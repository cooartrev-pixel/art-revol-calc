const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NbuRate {
  r030: number
  txt: string
  rate: number
  cc: string
  exchangedate: string
}

async function fetchNbuRate(valcode: string): Promise<NbuRate | null> {
  try {
    const response = await fetch(
      `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=${valcode}&json`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MortgageCalcBot/1.0)',
        },
      }
    )
    if (!response.ok) {
      console.error(`NBU API error for ${valcode}: ${response.status}`)
      return null
    }
    const data: NbuRate[] = await response.json()
    return data.length > 0 ? data[0] : null
  } catch (error) {
    console.error(`Error fetching ${valcode} rate:`, error)
    return null
  }
}

async function fetchUniversalbankRate(): Promise<{ buy: number; sell: number } | null> {
  try {
    const response = await fetch('https://www.universalbank.com.ua/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'uk-UA,uk;q=0.9,en;q=0.8',
      },
    })
    if (!response.ok) {
      console.error(`Universalbank fetch error: ${response.status}`)
      return null
    }
    const html = await response.text()
    
    // Parse USD sell rate from the page
    // The page typically has currency rates in a table/block
    // Try multiple patterns to find USD rates
    
    // Pattern 1: Look for USD rate in structured data
    const usdSellMatch = html.match(/USD[\s\S]*?(?:sell|продаж|Продаж)[^0-9]*?([\d]+[.,][\d]+)/i)
      || html.match(/(?:sell|продаж|Продаж)[^0-9]*?([\d]+[.,][\d]+)[\s\S]*?USD/i)
    
    // Pattern 2: Look for currency table pattern - buy/sell pairs near USD
    const usdBlockMatch = html.match(/USD[\s\S]{0,500}?([\d]{2}[.,][\d]{2,4})[\s\S]{0,100}?([\d]{2}[.,][\d]{2,4})/i)
    
    // Pattern 3: JSON data in script tags
    const jsonMatch = html.match(/["']USD["'][\s\S]*?["']sell["']\s*:\s*["']?([\d]+[.,][\d]+)["']?/i)
      || html.match(/["']sell["']\s*:\s*["']?([\d]+[.,][\d]+)["']?[\s\S]*?["']USD["']/i)

    // Pattern 4: data attributes
    const dataMatch = html.match(/data-currency=["']USD["'][\s\S]*?data-sell=["']([\d]+[.,][\d]+)["']/i)
      || html.match(/data-sell=["']([\d]+[.,][\d]+)["'][\s\S]*?data-currency=["']USD["']/i)

    let buy: number | null = null
    let sell: number | null = null

    if (jsonMatch) {
      sell = parseFloat(jsonMatch[1].replace(',', '.'))
    } else if (dataMatch) {
      sell = parseFloat(dataMatch[1].replace(',', '.'))
    } else if (usdSellMatch) {
      sell = parseFloat(usdSellMatch[1].replace(',', '.'))
    } else if (usdBlockMatch) {
      buy = parseFloat(usdBlockMatch[1].replace(',', '.'))
      sell = parseFloat(usdBlockMatch[2].replace(',', '.'))
    }

    // Fallback: try to find any two consecutive numbers near USD that look like exchange rates (38-50 range)
    if (!sell) {
      const allRates = [...html.matchAll(/USD[\s\S]{0,300}?(3\d[.,]\d{2,4}|4\d[.,]\d{2,4})/gi)]
      if (allRates.length >= 2) {
        buy = parseFloat(allRates[0][1].replace(',', '.'))
        sell = parseFloat(allRates[1][1].replace(',', '.'))
      } else if (allRates.length === 1) {
        sell = parseFloat(allRates[0][1].replace(',', '.'))
      }
    }

    if (sell && sell > 30 && sell < 60) {
      console.log(`Universalbank USD sell rate: ${sell}`)
      return { buy: buy || sell, sell }
    }

    console.error('Could not parse Universalbank USD rate from HTML')
    return null
  } catch (error) {
    console.error('Error fetching Universalbank rate:', error)
    return null
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const [usd, eur, universalbank] = await Promise.all([
      fetchNbuRate('USD'),
      fetchNbuRate('EUR'),
      fetchUniversalbankRate(),
    ])

    const rates: Record<string, { rate: number; date: string; name: string }> = {}

    if (usd) {
      rates.USD = { rate: usd.rate, date: usd.exchangedate, name: usd.txt }
    }
    if (eur) {
      rates.EUR = { rate: eur.rate, date: eur.exchangedate, name: eur.txt }
    }

    const universalbankRates: Record<string, { buy: number; sell: number }> | null = universalbank
      ? { USD: universalbank }
      : null

    return new Response(
      JSON.stringify({
        success: true,
        rates,
        universalbank: universalbankRates,
        fetchedAt: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in fetch-exchange-rates:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

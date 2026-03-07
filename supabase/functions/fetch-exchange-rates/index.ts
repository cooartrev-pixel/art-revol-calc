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

interface UniversalbankRates {
  USD: { buy: number; sell: number } | null;
  EUR: { buy: number; sell: number } | null;
}

function parseCurrencyFromHtml(html: string, currency: string, minRate: number, maxRate: number): { buy: number; sell: number } | null {
  // Pattern 1: JSON data in script tags
  const jsonMatch = html.match(new RegExp(`["']${currency}["'][\\s\\S]*?["']sell["']\\s*:\\s*["']?([\\d]+[.,][\\d]+)["']?`, 'i'))
    || html.match(new RegExp(`["']sell["']\\s*:\\s*["']?([\\d]+[.,][\\d]+)["']?[\\s\\S]*?["']${currency}["']`, 'i'))

  // Pattern 2: data attributes
  const dataMatch = html.match(new RegExp(`data-currency=["']${currency}["'][\\s\\S]*?data-sell=["']([\\d]+[.,][\\d]+)["']`, 'i'))
    || html.match(new RegExp(`data-sell=["']([\\d]+[.,][\\d]+)["'][\\s\\S]*?data-currency=["']${currency}["']`, 'i'))

  // Pattern 3: text patterns
  const sellMatch = html.match(new RegExp(`${currency}[\\s\\S]*?(?:sell|продаж|Продаж)[^0-9]*?([\\d]+[.,][\\d]+)`, 'i'))
    || html.match(new RegExp(`(?:sell|продаж|Продаж)[^0-9]*?([\\d]+[.,][\\d]+)[\\s\\S]*?${currency}`, 'i'))

  // Pattern 4: block with two numbers (buy/sell)
  const blockMatch = html.match(new RegExp(`${currency}[\\s\\S]{0,500}?([\\d]{2}[.,][\\d]{2,4})[\\s\\S]{0,100}?([\\d]{2}[.,][\\d]{2,4})`, 'i'))

  let buy: number | null = null
  let sell: number | null = null

  if (jsonMatch) {
    sell = parseFloat(jsonMatch[1].replace(',', '.'))
  } else if (dataMatch) {
    sell = parseFloat(dataMatch[1].replace(',', '.'))
  } else if (sellMatch) {
    sell = parseFloat(sellMatch[1].replace(',', '.'))
  } else if (blockMatch) {
    buy = parseFloat(blockMatch[1].replace(',', '.'))
    sell = parseFloat(blockMatch[2].replace(',', '.'))
  }

  // Fallback: find consecutive numbers near currency code in expected range
  if (!sell) {
    const pattern = new RegExp(`${currency}[\\s\\S]{0,300}?(${Math.floor(minRate)}\\d[.,]\\d{2,4}|${Math.floor(minRate)+1}\\d[.,]\\d{2,4})`, 'gi')
    const allRates = [...html.matchAll(pattern)]
    if (allRates.length >= 2) {
      buy = parseFloat(allRates[0][1].replace(',', '.'))
      sell = parseFloat(allRates[1][1].replace(',', '.'))
    } else if (allRates.length === 1) {
      sell = parseFloat(allRates[0][1].replace(',', '.'))
    }
  }

  if (sell && sell > minRate && sell < maxRate) {
    console.log(`Universalbank ${currency} sell rate: ${sell}`)
    return { buy: buy || sell, sell }
  }

  return null
}

async function fetchUniversalbankRates(): Promise<UniversalbankRates> {
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
      return { USD: null, EUR: null }
    }
    const html = await response.text()

    const usd = parseCurrencyFromHtml(html, 'USD', 30, 60)
    const eur = parseCurrencyFromHtml(html, 'EUR', 35, 65)

    return { USD: usd, EUR: eur }
  } catch (error) {
    console.error('Error fetching Universalbank rates:', error)
    return { USD: null, EUR: null }
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

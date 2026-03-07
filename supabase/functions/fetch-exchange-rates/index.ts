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

function parseRateTableRow(html: string, currency: string): { buy: number; sell: number } | null {
  // Match table rows: <td ...>USD</td> ... <td ...>43.50</td> ... <td ...>44.00</td>
  // The Universalbank page has: currency | buy | sell | nbu in each row
  // We need to match exactly "USD" or "EUR" (not "EUR/USD")
  const rowPattern = new RegExp(
    `<td[^>]*>\\s*${currency}\\s*</td>[\\s\\S]*?<td[^>]*>\\s*([\\d]+[.,][\\d]+)\\s*</td>[\\s\\S]*?<td[^>]*>\\s*([\\d]+[.,][\\d]+)\\s*</td>`,
    'i'
  )
  const match = html.match(rowPattern)
  if (match) {
    const buy = parseFloat(match[1].replace(',', '.'))
    const sell = parseFloat(match[2].replace(',', '.'))
    if (buy > 0 && sell > 0) {
      console.log(`Universalbank ${currency}: buy=${buy}, sell=${sell}`)
      return { buy, sell }
    }
  }
  console.error(`Could not parse Universalbank ${currency} rate`)
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

    // Extract just the first rate table (not conversion table)
    const rateTableMatch = html.match(/<table[^>]*class="rate table[^"]*"[^>]*>[\s\S]*?<\/table>/)
    const tableHtml = rateTableMatch ? rateTableMatch[0] : html

    const usd = parseRateTableRow(tableHtml, 'USD')
    const eur = parseRateTableRow(tableHtml, 'EUR')

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
      fetchUniversalbankRates(),
    ])

    const rates: Record<string, { rate: number; date: string; name: string }> = {}

    if (usd) {
      rates.USD = { rate: usd.rate, date: usd.exchangedate, name: usd.txt }
    }
    if (eur) {
      rates.EUR = { rate: eur.rate, date: eur.exchangedate, name: eur.txt }
    }

    const universalbankRates: Record<string, { buy: number; sell: number }> = {}
    if (universalbank.USD) universalbankRates.USD = universalbank.USD
    if (universalbank.EUR) universalbankRates.EUR = universalbank.EUR

    return new Response(
      JSON.stringify({
        success: true,
        rates,
        universalbank: Object.keys(universalbankRates).length > 0 ? universalbankRates : null,
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

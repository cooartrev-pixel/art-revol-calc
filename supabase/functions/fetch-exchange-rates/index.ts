import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const [usd, eur] = await Promise.all([
      fetchNbuRate('USD'),
      fetchNbuRate('EUR'),
    ])

    const rates: Record<string, { rate: number; date: string; name: string }> = {}

    if (usd) {
      rates.USD = { rate: usd.rate, date: usd.exchangedate, name: usd.txt }
    }
    if (eur) {
      rates.EUR = { rate: eur.rate, date: eur.exchangedate, name: eur.txt }
    }

    return new Response(
      JSON.stringify({
        success: true,
        rates,
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

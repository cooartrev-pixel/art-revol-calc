import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Official RSS/news sources for Ukrainian real estate legislation
const RSS_SOURCES = [
  {
    name: 'Верховна Рада України',
    url: 'https://www.rada.gov.ua/rss/',
    category: 'legislation'
  },
  {
    name: 'Національний банк України',
    url: 'https://bank.gov.ua/ua/rss',
    category: 'banking'
  },
  {
    name: 'Міністерство фінансів України',
    url: 'https://mof.gov.ua/uk/rss',
    category: 'finance'
  }
]

// Alternative JSON/HTML sources when RSS fails
const FALLBACK_SOURCES = [
  {
    name: 'НБУ - Новини',
    url: 'https://bank.gov.ua/ua/news/all',
    category: 'banking'
  }
]

// Keywords for filtering relevant real estate news (expanded)
const KEYWORDS = [
  'іпотек', 'іпотечн', 'житл', 'кредит', 'нерухом',
  'єоселя', 'єосел', 'банк', 'ставк', 'відсотк',
  'позик', 'будівн', 'квартир', 'будинок', 'будинк',
  'державн програм', 'субсид', 'компенсац', 'молод',
  'сім\'я', 'сімей', 'доступн житл', 'пільг',
  'заставн', 'страхув', 'нотаріальн', 'реєстрац',
  'право власност', 'купівл', 'продаж нерухом',
  'первинн ринок', 'вторинн ринок', 'новобудов',
  'забудовник', 'девелопер', 'земельн ділянк',
  'оренд', 'орендн', 'житлов фонд', 'житлов кредит',
  'рефінансув', 'реструктуриз', 'амортиз',
  'процентн ставк', 'облікова ставк',
  'житлов програм', 'державн підтримк',
  'воєнн стан', 'відновлен'
]

interface RssItem {
  title: string
  description: string
  link: string
  pubDate: string
}

function extractCdata(text: string): string {
  // Handle CDATA sections more robustly
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, '')
    .trim()
}

async function parseRssFeed(url: string): Promise<RssItem[]> {
  try {
    console.log(`Fetching RSS from: ${url}`)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LegislativeUpdatesBot/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      console.error(`Failed to fetch RSS from ${url}: ${response.status} ${response.statusText}`)
      return []
    }
    
    const text = await response.text()
    const items: RssItem[] = []
    
    // Parse both <item> (RSS 2.0) and <entry> (Atom) formats
    const itemMatches = text.matchAll(/<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/g)
    
    for (const match of itemMatches) {
      const itemXml = match[1]
      
      // Title: handle CDATA
      const titleMatch = itemXml.match(/<title[^>]*>([\s\S]*?)<\/title>/s)
      // Description: handle both description and content tags
      const descMatch = itemXml.match(/<(?:description|content|summary)[^>]*>([\s\S]*?)<\/(?:description|content|summary)>/s)
      // Link: handle both RSS and Atom formats
      const linkMatch = itemXml.match(/<link[^>]*href="([^"]*)"[^>]*\/?>/s) ||
                        itemXml.match(/<link[^>]*>([\s\S]*?)<\/link>/s)
      // Date: handle multiple date formats
      const dateMatch = itemXml.match(/<(?:pubDate|published|updated|dc:date)>([\s\S]*?)<\/(?:pubDate|published|updated|dc:date)>/s)
      
      if (titleMatch) {
        const title = extractCdata(titleMatch[1])
        const description = descMatch ? extractCdata(descMatch[1]).slice(0, 500) : ''
        const link = linkMatch ? extractCdata(linkMatch[1]) : ''
        const pubDate = dateMatch ? extractCdata(dateMatch[1]) : new Date().toISOString()
        
        if (title.length > 5) { // Skip empty/garbage titles
          items.push({ title, description, link, pubDate })
        }
      }
    }
    
    console.log(`Parsed ${items.length} items from ${url}`)
    return items
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`Timeout fetching RSS from ${url}`)
    } else {
      console.error(`Error parsing RSS from ${url}:`, error)
    }
    return []
  }
}

function isRelevant(item: RssItem): boolean {
  const text = `${item.title} ${item.description}`.toLowerCase()
  // Require at least one keyword match
  return KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()))
}

function parseDate(dateStr: string): Date {
  try {
    const parsed = new Date(dateStr)
    if (isNaN(parsed.getTime())) {
      // Try DD.MM.YYYY format common in Ukrainian sites
      const parts = dateStr.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/)
      if (parts) {
        return new Date(Number(parts[3]), Number(parts[2]) - 1, Number(parts[1]))
      }
      return new Date()
    }
    return parsed
  } catch {
    return new Date()
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting legislative updates fetch...')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Security: Verify request comes from an authenticated admin user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.log('Unauthorized: No authorization header')
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) {
      console.log('Unauthorized: Invalid or expired token')
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const { data: roleData, error: roleError } = await userClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (roleError || !roleData) {
      console.log('Forbidden: User is not an admin')
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden: Admin access required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    console.log(`Admin user ${user.id} authorized, proceeding with RSS fetch...`)
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const allItems: Array<{
      title: string
      content: string
      source_name: string
      source_url: string
      category: string
      published_at: string
      is_auto_fetched: boolean
    }> = []

    const sourceResults: Array<{ name: string; fetched: number; relevant: number; error?: string }> = []

    // Fetch from all RSS sources in parallel
    const feedResults = await Promise.allSettled(
      RSS_SOURCES.map(source => parseRssFeed(source.url))
    )

    for (let i = 0; i < RSS_SOURCES.length; i++) {
      const source = RSS_SOURCES[i]
      const result = feedResults[i]
      
      if (result.status === 'rejected') {
        console.error(`Source ${source.name} failed:`, result.reason)
        sourceResults.push({ name: source.name, fetched: 0, relevant: 0, error: String(result.reason) })
        continue
      }

      const items = result.value
      const relevantItems = items.filter(isRelevant).slice(0, 10) // Top 10 relevant per source
      
      sourceResults.push({ name: source.name, fetched: items.length, relevant: relevantItems.length })
      
      for (const item of relevantItems) {
        allItems.push({
          title: item.title.slice(0, 500),
          content: item.description || item.title,
          source_name: source.name,
          source_url: item.link,
          category: source.category,
          published_at: parseDate(item.pubDate).toISOString(),
          is_auto_fetched: true
        })
      }
    }

    console.log(`Found ${allItems.length} relevant items total`)
    console.log('Source results:', JSON.stringify(sourceResults))

    let inserted = 0
    let skipped = 0

    if (allItems.length > 0) {
      // Batch check for duplicates
      const titles = allItems.map(i => i.title)
      const { data: existingItems } = await supabase
        .from('legislative_updates')
        .select('title')
        .in('title', titles)
      
      const existingTitles = new Set((existingItems || []).map(i => i.title))

      const newItems = allItems.filter(item => !existingTitles.has(item.title))
      skipped = allItems.length - newItems.length

      if (newItems.length > 0) {
        const { error, data } = await supabase
          .from('legislative_updates')
          .insert(newItems)
          .select('id')
        
        if (error) {
          console.error('Batch insert error:', error)
          // Fallback: insert one by one
          for (const item of newItems) {
            const { error: singleError } = await supabase
              .from('legislative_updates')
              .insert(item)
            if (!singleError) inserted++
            else console.error(`Failed to insert: ${item.title}`, singleError)
          }
        } else {
          inserted = data?.length || newItems.length
        }
      }
    }

    console.log(`Inserted: ${inserted}, Skipped duplicates: ${skipped}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Inserted ${inserted} new items, skipped ${skipped} duplicates`,
        sources: sourceResults,
        totalRelevant: allItems.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error in fetch-legislative-updates:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

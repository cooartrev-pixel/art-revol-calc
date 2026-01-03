import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Official RSS sources for Ukrainian legislation and banking news
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

// Keywords for filtering relevant news
const KEYWORDS = [
  'іпотек', 'житл', 'кредит', 'нерухом', 'єоселя', 'банк',
  'ставк', 'відсотк', 'позик', 'будівн', 'квартир', 'будинок',
  'державн', 'програм', 'субсид', 'компенсац', 'молод', 'сім\'я'
]

interface RssItem {
  title: string
  description: string
  link: string
  pubDate: string
}

async function parseRssFeed(url: string): Promise<RssItem[]> {
  try {
    console.log(`Fetching RSS from: ${url}`)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LegislativeUpdatesBot/1.0)'
      }
    })
    
    if (!response.ok) {
      console.error(`Failed to fetch RSS from ${url}: ${response.status}`)
      return []
    }
    
    const text = await response.text()
    const items: RssItem[] = []
    
    // Simple XML parsing for RSS items
    const itemMatches = text.matchAll(/<item>([\s\S]*?)<\/item>/g)
    
    for (const match of itemMatches) {
      const itemXml = match[1]
      
      const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/s)
      const descMatch = itemXml.match(/<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/s)
      const linkMatch = itemXml.match(/<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/s)
      const dateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/s)
      
      if (titleMatch) {
        items.push({
          title: titleMatch[1].trim(),
          description: descMatch ? descMatch[1].trim().replace(/<[^>]*>/g, '') : '',
          link: linkMatch ? linkMatch[1].trim() : '',
          pubDate: dateMatch ? dateMatch[1].trim() : new Date().toISOString()
        })
      }
    }
    
    console.log(`Parsed ${items.length} items from ${url}`)
    return items
  } catch (error) {
    console.error(`Error parsing RSS from ${url}:`, error)
    return []
  }
}

function isRelevant(item: RssItem): boolean {
  const text = `${item.title} ${item.description}`.toLowerCase()
  return KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()))
}

function parseDate(dateStr: string): Date {
  try {
    return new Date(dateStr)
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
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    // Create a client with the user's JWT to verify their identity
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Verify the user is authenticated
    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) {
      console.log('Unauthorized: Invalid or expired token')
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    // Check if the user has admin role
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
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403 
        }
      )
    }

    console.log(`Admin user ${user.id} authorized, proceeding with RSS fetch...`)

    // Use service role key for database operations
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

    // Fetch from all RSS sources
    for (const source of RSS_SOURCES) {
      const items = await parseRssFeed(source.url)
      const relevantItems = items.filter(isRelevant).slice(0, 5) // Take top 5 relevant per source
      
      for (const item of relevantItems) {
        allItems.push({
          title: item.title,
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

    if (allItems.length > 0) {
      // Check for duplicates by title before inserting
      for (const item of allItems) {
        const { data: existing } = await supabase
          .from('legislative_updates')
          .select('id')
          .eq('title', item.title)
          .maybeSingle()

        if (!existing) {
          const { error } = await supabase
            .from('legislative_updates')
            .insert(item)
          
          if (error) {
            console.error('Error inserting item:', error)
          } else {
            console.log(`Inserted: ${item.title}`)
          }
        } else {
          console.log(`Skipped duplicate: ${item.title}`)
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${allItems.length} items`,
        sources: RSS_SOURCES.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in fetch-legislative-updates:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

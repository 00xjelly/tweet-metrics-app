export type Tweet = {
  id: string
  text: string
  url: string
  author: string
  isReply: boolean
  isQuote: boolean
  metrics: {
    likes: number
    replies: number
    retweets: number
    impressions: number
  }
}

export type MetricsParams = {
  type: 'profile' | 'post'
  username?: string
  maxItems?: number
  urls?: string[]
  since?: string
  until?: string
}

const BASE_API_URL = 'https://api.apify.com/v2/acts/kaitoeasyapi~twitter-x-data-tweet-scraper-pay-per-result-cheapest/run-sync-get-dataset-items'

export async function analyzeMetrics(params: MetricsParams) {
  const { type, username, maxItems = 100, since, until } = params
  
  const API_TOKEN = process.env.NEXT_PUBLIC_APIFY_API_TOKEN || process.env.APIFY_TOKEN
  
  if (!API_TOKEN) {
    console.error('API token not configured')
    return {
      success: false,
      error: 'API token not found in environment variables. Looking for NEXT_PUBLIC_APIFY_API_TOKEN or APIFY_TOKEN'
    }
  }

  // Clean up username if it's a URL
  const cleanUsername = username?.includes('/') ? 
    username.split('/').pop() : 
    username

  // Construct the search query
  const searchQuery = `from:${cleanUsername} ${since ? `since:${since}` : ''} ${until ? `until:${until}` : ''}`
  
  const requestBody = {
    searchTerms: [searchQuery],
  }

  const url = `${BASE_API_URL}?token=${API_TOKEN}`

  try {
    console.log('Making API request with params:', {
      url: url.replace(API_TOKEN, '***'),
      body: requestBody
    })

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API request failed:', response.status, errorText)
      return {
        success: false,
        error: `API request failed: ${errorText}`
      }
    }

    const rawData = await response.json()
    console.log('Raw API response:', rawData)

    // Transform the raw tweet data to match our Tweet interface
    const transformedTweets = rawData.map((tweet: any) => ({
      id: tweet.id_str || tweet.id || String(Date.now()),
      text: tweet.full_text || tweet.text,
      url: tweet.url || `https://twitter.com/${tweet.user?.screen_name}/status/${tweet.id_str}`,
      author: tweet.user?.screen_name || tweet.user?.name || cleanUsername,
      isReply: !!tweet.in_reply_to_status_id_str,
      isQuote: !!tweet.is_quote_status,
      metrics: {
        likes: tweet.favorite_count || 0,
        replies: tweet.reply_count || 0,
        retweets: tweet.retweet_count || 0,
        impressions: tweet.impression_count || 0
      }
    }))

    return {
      success: true,
      data: {
        posts: transformedTweets
      }
    }
  } catch (error) {
    console.error('An error occurred:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze metrics'
    }
  }
}
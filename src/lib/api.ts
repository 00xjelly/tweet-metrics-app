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

const BASE_API_URL = 'https://api.apify.com/v2/acts/kaitoeasyapi~twitter-x-data-tweet-scraper-pay-per-result-cheapest/runs'

export async function analyzeMetrics(params: MetricsParams) {
  const { type, username, maxItems = 100, since, until } = params
  
  // Debug: Check if we can access the token
  const API_TOKEN = process.env.NEXT_PUBLIC_APIFY_TOKEN
  console.log('API Token exists:', !!API_TOKEN)
  console.log('Token prefix:', API_TOKEN?.substring(0, 4) + '...')
  console.log('Environment variables:', process.env)

  if (!API_TOKEN) {
    console.error('API token not configured')
    return {
      success: false,
      error: 'API token not configured. Check environment variables.'
    }
  }

  // Construct the search query
  const searchQuery = `from:${username} ${since ? `since:${since}` : ''} ${until ? `until:${until}` : ''}`
  
  const requestBody = {
    searchTerms: [searchQuery],
  }

  const url = `${BASE_API_URL}?token=${API_TOKEN}`

  try {
    console.log('Making API request to:', url.replace(API_TOKEN, '***'))
    console.log('Request body:', requestBody)

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

    const data = await response.json()
    console.log('API response data:', data)

    return {
      success: true,
      data: {
        posts: data
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
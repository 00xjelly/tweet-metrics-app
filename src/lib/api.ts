export type Tweet = {
  id: string
  text: string
  url: string
  author: string
  isReply: boolean
  isQuote: boolean
  createdAt: string
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
  includeReplies?: boolean
  twitterContent?: string
  '@'?: string
}

const BASE_API_URL = 'https://api.apify.com/v2/acts/kaitoeasyapi~twitter-x-data-tweet-scraper-pay-per-result-cheapest/run-sync-get-dataset-items'

function extractUsername(url: string): string {
  const match = url.match(/(?:x\.com|twitter\.com)\/([^/]+)(?:\/status\/\d+)?/)
  return match ? match[1] : url
}

export async function analyzeMetrics(params: MetricsParams) {
  console.log('Analyzing metrics with params:', params)
  
  const API_TOKEN = process.env.NEXT_PUBLIC_APIFY_API_TOKEN
  if (!API_TOKEN) {
    console.error('API token not configured')
    return {
      success: false,
      error: 'API token not found in environment variables.'
    }
  }

  const url = `${BASE_API_URL}?token=${API_TOKEN}`
  
  // Clean up username if it's a URL
  const username = params.username ? 
    extractUsername(params.username).replace('@', '') : 
    undefined

  // Build search query
  let searchQuery = `from:${username}`
  
  if (params.twitterContent) {
    searchQuery += ` ${params.twitterContent}`
  }
  
  if (params['@']) {
    searchQuery += ` @${params['@']}`
  }
  
  if (params.since) {
    searchQuery += ` since:${params.since}`
  }
  
  if (params.until) {
    searchQuery += ` until:${params.until}`
  }
  
  if (!params.includeReplies) {
    searchQuery += ` -filter:replies`
  }

  const maxItems = Math.min(params.maxItems || 100, 200)

  const requestBody = {
    searchTerms: [searchQuery],
    maxItems
  }

  console.log('Making API request to:', url.replace(API_TOKEN, '***'))
  console.log('Request body:', requestBody)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      console.error('API request failed:', response.status)
      return {
        success: false,
        error: `API request failed with status ${response.status}`
      }
    }

    const data = await response.json()
    console.log('API response data:', data)

    // Filter out mock tweets and transform the data
    const transformedPosts = data
      .filter((tweet: any) => tweet.type !== 'mock_tweet')
      .slice(0, maxItems)
      .map((tweet: any) => {
        const createdAt = tweet.created_at || tweet.createdAt || new Date().toISOString()
        
        return {
          id: tweet.id || tweet.tweetId || String(Date.now()),
          text: tweet.text || tweet.full_text || '',
          url: tweet.url || tweet.twitterUrl || '',
          author: tweet.author?.userName || username || '',
          isReply: !!tweet.inReplyToId,
          isQuote: !!tweet.quoted_tweet,
          createdAt,
          metrics: {
            likes: tweet.likeCount || 0,
            replies: tweet.replyCount || 0,
            retweets: tweet.retweetCount || 0,
            impressions: tweet.viewCount || 0
          }
        }
      })

    return {
      success: true,
      data: {
        posts: transformedPosts
      }
    }
  } catch (error) {
    console.error('Error analyzing metrics:', error)
    return {
      success: false,
      error: 'Failed to analyze metrics'
    }
  }
}
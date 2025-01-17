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
  const username = params.username?.includes('/') ? 
    params.username.split('/').pop()?.replace('@', '') : 
    params.username?.replace('@', '')

  // Build search query
  let searchQuery = `from:${username}`
  if (params.since) {
    // Format: YYYY-MM-DD
    searchQuery += ` since:${params.since}`
  }
  if (params.until) {
    // Format: YYYY-MM-DD
    searchQuery += ` until:${params.until}`
  }

  const requestBody = {
    searchTerms: [searchQuery],
    maxTweets: params.maxItems || 100
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

    // Transform the data to match our Tweet interface
    const transformedPosts = data.map((tweet: any) => ({
      id: tweet.id || tweet.tweetId || String(Date.now()),
      text: tweet.text || tweet.full_text || '',
      url: tweet.url || tweet.twitterUrl || '',
      author: tweet.author?.userName || username || '',
      isReply: !!tweet.inReplyToId,
      isQuote: !!tweet.quoted_tweet,
      metrics: {
        likes: tweet.likeCount || 0,
        replies: tweet.replyCount || 0,
        retweets: tweet.retweetCount || 0,
        impressions: tweet.viewCount || 0
      }
    }))

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
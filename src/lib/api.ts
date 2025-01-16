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
  filterReplies?: boolean
  filterQuotes?: boolean
}

export type MetricsSuccessResponse = {
  success: true
  data: {
    posts: Tweet[]
  }
}

export type MetricsErrorResponse = {
  success: false
  error: string
}

export type MetricsResponse = MetricsSuccessResponse | MetricsErrorResponse

const BASE_API_URL = 'https://api.apify.com/v2/acts/kaitoeasyapi~twitter-x-data-tweet-scraper-pay-per-result-cheapest/run-sync-get-dataset-items'

export async function analyzeMetrics(params: MetricsParams): Promise<MetricsResponse> {
  const { type, username, maxItems = 100, urls, since, until, filterReplies, filterQuotes } = params
  
  // Extract username from URL if full URL is provided
  const cleanUsername = username?.includes('x.com/') || username?.includes('twitter.com/') 
    ? username.split('/').pop() 
    : username

  const requestBody = {
    twitterContent: "",
    maxItems,
    queryType: "Latest",
    lang: "en",
    from: cleanUsername,
    "filter:verified": false,
    "filter:blue_verified": false,
    since: since || "2021-12-31_23:59:59_UTC",
    until: until || "2024-12-31_23:59:59_UTC",
    "filter:nativeretweets": false,
    "include:nativeretweets": false,
    "filter:replies": filterReplies || false,
    "filter:quote": filterQuotes || false,
    "filter:has_engagement": false,
    "min_retweets": 0,
    "min_faves": 0,
    "min_replies": 0,
    "-min_retweets": 0,
    "-min_faves": 0,
    "-min_replies": 0,
    "filter:media": false,
    "filter:twimg": false,
    "filter:images": false,
    "filter:videos": false,
    "filter:native_video": false,
    "filter:vine": false,
    "filter:consumer_video": false,
    "filter:pro_video": false,
    "filter:spaces": false,
    "filter:links": false,
    "filter:mentions": false,
    "filter:news": false,
    "filter:safe": false,
    "filter:hashtags": false
  }

  try {
    const response = await fetch(BASE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      return {
        success: false,
        error: `API request failed with status ${response.status}`
      }
    }

    const data = await response.json()

    return {
      success: true,
      data: {
        posts: data
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze metrics'
    }
  }
}
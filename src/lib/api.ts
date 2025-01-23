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
  bookmarkCount?: number
  conversationId?: string
  entities?: object
  inReplyToId?: string
  inReplyToUserId?: string
  inReplyToUsername?: string
  lang?: string
  quoteCount?: number
  quoted_tweet?: object
  retweetCount?: number
  retweeted_tweet?: object
  source?: string
  type?: 'tweet'
  viewCount?: number
}

export type MetricsParams = {
  '@'?: string | string[]
  username?: string | string[]
  maxItems?: number
  tweet_ids?: string[]
  since?: string
  until?: string
  includeReplies?: boolean
  twitterContent?: string
}

export async function analyzeMetrics(params: MetricsParams) {
  try {
    if (params.tweet_ids) {
      const response = await fetch('https://api.twitterapi.io/twitter/tweets?tweet_ids=' + params.tweet_ids.join(','), {
        method: 'GET',
        headers: {
          'X-API-Key': process.env.TWITTER_API_KEY || ''
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API request failed: ${errorText}`)
      }

      const result = await response.json()
      return result
    } else {
      // Profile search endpoint remains unchanged
      const response = await fetch('/api/twitter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API request failed: ${errorText}`)
      }

      const result = await response.json()
      return result
    }
  } catch (error) {
    console.error('Error analyzing metrics:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze metrics'
    }
  }
}
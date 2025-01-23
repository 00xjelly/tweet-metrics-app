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
  console.log('Analyzing metrics with params:', params)

  try {
    if (params.tweet_ids) {
      const url = new URL('/twitter/tweets', window.location.origin)
      url.searchParams.append('tweet_ids', params.tweet_ids.join(','))
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Response Error:', errorText)
        throw new Error(`API request failed: ${errorText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Unknown error occurred')
      }

      return result
    } else {
      const response = await fetch('/api/twitter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Response Error:', errorText)
        throw new Error(`API request failed: ${errorText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Unknown error occurred')
      }

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
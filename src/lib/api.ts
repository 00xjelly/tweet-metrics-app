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
  '@'?: string | string[]
  username?: string | string[]
  maxItems?: number
  urls?: string[]
  since?: string
  until?: string
  includeReplies?: boolean
  twitterContent?: string
}

export type StreamCallback = {
  onTweet?: (tweet: Tweet, author: string) => void
  onError?: (error: string, author?: string) => void
  onComplete?: (allTweets: Tweet[]) => void
}

export async function analyzeMetrics(
  params: MetricsParams,
  callbacks?: StreamCallback
) {
  console.log('Analyzing metrics with params:', params)

  try {
    const response = await fetch('/api/twitter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        '@': params['@'],
        username: params.username,
        maxItems: params.maxItems,
        since: params.since,
        until: params.until,
        includeReplies: params.includeReplies,
        twitterContent: params.twitterContent,
        urls: params.urls
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Response Error:', errorText)
      throw new Error(`API request failed: ${errorText}`)
    }

    // Handle streaming response
    if (response.headers.get('content-type')?.includes('text/event-stream')) {
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      const allTweets: Tweet[] = []

      if (!reader) throw new Error('No reader available')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(Boolean)

        for (const line of lines) {
          try {
            const data = JSON.parse(line)

            if (!data.success) {
              callbacks?.onError?.(data.error, data.author)
              continue
            }

            if (data.isPartial) {
              // Handle individual tweet update
              const tweet = data.data.posts[0]
              allTweets.push(tweet)
              callbacks?.onTweet?.(tweet, data.author)
            } else if (data.isComplete) {
              callbacks?.onComplete?.(allTweets)
              return {
                success: true,
                data: {
                  posts: allTweets
                }
              }
            }
          } catch (error) {
            console.error('Error parsing stream chunk:', error)
          }
        }
      }

      return {
        success: true,
        data: {
          posts: allTweets
        }
      }
    }

    // Handle regular JSON response (for URL searches)
    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Unknown error occurred')
    }

    return result
  } catch (error) {
    console.error('Error analyzing metrics:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze metrics'
    }
  }
}

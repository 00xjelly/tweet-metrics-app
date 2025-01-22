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
  '@'?: string | string[]        // Author(s) from X Username field
  username?: string | string[]   // Mentioned user filter
  maxItems?: number
  urls?: string[]
  since?: string
  until?: string
  includeReplies?: boolean
  twitterContent?: string
}

export async function analyzeMetrics(params: MetricsParams) {
  console.log('Analyzing metrics with params:', params)

  try {
    // Send all params directly to the API
    const response = await fetch('/api/twitter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        '@': params['@'],            // Can be string or string[]
        username: params.username,    // Mentioned user filter
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

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Unknown error occurred')
    }

    return {
      success: true,
      data: result.data
    }
  } catch (error) {
    console.error('Error analyzing metrics:', error)
    return {
      success: false,
      error: error instanceof Error 
        ? error.message 
        : 'Failed to analyze metrics'
    }
  }
}

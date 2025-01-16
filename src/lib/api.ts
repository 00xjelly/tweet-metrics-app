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
}

const BASE_API_URL = 'https://api.apify.com/v2/acts/kaitoeasyapi~twitter-x-data-tweet-scraper-pay-per-result-cheapest/run-sync-get-dataset-items'

export async function analyzeMetrics(params: MetricsParams) {
  console.log('Analyzing metrics with params:', params)
  
  const requestBody = {
    from: params.username,
    maxItems: params.maxItems || 100,
    queryType: "Latest",
  }

  console.log('Making API request to:', BASE_API_URL)
  console.log('Request body:', requestBody)

  try {
    const response = await fetch(BASE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    console.log('API response status:', response.status)
    const data = await response.json()
    console.log('API response data:', data)

    const transformedData = {
      success: true,
      data: {
        posts: data
      }
    }

    console.log('Transformed data:', transformedData)
    return transformedData
  } catch (error) {
    console.error('Error analyzing metrics:', error)
    return {
      success: false,
      error: 'Failed to analyze metrics'
    }
  }
}
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

const BASE_API_URL = 'https://api.apify.com/v2/acts/kaitoeasyapi~twitter-x-data-tweet-scraper-pay-per-result-cheapest'

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

  // Construct the search query
  const searchQuery = `from:${username} ${since ? `since:${since}` : ''} ${until ? `until:${until}` : ''}`
  
  const requestBody = {
    searchTerms: [searchQuery],
  }

  const runUrl = `${BASE_API_URL}/runs?token=${API_TOKEN}`

  try {
    console.log('Starting API run...')
    console.log('Request body:', requestBody)

    // Start the run
    const runResponse = await fetch(runUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!runResponse.ok) {
      const errorText = await runResponse.text()
      console.error('API run failed:', runResponse.status, errorText)
      return {
        success: false,
        error: `API run failed: ${errorText}`
      }
    }

    const runData = await runResponse.json()
    console.log('Run started:', runData)

    // Get the dataset ID
    const runId = runData.data.id
    const datasetUrl = `${BASE_API_URL}/runs/${runId}/dataset/items?token=${API_TOKEN}`

    // Poll for results
    let attempts = 0
    const maxAttempts = 10
    const delay = 2000 // 2 seconds

    while (attempts < maxAttempts) {
      console.log(`Checking for results... (Attempt ${attempts + 1}/${maxAttempts})`)
      
      const dataResponse = await fetch(datasetUrl)
      
      if (dataResponse.ok) {
        const tweets = await dataResponse.json()
        console.log('Retrieved tweets:', tweets)

        return {
          success: true,
          data: {
            posts: tweets
          }
        }
      }

      attempts++
      await new Promise(resolve => setTimeout(resolve, delay))
    }

    return {
      success: false,
      error: 'Timed out waiting for results'
    }

  } catch (error) {
    console.error('An error occurred:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze metrics'
    }
  }
}
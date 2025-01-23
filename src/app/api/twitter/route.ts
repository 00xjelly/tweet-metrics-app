import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const apiKey = process.env.NEXT_PUBLIC_TWITTER_API_KEY

    if (!apiKey) {
      console.error('API key missing:', process.env)
      throw new Error('Twitter API key not configured')
    }

    if (body.tweet_ids) {
      const response = await fetch(
        `https://api.twitterapi.io/twitter/tweets?tweet_ids=${body.tweet_ids.join(',')}`, 
        {
          method: 'GET',
          headers: {
            'X-API-Key': apiKey
          }
        }
      )

      if (!response.ok) {
        const error = await response.text()
        console.error('Twitter API error:', error)
        throw new Error(`Twitter API error: ${error}`)
      }

      const data = await response.json()
      return NextResponse.json(data)
    } else if (body['@']) {
      // Profile search
      const userName = Array.isArray(body['@']) ? body['@'][0] : body['@']
      
      const queryParams = new URLSearchParams()
      queryParams.append('userName', userName)
      if (body.maxItems) queryParams.append('maxItems', body.maxItems.toString())
      if (body.since) queryParams.append('since', body.since)
      if (body.until) queryParams.append('until', body.until)
      if (body.includeReplies !== undefined) queryParams.append('includeReplies', body.includeReplies.toString())
      if (body.twitterContent) queryParams.append('twitterContent', body.twitterContent)

      const response = await fetch(
        `https://api.twitterapi.io/twitter/user/last_tweets?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'X-API-Key': apiKey
          }
        }
      )

      if (!response.ok) {
        const error = await response.text()
        console.error('Twitter API error:', error)
        throw new Error(`Twitter API error: ${error}`)
      }

      const data = await response.json()
      return NextResponse.json(data)
    } else {
      throw new Error('Invalid request: missing tweet_ids or userName')
    }
  } catch (error) {
    console.error('Twitter API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch data from Twitter API' 
      },
      { status: 500 }
    )
  }
}
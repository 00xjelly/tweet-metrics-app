import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const apiKey = process.env.TWITTER_API_KEY

    if (!apiKey) {
      throw new Error('Twitter API key not configured')
    }

    let endpoint = 'https://api.twitterapi.io/twitter'
    
    if (body.tweet_ids) {
      endpoint += `/tweets?tweet_ids=${body.tweet_ids.join(',')}`
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey
        }
      })
      const data = await response.json()
      return NextResponse.json(data)
    } else {
      endpoint += '/user/last_tweets'
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey
        },
        body: JSON.stringify(body)
      })
      const data = await response.json()
      return NextResponse.json(data)
    }
  } catch (error) {
    console.error('Twitter API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data from Twitter API' },
      { status: 500 }
    )
  }
}
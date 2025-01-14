import { NextResponse } from 'next/server'

const APIFY_URL = 'https://api.apify.com/v2/acts/kaitoeasyapi~twitter-x-data-tweet-scraper-pay-per-result-cheapest/run-sync-get-dataset-items'

export async function POST(req: Request) {
  try {
    const { tweetUrls, dateRange, type, params } = await req.json()
    
    // Extract tweet IDs from URLs
    const tweetIds = tweetUrls.map((url: string) => {
      const matches = url.match(/\/status\/(\d+)/)
      return matches ? matches[1] : null
    }).filter(Boolean)

    if (tweetIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid tweet IDs found'
      }, { status: 400 })
    }

    const response = await fetch(APIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.APIFY_TOKEN}`
      },
      body: JSON.stringify({
        tweetIDs: tweetIds,
        maxItems: tweetIds.length,
        queryType: 'Latest'
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Apify API error: ${error}`)
    }

    const data = await response.json()
    
    // Filter and transform the data
    const transformedData = data
      .filter((tweet: any) => 
        tweet && 
        tweet.type !== 'mock_tweet' && 
        tweet.id !== -1 && 
        tweet.text && 
        tweet.text.length > 0 &&
        !tweet.text.includes('From KaitoEasyAPI, a reminder:') &&
        tweet.id &&
        typeof tweet.id === 'string'
      )
      .map((tweet: any) => ({
        id: tweet.id,
        text: tweet.text,
        url: tweet.url,
        createdAt: tweet.createdAt,
        metrics: {
          views: tweet.viewCount || 0,
          likes: tweet.likeCount || 0,
          replies: tweet.replyCount || 0,
          retweets: tweet.retweetCount || 0,
          quotes: tweet.quoteCount || 0,
          bookmarks: tweet.bookmarkCount || 0
        },
        author: {
          username: tweet.author?.userName,
          name: tweet.author?.name,
          avatar: tweet.author?.profileImage
        },
        isReply: tweet.isReply || false,
        isQuote: tweet.isQuote || false
      }))

    // Apply date range filter if provided
    let filteredData = transformedData
    if (dateRange?.from) {
      const fromDate = new Date(dateRange.from)
      filteredData = filteredData.filter((tweet: any) => 
        new Date(tweet.createdAt) >= fromDate
      )
    }
    if (dateRange?.to) {
      const toDate = new Date(dateRange.to)
      filteredData = filteredData.filter((tweet: any) => 
        new Date(tweet.createdAt) <= toDate
      )
    }

    // Apply additional filters based on type and params
    if (type === 'metrics' && params) {
      const { minEngagementRate, minImpressions, keywords } = params
      
      filteredData = filteredData.filter((tweet: any) => {
        const totalEngagement = 
          tweet.metrics.likes + 
          tweet.metrics.replies + 
          tweet.metrics.retweets + 
          tweet.metrics.quotes

        const engagementRate = 
          (totalEngagement / tweet.metrics.views) * 100

        return (
          tweet.metrics.views >= minImpressions &&
          engagementRate >= minEngagementRate &&
          (!keywords || tweet.text.toLowerCase().includes(keywords.toLowerCase()))
        )
      })
    }

    return NextResponse.json({
      success: true,
      data: filteredData
    })

  } catch (error: any) {
    console.error('Error processing request:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
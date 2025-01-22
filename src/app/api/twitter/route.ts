import { NextResponse } from 'next/server'
const BASE_API_URL = 'https://api.twitterapi.io/twitter'

export async function POST(request: Request) {
  const API_KEY = process.env.NEXT_PUBLIC_TWITTER_API_KEY
  if (!API_KEY) {
    console.error('API key missing')
    return NextResponse.json({
      success: false,
      error: 'API key not configured'
    }, { status: 500 })
  }
  
  try {
    const body = await request.json()
    console.log('=== Debug: Request Body ===')
    console.log(JSON.stringify(body, null, 2))
    
    const { 
      '@': author,           // Authors from X Username field
      username,             // Mentioned user filter
      maxItems = 50,
      twitterContent,
      includeReplies = false,
      since,
      until,
      urls
    } = body

    // Handle multiple authors or single author
    const cleanAuthors = Array.isArray(author) 
      ? author.map(a => a?.trim().replace(/^@/, '')).filter(Boolean)
      : author ? [author.trim().replace(/^@/, '')] : []

    // Handle URL-based search separately
    if (urls && urls.length > 0) {
      const urlQuery = urls.map(url => `url:${url}`).join(' OR ')
      const apiUrl = new URL(`${BASE_API_URL}/tweet/advanced_search`)
      apiUrl.searchParams.set('query', urlQuery)
      apiUrl.searchParams.set('queryType', 'Latest')

      const apiResponse = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'x-api-key': API_KEY
        }
      })

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text()
        console.error('API Error:', errorText)
        return NextResponse.json({
          success: false,
          error: `API error: ${errorText}`
        }, { status: apiResponse.status })
      }

      const data = await apiResponse.json()
      const transformedTweets = (data.tweets || [])
        .slice(0, maxItems)
        .map((tweet: any) => ({
          id: tweet.id,
          text: tweet.text,
          url: tweet.url,
          author: tweet.author?.userName,
          isReply: tweet.isReply,
          isQuote: !!tweet.quoted_tweet,
          createdAt: tweet.createdAt,
          metrics: {
            likes: tweet.likeCount || 0,
            replies: tweet.replyCount || 0,
            retweets: tweet.retweetCount || 0,
            impressions: tweet.viewCount || 0
          }
        }))

      return NextResponse.json({
        success: true,
        data: {
          posts: transformedTweets
        }
      })
    }

    // Validate authors for profile/content search
    if (cleanAuthors.length === 0) {
      console.error('Authors missing')
      return NextResponse.json({
        success: false,
        error: 'At least one author username is required'
      }, { status: 400 })
    }

    // Build the query
    let query = []
    
    // Author filter - support multiple authors with OR condition
    if (cleanAuthors.length > 1) {
      query.push(`(${cleanAuthors.map(a => `from:${a}`).join(' OR ')})`)
    } else {
      query.push(`from:${cleanAuthors[0]}`)
    }

    // Add mention filter if provided
    if (username) {
      const cleanMention = username.trim().replace(/^@/, '')
      query.push(`@${cleanMention}`)
    }

    // Add keyword filter if provided
    if (twitterContent?.trim()) {
      query.push(twitterContent.trim())
    }

    // Add date range if provided
    if (since) {
      query.push(`since:${since}`)
    }
    if (until) {
      query.push(`until:${until}`)
    }

    // Add reply filter
    if (!includeReplies) {
      query.push('-filter:replies')
    }

    const finalQuery = query.join(' ')
    console.log('=== Debug: Query Construction ===')
    console.log('Query parts:', query)
    console.log('Final query:', finalQuery)

    const apiUrl = new URL(`${BASE_API_URL}/tweet/advanced_search`)
    apiUrl.searchParams.set('query', finalQuery)
    apiUrl.searchParams.set('queryType', 'Latest')

    console.log('=== Debug: API Request ===')
    console.log('Request URL:', apiUrl.toString())

    const apiResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY
      }
    })

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text()
      console.error('API Error:', errorText)
      return NextResponse.json({
        success: false,
        error: `API error: ${errorText}`
      }, { status: apiResponse.status })
    }

    const data = await apiResponse.json()
    console.log('=== Debug: Raw API Response ===')
    console.log('First tweet:', data.tweets?.[0])

    const transformedTweets = (data.tweets || [])
      .slice(0, maxItems)
      .map((tweet: any) => ({
        id: tweet.id,
        text: tweet.text,
        url: tweet.url,
        author: tweet.author?.userName,
        isReply: tweet.isReply,
        isQuote: !!tweet.quoted_tweet,
        createdAt: tweet.createdAt,
        metrics: {
          likes: tweet.likeCount || 0,
          replies: tweet.replyCount || 0,
          retweets: tweet.retweetCount || 0,
          impressions: tweet.viewCount || 0
        }
      }))

    return NextResponse.json({
      success: true,
      data: {
        posts: transformedTweets
      }
    })
  } catch (error) {
    console.error('=== Error ===')
    console.error('Error details:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 })
  }
}
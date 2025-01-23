export async function POST(req: Request) {
  const API_KEY = process.env.NEXT_PUBLIC_TWITTER_API_KEY
  if (!API_KEY) {
    return NextResponse.json({
      success: false,
      error: 'API key not configured'
    }, { status: 500 })
  }

  try {
    const body = await req.json()
    
    // Handle post search using tweets endpoint
    if (body.urls) {
      // Extract tweet IDs from URLs
      const tweetIds = body.urls.map((url: string) => {
        const matches = url.match(/status\/(\d+)/)
        return matches ? matches[1] : null
      }).filter(Boolean)

      if (tweetIds.length === 0) {
        throw new Error('No valid tweet IDs found in URLs')
      }

      const response = await fetch(
        `https://api.twitterapi.io/twitter/tweets?tweet_ids=${tweetIds.join(',')}`,
        {
          headers: {
            'x-api-key': API_KEY
          }
        }
      )

      if (!response.ok) {
        throw new Error(await response.text())
      }

      const data = await response.json()
      return NextResponse.json({
        success: true,
        data: { posts: data.tweets }
      })
    } 
    // Handle profile search using advanced_search
    else if (body['@']) {
      const authors = Array.isArray(body['@']) 
        ? body['@'].map(a => a?.trim().replace(/^@/, '')).filter(Boolean)
        : [body['@'].trim().replace(/^@/, '')]

      if (authors.length === 0) {
        throw new Error('No valid usernames provided')
      }

      const results = await Promise.all(authors.map(async (author) => {
        const query = [`from:${author}`];
        if (!body.includeReplies) {
          query.push('-filter:replies');
        }
        if (body.twitterContent?.trim()) {
          query.push(body.twitterContent.trim());
        }
        if (body.since) {
          query.push(`since:${body.since}`);
        }
        if (body.until) {
          query.push(`until:${body.until}`);
        }

        const response = await fetch(
          `https://api.twitterapi.io/twitter/tweet/advanced_search?query=${encodeURIComponent(query.join(' '))}&queryType=Latest`,
          {
            headers: {
              'x-api-key': API_KEY
            }
          }
        )

        if (!response.ok) {
          throw new Error(await response.text())
        }

        const data = await response.json()
        return data.tweets || []
      }))

      return NextResponse.json({
        success: true,
        data: { posts: results.flat().slice(0, body.maxItems || 50) }
      })
    }

    throw new Error('Invalid request parameters')

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 })
  }
}

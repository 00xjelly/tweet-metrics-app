import { NextResponse } from 'next/server'
const BASE_API_URL = 'https://api.twitterapi.io/twitter'

async function fetchAllTweets(apiUrl: URL, API_KEY: string, maxItems: number) {
  let allTweets: any[] = [];
  let cursor = "";
  
  while (allTweets.length < maxItems) {
    if (cursor) {
      apiUrl.searchParams.set('cursor', cursor);
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${await response.text()}`);
    }

    const data = await response.json();
    if (!data.tweets?.length) break;

    allTweets = [...allTweets, ...data.tweets];
    
    if (!data.has_next_page || !data.next_cursor) break;
    cursor = data.next_cursor;
  }

  return allTweets.slice(0, maxItems);
}

async function fetchUserTweets(author: string, API_KEY: string, maxItems: number, config: any) {
  const apiUrl = new URL(`${BASE_API_URL}/tweet/advanced_search`);
  const query = [`from:${author}`];

  if (!config.includeReplies) {
    query.push('-filter:replies');
  }
  if (config.twitterContent?.trim()) {
    query.push(config.twitterContent.trim());
  }
  if (config.username) {
    query.push(`@${config.username.trim().replace(/^@/, '')}`);
  }
  if (config.since) {
    query.push(`since:${config.since}`);
  }
  if (config.until) {
    query.push(`until:${config.until}`);
  }

  apiUrl.searchParams.set('query', query.join(' '));
  apiUrl.searchParams.set('queryType', 'Latest');

  return fetchAllTweets(apiUrl, API_KEY, maxItems);
}

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
    console.log('=== Debug: Request Body ===');
    console.log(JSON.stringify(body, null, 2));
    
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

      const tweets = await fetchAllTweets(apiUrl, API_KEY, maxItems);
      
      const transformedTweets = tweets.map((tweet: any) => ({
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

    // Fetch tweets for each author separately
    const itemsPerAuthor = Math.ceil(maxItems / cleanAuthors.length);
    
    const tweetsPromises = cleanAuthors.map(author => 
      fetchUserTweets(author, API_KEY, itemsPerAuthor, {
        username,
        twitterContent,
        includeReplies,
        since,
        until
      })
    );

    const authorTweets = await Promise.all(tweetsPromises);
    const allTweets = authorTweets.flat();

    const transformedTweets = allTweets.map((tweet: any) => ({
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
    }));

    return NextResponse.json({
      success: true,
      data: {
        posts: transformedTweets
      }
    })
  } catch (error) {
    console.error('=== Error ===');
    console.error('Error details:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 })
  }
}
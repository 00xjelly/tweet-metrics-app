import { NextResponse } from 'next/server'

const BASE_API_URL = 'https://api.twitterapi.io/twitter'

async function* fetchUserTweets(author: string, API_KEY: string, maxItems: number, config: any) {
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
  
  let cursor = "";
  let fetched = 0;

  while (fetched < maxItems) {
    if (cursor) {
      apiUrl.searchParams.set('cursor', cursor);
    }

    const response = await fetch(apiUrl, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${await response.text()}`);
    }

    const data = await response.json();
    
    if (!data.tweets?.length) break;
    
    for (const tweet of data.tweets) {
      if (fetched >= maxItems) break;
      
      yield {
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
      };
      
      fetched++;
    }
    
    if (!data.has_next_page || !data.next_cursor) break;
    cursor = data.next_cursor;
  }
}

async function processUser(author: string, API_KEY: string, config: any) {
  const tweets: any[] = [];
  try {
    for await (const tweet of fetchUserTweets(author, API_KEY, config.maxItems, config)) {
      tweets.push(tweet);
    }
  } catch (error) {
    console.error(`Error fetching tweets for ${author}:`, error);
  }
  return tweets;
}

export async function POST(request: Request) {
  const API_KEY = process.env.NEXT_PUBLIC_TWITTER_API_KEY
  if (!API_KEY) {
    return NextResponse.json({
      success: false,
      error: 'API key not configured'
    }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { 
      '@': author,
      username,
      maxItems = 50,
      twitterContent,
      includeReplies = false,
      since,
      until,
      urls
    } = body

    if (urls && urls.length > 0) {
      const urlQuery = urls.map(url => `url:${url}`).join(' OR ')
      const apiUrl = new URL(`${BASE_API_URL}/tweet/advanced_search`)
      apiUrl.searchParams.set('query', urlQuery)
      apiUrl.searchParams.set('queryType', 'Latest')

      const response = await fetch(apiUrl, {
        headers: {
          'x-api-key': API_KEY
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${await response.text()}`);
      }

      const data = await response.json();
      const tweets = data.tweets.slice(0, maxItems).map((tweet: any) => ({
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
        data: { posts: tweets }
      });
    }

    const cleanAuthors = Array.isArray(author) 
      ? author.map(a => a?.trim().replace(/^@/, '')).filter(Boolean)
      : author ? [author.trim().replace(/^@/, '')] : []

    if (cleanAuthors.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'At least one author username is required'
      }, { status: 400 })
    }

    const config = {
      username,
      maxItems,
      twitterContent,
      includeReplies,
      since,
      until
    };

    // Process all users concurrently
    const userPromises = cleanAuthors.map(author => 
      processUser(author, API_KEY, config)
    );
    
    const results = await Promise.all(userPromises);
    const allTweets = results.flat();

    return NextResponse.json({
      success: true,
      data: { posts: allTweets }
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 })
  }
}
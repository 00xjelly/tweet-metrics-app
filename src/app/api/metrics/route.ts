import { NextResponse } from 'next/server'

const BASE_API_URL = 'https://api.twitterapi.io/twitter'
const BATCH_SIZE = 2
const BATCH_DELAY = 2000 // 2 second delay between batches

// ... [previous fetchUserTweets function remains same]

async function processBatch(authors: string[], API_KEY: string, config: any) {
  const tweets: any[] = [];
  await Promise.all(
    authors.map(async (author) => {
      try {
        for await (const tweet of fetchUserTweets(author, API_KEY, config.maxItems, config)) {
          tweets.push(tweet);
        }
      } catch (error) {
        console.error(`Error fetching tweets for ${author}:`, error);
      }
    })
  );
  return tweets;
}

export async function POST(request: Request) {
  // ... [previous code until batches creation]

  const allTweets = [];
  for (const batch of batches) {
    const batchTweets = await processBatch(batch, API_KEY, config);
    allTweets.push(...batchTweets);
    if (batches.indexOf(batch) < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
    }
  }

  return NextResponse.json({
    success: true,
    data: { posts: allTweets }
  });
}

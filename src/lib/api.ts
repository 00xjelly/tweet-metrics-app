interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

const APIFY_API_TOKEN = process.env.NEXT_PUBLIC_APIFY_API_TOKEN;
const ACTOR_ID = 'apify/tweet-scraper';

export async function analyzeMetrics(data: any): Promise<ApiResponse> {
  try {
    const urls = Array.isArray(data.urls) ? data.urls : [data.urls];
    
    // Call Apify API
    const response = await fetch(`https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${APIFY_API_TOKEN}`,
      },
      body: JSON.stringify({
        tweet_urls: urls,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tweet metrics');
    }

    const result = await response.json();
    
    // Transform Apify response to our format
    const transformedData = {
      success: true,
      data: {
        posts: urls.map((url: string) => ({
          url,
          metrics: {
            likes: result.data?.likeCount || 0,
            replies: result.data?.replyCount || 0,
            retweets: result.data?.retweetCount || 0,
            impressions: result.data?.viewCount || 0,
            bookmarks: result.data?.bookmarkCount || 0,
          }
        }))
      }
    };

    return transformedData;
  } catch (error) {
    console.error('Error analyzing metrics:', error);
    return {
      success: false,
      error: 'Failed to analyze tweet metrics'
    };
  }
}
interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

const APIFY_API_TOKEN = process.env.NEXT_PUBLIC_APIFY_API_TOKEN;
const ACTOR_ID = 'apify/tweet-scraper';

export async function analyzeMetrics(data: any): Promise<ApiResponse> {
  console.log('Analyzing metrics with data:', data);
  
  try {
    const urls = Array.isArray(data.urls) ? data.urls : [data.urls];
    console.log('Processing URLs:', urls);

    if (!APIFY_API_TOKEN) {
      console.error('APIFY_API_TOKEN is not defined');
      throw new Error('API token is missing');
    }

    // Call Apify API
    const apiUrl = `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync`;
    console.log('Making API request to:', apiUrl);

    const requestBody = {
      tweet_urls: urls,
    };
    console.log('Request body:', requestBody);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${APIFY_API_TOKEN}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error('Failed to fetch tweet metrics');
    }

    const result = await response.json();
    console.log('API response data:', result);
    
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

    console.log('Transformed data:', transformedData);
    return transformedData;
  } catch (error) {
    console.error('Error analyzing metrics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze tweet metrics'
    };
  }
}
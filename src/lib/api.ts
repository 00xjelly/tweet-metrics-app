interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

const APIFY_API_TOKEN = process.env.NEXT_PUBLIC_APIFY_API_TOKEN;
const ACTOR_ID = 'kaitoeasyapi~twitter-x-data-tweet-scraper-pay-per-result-cheapest';

export async function analyzeMetrics(data: any): Promise<ApiResponse> {
  console.log('Analyzing metrics with data:', data);
  
  try {
    const urls = Array.isArray(data.urls) ? data.urls : [data.urls];
    console.log('Processing URLs:', urls);

    if (!APIFY_API_TOKEN) {
      console.error('APIFY_API_TOKEN is not defined');
      throw new Error('API token is missing');
    }

    // Extract tweet IDs from URLs
    const tweetIds = urls.map(url => {
      const matches = url.match(/status\/([0-9]+)/);
      return matches ? matches[1] : null;
    }).filter(Boolean);

    if (tweetIds.length === 0) {
      throw new Error('No valid tweet IDs found in URLs');
    }

    // Call Apify API
    const apiUrl = `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items`;
    console.log('Making API request to:', apiUrl);

    const requestBody = {
      tweetIDs: tweetIds,
      maxItems: tweetIds.length,
      queryType: "Latest"
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

    const results = await response.json();
    console.log('API response data:', results);
    
    // Transform Apify response to our format
    const transformedData = {
      success: true,
      data: {
        posts: results.map((result: any) => ({
          url: urls[0], // Map back to original URL
          metrics: {
            likes: result.public_metrics?.like_count || 0,
            replies: result.public_metrics?.reply_count || 0,
            retweets: result.public_metrics?.retweet_count || 0,
            impressions: result.public_metrics?.impression_count || 0,
            bookmarks: 0 // Not provided in this API
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
interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

interface AnalyzeMetricsParams {
  type: 'post' | 'profile' | 'metrics';
  urls?: string[];
  username?: string;
  maxItems?: number;
}

const APIFY_API_TOKEN = process.env.NEXT_PUBLIC_APIFY_API_TOKEN;
const ACTOR_ID = 'kaitoeasyapi~twitter-x-data-tweet-scraper-pay-per-result-cheapest';

export async function analyzeMetrics(params: AnalyzeMetricsParams): Promise<ApiResponse> {
  console.log('Analyzing metrics with params:', params);
  
  try {
    if (!APIFY_API_TOKEN) {
      console.error('APIFY_API_TOKEN is not defined');
      throw new Error('API token is missing');
    }

    const apiUrl = `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items`;
    console.log('Making API request to:', apiUrl);

    let requestBody;

    if (params.type === 'post') {
      const urls = Array.isArray(params.urls) ? params.urls : [params.urls];
      console.log('Processing URLs:', urls);

      const tweetIds = urls.map(url => {
        const matches = url.match(/status\/([0-9]+)/);
        return matches ? matches[1] : null;
      }).filter(Boolean);

      if (tweetIds.length === 0) {
        throw new Error('No valid tweet IDs found in URLs');
      }

      requestBody = {
        tweetIDs: tweetIds,
        maxItems: tweetIds.length,
        queryType: "Latest"
      };
    } else if (params.type === 'profile') {
      requestBody = {
        from: params.username,
        maxItems: params.maxItems || 100,
        queryType: "Latest"
      };
    } else {
      throw new Error('Unsupported search type');
    }

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

    const transformedPosts = results.map((result: any) => ({
      author: result.author?.userName || params.username || 'Unknown',
      url: result.url || result.twitterUrl,
      text: result.text,
      metrics: {
        likes: result.likeCount || result.public_metrics?.like_count || 0,
        replies: result.replyCount || result.public_metrics?.reply_count || 0,
        retweets: result.retweetCount || result.public_metrics?.retweet_count || 0,
        impressions: result.viewCount || result.public_metrics?.impression_count || 0,
        bookmarks: result.bookmarkCount || result.public_metrics?.bookmark_count || 0
      }
    }));
    
    const transformedData = {
      success: true,
      data: {
        posts: transformedPosts
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

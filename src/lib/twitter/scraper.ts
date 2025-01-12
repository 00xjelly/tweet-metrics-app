import axios from 'axios';

interface TweetData {
  id: string;
  username: string;
  text: string;
  createdAt: string;
  metrics: {
    views?: number;
    likes?: number;
    replies?: number;
    retweets?: number;
    bookmarks?: number;
  };
}

export async function getTweetData(url: string): Promise<TweetData | null> {
  try {
    console.log('Starting getTweetData for URL:', url);
    console.log('APIFY_TOKEN exists:', !!process.env.APIFY_TOKEN);

    const tweetId = url.split('/').pop()?.split('?')[0];
    
    if (!tweetId) {
      console.error('Invalid tweet URL:', url);
      return null;
    }

    console.log('Extracted tweet ID:', tweetId);
    console.log('Making request to Apify API...');

    // Using the exact same actor and configuration as the metrics service
    const apiUrl = 'https://api.apify.com/v2/acts/kaitoeasyapi~twitter-x-data-tweet-scraper-pay-per-result-cheapest/run-sync-get-dataset-items';
    console.log('API URL:', apiUrl);

    const payload = {
      tweetIDs: [tweetId],
      maxItems: 1,
      queryType: "Latest"
    };
    console.log('Request payload:', payload);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.APIFY_TOKEN}`
    };
    console.log('Request headers:', {
      ...headers,
      'Authorization': headers.Authorization ? 'Bearer [REDACTED]' : 'Missing'
    });

    const response = await axios.post(apiUrl, payload, { headers });
    console.log('Apify response status:', response.status);
    console.log('Apify response data:', response.data);

    if (!response.data?.[0]) {
      console.error('No tweet data found for:', url);
      return null;
    }

    const tweet = response.data[0];
    console.log('Successfully parsed tweet data');

    // Map the response to match our expected format
    return {
      id: tweet.id,
      username: tweet.username || tweet.author_id,
      text: tweet.text,
      createdAt: tweet.created_at,
      metrics: {
        views: tweet.public_metrics?.impression_count,
        likes: tweet.public_metrics?.like_count,
        replies: tweet.public_metrics?.reply_count,
        retweets: tweet.public_metrics?.retweet_count
      }
    };

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
    } else {
      console.error('Non-Axios error fetching tweet data:', error);
    }
    throw error;
  }
}
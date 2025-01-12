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

    // Updated to use the correct actor name
    const apiUrl = 'https://api.apify.com/v2/acts/apify~twitter-scraper/run-sync-get-dataset-items';
    console.log('API URL:', apiUrl);

    const payload = {
      startUrls: [{ url }],
      maxTweets: 1,
      addUserInfo: false
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

    const response = await axios.post(apiUrl, payload);
    console.log('Apify response status:', response.status);
    console.log('Apify response data:', response.data);

    if (!response.data?.[0]) {
      console.error('No tweet data found for:', url);
      return null;
    }

    const tweet = response.data[0];
    console.log('Successfully parsed tweet data');

    return {
      id: tweet.id || tweetId,
      username: tweet.username || tweet.user?.username,
      text: tweet.full_text || tweet.text,
      createdAt: tweet.created_at,
      metrics: {
        views: tweet.view_count,
        likes: tweet.favorite_count || tweet.likes,
        replies: tweet.reply_count || tweet.replies,
        retweets: tweet.retweet_count || tweet.retweets,
        bookmarks: tweet.bookmark_count
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
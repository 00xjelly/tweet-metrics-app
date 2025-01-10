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
    const tweetId = url.split('/').pop()?.split('?')[0];
    
    if (!tweetId) {
      console.error('Invalid tweet URL:', url);
      return null;
    }

    const response = await axios.post('https://api.apify.com/v2/acts/quacker~tweet-scraper/run-sync-get-dataset-items', {
      tweets: [tweetId],
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.APIFY_TOKEN}`
      }
    });

    if (!response.data?.[0]) {
      console.error('No tweet data found for:', url);
      return null;
    }

    const tweet = response.data[0];

    return {
      id: tweet.id,
      username: tweet.username,
      text: tweet.text,
      createdAt: tweet.created_at,
      metrics: {
        views: tweet.views,
        likes: tweet.likes,
        replies: tweet.replies,
        retweets: tweet.retweets,
        bookmarks: tweet.bookmarks
      }
    };

  } catch (error) {
    console.error('Error fetching tweet data:', error);
    throw error;
  }
}
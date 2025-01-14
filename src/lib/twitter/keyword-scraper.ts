import axios from 'axios';
import { TweetData, MetricSearchParams } from '@/types/twitter';
import { validateSearchParams } from './validator';

interface KeywordScraperOptions {
  maxTweets?: number;
  maxConcurrency?: number;
}

export async function searchTweetsByKeyword(
  params: MetricSearchParams,
  options: KeywordScraperOptions = {}
): Promise<TweetData[]> {
  try {
    const { isValid, errors } = validateSearchParams(params);
    if (!isValid) {
      throw new Error(`Invalid search parameters: ${errors.join(', ')}`);
    }

    const apiUrl = 'https://api.apify.com/v2/acts/quacker~twitter-scraper/run-sync-get-dataset-items';
    
    const payload = {
      searchTerms: params.keywords,
      maxTweets: options.maxTweets || 100,
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate }),
      onlyVerified: false,
      onlyWithContent: true
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.APIFY_TOKEN}`
    };

    const response = await axios.post(apiUrl, payload, { headers });
    let tweets = response.data;

    // Filter by engagement rate if specified
    if (params.minEngagementRate !== undefined) {
      tweets = tweets.filter(tweet => {
        const engagementCount = 
          tweet.public_metrics.like_count +
          tweet.public_metrics.reply_count +
          tweet.public_metrics.retweet_count +
          tweet.public_metrics.quote_count;
        
        const impressions = tweet.public_metrics.impression_count;
        if (impressions === 0) return false;
        
        const engagementRate = (engagementCount / impressions) * 100;
        return engagementRate >= params.minEngagementRate!;
      });
    }

    // Filter by minimum impressions if specified
    if (params.minImpressions !== undefined) {
      tweets = tweets.filter(tweet => 
        tweet.public_metrics.impression_count >= params.minImpressions!
      );
    }

    return tweets.map(tweet => ({
      ...tweet,
      // Ensure consistent data structure
      public_metrics: {
        impression_count: tweet.public_metrics?.impression_count || 0,
        like_count: tweet.public_metrics?.like_count || 0,
        reply_count: tweet.public_metrics?.reply_count || 0,
        retweet_count: tweet.public_metrics?.retweet_count || 0,
        quote_count: tweet.public_metrics?.quote_count || 0,
        bookmark_count: tweet.public_metrics?.bookmark_count || 0,
        view_count: tweet.public_metrics?.view_count || 0
      }
    }));

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error in keyword scraper:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
    } else {
      console.error('Error in keyword scraper:', error);
    }
    throw error;
  }
}

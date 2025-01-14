import axios from 'axios';
import { TweetData, ProfileSearchParams } from '@/types/twitter';
import { validateSearchParams, extractProfileUsername } from './validator';

interface ProfileScraperOptions {
  maxTweets?: number;
  maxConcurrency?: number;
}

export async function getProfileTweets(
  profileUrl: string,
  params: ProfileSearchParams,
  options: ProfileScraperOptions = {}
): Promise<TweetData[]> {
  try {
    const username = extractProfileUsername(profileUrl);
    if (!username) {
      throw new Error(`Invalid profile URL: ${profileUrl}`);
    }

    const { isValid, errors } = validateSearchParams(params);
    if (!errors) {
      throw new Error(`Invalid search parameters: ${errors.join(', ')}`);
    }

    const apiUrl = 'https://api.apify.com/v2/acts/quacker~twitter-scraper/run-sync-get-dataset-items';
    
    const payload = {
      username,
      maxTweets: options.maxTweets || 100,
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate }),
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.APIFY_TOKEN}`
    };

    const response = await axios.post(apiUrl, payload, { headers });
    let tweets = response.data;

    // Apply keyword filtering if specified
    if (params.keywords?.length) {
      tweets = tweets.filter(tweet => 
        params.keywords!.some(keyword => 
          tweet.text.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    }

    // Apply engagement rate filtering if specified
    if (params.minEngagementRate !== undefined) {
      tweets = tweets.filter(tweet => {
        const engagementCount = 
          tweet.public_metrics.like_count +
          tweet.public_metrics.reply_count +
          tweet.public_metrics.retweet_count +
          tweet.public_metrics.quote_count;
        
        const engagementRate = 
          (engagementCount / tweet.public_metrics.impression_count) * 100;
        
        return engagementRate >= params.minEngagementRate!;
      });
    }

    // Apply impressions filtering if specified
    if (params.minImpressions !== undefined) {
      tweets = tweets.filter(tweet => 
        tweet.public_metrics.impression_count >= params.minImpressions!
      );
    }

    return tweets;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error in profile scraper:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
    } else {
      console.error('Error in profile scraper:', error);
    }
    throw error;
  }
}

export async function getMultipleProfileTweets(
  profileUrls: string[],
  params: ProfileSearchParams,
  options: ProfileScraperOptions = {}
): Promise<TweetData[]> {
  const maxConcurrent = options.maxConcurrency || 2;
  let allTweets: TweetData[] = [];

  // Process profiles in chunks to maintain concurrency limit
  for (let i = 0; i < profileUrls.length; i += maxConcurrent) {
    const chunk = profileUrls.slice(i, i + maxConcurrent);
    const promises = chunk.map(url => getProfileTweets(url, params, options));

    const chunkResults = await Promise.all(
      promises.map(p => p.catch(error => {
        console.error('Error processing profile:', error);
        return [] as TweetData[];
      }))
    );

    allTweets = allTweets.concat(chunkResults.flat());
  }

  return allTweets;
}

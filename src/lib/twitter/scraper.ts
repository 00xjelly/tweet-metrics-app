import axios from 'axios';
import { TweetData, DateFilter } from '@/types/twitter';
import { validateDateFilter, extractTweetId } from './validator';

interface ApifyOptions {
  dateFilter?: DateFilter;
  maxConcurrency?: number;
}

export async function getTweetData(
  url: string,
  options: ApifyOptions = {}
): Promise<TweetData | null> {
  try {
    console.log('Starting getTweetData for URL:', url);
    console.log('APIFY_TOKEN exists:', !!process.env.APIFY_TOKEN);

    const tweetId = extractTweetId(url);
    
    if (!tweetId) {
      console.error('Invalid tweet URL:', url);
      return null;
    }

    console.log('Extracted tweet ID:', tweetId);
    
    const dateFilter = validateDateFilter(options.dateFilter);
    console.log('Using date filter:', dateFilter);

    const apiUrl = 'https://api.apify.com/v2/acts/kaitoeasyapi~twitter-x-data-tweet-scraper-pay-per-result-cheapest/run-sync-get-dataset-items';
    
    const payload = {
      tweetIDs: [tweetId],
      maxItems: 1,
      queryType: "Latest",
      ...(dateFilter && {
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate
      })
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
    
    // Filter response data based on date if needed
    let tweetData = response.data;
    
    if (dateFilter && tweetData) {
      const tweetDate = new Date(tweetData.created_at);
      const startDate = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
      const endDate = dateFilter.endDate ? new Date(dateFilter.endDate) : null;
      
      if (
        (startDate && tweetDate < startDate) ||
        (endDate && tweetDate > endDate)
      ) {
        console.log('Tweet outside date range');
        return null;
      }
    }

    return tweetData;

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

export async function getTweetsData(
  urls: string[],
  options: ApifyOptions = {}
): Promise<(TweetData | null)[]> {
  const maxConcurrent = options.maxConcurrency || 3; // Default to 3 concurrent requests
  const results: (TweetData | null)[] = [];
  
  // Process URLs in chunks to maintain concurrency limit
  for (let i = 0; i < urls.length; i += maxConcurrent) {
    const chunk = urls.slice(i, i + maxConcurrent);
    const promises = chunk.map(url => getTweetData(url, options));
    
    const chunkResults = await Promise.all(promises);
    results.push(...chunkResults);
  }
  
  return results;
}

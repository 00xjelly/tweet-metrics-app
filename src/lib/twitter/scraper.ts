import axios from 'axios';
import { ApiTweetResponse } from '@/types/twitter';

export async function getTweetData(url: string): Promise<ApiTweetResponse[]> {
  try {
    console.log('Starting getTweetData for URL:', url);
    console.log('APIFY_TOKEN exists:', !!process.env.APIFY_TOKEN);

    const tweetId = url.split('/').pop()?.split('?')[0];
    
    if (!tweetId) {
      console.error('Invalid tweet URL:', url);
      return [];
    }

    console.log('Extracted tweet ID:', tweetId);
    console.log('Making request to Apify API...');

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

    // Ensure we always return an array
    return Array.isArray(response.data) ? response.data : [response.data];

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

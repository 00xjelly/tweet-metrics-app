"use client";

import { useEffect, useState } from 'react';

interface Tweet {
  id: string;
  url: string;
  type: string;
  tweet_id: string;
  twitter_url: string;
  text: string;
  source: string;
  retweet_count: number;
  reply_count: number;
  like_count: number;
  quote_count: number;
  view_count: number;
  bookmark_count: number;
  created_at: string;
  lang: string;
  conversation_id: string;
  author_info: {
    userName: string;
    name: string;
    description: string;
    followers: number;
    following: number;
    isVerified: boolean;
  };
}

interface ProcessingStatus {
  stage: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  processedCount?: number;
  totalCount?: number;
}

interface ResultsData {
  status: ProcessingStatus;
  tweets?: Tweet[];
}

export default function TweetsPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<ResultsData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const pollStatus = async () => {
      try {
        console.log('Fetching status for ID:', params.id);
        const response = await fetch(`/api/tweets/status?id=${params.id}`);
        const result = await response.json();

        console.log('Status response:', result);

        if (!result.success) {
          throw new Error(result.error);
        }

        setData(result.data);

        // Continue polling if not completed or failed
        if (result.data.status.stage !== 'completed' && result.data.status.stage !== 'failed') {
          setTimeout(pollStatus, 2000);
        }

      } catch (error) {
        console.error('Error in polling:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch status');
      }
    };

    pollStatus();
  }, [params.id]);

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4">
        <div>Loading...</div>
      </div>
    );
  }

  if (data.status.stage === 'failed') {
    return (
      <div className="p-4">
        <div className="text-red-500">
          Processing failed: {data.status.error || 'Unknown error'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Processing Status</h2>
        {data.tweets && data.tweets.length > 0 && (
          <button
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
            onClick={() => window.location.href = `/api/tweets/export?id=${params.id}`}
          >
            Export CSV
          </button>
        )}
      </div>

      <div className="p-4 bg-gray-50 rounded mb-8">
        <div>Stage: {data.status.stage}</div>
        <div>Progress: {data.status.progress}%</div>
        {data.status.processedCount !== undefined && (
          <div>
            Processed {data.status.processedCount} of {data.status.totalCount} tweets
          </div>
        )}
      </div>

      {data.tweets && data.tweets.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Tweet Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.tweets.map(tweet => (
              <div key={tweet.id} className="p-4 border rounded">
                <div className="font-bold">
                  @{tweet.author_info.userName}
                  {tweet.author_info.isVerified && (
                    <span className="ml-1 text-blue-500">✓</span>
                  )}
                </div>
                <div className="text-sm text-gray-500">{tweet.author_info.name}</div>
                <div className="text-sm text-gray-600 mb-2">
                  {new Date(tweet.created_at).toLocaleString()}
                </div>
                <div className="mb-4">{tweet.text}</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Views: {tweet.view_count?.toLocaleString()}</div>
                  <div>Likes: {tweet.like_count?.toLocaleString()}</div>
                  <div>Replies: {tweet.reply_count?.toLocaleString()}</div>
                  <div>Retweets: {tweet.retweet_count?.toLocaleString()}</div>
                  <div>Quotes: {tweet.quote_count?.toLocaleString()}</div>
                  <div>Bookmarks: {tweet.bookmark_count?.toLocaleString()}</div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  via {tweet.source}
                </div>
                <a 
                  href={tweet.twitter_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-2 text-sm text-blue-500 hover:underline block"
                >
                  View on Twitter
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
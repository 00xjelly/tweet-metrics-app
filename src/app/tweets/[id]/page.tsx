"use client";

import { useEffect, useState } from 'react';
import { ProcessingStatus, Tweet } from '@/db/schema';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

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
        const response = await fetch(`/api/tweets/status?id=${params.id}`);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error);
        }

        setData(result.data);

        if (result.data.status.stage !== 'completed' && result.data.status.stage !== 'failed') {
          setTimeout(pollStatus, 2000);
        }

      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch status');
      }
    };

    pollStatus();
  }, [params.id]);

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-500">{error}</div>
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
                <div className="font-bold">@{tweet.authorUsername}</div>
                <div className="text-sm text-gray-600 mb-2">
                  {new Date(tweet.createdAt).toLocaleString()}
                </div>
                <div className="mb-4">{tweet.content}</div>
                {tweet.metrics && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Views: {tweet.metrics.views?.toLocaleString()}</div>
                    <div>Likes: {tweet.metrics.likes?.toLocaleString()}</div>
                    <div>Replies: {tweet.metrics.replies?.toLocaleString()}</div>
                    <div>Retweets: {tweet.metrics.retweets?.toLocaleString()}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
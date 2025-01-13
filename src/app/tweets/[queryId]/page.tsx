"use client";

import { useEffect, useState } from 'react';
import { ActivityList } from '@/components/activity/activity-list';
import type { AnalyticsRequest, Tweet } from '@/db/schema';

interface PageProps {
  params: {
    queryId: string;
  };
}

export default function TweetQueryPage({ params }: PageProps) {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [request, setRequest] = useState<AnalyticsRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Start polling status
        const statusResponse = await fetch(`/api/tweets/status?id=${params.queryId}`);
        const statusData = await statusResponse.json();

        if (statusData.status.stage === 'completed') {
          const response = await fetch(`/api/tweets/${params.queryId}`);
          const data = await response.json();
          setTweets(data.tweets);
          setRequest(data.request);
        } else if (statusData.status.stage === 'failed') {
          setError('Analysis failed. Please try again.');
        } else {
          // Still processing
          setError('Analysis in progress...');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tweets');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Set up polling if needed
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [params.queryId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading tweets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 text-red-500 p-4 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">Tweet Analysis Results</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <ActivityList tweets={tweets} />
      </div>
    </div>
  );
}
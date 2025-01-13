"use client";

import { useEffect, useState } from 'react';
import { ActivityList } from '@/components/activity/activity-list';
import type { Tweet as ActivityTweet } from '@/db/schema';

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
  raw_response: any;
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

function cleanSourceText(source: string) {
  const div = document.createElement('div');
  div.innerHTML = source;
  const link = div.querySelector('a');
  return link ? link.textContent : source;
}

// Convert Tweet to ActivityTweet format
function convertToActivityTweet(tweet: Tweet): ActivityTweet {
  return {
    id: parseInt(tweet.id),
    tweetId: tweet.tweet_id,
    authorUsername: tweet.author_info.userName,
    content: tweet.text,
    createdAt: new Date(tweet.created_at),
    metrics: {
      views: tweet.view_count,
      likes: tweet.like_count,
      replies: tweet.reply_count,
      retweets: tweet.retweet_count,
      bookmarks: tweet.bookmark_count
    },
    lastUpdated: new Date(tweet.created_at),
    requestId: null
  };
}

export default function TweetsPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<ResultsData | null>(null);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'detailed' | 'activity'>('detailed');

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
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">Processing Status</h2>
          <div className="flex rounded-lg overflow-hidden border">
            <button
              className={`px-4 py-2 text-sm ${viewMode === 'detailed' ? 'bg-blue-500 text-white' : 'bg-white'}`}
              onClick={() => setViewMode('detailed')}
            >
              Detailed View
            </button>
            <button
              className={`px-4 py-2 text-sm ${viewMode === 'activity' ? 'bg-blue-500 text-white' : 'bg-white'}`}
              onClick={() => setViewMode('activity')}
            >
              Activity View
            </button>
          </div>
        </div>
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
          
          {viewMode === 'activity' ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <ActivityList tweets={data.tweets.map(convertToActivityTweet)} />
            </div>
          ) : (
            <div className="space-y-6">
              {data.tweets.map(tweet => {
                const tweetData = tweet.raw_response;
                
                return (
                  <div key={tweet.tweet_id} className="p-6 border rounded-lg bg-white shadow-sm">
                    {/* Author Info */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-bold text-lg">
                          @{tweet.author_info.userName}
                          {tweet.author_info.isVerified && (
                            <span className="ml-1 text-blue-500">✓</span>
                          )}
                        </div>
                        <div className="text-gray-500">{tweet.author_info.name}</div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(tweet.created_at).toLocaleString()}
                      </div>
                    </div>

                    {/* Tweet Content */}
                    <div className="mb-4 text-lg">{tweet.text}</div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-gray-500 text-sm">Views</div>
                        <div className="font-bold">{tweet.view_count?.toLocaleString()}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-500 text-sm">Likes</div>
                        <div className="font-bold">{tweet.like_count?.toLocaleString()}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-500 text-sm">Replies</div>
                        <div className="font-bold">{tweet.reply_count?.toLocaleString()}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-500 text-sm">Retweets</div>
                        <div className="font-bold">{tweet.retweet_count?.toLocaleString()}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-500 text-sm">Quotes</div>
                        <div className="font-bold">{tweet.quote_count?.toLocaleString()}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-500 text-sm">Bookmarks</div>
                        <div className="font-bold">{tweet.bookmark_count?.toLocaleString()}</div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div>via {cleanSourceText(tweet.source)}</div>
                      <a 
                        href={tweet.twitter_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View on Twitter →
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
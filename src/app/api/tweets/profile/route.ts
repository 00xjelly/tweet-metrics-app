import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { getMultipleProfileTweets } from '@/lib/twitter/profile-scraper';
import { ProfileSearchParams } from '@/types/twitter';

export const runtime = 'edge';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Request ID is required' },
      { status: 400 }
    );
  }

  try {
    // Get the analytics request
    const { data: analyticsRequest, error: fetchError } = await supabase
      .from('analytics_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !analyticsRequest) {
      throw new Error('Analytics request not found');
    }

    const { profileUrls, searchParams: params } = analyticsRequest.parameters as ProfileSearchParams;

    if (!profileUrls?.length) {
      throw new Error('No profile URLs provided');
    }

    // Update status to processing
    await supabase
      .from('analytics_requests')
      .update({
        status: {
          stage: 'processing',
          progress: 0,
          startedAt: new Date().toISOString(),
          totalCount: profileUrls.length
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    let processedCount = 0;
    const tweets = await getMultipleProfileTweets(profileUrls, params);

    // Store tweets in database
    for (const tweet of tweets) {
      const { error: upsertError } = await supabase
        .from('tweets')
        .upsert({
          id: crypto.randomUUID(),
          url: `https://twitter.com/${tweet.username}/status/${tweet.id}`,
          tweet_id: tweet.id,
          author_id: tweet.author_id,
          username: tweet.username,
          text: tweet.text,
          tweet_created_at: tweet.created_at,
          impression_count: tweet.public_metrics?.impression_count || 0,
          like_count: tweet.public_metrics?.like_count || 0,
          reply_count: tweet.public_metrics?.reply_count || 0,
          retweet_count: tweet.public_metrics?.retweet_count || 0,
          quote_count: tweet.public_metrics?.quote_count || 0,
          bookmark_count: tweet.public_metrics?.bookmark_count || 0,
          view_count: tweet.public_metrics?.view_count || 0,
          raw_data: tweet,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (upsertError) {
        console.error('Error upserting tweet:', upsertError);
      } else {
        processedCount++;
      }
    }

    // Update final status
    await supabase
      .from('analytics_requests')
      .update({
        status: {
          stage: 'completed',
          progress: 100,
          processedCount,
          totalCount: tweets.length,
          completedAt: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    return NextResponse.json({
      success: true,
      data: {
        processedCount,
        totalCount: tweets.length
      }
    });

  } catch (error) {
    console.error('Error in profile search:', error);

    await supabase
      .from('analytics_requests')
      .update({
        status: {
          stage: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    return NextResponse.json(
      { success: false, error: 'Failed to process profile search request' },
      { status: 500 }
    );
  }
}

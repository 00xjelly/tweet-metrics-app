import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { searchTweetsByKeyword } from '@/lib/twitter/keyword-scraper';
import { MetricSearchParams } from '@/types/twitter';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Request ID is required' },
        { status: 400 }
      );
    }

    // Get the analytics request
    const { data: analyticsRequest, error: fetchError } = await supabase
      .from('analytics_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !analyticsRequest) {
      throw new Error('Analytics request not found');
    }

    const params = analyticsRequest.parameters as MetricSearchParams;

    if (!params.keywords?.length) {
      throw new Error('No keywords provided for search');
    }

    // Update status to processing
    await supabase
      .from('analytics_requests')
      .update({
        status: {
          stage: 'processing',
          progress: 0,
          startedAt: new Date().toISOString(),
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    // Perform the search
    const tweets = await searchTweetsByKeyword(params);

    let processedCount = 0;

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
          impression_count: tweet.public_metrics.impression_count,
          like_count: tweet.public_metrics.like_count,
          reply_count: tweet.public_metrics.reply_count,
          retweet_count: tweet.public_metrics.retweet_count,
          quote_count: tweet.public_metrics.quote_count,
          bookmark_count: tweet.public_metrics.bookmark_count,
          view_count: tweet.public_metrics.view_count,
          raw_data: tweet,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          search_query: params.keywords.join(', ')
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
    console.error('Error in keyword search:', error);

    if (id) {
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
    }

    return NextResponse.json(
      { success: false, error: 'Failed to process keyword search request' },
      { status: 500 }
    );
  }
}

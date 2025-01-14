import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { getTweetData } from '@/lib/twitter/scraper';

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

    const urls = analyticsRequest.status.urls || [];

    // Update status to processing
    await supabase
      .from('analytics_requests')
      .update({
        status: {
          stage: 'processing',
          progress: 0,
          startedAt: new Date().toISOString(),
          totalCount: urls.length
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    let processedCount = 0;

    for (const url of urls) {
      try {
        console.log('Processing URL:', url);
        const tweetDataArray = await getTweetData(url);
        const tweet = tweetDataArray?.[0];
        
        if (tweet?.type === 'tweet') {
          console.log('Got tweet data:', tweet);
          
          // Store complete data in tweets table
          const { error: upsertError } = await supabase
            .from('tweets')
            .upsert({
              id: crypto.randomUUID(), // Unique ID for our record
              url: url,
              tweet_id: tweet.id,
              author_id: tweet.author.id,
              username: tweet.author.username,
              text: tweet.text,
              tweet_created_at: tweet.createdAt,
              impression_count: tweet.viewCount || 0,
              like_count: tweet.likeCount || 0,
              reply_count: tweet.replyCount || 0,
              retweet_count: tweet.retweetCount || 0,
              quote_count: tweet.quoteCount || 0,
              bookmark_count: tweet.bookmarkCount || 0,
              view_count: typeof tweet.viewCount === 'string' ? parseInt(tweet.viewCount) : tweet.viewCount || 0,
              raw_data: tweet, // Store complete raw response
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (upsertError) {
            console.error('Error upserting tweet:', upsertError);
            throw upsertError;
          }
        }

        processedCount++;

        // Update progress
        const { error: updateError } = await supabase
          .from('analytics_requests')
          .update({
            status: {
              stage: 'processing',
              progress: Math.round((processedCount / urls.length) * 100),
              processedCount,
              totalCount: urls.length
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (updateError) {
          console.error('Error updating progress:', updateError);
        }

      } catch (error) {
        console.error(`Error processing tweet URL ${url}:`, error);
      }
    }

    // Update final status
    const { error: finalUpdateError } = await supabase
      .from('analytics_requests')
      .update({
        status: {
          stage: 'completed',
          progress: 100,
          processedCount,
          totalCount: urls.length,
          completedAt: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (finalUpdateError) {
      console.error('Error updating final status:', finalUpdateError);
    }

    return NextResponse.json({
      success: true,
      data: {
        processedCount,
        totalCount: urls.length
      }
    });

  } catch (error) {
    console.error('Error processing analytics request:', error);
    
    await supabase
      .from('analytics_requests')
      .update({
        status: {
          stage: 'failed',
          progress: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
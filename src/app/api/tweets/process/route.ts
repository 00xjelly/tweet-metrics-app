import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { getTweetData } from '@/lib/twitter/scraper';

export const runtime = 'edge';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  console.log('Processing request for ID:', id);

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

    console.log('Found analytics request:', analyticsRequest);

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

    console.log('Updated status to processing');
    let processedCount = 0;

    for (const url of urls) {
      try {
        console.log('Processing URL:', url);
        const tweetData = await getTweetData(url);
        
        if (tweetData) {
          console.log('Got tweet data:', tweetData);
          
          // Store complete data in tweets table
          const { error: upsertError } = await supabase
            .from('tweets')
            .upsert({
              id: crypto.randomUUID(), // Unique ID for our record
              url: url,
              tweet_id: tweetData.id,
              author_id: tweetData.author_id,
              username: tweetData.username,
              text: tweetData.text,
              tweet_created_at: tweetData.created_at,
              impression_count: tweetData.public_metrics?.impression_count || 0,
              like_count: tweetData.public_metrics?.like_count || 0,
              reply_count: tweetData.public_metrics?.reply_count || 0,
              retweet_count: tweetData.public_metrics?.retweet_count || 0,
              quote_count: tweetData.public_metrics?.quote_count || 0,
              bookmark_count: tweetData.public_metrics?.bookmark_count || 0,
              view_count: tweetData.public_metrics?.view_count || 0,
              raw_data: tweetData, // Store complete raw response
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
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { getTweetData } from '@/lib/twitter/scraper';

export const runtime = 'edge';

export async function POST(request: Request) {
  // Move id declaration outside try block so it's available in catch
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
          // Insert or update tweet
          const { error: upsertError } = await supabase
            .from('tweets')
            .upsert({
              id: tweetData.id,
              url: url,
              data: {
                username: tweetData.username,
                text: tweetData.text,
                createdAt: tweetData.createdAt,
                metrics: tweetData.metrics
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (upsertError) {
            console.error('Error upserting tweet:', upsertError);
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
    
    // Update error status - now id is in scope
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
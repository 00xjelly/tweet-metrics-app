import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { getTweetData } from '@/lib/twitter/scraper';

export const runtime = 'edge';

export async function POST(
  request: Request,
  { searchParams }: { searchParams: { get: (key: string) => string | null } }
) {
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
        const tweetData = await getTweetData(url);
        
        if (tweetData) {
          // Insert or update tweet
          await supabase
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
        }

        processedCount++;

        // Update progress
        await supabase
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

      } catch (error) {
        console.error(`Error processing tweet URL ${url}:`, error);
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
          totalCount: urls.length,
          completedAt: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    return NextResponse.json({
      success: true,
      data: {
        processedCount,
        totalCount: urls.length
      }
    });

  } catch (error) {
    console.error('Error processing analytics request:', error);
    
    // Update error status
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
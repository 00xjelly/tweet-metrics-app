import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { z } from 'zod';
import { getTweetData } from '@/lib/twitter/scraper';

const RequestSchema = z.object({
  urls: z.array(z.string().url()).min(1)
});

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { urls } = RequestSchema.parse(body);

    console.log('Starting analysis with APIFY_TOKEN:', process.env.APIFY_TOKEN ? 'Present' : 'Missing');
    console.log('Analyzing URLs:', urls);

    // Insert into analytics_requests
    const { data: analyticsRequest, error: insertError } = await supabase
      .from('analytics_requests')
      .insert({
        id: crypto.randomUUID(),
        url: urls[0], // For now, just store the first URL
        status: {
          stage: 'queued',
          progress: 0,
          urls
        }
      })
      .select()
      .single();

    if (insertError) throw insertError;

    console.log('Created analytics request:', analyticsRequest.id);

    // Process directly
    try {
      console.log('Starting processing directly');
      
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
        .eq('id', analyticsRequest.id);

      console.log('Updated status to processing');
      let processedCount = 0;

      for (const url of urls) {
        try {
          console.log('About to call getTweetData for URL:', url);
          const tweetData = await getTweetData(url);
          console.log('getTweetData response:', tweetData);
          
          if (tweetData) {
            console.log('Upserting tweet data to Supabase');
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
              throw upsertError;
            }

            console.log('Successfully upserted tweet data');
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
            .eq('id', analyticsRequest.id);

        } catch (error) {
          console.error(`Error processing tweet URL ${url}:`, error);
          throw error;
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
        .eq('id', analyticsRequest.id);

      console.log('Processing completed successfully');

    } catch (processError) {
      console.error('Error in processing:', processError);
      // Update status to failed
      await supabase
        .from('analytics_requests')
        .update({
          status: {
            stage: 'failed',
            progress: 0,
            error: processError instanceof Error ? processError.message : 'Unknown error',
            completedAt: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', analyticsRequest.id);

      throw processError;
    }

    return NextResponse.json({
      success: true,
      data: {
        id: analyticsRequest.id,
        status: analyticsRequest.status
      }
    });
  } catch (error) {
    console.error('Error in analyze endpoint:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
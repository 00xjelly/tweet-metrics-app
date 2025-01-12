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

    const { data: analyticsRequest, error: insertError } = await supabase
      .from('analytics_requests')
      .insert({
        id: crypto.randomUUID(),
        url: urls[0],
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

    try {
      console.log('Starting processing directly');
      
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

      let processedCount = 0;

      for (const url of urls) {
        try {
          console.log('Processing URL:', url);
          const apiResponse = await getTweetData(url);
          console.log('Got API response:', apiResponse);
          
          if (apiResponse && apiResponse[0] && apiResponse[0].type === 'tweet') {
            const tweet = apiResponse[0];
            console.log('Processing tweet:', tweet.id);
            
            // Extract media information from extended_entities or entities
            const mediaItems = tweet.extended_entities?.media || tweet.entities?.media || [];
            
            const { error: upsertError } = await supabase
              .from('tweets')
              .upsert({
                analytics_request_id: analyticsRequest.id,
                tweet_id: tweet.id,
                url: url,
                type: tweet.type,
                twitter_url: tweet.twitterUrl,
                text: tweet.text,
                source: tweet.source,
                retweet_count: tweet.retweetCount,
                reply_count: tweet.replyCount,
                like_count: tweet.likeCount,
                quote_count: tweet.quoteCount,
                view_count: parseInt(tweet.viewCount) || 0,
                bookmark_count: tweet.bookmarkCount,
                created_at: new Date(tweet.createdAt).toISOString(),
                updated_at: new Date().toISOString(),
                lang: tweet.lang,
                conversation_id: tweet.conversationId,
                author_info: tweet.author,
                raw_response: tweet,
                media_items: mediaItems
              }, { 
                onConflict: 'analytics_request_id,tweet_id'
              });

            if (upsertError) {
              console.error('Error upserting tweet:', upsertError);
              throw upsertError;
            }

            console.log('Successfully stored tweet:', tweet.id);
          }

          processedCount++;
          
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
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
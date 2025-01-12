import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(
  request: Request,
  { searchParams }: { searchParams: { get: (key: string) => string | null } }
) {
  try {
    const id = searchParams.get('id');

    if (!id) {
      console.error('No ID provided');
      return NextResponse.json(
        { success: false, error: 'Request ID is required' },
        { status: 400 }
      );
    }

    console.log('Fetching analytics request with ID:', id);

    // Get analytics request
    const { data: analyticsRequest, error: requestError } = await supabase
      .from('analytics_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (requestError) {
      console.error('Error fetching analytics request:', requestError);
      return NextResponse.json(
        { success: false, error: 'Request not found', details: requestError.message },
        { status: 404 }
      );
    }

    if (!analyticsRequest) {
      console.error('No analytics request found for ID:', id);
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }

    console.log('Found analytics request:', analyticsRequest);

    // Get tweets if processing is completed
    let tweets = [];
    if (analyticsRequest.status?.stage === 'completed') {
      console.log('Fetching associated tweets');
      const { data: tweetData, error: tweetsError } = await supabase
        .from('tweets')
        .select('*')
        .eq('url', analyticsRequest.url);

      if (tweetsError) {
        console.error('Error fetching tweets:', tweetsError);
      } else {
        tweets = tweetData;
        console.log('Found tweets:', tweets.length);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        status: analyticsRequest.status,
        tweets: analyticsRequest.status?.stage === 'completed' ? tweets : undefined
      }
    });

  } catch (error) {
    console.error('Error in status endpoint:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(
  request: Request,
  { searchParams }: { searchParams: { get: (key: string) => string | null } }
) {
  try {
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Request ID is required' },
        { status: 400 }
      );
    }

    // Get analytics request
    const { data: analyticsRequest, error: requestError } = await supabase
      .from('analytics_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (requestError || !analyticsRequest) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }

    // Get tweets if processing is completed
    let tweets = [];
    if (analyticsRequest.status.stage === 'completed') {
      const { data: tweetData, error: tweetsError } = await supabase
        .from('tweets')
        .select('*')
        .eq('url', analyticsRequest.url);

      if (!tweetsError) {
        tweets = tweetData;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        status: analyticsRequest.status,
        tweets: analyticsRequest.status.stage === 'completed' ? tweets : undefined
      }
    });

  } catch (error) {
    console.error('Error fetching status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}
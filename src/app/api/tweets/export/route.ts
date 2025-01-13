import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryId = searchParams.get('id');

    if (!queryId) {
      return NextResponse.json(
        { success: false, error: 'No ID provided' },
        { status: 400 }
      );
    }

    console.log('Attempting to export tweets for queryId:', queryId);

    const { data: results, error } = await supabase
      .from('tweets')
      .select('*')
      .eq('analytics_request_id', queryId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    if (!results || results.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No tweets found for this request' },
        { status: 404 }
      );
    }

    // Convert to CSV with only URLs for re-import compatibility
    const csvHeaders = ['URL'];
    const csvRows = results.map(tweet => [tweet.twitter_url || '']);

    const csv = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=tweet-urls-${queryId}.csv`
      }
    });

  } catch (error) {
    console.error('Error exporting tweets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export tweets' },
      { status: 500 }
    );
  }
}
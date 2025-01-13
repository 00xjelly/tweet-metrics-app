import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { queryId: string } }
) {
  try {
    const queryId = parseInt(params.queryId);
    console.log('Attempting to export tweets for queryId:', queryId);

    // Using Supabase client instead of Drizzle
    const { data: results, error } = await supabase
      .from('tweets')
      .select('*')
      .eq('request_id', queryId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    console.log('Query results:', results ? `Found ${results.length} tweets` : 'No results');

    if (!results || results.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No tweets found for this request' },
        { status: 404 }
      );
    }

    // Convert to CSV
    const csvHeaders = [
      'Tweet ID',
      'Author',
      'Content',
      'Created At',
      'Views',
      'Likes',
      'Replies',
      'Retweets',
      'Bookmarks'
    ].join(',');

    const csvRows = results.map(tweet => [
      tweet.tweet_id,
      tweet.author_username,
      `"${(tweet.content || '').replace(/"/g, '""')}"`,
      tweet.created_at,
      tweet.metrics?.views || 0,
      tweet.metrics?.likes || 0,
      tweet.metrics?.replies || 0,
      tweet.metrics?.retweets || 0,
      tweet.metrics?.bookmarks || 0
    ].join(','));

    const csv = [csvHeaders, ...csvRows].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=tweet-analysis-${queryId}.csv`
      }
    });

  } catch (error) {
    console.error('Detailed export error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export tweets' },
      { status: 500 }
    );
  }
}
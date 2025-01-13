import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: { queryId: string } }
) {
  try {
    const queryId = params.queryId;
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
      tweet.author_info?.username || '',
      `"${(tweet.text || '').replace(/"/g, '""')}"`,
      tweet.created_at,
      tweet.view_count || 0,
      tweet.like_count || 0,
      tweet.reply_count || 0,
      tweet.retweet_count || 0,
      tweet.bookmark_count || 0
    ].join(','));

    const csv = [csvHeaders, ...csvRows].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=tweet-analysis-${queryId}.csv`
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
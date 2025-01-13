import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { requestId: string } }
) {
  try {
    const requestId = parseInt(params.requestId);

    // Fetch tweets for this request
    const { data: tweets, error } = await supabase
      .from('tweets')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!tweets || tweets.length === 0) {
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

    const csvRows = tweets.map(tweet => [
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
        'Content-Disposition': `attachment; filename=tweet-analysis-${requestId}.csv`
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
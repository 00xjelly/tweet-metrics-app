import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tweets } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: { requestId: string } }
) {
  try {
    console.log('Starting export for request:', params.requestId);
    const requestId = parseInt(params.requestId);

    if (isNaN(requestId)) {
      console.error('Invalid requestId:', params.requestId);
      return NextResponse.json(
        { success: false, error: 'Invalid request ID' },
        { status: 400 }
      );
    }

    console.log('Fetching tweets for requestId:', requestId);
    const results = await db.query.tweets.findMany({
      where: eq(tweets.requestId, requestId),
      orderBy: (tweets, { desc }) => [desc(tweets.createdAt)]
    });

    console.log(`Found ${results.length} tweets`);

    if (results.length === 0) {
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
      tweet.tweetId,
      tweet.authorUsername || '',
      `"${(tweet.content || '').replace(/"/g, '""')}"`,
      tweet.createdAt?.toISOString() || '',
      tweet.metrics?.views || 0,
      tweet.metrics?.likes || 0,
      tweet.metrics?.replies || 0,
      tweet.metrics?.retweets || 0,
      tweet.metrics?.bookmarks || 0
    ].join(','));

    const csv = [csvHeaders, ...csvRows].join('\n');

    console.log('CSV generated successfully');

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
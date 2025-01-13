import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tweets } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: { queryId: string } }
) {
  try {
    console.log('Starting export for query:', params.queryId);
    const queryId = parseInt(params.queryId);

    if (isNaN(queryId)) {
      console.error('Invalid queryId:', params.queryId);
      return NextResponse.json(
        { success: false, error: 'Invalid query ID' },
        { status: 400 }
      );
    }

    console.log('Fetching tweets for queryId:', queryId);
    const results = await db.query.tweets.findMany({
      where: eq(tweets.queryId, queryId),
      orderBy: (tweets, { desc }) => [desc(tweets.createdAt)]
    });

    console.log(`Found ${results.length} tweets`);

    if (results.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No tweets found for this query' },
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
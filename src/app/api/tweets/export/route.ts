import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tweets } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'No request ID provided' },
        { status: 400 }
      );
    }

    const requestId = parseInt(id);
    if (isNaN(requestId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request ID' },
        { status: 400 }
      );
    }

    const results = await db.select().from(tweets)
      .where(eq(tweets.requestId, requestId));

    if (!results || results.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No tweets found' },
        { status: 404 }
      );
    }

    const csvRows = results.map(tweet => [
      tweet.tweetId,
      tweet.authorUsername,
      tweet.content,
      tweet.metrics?.views || 0,
      tweet.metrics?.likes || 0,
      tweet.metrics?.replies || 0,
      tweet.metrics?.retweets || 0,
      tweet.metrics?.bookmarks || 0
    ].join(','));

    const csvHeaders = ['Tweet ID', 'Author', 'Content', 'Views', 'Likes', 'Replies', 'Retweets', 'Bookmarks'].join(',');
    const csv = [csvHeaders, ...csvRows].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="tweets-${id}.csv"`
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
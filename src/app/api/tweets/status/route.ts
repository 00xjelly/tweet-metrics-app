import { NextResponse } from 'next/server';
import { db } from '../../../../db';
import { analyticsRequests, tweets } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { searchParams }: { searchParams: { get: (key: string) => string | null } }
) {
  try {
    const id = parseInt(searchParams.get('id') || '');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Request ID is required' },
        { status: 400 }
      );
    }

    const request = await db.query.analyticsRequests.findFirst({
      where: eq(analyticsRequests.id, id)
    });

    if (!request) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }

    const tweetData = await db.query.tweets.findMany({
      where: eq(tweets.requestId, id)
    });

    return NextResponse.json({
      success: true,
      data: {
        status: request.status,
        tweets: request.status.stage === 'completed' ? tweetData : undefined
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
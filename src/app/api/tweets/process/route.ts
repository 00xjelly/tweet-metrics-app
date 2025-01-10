import { NextResponse } from 'next/server';
import { db } from '@/db';
import { analyticsRequests, tweets } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getTweetData } from '@/lib/twitter/scraper';

export const runtime = 'edge';

export async function POST(
  request: Request,
  { searchParams }: { searchParams: { get: (key: string) => string | null } }
) {
  const id = parseInt(searchParams.get('id') || '');

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Request ID is required' },
      { status: 400 }
    );
  }

  try {
    const analyticsRequest = await db.query.analyticsRequests.findFirst({
      where: eq(analyticsRequests.id, id)
    });

    if (!analyticsRequest) {
      return NextResponse.json(
        { success: false, error: 'Analytics request not found' },
        { status: 404 }
      );
    }

    await db.update(analyticsRequests)
      .set({
        status: {
          stage: 'processing',
          progress: 0,
          startedAt: new Date().toISOString(),
          totalCount: analyticsRequest.urls.length
        },
        updatedAt: new Date()
      })
      .where(eq(analyticsRequests.id, id));

    const processedTweets = [];
    let processedCount = 0;

    for (const url of analyticsRequest.urls) {
      try {
        const tweetData = await getTweetData(url);
        
        if (tweetData) {
          const [tweet] = await db.insert(tweets)
            .values({
              tweetId: tweetData.id,
              authorUsername: tweetData.username,
              content: tweetData.text,
              createdAt: new Date(tweetData.createdAt),
              metrics: tweetData.metrics,
              requestId: id
            })
            .onConflictDoUpdate({
              target: tweets.tweetId,
              set: {
                metrics: tweetData.metrics,
                lastUpdated: new Date()
              }
            })
            .returning();

          processedTweets.push(tweet);
        }

        processedCount++;

        await db.update(analyticsRequests)
          .set({
            status: {
              stage: 'processing',
              progress: Math.round((processedCount / analyticsRequest.urls.length) * 100),
              processedCount,
              totalCount: analyticsRequest.urls.length
            },
            updatedAt: new Date()
          })
          .where(eq(analyticsRequests.id, id));

      } catch (error) {
        console.error(`Error processing tweet URL ${url}:`, error);
      }
    }

    await db.update(analyticsRequests)
      .set({
        status: {
          stage: 'completed',
          progress: 100,
          processedCount,
          totalCount: analyticsRequest.urls.length,
          completedAt: new Date().toISOString()
        },
        updatedAt: new Date()
      })
      .where(eq(analyticsRequests.id, id));

    return NextResponse.json({
      success: true,
      data: {
        processedCount,
        totalCount: analyticsRequest.urls.length
      }
    });

  } catch (error) {
    console.error('Error processing analytics request:', error);
    
    await db.update(analyticsRequests)
      .set({
        status: {
          stage: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date().toISOString()
        },
        updatedAt: new Date()
      })
      .where(eq(analyticsRequests.id, id));

    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
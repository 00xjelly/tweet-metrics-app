import { NextResponse } from 'next/server';
import { db } from '@/db';
import { analyticsRequests } from '@/db/schema';
import { ProcessingStatus } from '@/db/schema';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const urls = body.urls;

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No URLs provided' },
        { status: 400 }
      );
    }

    // Initialize status
    const initialStatus: ProcessingStatus = {
      stage: 'queued',
      progress: 0,
      startedAt: new Date().toISOString(),
      processedCount: 0,
      totalCount: urls.length
    };

    const [result] = await db.insert(analyticsRequests)
      .values({
        urls: urls,
        status: initialStatus
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        requestId: result.id,
        status: result.status
      }
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
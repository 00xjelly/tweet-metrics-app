import { NextResponse } from 'next/server';
import { db } from '@/db';
import { analyticsRequests } from '@/db/schema';
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

    const result = await db.select().from(analyticsRequests)
      .where(eq(analyticsRequests.id, requestId));

    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: result[0].id,
        status: result[0].status,
        urls: result[0].urls
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
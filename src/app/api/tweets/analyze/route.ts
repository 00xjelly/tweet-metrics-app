import { NextResponse } from 'next/server';
import { db } from '../../../../db';
import { analyticsRequests } from '../../../../db/schema';
import { z } from 'zod';

const RequestSchema = z.object({
  urls: z.array(z.string().url()).min(1)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { urls } = RequestSchema.parse(body);

    const [analyticsRequest] = await db.insert(analyticsRequests)
      .values({
        urls,
        status: {
          stage: 'queued',
          progress: 0
        }
      })
      .returning();

    // Start processing
    fetch(`${request.headers.get('origin')}/api/tweets/process?id=${analyticsRequest.id}`, {
      method: 'POST'
    }).catch(console.error); // Non-blocking call

    return NextResponse.json({
      success: true,
      data: {
        id: analyticsRequest.id,
        status: analyticsRequest.status
      }
    });
  } catch (error) {
    console.error('Error processing request:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
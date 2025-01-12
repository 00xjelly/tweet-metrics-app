import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { z } from 'zod';

const RequestSchema = z.object({
  urls: z.array(z.string().url()).min(1)
});

export async function POST(request: Request) {
  try {
    // Create anonymous session for testing
    const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
      email: process.env.TEST_USER_EMAIL || 'test@example.com',
      password: process.env.TEST_USER_PASSWORD || 'test123'
    });

    if (authError) {
      console.error('Auth error:', authError);
      // Continue anyway for now
    }

    const body = await request.json();
    const { urls } = RequestSchema.parse(body);

    // Insert into analytics_requests
    const { data: analyticsRequest, error: insertError } = await supabase
      .from('analytics_requests')
      .insert({
        id: crypto.randomUUID(),
        url: urls[0], // For now, just store the first URL
        status: {
          stage: 'queued',
          progress: 0,
          urls
        },
        user_id: session?.user?.id || null // Add user_id if we have a session
      })
      .select()
      .single();

    if (insertError) throw insertError;

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
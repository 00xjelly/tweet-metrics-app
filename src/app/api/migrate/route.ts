import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // Create analytics_requests table
    await supabase.from('analytics_requests').create_table({
      id: 'text PRIMARY KEY',
      url: 'text',
      status: 'jsonb',
      createdAt: 'text',
      updatedAt: 'text'
    });

    // Create tweets table
    await supabase.from('tweets').create_table({
      id: 'text PRIMARY KEY', 
      url: 'text',
      data: 'jsonb',
      createdAt: 'text',
      updatedAt: 'text'
    });

    return NextResponse.json({
      message: 'Database tables created successfully',
      status: 'success'
    }, { status: 200 });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({
      message: 'Database migration failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createTables } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // Create tables
    await createTables();

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

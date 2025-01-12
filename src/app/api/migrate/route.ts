import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // Create analytics_requests table
    await sql`
      CREATE TABLE IF NOT EXISTS analytics_requests (
        id TEXT PRIMARY KEY,
        url TEXT,
        status JSONB,
        createdAt TEXT,
        updatedAt TEXT
      );
    `;

    // Create tweets table
    await sql`
      CREATE TABLE IF NOT EXISTS tweets (
        id TEXT PRIMARY KEY,
        url TEXT,
        data JSONB,
        createdAt TEXT,
        updatedAt TEXT
      );
    `;

    return NextResponse.json({ 
      message: 'Database tables created successfully',
      status: 'success'
    }, { status: 200 });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      message: 'Database migration failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      fullError: JSON.stringify(error),
      status: 'error'
    }, { status: 500 });
  }
}

// Ensure this route can be reached
export const dynamic = 'force-dynamic';
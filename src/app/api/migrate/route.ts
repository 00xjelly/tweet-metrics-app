import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../db';
import { analyticsRequests, tweets } from '../../../db/schema';

export const runtime = 'edge'; // Explicitly set runtime to prevent static generation

export async function GET(request: NextRequest) {
  try {
    // Create tables if they don't exist
    await db.run(`
      CREATE TABLE IF NOT EXISTS analytics_requests (
        id TEXT PRIMARY KEY,
        url TEXT,
        status JSONB,
        createdAt TEXT,
        updatedAt TEXT
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS tweets (
        id TEXT PRIMARY KEY,
        url TEXT,
        data JSONB,
        createdAt TEXT,
        updatedAt TEXT
      )
    `);

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

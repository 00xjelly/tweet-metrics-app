import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    await db.execute(sql`DROP TABLE IF EXISTS tweets CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS analytics_requests CASCADE`);

    await db.execute(sql`
      CREATE TABLE analytics_requests (
        id SERIAL PRIMARY KEY,
        urls JSONB NOT NULL,
        status JSONB NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE tweets (
        id SERIAL PRIMARY KEY,
        tweet_id TEXT NOT NULL UNIQUE,
        author_username TEXT,
        content TEXT,
        created_at TIMESTAMP NOT NULL,
        metrics JSONB,
        last_updated TIMESTAMP NOT NULL DEFAULT NOW(),
        request_id INTEGER REFERENCES analytics_requests(id)
      )
    `);

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully'
    });

  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json(
      { success: false, error: 'Migration failed' },
      { status: 500 }
    );
  }
}
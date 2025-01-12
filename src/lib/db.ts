import { sql } from '@vercel/postgres';

// This function creates a connection to your Vercel Postgres database
export async function createTables() {
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

    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

// Export the sql function for direct database operations
export { sql };

import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from '@/db/schema';

const db = drizzle(sql, { schema });

export { db, sql };
export * from '@/db/schema';
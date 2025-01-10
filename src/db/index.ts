import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from 'drizzle-orm';
import * as schema from './schema';
import { createClient } from '@vercel/postgres';

const client = createClient();

export const db = drizzle(client, { schema });

export { sql };
export * from './schema';
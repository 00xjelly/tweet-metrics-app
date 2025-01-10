import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from 'drizzle-orm';
import { createClient } from '@vercel/postgres';
import * as schema from './schema';

const client = createClient();

export const db = drizzle(client, { schema });

export { sql };
export * from './schema';
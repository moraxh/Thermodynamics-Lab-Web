import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '@/lib/env';

// Usar la DATABASE_URL directamente (ya debe estar configurada con el pooler en producción)
const client = postgres(env.DATABASE_URL, {
  max: env.NODE_ENV === 'production' ? 10 : 1,
  idle_timeout: env.NODE_ENV === 'production' ? 20 : undefined,
});

export const db = drizzle(client, { schema });

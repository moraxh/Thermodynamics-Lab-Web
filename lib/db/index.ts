import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '@/lib/env';

// Configurar conexión según el entorno
const connectionString = env.NODE_ENV === 'production' 
  ? env.DATABASE_URL.replace('postgresql://', 'postgresql://').replace('5432', '6543') // Supabase usa puerto 6543 para pooling
  : env.DATABASE_URL;

const client = postgres(connectionString, {
  max: env.NODE_ENV === 'production' ? 10 : 1,
  idle_timeout: env.NODE_ENV === 'production' ? 20 : undefined,
});

export const db = drizzle(client, { schema });

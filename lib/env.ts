import { z } from 'zod';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL debe ser una URL válida de PostgreSQL'),

  // NextAuth
  AUTH_SECRET: z
    .string()
    .min(32, 'AUTH_SECRET debe tener al menos 32 caracteres')
    .describe('Genera con: openssl rand -base64 32'),
  AUTH_URL: z.string().url('AUTH_URL debe ser una URL válida'),

  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

// Validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse({
      DATABASE_URL: process.env.DATABASE_URL,
      AUTH_SECRET: process.env.AUTH_SECRET,
      AUTH_URL: process.env.AUTH_URL,
      NODE_ENV: process.env.NODE_ENV,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Error en variables de entorno:');
      console.error(z.prettifyError(error));
      process.exit(1);
    }
    throw error;
  }
};

// Export validated environment variables
export const env = parseEnv();

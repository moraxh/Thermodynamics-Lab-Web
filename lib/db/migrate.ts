import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@/lib/env';

export async function runMigrations() {
  console.log('⏳ Ejecutando migraciones...');
  
  const migrationClient = postgres(env.DATABASE_URL, { max: 1 });
  
  try {
    const db = drizzle(migrationClient);
    
    await migrate(db, { 
      migrationsFolder: './lib/db/migrations',
    });
    
    console.log('✅ Migraciones completadas');
  } catch (error) {
    console.error('❌ Error al ejecutar migraciones:', error);
    throw error;
  } finally {
    await migrationClient.end();
  }
}

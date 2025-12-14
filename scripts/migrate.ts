import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local before importing other modules
config({ path: resolve(process.cwd(), '.env.local') });

import { runMigrations } from '@/lib/db/migrate';
import { seedDefaultAdmin } from '@/lib/db/seed';

async function main() {
  await runMigrations();
  await seedDefaultAdmin();
}

main().catch((error) => {
  console.error('Error en migración inicial:', error);
  process.exit(1);
});

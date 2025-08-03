import pkg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

const { Pool } = pkg;

// Función para crear mock de base de datos
const createMockDb = () => ({
  select: () => ({ 
    from: () => ({ 
      where: () => Promise.resolve([]),
      leftJoin: () => ({ where: () => Promise.resolve([]) })
    }) 
  }),
  insert: () => ({ 
    values: () => ({ 
      returning: () => Promise.resolve([]),
      onConflictDoNothing: () => Promise.resolve([])
    }) 
  }),
  update: () => ({ 
    set: () => ({ 
      where: () => Promise.resolve([]),
      returning: () => Promise.resolve([])
    }) 
  }),
  delete: () => ({ 
    where: () => Promise.resolve([]) 
  }),
  execute: () => Promise.resolve([])
} as any);

let db: ReturnType<typeof drizzle>;

// Verificar si estamos en build time
if (process.env.NODE_ENV === 'production') {
  console.log('Production build detected - using mock database');
  db = createMockDb();
} else {
  try {
    // Solo en desarrollo, intentar cargar variables de entorno
    const envModule = await import("astro:env/server").catch(() => ({ CONNECTION_STRING: '' }));
    const CONNECTION_STRING = envModule.CONNECTION_STRING || process.env.CONNECTION_STRING;
    
    if (!CONNECTION_STRING) {
      console.log('No CONNECTION_STRING found - using mock database');
      db = createMockDb();
    } else {
      const pool = new Pool({
        connectionString: CONNECTION_STRING,
      });
      db = drizzle(pool);
      console.log('Database connection established');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn('Database connection failed, using mock:', errorMessage);
    db = createMockDb();
  }
}

export { db };
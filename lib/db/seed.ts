import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from './schema';
import bcrypt from 'bcryptjs';
import { env } from '@/lib/env';
import crypto from 'crypto';

export async function seedDefaultAdmin() {
  const seedClient = postgres(env.DATABASE_URL, { max: 1 });
  const db = drizzle(seedClient);
  
  try {
    // Verificar si ya existe algún usuario
    const existingUsers = await db.select().from(users).limit(1);
    
    if (existingUsers.length > 0) {
      return; // Ya hay usuarios, no crear admin por defecto
    }

    const isDev = env.NODE_ENV === 'development';
    const username = 'admin';
    
    // Generar contraseña según el ambiente
    const password = isDev ? 'admin' : crypto.randomBytes(16).toString('hex');
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Crear usuario admin
    await db.insert(users).values({
      name: username,
      password: hashedPassword,
    });

    // Mostrar credenciales en consola
    console.log('\n' + '='.repeat(60));
    console.log('🔐 USUARIO ADMINISTRADOR CREADO');
    console.log('='.repeat(60));
    console.log(`Ambiente: ${isDev ? 'DESARROLLO' : 'PRODUCCIÓN'}`);
    console.log(`Usuario: ${username}`);
    console.log(`Contraseña: ${password}`);
    console.log('='.repeat(60) + '\n');
    
    if (!isDev) {
      console.log('⚠️  GUARDA ESTA CONTRASEÑA - NO SE MOSTRARÁ NUEVAMENTE\n');
    }
  } catch (error) {
    console.error('Error al crear usuario administrador:', error);
    throw error;
  } finally {
    await seedClient.end();
  }
}

import { config } from 'dotenv';
import { resolve, join } from 'path';
import { readFileSync, existsSync, copyFileSync, mkdirSync } from 'fs';

// Load .env.local before importing other modules
config({ path: resolve(process.cwd(), '.env.local') });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { env } from '@/lib/env';
import { supabaseAdmin } from '@/lib/supabase';
import {
  members,
  gallery,
  publications,
  videos,
  educationalMaterial,
  events,
  users,
} from '@/lib/db/schema';
import { seedDefaultAdmin } from '@/lib/db/seed';

type Environment = 'development' | 'production';

interface SeedConfig {
  environment: Environment;
  clearExisting: boolean;
}

interface FileCopyResult {
  copied: number;
  skipped: number;
  errors: number;
}

interface SeedRecord {
  id: string;
  [key: string]: unknown;
}

type DbInstance = PostgresJsDatabase<Record<string, never>>;

/**
 * Sanitiza el nombre del archivo para Supabase Storage
 * Remueve acentos y caracteres especiales
 */
function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize('NFD') // Descomponer caracteres con acento
    .replace(/[\u0300-\u036f]/g, '') // Remover marcas diacríticas
    .replace(/ñ/g, 'n')
    .replace(/Ñ/g, 'N')
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Reemplazar caracteres especiales con _
    .replace(/_+/g, '_') // Reemplazar múltiples _ con uno solo
    .toLowerCase();
}

/**
 * Determina el bucket correcto según el tipo de archivo
 */
function getBucketName(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();
  
  // Mapear extensiones a buckets
  if (ext === 'pdf') return 'documents';
  if (['mp4', 'webm', 'mov'].includes(ext || '')) return 'videos';
  if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext || '')) return 'images';
  
  return 'documents'; // Default
}

/**
 * Sube un archivo a Supabase Storage
 */
async function uploadToSupabase(localPath: string, remotePath: string): Promise<boolean> {
  if (!supabaseAdmin) {
    console.error('  ⚠️  Supabase admin client no está disponible');
    return false;
  }

  try {
    const bucket = getBucketName(localPath);
    const fileBuffer = readFileSync(localPath);
    
    // Extraer solo el nombre del archivo, sin la ruta uploads/tipo/
    const originalFileName = remotePath.split('/').pop() || remotePath;
    const sanitizedFileName = sanitizeFileName(originalFileName);
    
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(sanitizedFileName, fileBuffer, {
        contentType: getContentType(localPath),
        upsert: true,
      });

    if (error) {
      console.error(`  ❌ Error subiendo a Supabase (${bucket}): ${error.message}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`  ❌ Error leyendo archivo ${localPath}:`, error);
    return false;
  }
}

/**
 * Obtiene el content type basado en la extensión del archivo
 */
function getContentType(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();
  const contentTypes: Record<string, string> = {
    'pdf': 'application/pdf',
    'mp4': 'video/mp4',
    'webp': 'image/webp',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
  };
  return contentTypes[ext || ''] || 'application/octet-stream';
}

/**
 * Copia archivos específicos basándose en las rutas en los JSON
 */
async function copySpecificFiles(environment: Environment, dataType: string): Promise<FileCopyResult> {
  const result: FileCopyResult = { copied: 0, skipped: 0, errors: 0 };
  
  // Cargar los datos JSON para saber qué archivos copiar
  const data = loadSeedData(environment, dataType);
  if (data.length === 0) return result;

  // Determinar el campo que contiene la ruta del archivo
  const fileFields: Record<string, string[]> = {
    'members': ['photo'],
    'gallery': ['path'],
    'publications': ['filePath'],
    'videos': ['videoPath', 'thumbnailPath'],
    'educational-material': ['filePath'],
  };

  const isProduction = environment === 'production';
  const fields = fileFields[dataType] || [];
  const filesToCopy = new Set<string>();

  // Recopilar todos los archivos que necesitamos
  data.forEach(item => {
    fields.forEach(field => {
      const fieldValue = item[field];
      if (fieldValue && typeof fieldValue === 'string') {
        // Extraer la ruta del archivo desde public/
        const filePath = fieldValue.replace(/^\//, ''); // Quitar / inicial
        filesToCopy.add(filePath);
      }
    });
  });

  // Copiar cada archivo
  const sharedPath = join(process.cwd(), 'seed_data', 'shared');
  const commonPath = join(process.cwd(), 'seed_data', environment, 'common');

  for (const relativeDestPath of filesToCopy) {
    const fileName = relativeDestPath.split('/').pop() || '';
    const destPath = join(process.cwd(), 'public', relativeDestPath);
    const destDir = join(process.cwd(), 'public', relativeDestPath.substring(0, relativeDestPath.lastIndexOf('/')));
    
    // Buscar el archivo en las carpetas source
    let found = false;
    
    // Buscar en múltiples ubicaciones posibles
    const possibleLocations = [
      // En la carpeta específica del tipo de datos (ej: shared/gallery/IMG_1508.webp)
      join(sharedPath, dataType, fileName),
      join(commonPath, fileName),
      // En subcarpetas comunes
      join(sharedPath, dataType, 'images', fileName),
      join(commonPath, 'pdf', fileName),
      join(commonPath, 'mp4', fileName),
      join(commonPath, 'webp', fileName),
      join(commonPath, 'images', fileName),
    ];
    
    for (const sourceFile of possibleLocations) {
      if (existsSync(sourceFile)) {
        const normalizedFileName = fileName.normalize('NFC');
        
        if (isProduction) {
          // En producción, subir a Supabase Storage
          const remotePath = relativeDestPath.replace(/^uploads\//, '');
          const uploaded = await uploadToSupabase(sourceFile, remotePath);
          if (uploaded) {
            result.copied++;
            found = true;
            break;
          } else {
            result.errors++;
          }
        } else {
          // En desarrollo, copiar localmente
          if (!existsSync(destDir)) {
            mkdirSync(destDir, { recursive: true });
          }
          
          const normalizedDestPath = destPath.replace(fileName, normalizedFileName);
          
          if (!existsSync(normalizedDestPath)) {
            try {
              copyFileSync(sourceFile, normalizedDestPath);
              result.copied++;
              found = true;
              break;
            } catch (error) {
              console.error(`  ❌ Error copiando ${fileName}:`, error);
              result.errors++;
            }
          } else {
            result.skipped++;
            found = true;
            break;
          }
        }
      }
    }
    
    if (!found && !existsSync(destPath)) {
      console.warn(`  ⚠️  Archivo no encontrado: ${fileName}`);
    }
  }

  return result;
}

/**
 * Copia todos los archivos necesarios para el seed
 */
async function copyAllSeedFiles(environment: Environment): Promise<void> {
  console.log('\n📂 Copiando archivos de seed...\n');

  let totalCopied = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  const dataTypes = ['members', 'gallery', 'publications', 'videos', 'educational-material'];

  for (const dataType of dataTypes) {
    console.log(`\n🔄 Procesando archivos de ${dataType}`);
    const result = await copySpecificFiles(environment, dataType);
    totalCopied += result.copied;
    totalSkipped += result.skipped;
    totalErrors += result.errors;
    
    if (result.copied > 0) {
      console.log(`  ✅ ${result.copied} archivos copiados`);
    }
    if (result.skipped > 0) {
      console.log(`  ⏭️  ${result.skipped} ya existían`);
    }
  }

  console.log('\n' + '─'.repeat(60));
  console.log(`📊 Resumen de archivos:`);
  console.log(`  ✅ Copiados: ${totalCopied}`);
  console.log(`  ⏭️  Omitidos: ${totalSkipped}`);
  if (totalErrors > 0) {
    console.log(`  ❌ Errores: ${totalErrors}`);
  }
  console.log('─'.repeat(60) + '\n');
}

/**
 * Valida que los datos tengan los campos requeridos
 */
function validateData(dataType: string, items: SeedRecord[]): boolean {
  const requiredFields: Record<string, string[]> = {
    members: ['id', 'fullName', 'position', 'typeOfMember'],
    gallery: ['id', 'path'],
    publications: ['id', 'title', 'description', 'type', 'authors', 'publicationDate'],
    videos: ['id', 'title', 'description', 'videoPath'],
    'educational-material': ['id', 'title', 'description', 'filePath'],
    events: ['id', 'title', 'description', 'typeOfEvent', 'startDate', 'startTime', 'endTime', 'location'],
  };

  const required = requiredFields[dataType];
  if (!required) return true;

  for (const item of items) {
    for (const field of required) {
      if (!(field in item) || item[field] === null || item[field] === undefined) {
        console.error(`❌ Campo requerido faltante: "${field}" en ${dataType}`, item);
        return false;
      }
    }
    
    // Validaciones especiales
    if (dataType === 'publications') {
      // Debe tener filePath O link (al menos uno)
      if (!item.filePath && !item.link) {
        console.error(`❌ Publications debe tener al menos filePath o link`, item);
        return false;
      }
      // Authors debe ser un array
      if (!Array.isArray(item.authors) || item.authors.length === 0) {
        console.error(`❌ Authors debe ser un array no vacío`, item);
        return false;
      }
    }
  }

  return true;
}

/**
 * Carga archivos JSON del directorio de seed data
 */
function loadSeedData(environment: Environment, dataType: string): SeedRecord[] {
  const paths = [
    // Datos compartidos (van en todos los ambientes)
    join(process.cwd(), 'seed_data', 'shared', dataType, `${dataType}.json`),
    // Datos específicos del ambiente
    join(process.cwd(), 'seed_data', environment, 'common', `${dataType}.json`),
  ];

  const allData: SeedRecord[] = [];
  const seenIds = new Set<string>();

  for (const path of paths) {
    if (existsSync(path)) {
      try {
        const fileContent = readFileSync(path, 'utf-8');
        const data = JSON.parse(fileContent);
        const arrayData = Array.isArray(data) ? data : [data];
        
        // Filtrar arrays vacíos
        if (arrayData.length === 0) {
          continue;
        }

        // Verificar duplicados de IDs
        for (const item of arrayData) {
          if (item.id && seenIds.has(item.id)) {
            console.warn(`⚠️  ID duplicado encontrado: ${item.id} en ${path}`);
            continue;
          }
          if (item.id) {
            seenIds.add(item.id);
          }
          allData.push(item);
        }
        
        console.log(`✅ Cargados ${arrayData.length} registros desde: ${path}`);
      } catch (error) {
        console.error(`❌ Error al cargar ${path}:`, error);
        throw error; // Detener si hay un error crítico
      }
    }
  }

  return allData;
}

/**
 * Seed members
 */
async function seedMembers(db: DbInstance, environment: Environment) {
  const data = loadSeedData(environment, 'members');
  
  if (data.length === 0) {
    console.log('⏭️  Sin datos de members para sembrar');
    return;
  }

  if (!validateData('members', data)) {
    throw new Error('Validación fallida para members');
  }

  try {
    // En producción, sanitizar nombres de archivos en las rutas
    const isProduction = environment === 'production';
    const processedData = isProduction ? data.map(item => {
      if (item.photo && typeof item.photo === 'string') {
        const parts = item.photo.split('/');
        const fileName = parts.pop() || '';
        const sanitized = sanitizeFileName(fileName);
        // Cambiar la ruta para que apunte a Supabase Storage
        const bucket = getBucketName(fileName);
        return {
          ...item,
          photo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${sanitized}`
        };
      }
      return item;
    }) : data;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.insert(members).values(processedData as any)
      .onConflictDoNothing();
    console.log(`✅ Sembrados ${data.length} members`);
  } catch (error) {
    console.error('❌ Error al sembrar members:', error);
    throw error;
  }
}

/**
 * Seed gallery
 */
async function seedGallery(db: DbInstance, environment: Environment) {
  const data = loadSeedData(environment, 'gallery');
  
  if (data.length === 0) {
    console.log('⏭️  Sin datos de gallery para sembrar');
    return;
  }

  try {
    const isProduction = environment === 'production';
    // Asegurar que las fechas se procesen correctamente
    const processedData = data.map(item => {
      let path = item.path as string;
      
      if (isProduction && path) {
        const fileName = path.split('/').pop() || '';
        const sanitized = sanitizeFileName(fileName);
        const bucket = getBucketName(fileName);
        path = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${sanitized}`;
      }
      
      return {
        ...item,
        path,
        uploadedAt: item.uploadedAt ? new Date(item.uploadedAt as string | number | Date) : new Date(),
      };
    });
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.insert(gallery).values(processedData as any)
      .onConflictDoNothing();
    console.log(`✅ Sembrados ${data.length} items de gallery`);
  } catch (error) {
    console.error('❌ Error al sembrar gallery:', error);
    throw error;
  }
}

/**
 * Seed publications
 */
async function seedPublications(db: DbInstance, environment: Environment) {
  const data = loadSeedData(environment, 'publications');
  
  if (data.length === 0) {
    console.log('⏭️  Sin datos de publications para sembrar');
    return;
  }

  try {
    const isProduction = environment === 'production';
    // Asegurar que las fechas se procesen correctamente
    const processedData = data.map(item => {
      let filePath = item.filePath as string | undefined;
      
      if (isProduction && filePath) {
        const fileName = filePath.split('/').pop() || '';
        const sanitized = sanitizeFileName(fileName);
        const bucket = getBucketName(fileName);
        filePath = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${sanitized}`;
      }
      
      return {
        ...item,
        filePath,
        publicationDate: new Date(item.publicationDate as string | number | Date),
      };
    });
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.insert(publications).values(processedData as any)
      .onConflictDoNothing();
    console.log(`✅ Sembrados ${data.length} publications`);
  } catch (error) {
    console.error('❌ Error al sembrar publications:', error);
    throw error;
  }
}

/**
 * Seed videos
 */
async function seedVideos(db: DbInstance, environment: Environment) {
  const data = loadSeedData(environment, 'videos');
  
  if (data.length === 0) {
    console.log('⏭️  Sin datos de videos para sembrar');
    return;
  }

  try {
    const isProduction = environment === 'production';
    // Asegurar que las fechas se procesen correctamente
    const processedData = data.map(item => {
      let videoPath = item.videoPath as string;
      let thumbnailPath = item.thumbnailPath as string | undefined;
      
      if (isProduction) {
        if (videoPath) {
          const fileName = videoPath.split('/').pop() || '';
          const sanitized = sanitizeFileName(fileName);
          const bucket = getBucketName(fileName);
          videoPath = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${sanitized}`;
        }
        if (thumbnailPath) {
          const fileName = thumbnailPath.split('/').pop() || '';
          const sanitized = sanitizeFileName(fileName);
          const bucket = getBucketName(fileName);
          thumbnailPath = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${sanitized}`;
        }
      }
      
      return {
        ...item,
        videoPath,
        thumbnailPath,
        uploadedAt: item.uploadedAt ? new Date(item.uploadedAt as string | number | Date) : new Date(),
      };
    });
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.insert(videos).values(processedData as any)
      .onConflictDoNothing();
    console.log(`✅ Sembrados ${data.length} videos`);
  } catch (error) {
    console.error('❌ Error al sembrar videos:', error);
    throw error;
  }
}

/**
 * Seed educational material
 */
async function seedEducationalMaterial(db: DbInstance, environment: Environment) {
  const data = loadSeedData(environment, 'educational-material');
  
  if (data.length === 0) {
    console.log('⏭️  Sin datos de educational material para sembrar');
    return;
  }

  try {
    const isProduction = environment === 'production';
    // Asegurar que las fechas se procesen correctamente
    const processedData = data.map(item => {
      let filePath = item.filePath as string;
      
      if (isProduction && filePath) {
        const fileName = filePath.split('/').pop() || '';
        const sanitized = sanitizeFileName(fileName);
        const bucket = getBucketName(fileName);
        filePath = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${sanitized}`;
      }
      
      return {
        ...item,
        filePath,
        uploadedAt: item.uploadedAt ? new Date(item.uploadedAt as string | number | Date) : new Date(),
      };
    });
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.insert(educationalMaterial).values(processedData as any)
      .onConflictDoNothing();
    console.log(`✅ Sembrados ${data.length} educational materials`);
  } catch (error) {
    console.error('❌ Error al sembrar educational material:', error);
    throw error;
  }
}

/**
 * Seed events
 */
async function seedEvents(db: DbInstance, environment: Environment) {
  const data = loadSeedData(environment, 'events');
  
  if (data.length === 0) {
    console.log('⏭️  Sin datos de events para sembrar');
    return;
  }

  try {
    // Asegurar que las fechas se procesen correctamente
    const processedData = data.map(item => ({
      ...item,
      uploadedAt: item.uploadedAt ? new Date(item.uploadedAt as string | number | Date) : new Date(),
    }));
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.insert(events).values(processedData as any)
      .onConflictDoNothing();
    console.log(`✅ Sembrados ${data.length} events`);
  } catch (error) {
    console.error('❌ Error al sembrar events:', error);
    throw error;
  }
}

/**
 * Limpia todas las tablas
 */
async function clearAllTables(db: DbInstance) {
  console.log('\n🗑️  Limpiando tablas existentes...');
  
  try {
    await db.delete(events);
    await db.delete(educationalMaterial);
    await db.delete(videos);
    await db.delete(publications);
    await db.delete(gallery);
    await db.delete(members);
    await db.delete(users);
    console.log('✅ Tablas limpiadas (incluyendo usuarios)\n');
  } catch (error) {
    console.error('❌ Error al limpiar tablas:', error);
    throw error;
  }
}

/**
 * Función principal de seeding
 */
async function seedDatabase(config: SeedConfig) {
  const seedClient = postgres(env.DATABASE_URL, { max: 1 });
  const db = drizzle(seedClient);

  try {
    console.log('\n' + '='.repeat(60));
    console.log('🌱 INICIANDO SEED DE BASE DE DATOS');
    console.log('='.repeat(60));
    console.log(`Ambiente: ${config.environment.toUpperCase()}`);
    console.log(`Limpiar existentes: ${config.clearExisting ? 'SÍ' : 'NO'}`);
    console.log('='.repeat(60) + '\n');

    // Paso 1: Copiar archivos físicos
    await copyAllSeedFiles(config.environment);

    // Paso 2: Limpiar tablas si es necesario
    if (config.clearExisting) {
      await clearAllTables(db);
      // Crear usuario admin después de limpiar
      await seedDefaultAdmin();
    }

    // Paso 3: Sembrar datos en orden
    await seedMembers(db, config.environment);
    await seedGallery(db, config.environment);
    await seedPublications(db, config.environment);
    await seedVideos(db, config.environment);
    await seedEducationalMaterial(db, config.environment);
    await seedEvents(db, config.environment);

    console.log('\n' + '='.repeat(60));
    console.log('✅ SEED COMPLETADO EXITOSAMENTE');
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('\n❌ Error durante el seed:', error);
    throw error;
  } finally {
    await seedClient.end();
  }
}

// Ejecutar el script
async function main() {
  // Determinar el ambiente
  const environment: Environment = 
    (process.env.NODE_ENV as Environment) === 'production' 
      ? 'production' 
      : 'development';
  
  // Opción para limpiar datos existentes (pasar --clear como argumento)
  const clearExisting = process.argv.includes('--clear');

  await seedDatabase({
    environment,
    clearExisting,
  });
}

main().catch((error) => {
  console.error('Error fatal:', error);
  process.exit(1);
});

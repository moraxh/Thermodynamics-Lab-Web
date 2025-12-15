#!/usr/bin/env node

/**
 * Script de verificación de archivos seed
 * Verifica que todos los archivos JSON tengan el formato correcto
 */

import { readFileSync, existsSync } from 'fs';

const errors = [];
const warnings = [];

// Campos requeridos por tabla
const requiredFields = {
  members: ['id', 'fullName', 'position', 'typeOfMember'],
  gallery: ['id', 'path'],
  publications: ['id', 'title', 'description', 'type', 'authors', 'publicationDate'],
  videos: ['id', 'title', 'description', 'videoPath'],
  'educational-material': ['id', 'title', 'description', 'filePath'],
  events: ['id', 'title', 'description', 'typeOfEvent', 'startDate', 'startTime', 'endTime', 'location'],
};

function checkFile(filePath, dataType) {
  console.log(`\n🔍 Verificando: ${filePath}`);
  
  if (!existsSync(filePath)) {
    warnings.push(`⚠️  Archivo no existe: ${filePath}`);
    return;
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    if (!Array.isArray(data)) {
      errors.push(`❌ ${filePath}: No es un array`);
      return;
    }

    if (data.length === 0) {
      console.log(`  ✅ Array vacío (OK)`);
      return;
    }

    const required = requiredFields[dataType];
    const ids = new Set();

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      
      // Verificar campos requeridos
      for (const field of required) {
        if (!(field in item) || item[field] === null || item[field] === undefined) {
          errors.push(`❌ ${filePath} [índice ${i}]: Campo "${field}" faltante o nulo`);
        }
      }

      // Validaciones especiales
      if (dataType === 'publications') {
        // Debe tener filePath O link
        if (!item.filePath && !item.link) {
          errors.push(`❌ ${filePath} [índice ${i}]: Debe tener al menos filePath o link`);
        }
        // Authors debe ser array
        if (!Array.isArray(item.authors) || item.authors.length === 0) {
          errors.push(`❌ ${filePath} [índice ${i}]: Authors debe ser un array no vacío`);
        }
      }

      // Verificar ID duplicado
      if (item.id) {
        if (ids.has(item.id)) {
          errors.push(`❌ ${filePath} [índice ${i}]: ID duplicado "${item.id}"`);
        }
        ids.add(item.id);
      }
    }

    console.log(`  ✅ ${data.length} registros válidos`);
  } catch (error) {
    errors.push(`❌ ${filePath}: Error al parsear JSON - ${error.message}`);
  }
}

// Archivos a verificar
const files = [
  // Shared
  { path: 'seed_data/shared/members/members.json', type: 'members' },
  { path: 'seed_data/shared/gallery/gallery.json', type: 'gallery' },
  { path: 'seed_data/shared/publications/publications.json', type: 'publications' },
  { path: 'seed_data/shared/videos/videos.json', type: 'videos' },
  { path: 'seed_data/shared/educational-material/educational-material.json', type: 'educational-material' },
  { path: 'seed_data/shared/events/events.json', type: 'events' },
  
  // Development
  { path: 'seed_data/development/common/gallery.json', type: 'gallery' },
  { path: 'seed_data/development/common/publications.json', type: 'publications' },
  { path: 'seed_data/development/common/videos.json', type: 'videos' },
  { path: 'seed_data/development/common/educational-material.json', type: 'educational-material' },
  { path: 'seed_data/development/common/events.json', type: 'events' },
  
  // Production
  { path: 'seed_data/production/gallery.json', type: 'gallery' },
  { path: 'seed_data/production/publications.json', type: 'publications' },
  { path: 'seed_data/production/videos.json', type: 'videos' },
  { path: 'seed_data/production/educational-material.json', type: 'educational-material' },
  { path: 'seed_data/production/events.json', type: 'events' },
];

console.log('='.repeat(60));
console.log('🔍 VERIFICACIÓN DE ARCHIVOS SEED');
console.log('='.repeat(60));

for (const file of files) {
  checkFile(file.path, file.type);
}

console.log('\n' + '='.repeat(60));
console.log('📊 RESUMEN');
console.log('='.repeat(60));

if (warnings.length > 0) {
  console.log('\n⚠️  ADVERTENCIAS:');
  warnings.forEach(w => console.log(w));
}

if (errors.length > 0) {
  console.log('\n❌ ERRORES:');
  errors.forEach(e => console.log(e));
  console.log('\n' + '='.repeat(60));
  process.exit(1);
} else {
  console.log('\n✅ Todos los archivos son válidos');
  console.log('='.repeat(60));
}

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import sharp from 'sharp';
import { supabaseAdmin } from './supabase';
import { env } from './env';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Usar Supabase si tenemos las credenciales configuradas
function shouldUseSupabase() {
  const hasSupabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_URL !== '';
  const hasServiceKey = env.SUPABASE_SERVICE_ROLE_KEY && env.SUPABASE_SERVICE_ROLE_KEY !== '';
  const useSupabase = hasSupabaseUrl && hasServiceKey;
  
  return useSupabase;
}

// Tipos de archivo permitidos por categoría
export const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  videos: [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime', // .mov
    'video/x-msvideo', // .avi
  ],
  documents: [
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-powerpoint', // .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'text/plain', // .txt
  ],
  archives: [
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
  ],
};

export const ALL_ALLOWED_TYPES = [
  ...ALLOWED_FILE_TYPES.images,
  ...ALLOWED_FILE_TYPES.videos,
  ...ALLOWED_FILE_TYPES.documents,
  ...ALLOWED_FILE_TYPES.archives,
];

export type FileUploadOptions = {
  allowedTypes?: string[];
  maxSize?: number;
  generateThumbnail?: boolean;
  thumbnailWidth?: number;
};

async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function handleFileUpload(
  file: File,
  options: FileUploadOptions = {}
) {
  const {
    allowedTypes = ALL_ALLOWED_TYPES,
    maxSize = MAX_FILE_SIZE,
    generateThumbnail = false,
    thumbnailWidth = 400,
  } = options;

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }

  if (file.size > maxSize) {
    throw new Error(`File size exceeds limit of ${maxSize / 1024 / 1024}MB`);
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileExt = path.extname(file.name);
  const fileName = `${nanoid()}-${Date.now()}${fileExt}`;

  // Usar Supabase Storage si está configurado
  const useSupabase = shouldUseSupabase();
  
  if (useSupabase && supabaseAdmin) {
    console.log('📤 Subiendo a Supabase Storage...');
    
    // Determinar el bucket según el tipo de archivo
    let bucket: string;
    if (ALLOWED_FILE_TYPES.images.includes(file.type)) {
      bucket = 'images';
    } else if (ALLOWED_FILE_TYPES.videos.includes(file.type)) {
      bucket = 'videos';
    } else if (ALLOWED_FILE_TYPES.documents.includes(file.type) || ALLOWED_FILE_TYPES.archives.includes(file.type)) {
      bucket = 'documents';
    } else {
      bucket = 'documents'; // Default
    }
    
    console.log(`📦 Bucket seleccionado: ${bucket} para tipo: ${file.type}`);
    
    // Subir archivo principal
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`Error uploading to Supabase: ${error.message}`);
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(fileName);

    const publicPath = urlData.publicUrl;
    let thumbnailPath: string | undefined;

    // Generar thumbnail si es imagen
    if (generateThumbnail && file.type.startsWith('image/')) {
      const thumbnailFileName = `thumb-${fileName}`;
      const thumbnailBuffer = await sharp(buffer)
        .resize(thumbnailWidth, null, { withoutEnlargement: true })
        .toBuffer();

      const { error: thumbError } = await supabaseAdmin.storage
        .from(bucket)
        .upload(thumbnailFileName, thumbnailBuffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        });

      if (!thumbError) {
        const { data: thumbUrlData } = supabaseAdmin.storage
          .from(bucket)
          .getPublicUrl(thumbnailFileName);
        thumbnailPath = thumbUrlData.publicUrl;
      }
    }

    return { path: publicPath, thumbnailPath };
  } else {
    // Usar sistema de archivos local en desarrollo
    await ensureUploadDir();

    const filePath = path.join(UPLOAD_DIR, fileName);
    await writeFile(filePath, buffer);

    const publicPath = `/uploads/${fileName}`;
    let thumbnailPath: string | undefined;

    if (generateThumbnail && file.type.startsWith('image/')) {
      const thumbnailFileName = `thumb-${fileName}`;
      const thumbnailFilePath = path.join(UPLOAD_DIR, thumbnailFileName);

      await sharp(buffer)
        .resize(thumbnailWidth, null, { withoutEnlargement: true })
        .toFile(thumbnailFilePath);

      thumbnailPath = `/uploads/${thumbnailFileName}`;
    }

    return { path: publicPath, thumbnailPath };
  }
}

export async function parseFormData(request: NextRequest) {
  const formData = await request.formData();
  const fields: Record<string, unknown> = {};
  const files: Record<string, File> = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      files[key] = value;
    } else {
      try {
        fields[key] = JSON.parse(value);
      } catch {
        fields[key] = value;
      }
    }
  }

  return { fields, files };
}

export function createErrorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function createSuccessResponse(data: unknown, status: number = 200) {
  return NextResponse.json({ data }, { status });
}

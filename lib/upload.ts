import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import sharp from 'sharp';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
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

  await ensureUploadDir();

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileExt = path.extname(file.name);
  const fileName = `${nanoid()}-${Date.now()}${fileExt}`;
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

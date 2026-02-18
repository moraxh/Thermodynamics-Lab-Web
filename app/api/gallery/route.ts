import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { gallery } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { requireAuth } from '@/lib/auth-utils';
import { parseFormData, handleFileUpload, createErrorResponse, createSuccessResponse } from '@/lib/upload';

export async function GET() {
  try {
    const images = await db.select().from(gallery).orderBy(gallery.uploadedAt);
    return createSuccessResponse(images);
  } catch {
    return createErrorResponse('Failed to fetch gallery images', 500);
  }
}

export async function POST(request: NextRequest) {
  const authCheck = await requireAuth();
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const { files } = await parseFormData(request);

    if (!files.image) {
      return createErrorResponse('No image file provided');
    }

    const { path } = await handleFileUpload(files.image, {
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    });

    const imageId = nanoid();
    const [newImage] = await db
      .insert(gallery)
      .values({
        id: imageId,
        path,
      })
      .returning();

    return createSuccessResponse(newImage, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload image';
    return createErrorResponse(message, 500);
  }
}

export async function DELETE(request: NextRequest) {
  const authCheck = await requireAuth();
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return createErrorResponse('Missing required parameter: id');
    }

    await db.delete(gallery).where(eq(gallery.id, id));
    return createSuccessResponse({ message: 'Image deleted successfully' });
  } catch {
    return createErrorResponse('Failed to delete image', 500);
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { educationalMaterial } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { requireAuth } from '@/lib/auth-utils';
import { parseFormData, handleFileUpload, createErrorResponse, createSuccessResponse } from '@/lib/upload';

export async function GET() {
  try {
    const materials = await db.select().from(educationalMaterial).orderBy(educationalMaterial.uploadedAt);
    return createSuccessResponse(materials);
  } catch {
    return createErrorResponse('Failed to fetch educational materials', 500);
  }
}

export async function POST(request: NextRequest) {
  const authCheck = await requireAuth();
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const { fields, files } = await parseFormData(request);
    const { title, description } = fields;

    if (!title || !description) {
      return createErrorResponse('Missing required fields: title, description');
    }

    if (!files.file) {
      return createErrorResponse('No file provided');
    }

    const { path: filePath } = await handleFileUpload(files.file, {
      allowedTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ],
    });

    const materialId = nanoid();
    const [newMaterial] = await db
      .insert(educationalMaterial)
      .values({
        id: materialId,
        title: title as string,
        description: description as string,
        filePath,
      })
      .returning();

    return createSuccessResponse(newMaterial, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create educational material';
    return createErrorResponse(message, 500);
  }
}

export async function PUT(request: NextRequest) {
  const authCheck = await requireAuth();
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const { fields, files } = await parseFormData(request);
    const { id, title, description } = fields;

    if (!id) {
      return createErrorResponse('Missing required field: id');
    }

    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;

    if (files.file) {
      const { path: filePath } = await handleFileUpload(files.file, {
        allowedTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        ],
      });
      updateData.filePath = filePath;
    }

    const [updated] = await db
      .update(educationalMaterial)
      .set(updateData)
      .where(eq(educationalMaterial.id, id as string))
      .returning();

    if (!updated) {
      return createErrorResponse('Educational material not found', 404);
    }

    return createSuccessResponse(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update educational material';
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

    await db.delete(educationalMaterial).where(eq(educationalMaterial.id, id));
    return createSuccessResponse({ message: 'Educational material deleted successfully' });
  } catch {
    return createErrorResponse('Failed to delete educational material', 500);
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { publications } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { requireAuth } from '@/lib/auth-utils';
import { parseFormData, handleFileUpload, createErrorResponse, createSuccessResponse } from '@/lib/upload';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const query = db.select().from(publications);
    
    if (type) {
      const results = await db
        .select()
        .from(publications)
        .where(eq(publications.type, type as 'article' | 'book' | 'thesis' | 'technical_report' | 'monograph' | 'other'));
      return createSuccessResponse(results);
    }

    const allPublications = await query.orderBy(publications.publicationDate);
    return createSuccessResponse(allPublications);
  } catch {
    return createErrorResponse('Failed to fetch publications', 500);
  }
}

export async function POST(request: NextRequest) {
  const authCheck = await requireAuth();
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const { fields, files } = await parseFormData(request);
    const { title, description, type, authors, publicationDate } = fields;

    if (!title || !description || !type || !authors || !publicationDate) {
      return createErrorResponse('Missing required fields');
    }

    if (!files.file) {
      return createErrorResponse('No file provided');
    }

    const { path: filePath } = await handleFileUpload(files.file, {
      allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    });

    let thumbnailPath: string | undefined;
    if (files.thumbnail) {
      const { path } = await handleFileUpload(files.thumbnail, {
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      });
      thumbnailPath = path;
    }

    const pubId = nanoid();
    const [newPublication] = await db
      .insert(publications)
      .values({
        id: pubId,
        title: title as string,
        description: description as string,
        type: type as typeof publications.$inferInsert.type,
        authors: (Array.isArray(authors) ? authors : [authors]) as string[],
        publicationDate: new Date(publicationDate as string),
        filePath,
        thumbnailPath,
      })
      .returning();

    return createSuccessResponse(newPublication, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create publication';
    return createErrorResponse(message, 500);
  }
}

export async function PUT(request: NextRequest) {
  const authCheck = await requireAuth();
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const { fields, files } = await parseFormData(request);
    const { id, title, description, type, authors, publicationDate } = fields;

    if (!id) {
      return createErrorResponse('Missing required field: id');
    }

    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (type) updateData.type = type;
    if (authors) updateData.authors = Array.isArray(authors) ? authors : [authors];
    if (publicationDate) updateData.publicationDate = new Date(publicationDate as string);

    if (files.file) {
      const { path: filePath } = await handleFileUpload(files.file, {
        allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      });
      updateData.filePath = filePath;
    }

    if (files.thumbnail) {
      const { path } = await handleFileUpload(files.thumbnail, {
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      });
      updateData.thumbnailPath = path;
    }

    const [updated] = await db
      .update(publications)
      .set(updateData)
      .where(eq(publications.id, id as string))
      .returning();

    if (!updated) {
      return createErrorResponse('Publication not found', 404);
    }

    return createSuccessResponse(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update publication';
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

    await db.delete(publications).where(eq(publications.id, id));
    return createSuccessResponse({ message: 'Publication deleted successfully' });
  } catch {
    return createErrorResponse('Failed to delete publication', 500);
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { articles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { requireAuth } from '@/lib/auth-utils';
import { parseFormData, handleFileUpload, createErrorResponse, createSuccessResponse } from '@/lib/upload';

export async function GET() {
  try {
    const allArticles = await db.select().from(articles).orderBy(articles.publicationDate);
    return createSuccessResponse(allArticles);
  } catch {
    return createErrorResponse('Failed to fetch articles', 500);
  }
}

export async function POST(request: NextRequest) {
  const authCheck = await requireAuth();
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const { fields, files } = await parseFormData(request);
    const { title, description, authors, publicationDate } = fields;

    if (!title || !description || !authors || !publicationDate) {
      return createErrorResponse('Missing required fields');
    }

    if (!files.file) {
      return createErrorResponse('No file provided');
    }

    const { path: filePath } = await handleFileUpload(files.file, {
      allowedTypes: ['application/pdf'],
    });

    let thumbnailPath: string | undefined;
    if (files.thumbnail) {
      const { path } = await handleFileUpload(files.thumbnail, {
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      });
      thumbnailPath = path;
    }

    const articleId = nanoid();
    const [newArticle] = await db
      .insert(articles)
      .values({
        id: articleId,
        title: title as string,
        description: description as string,
        authors: (Array.isArray(authors) ? authors : [authors]) as string[],
        publicationDate: new Date(publicationDate as string),
        filePath,
        thumbnailPath,
      })
      .returning();

    return createSuccessResponse(newArticle, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create article';
    return createErrorResponse(message, 500);
  }
}

export async function PUT(request: NextRequest) {
  const authCheck = await requireAuth();
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const { fields, files } = await parseFormData(request);
    const { id, title, description, authors, publicationDate } = fields;

    if (!id) {
      return createErrorResponse('Missing required field: id');
    }

    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (authors) updateData.authors = Array.isArray(authors) ? authors : [authors];
    if (publicationDate) updateData.publicationDate = new Date(publicationDate as string);

    if (files.file) {
      const { path: filePath } = await handleFileUpload(files.file, {
        allowedTypes: ['application/pdf'],
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
      .update(articles)
      .set(updateData)
      .where(eq(articles.id, id as string))
      .returning();

    if (!updated) {
      return createErrorResponse('Article not found', 404);
    }

    return createSuccessResponse(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update article';
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

    await db.delete(articles).where(eq(articles.id, id));
    return createSuccessResponse({ message: 'Article deleted successfully' });
  } catch {
    return createErrorResponse('Failed to delete article', 500);
  }
}

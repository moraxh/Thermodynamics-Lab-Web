import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { videos } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { requireAuth } from '@/lib/auth-utils';
import { parseFormData, handleFileUpload, createErrorResponse, createSuccessResponse } from '@/lib/upload';

export async function GET() {
  try {
    const allVideos = await db.select().from(videos).orderBy(videos.uploadedAt);
    return createSuccessResponse(allVideos);
  } catch {
    return createErrorResponse('Failed to fetch videos', 500);
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

    if (!files.video) {
      return createErrorResponse('No video file provided');
    }

    const { path: videoPath } = await handleFileUpload(files.video, {
      allowedTypes: ['video/mp4', 'video/webm', 'video/ogg'],
      maxSize: 100 * 1024 * 1024, // 100MB
    });

    let thumbnailPath: string | undefined;
    if (files.thumbnail) {
      const { path } = await handleFileUpload(files.thumbnail, {
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      });
      thumbnailPath = path;
    }

    const videoId = nanoid();
    const [newVideo] = await db
      .insert(videos)
      .values({
        id: videoId,
        title: title as string,
        description: description as string,
        videoPath,
        thumbnailPath,
      })
      .returning();

    return createSuccessResponse(newVideo, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create video';
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

    if (files.video) {
      const { path: videoPath } = await handleFileUpload(files.video, {
        allowedTypes: ['video/mp4', 'video/webm', 'video/ogg'],
        maxSize: 100 * 1024 * 1024,
      });
      updateData.videoPath = videoPath;
    }

    if (files.thumbnail) {
      const { path } = await handleFileUpload(files.thumbnail, {
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      });
      updateData.thumbnailPath = path;
    }

    const [updated] = await db
      .update(videos)
      .set(updateData)
      .where(eq(videos.id, id as string))
      .returning();

    if (!updated) {
      return createErrorResponse('Video not found', 404);
    }

    return createSuccessResponse(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update video';
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

    await db.delete(videos).where(eq(videos.id, id));
    return createSuccessResponse({ message: 'Video deleted successfully' });
  } catch {
    return createErrorResponse('Failed to delete video', 500);
  }
}

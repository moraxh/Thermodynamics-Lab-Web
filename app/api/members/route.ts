import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { members } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { requireAuth } from '@/lib/auth-utils';
import { parseFormData, handleFileUpload, createErrorResponse, createSuccessResponse } from '@/lib/upload';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const query = db.select().from(members);
    
    if (type) {
      const results = await db
        .select()
        .from(members)
        .where(eq(members.typeOfMember, type));
      return createSuccessResponse(results);
    }

    const allMembers = await query;
    return createSuccessResponse(allMembers);
  } catch {
    return createErrorResponse('Failed to fetch members', 500);
  }
}

export async function POST(request: NextRequest) {
  const authCheck = await requireAuth();
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const { fields, files } = await parseFormData(request);
    const { fullName, position, typeOfMember } = fields;

    if (!fullName || !position || !typeOfMember) {
      return createErrorResponse('Missing required fields: fullName, position, typeOfMember');
    }

    let photoPath: string | undefined;

    if (files.photo) {
      const { path } = await handleFileUpload(files.photo, {
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        generateThumbnail: true,
      });
      photoPath = path;
    }

    const memberId = nanoid();
    const [newMember] = await db
      .insert(members)
      .values({
        id: memberId,
        fullName: fullName as string,
        position: position as string,
        typeOfMember: typeOfMember as string,
        photo: photoPath,
      })
      .returning();

    return createSuccessResponse(newMember, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create member';
    return createErrorResponse(message, 500);
  }
}

export async function PUT(request: NextRequest) {
  const authCheck = await requireAuth();
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const { fields, files } = await parseFormData(request);
    const { id, fullName, position, typeOfMember } = fields;

    if (!id) {
      return createErrorResponse('Missing required field: id');
    }

    const updateData: Record<string, unknown> = {};
    if (fullName) updateData.fullName = fullName;
    if (position) updateData.position = position;
    if (typeOfMember) updateData.typeOfMember = typeOfMember;

    if (files.photo) {
      const { path } = await handleFileUpload(files.photo, {
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        generateThumbnail: true,
      });
      updateData.photo = path;
    }

    const [updated] = await db
      .update(members)
      .set(updateData)
      .where(eq(members.id, id as string))
      .returning();

    if (!updated) {
      return createErrorResponse('Member not found', 404);
    }

    return createSuccessResponse(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update member';
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

    await db.delete(members).where(eq(members.id, id));
    return createSuccessResponse({ message: 'Member deleted successfully' });
  } catch {
    return createErrorResponse('Failed to delete member', 500);
  }
}

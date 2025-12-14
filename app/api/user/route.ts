import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-utils';
import { createErrorResponse, createSuccessResponse } from '@/lib/upload';
import bcrypt from 'bcryptjs';
import { auth } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  const authCheck = await requireAuth();
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { name, currentPassword, newPassword } = body;

    // Get current user
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id));

    if (!currentUser) {
      return createErrorResponse('User not found', 404);
    }

    const updateData: Record<string, unknown> = {};

    // Update username if provided
    if (name && name !== currentUser.name) {
      // Check if name is already taken
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.name, name));

      if (existingUser && existingUser.id !== session.user.id) {
        return createErrorResponse('Username already taken', 400);
      }

      updateData.name = name;
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return createErrorResponse('Current password is required', 400);
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, currentUser.password);
      if (!isValid) {
        return createErrorResponse('Current password is incorrect', 400);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    if (Object.keys(updateData).length === 0) {
      return createErrorResponse('No changes provided', 400);
    }

    // Update timestamp
    updateData.updatedAt = new Date();

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, session.user.id))
      .returning();

    if (!updated) {
      return createErrorResponse('Failed to update user', 500);
    }

    return createSuccessResponse({
      message: 'User updated successfully',
      name: updated.name,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update user';
    return createErrorResponse(message, 500);
  }
}

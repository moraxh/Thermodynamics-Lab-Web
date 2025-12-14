import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';
import { eq, gte } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { requireAuth } from '@/lib/auth-utils';
import { createErrorResponse, createSuccessResponse } from '@/lib/upload';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const upcoming = searchParams.get('upcoming');

    if (upcoming === 'true') {
      const today = new Date().toISOString().split('T')[0];
      const upcomingEvents = await db
        .select()
        .from(events)
        .where(gte(events.eventDate, today))
        .orderBy(events.eventDate);
      return createSuccessResponse(upcomingEvents);
    }

    const allEvents = await db.select().from(events).orderBy(events.eventDate);
    return createSuccessResponse(allEvents);
  } catch {
    return createErrorResponse('Failed to fetch events', 500);
  }
}

export async function POST(request: NextRequest) {
  const authCheck = await requireAuth();
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const body = await request.json();
    const { title, description, typeOfEvent, eventDate, startTime, endTime, location, link } = body;

    if (!title || !description || !typeOfEvent || !eventDate || !startTime || !endTime || !location) {
      return createErrorResponse('Missing required fields');
    }

    const eventId = nanoid();
    const [newEvent] = await db
      .insert(events)
      .values({
        id: eventId,
        title: title as string,
        description: description as string,
        typeOfEvent: typeOfEvent as string,
        eventDate: eventDate as string,
        startTime: startTime as string,
        endTime: endTime as string,
        location: location as string,
        link: (link as string | undefined) || null,
      })
      .returning();

    return createSuccessResponse(newEvent, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create event';
    return createErrorResponse(message, 500);
  }
}

export async function PUT(request: NextRequest) {
  const authCheck = await requireAuth();
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const body = await request.json();
    const { id, title, description, typeOfEvent, eventDate, startTime, endTime, location, link } = body;

    if (!id) {
      return createErrorResponse('Missing required field: id');
    }

    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (typeOfEvent) updateData.typeOfEvent = typeOfEvent;
    if (eventDate) updateData.eventDate = eventDate;
    if (startTime) updateData.startTime = startTime;
    if (endTime) updateData.endTime = endTime;
    if (location) updateData.location = location;
    if (link !== undefined) updateData.link = link;

    const [updated] = await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, id as string))
      .returning();

    if (!updated) {
      return createErrorResponse('Event not found', 404);
    }

    return createSuccessResponse(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update event';
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

    await db.delete(events).where(eq(events.id, id));
    return createSuccessResponse({ message: 'Event deleted successfully' });
  } catch {
    return createErrorResponse('Failed to delete event', 500);
  }
}

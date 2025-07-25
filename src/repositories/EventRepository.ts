import { count, desc, eq } from 'drizzle-orm';
import { db } from '@db/connection';
import { Event } from '@db/tables';

export type EventSelect = typeof Event.$inferSelect
export type EventInsert = typeof Event.$inferInsert

export class EventRepository {
  static async getEvents(page: number = 1, max_size: number = 5): Promise<EventSelect[]> {
    const offset = (page - 1) * max_size
    const limit = max_size

    const events = await db
      .select()
      .from(Event)
      .orderBy(desc(Event.eventDate))
      .limit(limit)
      .offset(offset)

    return events
  }

  static async getEventById(id: string): Promise<EventSelect | null> {
    const event = await db
      .select()
      .from(Event)
      .where(eq(Event.id, id))
      .limit(1)

    return event.length > 0 ? event[0] : null
  }

  static async getEventsByTitle(title: string): Promise<EventSelect[]> {
    const events = await db
      .select()
      .from(Event)
      .where(eq(Event.title, title))
      .orderBy(desc(Event.eventDate))

    return events
  }

  static async getNumberOfEvents(): Promise<number> {
    const eventsCount = await db
      .select({ count: count() })
      .from(Event)

    return eventsCount[0].count
  }

  static async insertEvents(events: EventInsert[]): Promise<void> {
    await db.insert(Event).values(events).execute()
  }

  static async updateEventById(id: string, eventData: Partial<EventInsert>): Promise<void> {
    await db.update(Event)
      .set(eventData)
      .where(eq(Event.id, id))
      .execute();
  }

  static async deleteEventById(id: string): Promise<void> {
    await db.delete(Event).where(eq(Event.id, id)).execute();
  }

  static async clearTable(): Promise<void> {
    await db.delete(Event).execute()
  }
}
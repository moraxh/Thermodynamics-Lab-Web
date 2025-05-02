import { count, desc } from "drizzle-orm";
import { db } from "@db/connection"
import { Event } from "@db/tables";

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

  static async getNumberOfEvents(): Promise<number> {
    const eventsCount = await db
      .select({ count: count() })
      .from(Event)

    return eventsCount[0].count
  }

  static async clearTable(): Promise<void> {
    await db.delete(Event).execute()
  }

  static async insertEvents(events: EventInsert[]): Promise<void> {
    await db.insert(Event).values(events).execute()
  }
}
import { count, desc } from "drizzle-orm";
import { db } from "@db/connection"
import { Event } from "@db/tables";

export class EventRepository {
  static async getEvents(page: number = 1, max_size: number = 5) {
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
}
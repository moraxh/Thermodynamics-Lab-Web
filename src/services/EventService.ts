import { Event } from "@db/tables";
import { EventRepository } from "@src/repositories/EventRepository";
import type { PaginatedResponse } from "@src/types";

type EventSelect = typeof Event.$inferSelect

interface EventResponse extends PaginatedResponse {
  events?: EventSelect[]
}

export class EventService {
  static async getEvents(searchParams: URLSearchParams): Promise<EventResponse> {
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 5;

    const events = await EventRepository.getEvents(page, limit);
    const total = await EventRepository.getNumberOfEvents()

    return {
      status: 200,
      info: {
        total,
        page,
        size: events.length,
        limit
      },
      events
    }
  }
}
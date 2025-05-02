import fs from "node:fs"
import { Event } from "@db/tables";
import { EventRepository } from "@src/repositories/EventRepository";
import type { PaginatedResponse } from "@src/types";
import type { EventInsert, EventSelect } from "@src/repositories/EventRepository";
import { generateIdFromEntropySize } from "lucia";

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

  static async clearData(): Promise<void> {
    // Clear the files  
    fs.rmdirSync("./public/storage/events", { recursive: true });

    // Delete the table data
    await EventRepository.clearTable()
  }

  static async seedData(): Promise<void> {
    // On Production
    if (import.meta.env.PROD) {
      return
    }

    const locations = ["Auditorium", "Room 101", "Room 102", "Room 103", "Room 104", "Room 105"]

    const events: EventInsert[] = []

    for (let i = 0; i < 15; i++) {
      const event: EventInsert = {
        id: generateIdFromEntropySize(10),
        title: `Title of the event ${i + 1}`,
        description: `Description of the event ${i + 1}`,
        typeOfEvent: "Conference",
        eventDate: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toDateString(),
        startTime: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().substring(11, 19),
        endTime: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().substring(11, 19),
        location: locations[Math.floor(Math.random() * locations.length)],
        link: `https://example.com/event-${i + 1}`,
        uploadedAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
      }

      events.push(event)
    }

    await EventRepository.insertEvents(events)
  } 
}
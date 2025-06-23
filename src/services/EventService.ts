import { Event } from '@db/tables';
import { EventRepository } from '@src/repositories/EventRepository';
import { EventSchema } from '@db/schemas';
import { generateIdFromEntropySize } from 'lucia';
import fs from "node:fs"
import type { CommonResponse, PaginatedResponse } from "@src/types";
import type { EventInsert, EventSelect } from "@src/repositories/EventRepository";

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

  static async createEvent(formData: FormData): Promise<CommonResponse> {
    const fields = Object.fromEntries(formData.entries())
    const validation = EventSchema.safeParse(fields)

    if (!validation.success) {
      return {
        status: 400,
        message: validation.error.errors[0].message,
      }
    }

    const { title, description, typeOfEvent, eventDate, startTime, endTime, location, link } = validation.data

    // Check if the event already exists
    const sameTitledEvents = await EventRepository.getEventsByTitle(title)

    // Check if there are any events with the same date
    for (const event of sameTitledEvents) {
      if (event.eventDate === eventDate && event.startTime === startTime && event.endTime === endTime) {
        return {
          status: 400,
          message: "Ya existe un evento con el mismo título, fecha y hora",
        }
      }
    }


    // Insert in the database
    EventRepository.insertEvents([{
      id: generateIdFromEntropySize(10),
      title,
      description,
      typeOfEvent,
      eventDate,
      startTime,
      endTime,
      location,
      link,
    }])

    return { 
      status: 201,
      message: "Evento creado correctamente",
    }
  }

  static async updateEvent(formData: FormData): Promise<CommonResponse> {
    const eventId = formData.get("id") as string;

    if (!eventId) {
      return {
        status: 400,
        message: "El ID del evento es requerido",
      }
    }

    // Check if the event exists
    const event = await EventRepository.getEventById(eventId)

    if (!event) {
      return {
        status: 404,
        message: "No hay ningún evento con ese ID",
      }
    }

    // Validate
    const fields = Object.fromEntries(formData.entries())
    const validation = EventSchema.safeParse(fields)

    if (!validation.success) {
      return {
        status: 400,
        message: validation.error.errors[0].message,
      }
    }

    // Update the event in the database
    const { title, description, typeOfEvent, eventDate, startTime, endTime, location, link } = validation.data

    await EventRepository.updateEventById(eventId, {
      title,
      description,
      typeOfEvent,
      eventDate,
      startTime,
      endTime,
      location,
      link,
    })

    return {
      status: 200,
      message: "Evento actualizado correctamente",
    }
  }

  static async deleteEvent(formData: FormData): Promise<CommonResponse>  {
    const eventId = formData.get("id") as string;

    if (!eventId) {
      return {
        status: 400,
        message: "El ID del evento es requerido",
      }
    }

    // Check if the event exists
    const event = await EventRepository.getEventById(eventId)

    if (!event) {
      return {
        status: 404,
        message: "No hay ningún evento con ese ID",
      }
    }

    // Delete the event from the database
    await EventRepository.deleteEventById(eventId)

    return {
      status: 200,
      message: "Evento eliminado correctamente",
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
import { EventController } from '@src/controllers/EventController';
import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {
  return EventController.getEvents(context);
}

export async function POST(context: APIContext): Promise<Response> {
  return EventController.createEvent(context);
}

export async function PATCH(context: APIContext): Promise<Response> {
  return EventController.updateEvent(context);
}

export async function DELETE(context: APIContext): Promise<Response> {
  return EventController.deleteEvent(context);
}
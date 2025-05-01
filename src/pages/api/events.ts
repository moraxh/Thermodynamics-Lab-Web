import { EventController } from "@src/controllers/EventController";
import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {
  return EventController.getEvents(context);
}
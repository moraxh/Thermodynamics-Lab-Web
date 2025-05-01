import { EventService } from "@src/services/EventService";
import type { APIContext } from "astro";

export class EventController {
  static async getEvents(context: APIContext): Promise<Response> {
    try {
      const searchParams = context.url.searchParams
      const response = await EventService.getEvents(searchParams)
      return new Response(JSON.stringify(response), { status: response.status})
    } catch (error) {
      return new Response(JSON.stringify({
        message: "Error al obtener los eventos"
      }), { status: 500 })
    }
  }
}
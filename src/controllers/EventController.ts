import { EventService } from '@src/services/EventService';
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

  static async createEvent(context: APIContext): Promise<Response> {
    try {
      const formData = await context.request.formData()
      const response = await EventService.createEvent(formData)
      return new Response(JSON.stringify(response), { status: response.status })
    } catch (error) {
      return new Response(JSON.stringify({
        message: "Error al crear el evento"
      }), { status: 500 })
    }
  }

  static async updateEvent(context: APIContext): Promise<Response> {
    try {
      const formData = await context.request.formData()
      const response = await EventService.updateEvent(formData)
      return new Response(JSON.stringify(response), { status: response.status })
    } catch (error) {
      return new Response(JSON.stringify({
        message: "Error al actualizar el evento"
      }), { status: 500 })
    }
  }

  static async deleteEvent(context: APIContext): Promise<Response> {
    try {
      const formData = await context.request.formData()
      const response = await EventService.deleteEvent(formData)
      return new Response(JSON.stringify(response), { status: response.status })
    } catch (error) {
      return new Response(JSON.stringify({
        message: "Error al eliminar el evento"
      }), { status: 500 })
    }
  }
}
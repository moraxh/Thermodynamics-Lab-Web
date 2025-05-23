import { PublicationService } from "@src/services/PublicationService";
import type { APIContext } from "astro";

export class PublicationController {
  static async getPublications(context: APIContext): Promise<Response> {
    try {
      const searchParams = context.url.searchParams
      const response = await PublicationService.getPublications(searchParams)
      return new Response(JSON.stringify(response), { status: response.status })
    } catch (error) {
      return new Response(JSON.stringify({
        message: "Error al obtener las publicaciones"
      }), { status: 500 })
    }
  }
}
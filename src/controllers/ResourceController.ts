import { ResourceService } from "@src/services/ResourceService"
import type { APIContext } from "astro"

export class ResourceController {
  static async getResources(context: APIContext): Promise<Response> {
    try {
      const searchParams = context.url.searchParams
      const response = await ResourceService.getResources(searchParams)
      return new Response(JSON.stringify(response), { status: response.status })
    } catch (error) {
      return new Response(JSON.stringify({
        message: "Error al obtener los recursos"
      }), { status: 500 })
    }
  }
}
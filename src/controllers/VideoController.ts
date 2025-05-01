import { VideoService } from "@src/services/VideoService";
import type { APIContext } from "astro";

export class VideoController {
  static async getVideos(context: APIContext): Promise<Response> {
    try {
      const searchParams = context.url.searchParams
      const response = await VideoService.getPublications(searchParams)
      return new Response(JSON.stringify(response), { status: response.status })
    } catch (error) {
      return new Response(JSON.stringify({
        message: "Error al obtener los videos"
      }), { status: 500 })
    }
  }
}
import { VideoService } from '@src/services/VideoService';
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

  static async createVideo(context: APIContext): Promise<Response> {
    try {
      const formData = await context.request.formData()
      const response = await VideoService.createVideo(formData)
      return new Response(JSON.stringify(response), { status: response.status })
    } catch (error) {
      return new Response(JSON.stringify({
        message: "Error al crear el video"
      }), { status: 500 })
    }
  }

  static async updateVideo(context: APIContext): Promise<Response> {
    try {
      const formData = await context.request.formData()
      const response = await VideoService.updateVideo(formData)
      return new Response(JSON.stringify(response), { status: response.status })
    } catch (error) {
      return new Response(JSON.stringify({
        message: "Error al actualizar el video"
      }), { status: 500 })
    }
  }

  static async deleteVideo(context: APIContext): Promise<Response> {
    try {
      const formData = await context.request.formData()
      const response = await VideoService.deleteVideo(formData)
      return new Response(JSON.stringify(response), { status: response.status })
    } catch (error) {
      return new Response(JSON.stringify({
        message: "Error al eliminar el video"
      }), { status: 500 })
    }
  }
}
import Publications from '@src/components/pages/publications_divulgation/Publications.astro';
import { PublicationService } from '@src/services/PublicationService';
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

  static async createPublication(context: APIContext): Promise<Response> {
    try {
      const formData = await context.request.formData()
      const response = await PublicationService.createPublication(formData)
      return new Response(JSON.stringify(response), { status: response.status })
    } catch (error){
      return new Response(JSON.stringify({
        message: "Error al crear la publicación"
      }), { status: 500 })
    }
  }

  static async updatePublication(context: APIContext): Promise<Response> {
    try {
      const formData = await context.request.formData()
      const response = await PublicationService.updatePublication(formData)
      return new Response(JSON.stringify(response), { status: response.status })
    } catch (error){
      return new Response(JSON.stringify({
        message: "Error al crear la publicación"
      }), { status: 500 })
    }
  }

  static async deletePublication(context: APIContext): Promise<Response> {
    try {
      const formData = await context.request.formData()
      const response = await PublicationService.deletePublication(formData)
      return new Response(JSON.stringify(response), { status: response.status })
    } catch (error){
      return new Response(JSON.stringify({
        message: "Error al crear la publicación"
      }), { status: 500 })
    }
  }
}
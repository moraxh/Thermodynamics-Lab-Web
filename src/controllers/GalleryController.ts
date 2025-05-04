import { GalleryService } from "@src/services/GalleryService";
import type { APIContext } from "astro";

export class GalleryController {
  static async getImages(context: APIContext): Promise<Response> {
    try {
      const response = await GalleryService.getImages()
      return new Response(JSON.stringify(response), { status: response.status })
    } catch (error) {
      return new Response(JSON.stringify({
        message: "Error al obtener las imagenes"
      }), { status: 500 })
    }
  }

  static async createImage(context: APIContext): Promise<Response> {
    try {
      const formData = await context.request.formData();
      const response = await GalleryService.createImage(formData)
      return new Response(JSON.stringify(response), { status: response.status })
    } catch (error) {
      return new Response(JSON.stringify({
        message: "Error interno del servidor"
      }), { status: 500 })
    }
  }

  static async deleteImage(context: APIContext): Promise<Response> {
    try {
      const formData = await context.request.formData();
      const response = await GalleryService.deleteImage(formData)
      return new Response(JSON.stringify(response), { status: response.status })
    } catch (error) {
      return new Response(JSON.stringify({
        message: "Error interno del servidor"
      }), { status: 500 })
    }
  }
}
import { GalleryService } from "@src/services/GalleryService";
import type { APIContext } from "astro";

export class GalleryController {
  static async createImage(context: APIContext): Promise<Response> {
    try {
      const formData = await context.request.formData();
      const image = formData.get('image') as File;

      if (!image) {
        return new Response(JSON.stringify({
          error: "La imagen es requerida"
        }), { status: 400 })
      }

      const response = await GalleryService.createImage(image)
      return new Response(JSON.stringify(response), { status: response.status })
    } catch (error) {
      return new Response(JSON.stringify({
        error: "Error interno del servidor"
      }), { status: 500 })
    }
  }

  static async deleteImage(context: APIContext): Promise<Response> {
    try {
      const formData = await context.request.formData();
      const imageId = formData.get('id') as string;

      if (!imageId) {
        return new Response(JSON.stringify({
          error: "ID de imagen requerido"
        }), { status: 400 })
      }

      const response = await GalleryService.deleteImage(imageId)
      return new Response(JSON.stringify(response), { status: response.status })
    } catch (error) {
      return new Response(JSON.stringify({
        error: "Error interno del servidor"
      }), { status: 500 })
    }
  }
}
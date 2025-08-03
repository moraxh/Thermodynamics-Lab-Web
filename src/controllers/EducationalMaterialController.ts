import { EducationalMaterialService } from '@src/services/EducationalMaterialService';
import type { APIContext } from "astro"

export class EducationalMaterialController {
  static async getEducationalMaterial(context: APIContext): Promise<Response> {
    try {
      const searchParams = context.url.searchParams
      const response = await EducationalMaterialService.getEducationalMaterial(searchParams)
      return new Response(JSON.stringify(response), { status: response.status })
    } catch (error) {
      return new Response(JSON.stringify({
        message: "Error al obtener los recursos"
      }), { status: 500 })
    }
  }

  static async createEducationalMaterial(context: APIContext): Promise<Response> {
    try {
      const formData = await context.request.formData()
      const response = await EducationalMaterialService.createEducationalMaterial(formData)
      return new Response(JSON.stringify(response), { status: response.status })
    } catch (error) {
      return new Response(JSON.stringify({
        message: "Error al crear el recurso"
      }), { status: 500 })
    }
  }

  static async deleteEducationalMaterial(context: APIContext): Promise<Response> {
    try {
      const formData = await context.request.formData()
      const response = await EducationalMaterialService.deleteEducationalMaterial(formData)
      return new Response(JSON.stringify(response), { status: response.status })
    } catch (error) {
      return new Response(JSON.stringify({
        message: "Error al eliminar el recurso"
      }), { status: 500 })
    }
  }

  static async updateEducationalMaterial(context: APIContext): Promise<Response> {
    try {
      const formData = await context.request.formData()
      const response = await EducationalMaterialService.updateEducationalMaterial(formData)
      return new Response(JSON.stringify(response), { status: response.status })
    } catch (error) {
      return new Response(JSON.stringify({
        message: "Error al actualizar el recurso"
      }), { status: 500 })
    }
  }
}
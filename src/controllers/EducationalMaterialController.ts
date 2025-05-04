import { EducationalMaterialService } from "@src/services/EducationalMaterialService"
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
}
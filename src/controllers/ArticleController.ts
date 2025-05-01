import { ArticleService } from "@src/services/ArticleService";
import type { APIContext } from "astro";

export class ArticleController {
  static async getArticles(context: APIContext): Promise<Response> {
    try {
      const searchParams = context.url.searchParams
      const response = await ArticleService.getArticles(searchParams)
      return new Response(JSON.stringify(response), { status: response.status })
    } catch (error) {
      return new Response(JSON.stringify({
        message: "Error al obtener los artículos"
      }), { status: 500 })
    }
  }
}
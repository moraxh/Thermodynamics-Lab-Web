import { ArticleService } from '@src/services/ArticleService';
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

  static async createArticle(context: APIContext): Promise<Response> {
     try {
      const formData = await context.request.formData()
      const response = await ArticleService.createArticle(formData)
      return new Response(JSON.stringify(response), { status: response.status })
     } catch (error) {
      return new Response(JSON.stringify({
        message: "Error al crear el artículo"
      }), { status: 500 })
     }
  }

  static async updateArticle(context: APIContext): Promise<Response> {
     try {
      const formData = await context.request.formData()
      const response = await ArticleService.updateArticle(formData)
      return new Response(JSON.stringify(response), { status: response.status })
     } catch (error) {
      return new Response(JSON.stringify({
        message: "Error al actualizar el articulo"
      }), { status: 500 })
     }
  }

  static async deleteArticle(context: APIContext): Promise<Response> {
     try {
      const formData = await context.request.formData()
      const response = await ArticleService.deleteArticle(formData)
      return new Response(JSON.stringify(response), { status: response.status })
     } catch (error) {
      return new Response(JSON.stringify({
        message: "Error al eliminar el artículo"
      }), { status: 500 })
     }
  }
}
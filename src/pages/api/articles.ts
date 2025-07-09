import { ArticleController } from '@src/controllers/ArticleController';
import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {
  return ArticleController.getArticles(context)  
}

export async function POST(context: APIContext): Promise<Response> {
  return ArticleController.createArticle(context)
}

export async function PATCH(context: APIContext): Promise<Response> {
  return ArticleController.updateArticle(context)
}

export async function DELETE(context: APIContext): Promise<Response> {
  return ArticleController.deleteArticle(context)
}
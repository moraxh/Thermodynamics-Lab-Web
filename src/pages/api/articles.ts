import { ArticleController } from "@src/controllers/ArticleController";
import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {
  return ArticleController.getArticles(context)  
}

export async function POST(context: APIContext): Promise<Response> {
  return ArticleController.createArticle(context)
}
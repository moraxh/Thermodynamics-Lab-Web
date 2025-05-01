import { ArticleRepository } from "@src/repositories/ArticleRepository";
import { Article } from "@db/tables";
import type { PaginatedResponse } from "@src/types";

type ArticleSelect = typeof Article.$inferSelect

interface ArticleResponse extends PaginatedResponse {
  articles?: ArticleSelect[];
}

export class ArticleService {
  static async getArticles(searchParams: URLSearchParams): Promise<ArticleResponse> {
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 9;

    const articles = await ArticleRepository.getArticles(page, limit)
    const total = await ArticleRepository.getNumberOfArticles()

    return {
      status: 200,
      info: {
        total,
        page,
        size: articles.length,
        limit
      },
      articles
    }
  }
}
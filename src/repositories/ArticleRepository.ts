import { count, desc } from "drizzle-orm"
import { db } from "@db/connection"
import { Article } from "@db/tables"

type ArticleSelect = typeof Article.$inferSelect

export class ArticleRepository {
  static async getArticles(page: number = 1, max_size: number = 5): Promise<ArticleSelect[]> {
    const offset = (page - 1 ) *  max_size
    const limit = max_size

    const articles = await db
      .select()
      .from(Article)
      .orderBy(desc(Article.publicationDate))
      .limit(limit)
      .offset(offset)

    return articles
  }

  static async getNumberOfArticles(): Promise<number> {
    const articlesCount = await db
      .select({ count: count() })
      .from(Article)

    return articlesCount[0].count
  }

  static async clearTable(): Promise<void> {
    await db.delete(Article).execute()
  }
}
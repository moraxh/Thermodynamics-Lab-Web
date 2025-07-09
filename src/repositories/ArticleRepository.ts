import { Article } from '@db/tables';
import {
  count,
  desc,
  eq,
  like
  } from 'drizzle-orm';
import { db } from '@db/connection';

export type ArticleSelect = typeof Article.$inferSelect
export type ArticleInsert = typeof Article.$inferInsert

export class ArticleRepository {
  static async getArticleById(id: string): Promise<ArticleSelect | null> {
    const article = await db
      .select()
      .from(Article)
      .where(eq(Article.id, id))
      .limit(1)

    return article[0] || null
  }

  static async getArticleByTitle(title: string): Promise<ArticleSelect | null> {
    const article = await db
      .select()
      .from(Article)
      .where(eq(Article.title, title))
      .limit(1)

    return article[0]
  }

  static async getArticleByFileHash(fileHash: string): Promise<ArticleSelect | null> {
    const article = await db
      .select()
      .from(Article)
      .where(like(Article.filePath, `%${fileHash}%`))
      .limit(1)

    return article[0]
  }

  static async getArticleByThumbnailHash(thumbnailHash: string): Promise<ArticleSelect | null> {
    const article = await db
      .select()
      .from(Article)
      .where(like(Article.thumbnailPath, `%${thumbnailHash}%`))
      .limit(1)

    return article[0] 
  }

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

  static async insertArticles(articles: ArticleInsert[]): Promise<void> {
    await db.insert(Article).values(articles).execute()
  }

  static async updateArticleById(id: string, article: Partial<ArticleInsert>): Promise<void> {
    await db
      .update(Article)
      .set(article)
      .where(eq(Article.id, id))
      .execute()
  }

  static async deleteArticleById(id: string): Promise<void> {
    await db
      .delete(Article)
      .where(eq(Article.id, id))
      .execute()
  }

  static async clearTable(): Promise<void> {
    await db.delete(Article).execute()
  }
}
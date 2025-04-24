import { db } from "@db/connection"
import { Article } from "@db/tables"
import { generateIdFromEntropySize } from "lucia"

type ArticleInsert = typeof Article.$inferInsert

// IMPORTANT: This data is only for development purposes. Do not use it in production.
const test_articles: ArticleInsert[] = []

for (let i = 0; i < 9; i++) {
  const article: ArticleInsert = {
    id: generateIdFromEntropySize(10),
    title: `Title of the article ${i + 1}`,
    slug: `slug-of-the-article-${i + 1}`,
    category: `Category ${i + 1}`,
    authors: JSON.stringify([`Author ${i + 1}`]),
    description: `Description of the article ${i + 1}`,
    body: `Body of the article ${i + 1}`,
    thumbnailPath: `storage/articles/thumbnails/thumbnail(${i + 1}).webp`,
    uploadedAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
  }

  test_articles.push(article)
}
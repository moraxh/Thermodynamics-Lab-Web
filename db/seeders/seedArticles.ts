import fs from "node:fs"
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
    description: `Description of the article ${i + 1}`,
    publicationDate: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
    filePath: `storage/articles/docs/publications(${i + 1}).pdf`,
    thumbnailPath: `storage/articles/thumbnails/thumbnail (${i + 1}).webp`
  }

  test_articles.push(article)
}

// Copy the files to the public directory 
fs.mkdirSync("./public/storage/articles/docs", { recursive: true })
fs.mkdirSync("./public/storage/articles/thumbnails", { recursive: true })

const seedPath = "./seed/test/publications"

// Copy the docs
fs.readdirSync(`${seedPath}/docs`).forEach((file) => {
  const inputPath = `${seedPath}/docs/${file}`
  const outputPath = `storage/articles/docs/${file}`

  fs.copyFileSync(inputPath, `./public/${outputPath}`)
})

// Copy the thumbnails
fs.readdirSync(`${seedPath}/thumbnails`).forEach((file) => {
  const inputPath = `${seedPath}/thumbnails/${file}`
  const outputPath = `storage/articles/thumbnails/${file}`

  fs.copyFileSync(inputPath, `./public/${outputPath}`)
})

export async function seedArticles() {
  await db.insert(Article).values(test_articles).execute()
}
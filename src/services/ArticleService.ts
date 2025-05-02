import fs from "node:fs"
import { ArticleRepository } from "@src/repositories/ArticleRepository";
import { Article } from "@db/tables";
import type { PaginatedResponse } from "@src/types";
import type { ArticleSelect, ArticleInsert } from "@src/repositories/ArticleRepository";
import { generateIdFromEntropySize } from "lucia";

interface ArticleResponse extends PaginatedResponse {
  articles?: ArticleSelect[];
}

const storagePath = "storage/articles"

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

  static async clearData(): Promise<void> {
    // Clear the files
    fs.rmdirSync(`./public/${storagePath}`, { recursive: true });

    // Delete the table data
    await ArticleRepository.clearTable()
  }

  static async seedData(): Promise<void> {
    const filesPath = `${storagePath}/files`
    const thumbnailsPath = `${storagePath}/thumbnails`  

    // Create the directories if they don't exist
    if (!fs.existsSync(`./public/${filesPath}`)) {
      fs.mkdirSync(`./public/${filesPath}`, { recursive: true })
    }
    if (!fs.existsSync(`./public/${thumbnailsPath}`)) {
      fs.mkdirSync(`./public/${thumbnailsPath}`, { recursive: true })
    }

    // On production
    if (import.meta.env.PROD) {
      // TODO
      return
    }

    const seedPath = "./seed_data/development/common" 

    const files = fs.readdirSync(`${seedPath}/pdf`)
    const imgs = fs.readdirSync(`${seedPath}/webp`)

    if (files.length !== imgs.length) {
      throw new Error("The number of docs and images must be the same")
    }

    const test_articles: ArticleInsert[] = files.map((file, i) => {
      return {
        id: generateIdFromEntropySize(10),
        title: `Title of the article ${i + 1}`,
        description: `Description of the article ${i + 1}`,
        publicationDate: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
        filePath: `${filesPath}/${file}`,
        thumbnailPath: `${thumbnailsPath}/${imgs[i]}`
      }
    })

    await ArticleRepository.insertArticles(test_articles)

    // Copy the files to the public directory
    files.forEach((file) => {
      const inputPath = `${seedPath}/pdf/${file}`
      const outputPath = `${filesPath}/${file}`

      fs.copyFileSync(inputPath, `./public/${outputPath}`)
    })

    imgs.forEach((file) => {
      const inputPath = `${seedPath}/webp/${file}`
      const outputPath = `${thumbnailsPath}/${file}`

      fs.copyFileSync(inputPath, `./public/${outputPath}`)
    })
  }
}
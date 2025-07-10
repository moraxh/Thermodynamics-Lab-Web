import { Article } from '@db/tables';
import { ArticleRepository } from '@src/repositories/ArticleRepository';
import { ArticleSchema, ArticleUpdateSchema } from '@db/schemas';
import { generateHashFromStream } from '@src/utils/Hash';
import { generateIdFromEntropySize } from 'lucia';
import { isValidUrl } from '@src/utils/url';
import fs from "node:fs"
import type { CommonResponse, PaginatedResponse } from "@src/types";
import type { ArticleSelect, ArticleInsert } from "@src/repositories/ArticleRepository";
import { randomUUID } from 'node:crypto';

interface ArticleResponse extends PaginatedResponse {
  articles?: ArticleSelect[];
}

const storagePath = "storage/articles"
const filesPath = `${storagePath}/files`
const thumbnailsPath = `${storagePath}/thumbnails`  

export class ArticleService {
  static async createArticle(formData: FormData): Promise<CommonResponse> {
    const fields = Object.fromEntries(formData.entries())
    const validation = ArticleSchema.safeParse(fields)

    if (!validation.success) {
      return {
        status: 400,
        message: validation.error.errors[0].message,
      }
    }

    const { title, description, publicationDate, file, fileUrl, thumbnail, authors } = validation.data

    let data: ArticleInsert = {
      id: randomUUID(),
      title,
      description,
      authors,
      publicationDate: new Date(publicationDate),
      filePath: "",
      thumbnailPath: "",
    }

    // Check if the title is already in use
    if (await ArticleRepository.getArticleByTitle(title)) {
      return {
        status: 400,
        message: "El título ya está en uso",
      }
    }

    if (fileUrl) {
      data.filePath = fileUrl
    } else if (file) {
      const fileHash = await generateHashFromStream(file.stream())

      if (await ArticleRepository.getArticleByFileHash(fileHash)) {
        return {
          status: 400,
          message: "El archivo ya está en uso",
        }
      }

      fs.mkdirSync(`./public/${filesPath}`, { recursive: true })
      const filePath = `${filesPath}/${fileHash}.${file.name.split('.').pop()}`
      fs.writeFileSync(`./public/${filePath}`, Buffer.from(await file.arrayBuffer()))

      data.filePath = filePath
    } else {
      return {
        status: 400,
        message: "El archivo o la URL del archivo es requerido",
      }
    }

    const thumbnailHash = await generateHashFromStream(thumbnail.stream())

    // Check if the thumbnail is already in use
    if (await ArticleRepository.getArticleByThumbnailHash(thumbnailHash)) {
      return {
        status: 400,
        message: "La miniatura ya está en uso",
      }
    }

    fs.mkdirSync(`./public/${thumbnailsPath}`, { recursive: true })
    const thumbnailPath = `${thumbnailsPath}/${thumbnailHash}.${thumbnail.name.split('.').pop()}`
    fs.writeFileSync(`./public/${thumbnailPath}`, Buffer.from(await thumbnail.arrayBuffer()))
    data.thumbnailPath = thumbnailPath

    // Insert in the database
    ArticleRepository.insertArticles([data])

    return {
      status: 200,
      message: "Articulo creado correctamente",
    }
  }

  static async updateArticle(formData: FormData): Promise<CommonResponse> {
    const articleId = formData.get("id") as string;

    if (!articleId) {
      return {
        status: 400,
        message: "El ID del artículo es requerido",
      }
    }

    const article = await ArticleRepository.getArticleById(articleId)

    if (!article) {
      return {
        status: 404,
        message: "No hay ningún artículo con ese ID",
      }
    }

    const fields = Object.fromEntries(formData.entries())
    const validation = ArticleUpdateSchema.safeParse(fields)

    if (!validation.success) {
      return {
        status: 400,
        message: validation.error.errors[0].message,
      }
    }

    const { title, description, publicationDate, file, fileUrl, thumbnail, authors } = validation.data

    // Check if the title is already in use
    const existingArticle = await ArticleRepository.getArticleByTitle(title);
    if (existingArticle && existingArticle.id !== articleId) {
      return {
        status: 400,
        message: "El título ya está en uso",
      }
    }

    let updateData: Partial<ArticleInsert> = {
      title,
      description,
      authors,
      publicationDate: new Date(publicationDate),
    }

    // Get the file & thumbnail hashes
    if (file || fileUrl) {
      // Delete the old file
      if (!isValidUrl(article.filePath)) {
        fs.rmSync(`./public/${article.filePath}`, { force: true, recursive: true })
      }

      if (fileUrl) {
        updateData.filePath = fileUrl;
      } else if (file) {
        const fileHash = await generateHashFromStream(file.stream())

        // Check if the file is already in use
        const existingArticle = await ArticleRepository.getArticleByFileHash(fileHash);
        if (existingArticle && existingArticle.id !== articleId) {
          return {
            status: 400,
            message: "El archivo ya está en uso",
          }
        }

        fs.mkdirSync(`./public/${filesPath}`, { recursive: true })
        const filePath = `${filesPath}/${fileHash}.${file.name.split('.').pop()}`
        fs.writeFileSync(`./public/${filePath}`, Buffer.from(await file.arrayBuffer()))

        updateData.filePath = filePath
      }
    } else {
      updateData.filePath = article.filePath; // Keep the old file path if no new file is provided
    }

    if (thumbnail) {
      // Delete the old thumbnail
      fs.rmSync(`./public/${article.thumbnailPath}`, { force: true, recursive: true })

      const thumbnailHash = await generateHashFromStream(thumbnail.stream())

      // Check if the thumbnail is already in use
      const existingArticle = await ArticleRepository.getArticleByThumbnailHash(thumbnailHash);
      if (existingArticle && existingArticle.id !== articleId) {
        return {
          status: 400,
          message: "La miniatura ya está en uso",
        }
      }

      fs.mkdirSync(`./public/${thumbnailsPath}`, { recursive: true })
      const thumbnailPath = `${thumbnailsPath}/${thumbnailHash}.${thumbnail.name.split('.').pop()}`
      fs.writeFileSync(`./public/${thumbnailPath}`, Buffer.from(await thumbnail.arrayBuffer()))

      updateData.thumbnailPath = thumbnailPath
    } else {
      updateData.thumbnailPath = article.thumbnailPath; // Keep the old thumbnail path if no new thumbnail is provided
    }

    ArticleRepository.updateArticleById(articleId, updateData)

    return {
      status: 200,
      message: "Artículo actualizado correctamente",
    }
  }

  static async deleteArticle(formData: FormData): Promise<CommonResponse> {
    const articleId = formData.get("id") as string;

    if (!articleId) {
      return {
        status: 400,
        message: "El ID del artículo es requerido",
      }
    }

    // Check if the article exists
    const article = await ArticleRepository.getArticleById(articleId)

    if (!article) {
      return {
        status: 404,
        message: "No hay ningún artículo con ese ID",
      }
    }

    // Delete the files
    if (!isValidUrl(article.filePath)) {
      fs.rmSync(`./public/${article.filePath}`, { force: true, recursive: true })
    }
    fs.rmSync(`./public/${article.thumbnailPath}`, { force: true, recursive: true })

    // Delete the article from the database
    await ArticleRepository.deleteArticleById(articleId)

    return {
      status: 200,
      message: "Artículo eliminado correctamente",
    }
  }

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
        authors: [`Author ${i + 1}`],
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
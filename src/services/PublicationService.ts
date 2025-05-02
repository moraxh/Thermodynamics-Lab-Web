import fs from "node:fs"
import { PublicationRepository } from "@src/repositories/PublicationRepository";
import type { PaginatedResponse } from "@src/types";
import type { PublicationInsert, PublicationSelect } from "@src/repositories/PublicationRepository";
import { publicationTypeEnum } from "@db/tables";
import { generateIdFromEntropySize } from "lucia";
import { file } from "astro/loaders";

interface PublicationResponse extends PaginatedResponse {
  publications?: PublicationSelect[];
}

const storagePath = "storage/publications"

export class PublicationService {
  static async getPublications(searchParams: URLSearchParams): Promise<PublicationResponse> {
    // Check if there is pagination 
    const page = Number(searchParams.get('page')) || 1;
    // Check if there is a type filter
    const type = searchParams.get('type') as string || 'all';
    // Check if there is a size limit
    const limit = Number(searchParams.get('limit')) || 9;

    // Get the publication from the database with pagination and filter
    const publications = await PublicationRepository.getPublications(page, type, limit);
    const total = await PublicationRepository.getNumberOfPublications(type)

    return {
      status: 200,
      info: {
        total,
        page,
        size: publications.length,
        limit
      },
      publications
    }
  }

  static async clearData(): Promise<void> {
    // Clear the files
    fs.rmdirSync("./public/storage/publications", { recursive: true });

    // Delete the table data
    await PublicationRepository.clearTable()
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

    if (import.meta.env.PROD) {
      // TODO
      return
    }

    const seedPath = "./seed_data/development/common"

    const publicationsTypes = publicationTypeEnum.enumValues
    const dummyAuthors = ["Sofía","Mateo","Valentina","Sebastián","Isabella","Santiago","Camila","Lucas","Victoria","Benjamín","Emma","Martín","Antonella","Diego","Renata","Nicolás","Catalina","Alejandro","Lucía","Tomás"]
    const files = fs.readdirSync(`${seedPath}/pdf`)
    const imgs = fs.readdirSync(`${seedPath}/webp`)

    if (files.length !== imgs.length) {
      throw new Error("The number of docs and thumbnails must be the same")
    }

    const publications: PublicationInsert[] = files.map((file, i) => {
      return {
        id: generateIdFromEntropySize(10),
        title: `Title of the publication ${i + 1}`,
        description: `Description of the publication ${i + 1}`,
        type: publicationsTypes[Math.floor(Math.random() * publicationsTypes.length)],
        authors: dummyAuthors.slice(0, Math.floor(Math.random() * dummyAuthors.length)).map(author => author),
        publicationDate: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
        filePath: `${filesPath}/${file}`,
        thumbnailPath: `${thumbnailsPath}/${imgs[i]}`
      }
    })

    await PublicationRepository.insertPublications(publications)

    // Copy the docs
    files.forEach((file) => {
      const inputPath = `${seedPath}/pdf/${file}`
      const outputPath = `${filesPath}/${file}`

      fs.copyFileSync(inputPath, `./public/${outputPath}`)
    })

    // Copy the thumbnails
    imgs.forEach((file) => {
      const inputPath = `${seedPath}/webp/${file}`
      const outputPath = `${thumbnailsPath}/${file}`

      fs.copyFileSync(inputPath, `./public/${outputPath}`)
    })
  }
}
import { ArticleRepository } from '@src/repositories/ArticleRepository';
import { generateHashFromStream } from '@src/utils/Hash';
import { generateIdFromEntropySize } from 'lucia';
import { isValidUrl } from '@src/utils/url';
import { PublicationRepository } from '@src/repositories/PublicationRepository';
import { PublicationSchema, PublicationUpdateSchema } from '@db/schemas';
import { publicationTypeEnum } from '@db/tables';
import fs from "node:fs"
import type { CommonResponse, PaginatedResponse } from "@src/types";
import type { PublicationInsert, PublicationSelect } from "@src/repositories/PublicationRepository";
import { randomUUID } from 'node:crypto';

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

  static async createPublication(formData: FormData): Promise<CommonResponse> {
    const fields = Object.fromEntries(formData.entries());
    const validation = PublicationSchema.safeParse(fields);

    if (!validation.success) {
      return {
        status: 400,
        message: validation.error.errors[0].message
      };
    }

    const { title, description, type, authors, publicationDate, file, fileUrl, thumbnail } = validation.data

    let data: PublicationInsert = {
      id: randomUUID(),
      title,
      description, 
      type,
      authors,
      publicationDate: new Date(publicationDate),
      filePath: "",
      thumbnailPath: ""
    }

    // Check if the title is already in use
    if (await PublicationRepository.getPublicationByTitle(title)) {
      return {
        status: 400,
        message: "El título ya está en uso"
      };
    }

    if (fileUrl) {
      data.filePath = fileUrl;
    } else if (file) {
      const fileHash = await generateHashFromStream(file.stream())

      if (await PublicationRepository.getPublicationByFileHash(fileHash)) {
        return {
          status: 400,
          message: "El archivo ya está en uso"
        }
      }

      fs.mkdirSync(`./public/${storagePath}/files`, { recursive: true });
      const filePath = `${storagePath}/${fileHash}.${file.name.split('.').pop()}`;
      fs.writeFileSync(`./public/${filePath}`, Buffer.from(await file.arrayBuffer()));

      data.filePath = filePath
    } else {
      return {
        status: 400,
        message: "El archivo es requerido"
      };
    }

    const thumbnailHash = await generateHashFromStream(thumbnail.stream())

    // Check if the thumbnail is already in use
    if (await PublicationRepository.getPublicationByThumbnailHash(thumbnailHash)) {
      return {
        status: 400,
        message: "La miniatura ya está en uso"
      }
    }

    fs.mkdirSync(`./public/${storagePath}/thumbnails`, { recursive: true });
    const thumbnailPath = `${storagePath}/${thumbnailHash}.${thumbnail.name.split('.').pop()}`
    fs.writeFileSync(`./public/${thumbnailPath}`, Buffer.from(await thumbnail.arrayBuffer()));
    data.thumbnailPath = thumbnailPath

    PublicationRepository.insertPublications([data])

    return {
      status: 200,
      message: "Publicación creada correctamente"
    };
  }

  static async updatePublication(formData: FormData): Promise<CommonResponse> {
    const publicationId = formData.get("id") as string;

    if (!publicationId) {
      return {
        status: 400,
        message: "El ID de la publicación es requerido"
      };
    }

    const publication = await PublicationRepository.getPublicationById(publicationId);

    if (!publication) {
      return {
        status: 404,
        message: "Publicación no encontrada"
      };
    }

    const fields = Object.fromEntries(formData.entries());
    const validation = PublicationUpdateSchema.safeParse(fields);

    if (!validation.success) {
      return {
        status: 400,
        message: validation.error.errors[0].message
      };
    }

    const { title, description, type, authors, publicationDate, file, fileUrl, thumbnail } = validation.data;
    
    const existingPublication = await PublicationRepository.getPublicationByTitle(title);

    if (existingPublication && existingPublication.id !== publicationId) {
      return {
        status: 400,
        message: "El título ya está en uso"
      };
    }

    let updateData: Partial<PublicationInsert> = {
      title,
      description,
      type,
      authors,
      publicationDate: new Date(publicationDate)
    }

    if (file || fileUrl) {
      if (!isValidUrl(publication.filePath)) {
        fs.rmdirSync(`./public/${publication.filePath}`, { recursive: true });
      }

      if (fileUrl) {
        updateData.filePath = fileUrl;
      } else if (file) {
        const fileHash = await generateHashFromStream(file.stream());

        const existingFile = await PublicationRepository.getPublicationByFileHash(fileHash);
        if (existingFile && existingFile.id !== publicationId) {
          return {
            status: 400,
            message: "El archivo ya está en uso"
          };
        }

        fs.mkdirSync(`./public/${storagePath}/files`, { recursive: true });
        const filePath = `${storagePath}/${fileHash}.${file.name.split('.').pop()}`;
        fs.writeFileSync(`./public/${filePath}`, Buffer.from(await file.arrayBuffer()));

        updateData.filePath = filePath;
      }
    } else {
      updateData.filePath = publication.filePath; // Keep the existing file path if no new file is provided
    }

    if (thumbnail) {
      // Delete the old thumbnail
      fs.rmdirSync(`./public/${publication.thumbnailPath}`, { recursive: true });

      const thumbnailHash = await generateHashFromStream(thumbnail.stream());

      const existingThumbnail = await PublicationRepository.getPublicationByThumbnailHash(thumbnailHash);

      if (existingThumbnail && existingThumbnail.id !== publicationId) {
        return {
          status: 400,
          message: "La miniatura ya está en uso"
        };
      }

      fs.mkdirSync(`./public/${storagePath}/thumbnails`, { recursive: true });
      const thumbnailPath = `${storagePath}/${thumbnailHash}.${thumbnail.name.split('.').pop()}`;
      fs.writeFileSync(`./public/${thumbnailPath}`, Buffer.from(await thumbnail.arrayBuffer()));
      updateData.thumbnailPath = thumbnailPath;
    } else {
      updateData.thumbnailPath = publication.thumbnailPath; // Keep the existing thumbnail path if no new thumbnail is provided
    }

    PublicationRepository.updatePublicationById(publicationId, updateData);
    
    return {
      status: 200,
      message: "Publicación actualizada correctamente"
    };
  }

  static async deletePublication(formData: FormData): Promise<CommonResponse> {
    const publicationId = formData.get("id") as string;

    if (!publicationId) {
      return {
        status: 400,
        message: "El ID de la publicación es requerido"
      };
    }

    const publication = await PublicationRepository.getPublicationById(publicationId);

    if (!publication) {
      return {
        status: 404,
        message: "Publicación no encontrada"
      };
    }

    // Delete the file and thumbnail 
    if (!isValidUrl(publication.filePath)) {
      fs.rmdirSync(`./public/${publication.filePath}`, { recursive: true });
    }
    fs.rmdirSync(`./public/${publication.thumbnailPath}`, { recursive: true });

    // Delete the publication from the database
    await PublicationRepository.deletePublicationById(publicationId);

    return {
      status: 200,
      message: "Publicación eliminada correctamente"
    };
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
import fs from 'node:fs'
import { GalleryRepository } from "@src/repositories/GalleryRepository"
import { generateHashFromFile, generateHashFromStream } from "@src/utils/hash"
import { Readable } from "node:stream"
import type { GalleryInsert, GallerySelect } from '@src/repositories/GalleryRepository'
import { generateIdFromEntropySize } from 'lucia'
import type { CommonResponse } from '@src/types'

const seedPath = "./seed_data/production/gallery"
const storagePath = "storage/gallery"

const supportedImageTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]

const maxImageSize = 10 * 1024 * 1024 // 10MB

export class GalleryService {
  static async getImages(): Promise<{ status: number, images: GallerySelect[]}> {
    const images = await GalleryRepository.getImages()

    return {
      status: 200,
      images
    }
  }

  static async createImage(formData: FormData):Promise<CommonResponse> {
    const image = formData.get('image') as File;

    // Check if the file exists
    if (!image) {
      return {
        status: 400,
        message: "La imagen es requerida"
      }
    }

    // Check if the image is a valid file
    if (image.type.startsWith("image/") === false) {
      return {
        status: 400,
        message: "El archivo no es una imagen"
      }
    }

    // Check if the image is a supported type
    if (!supportedImageTypes.includes(image.type)) {
      return {
        status: 400,
        message: "Formato de imagen no soportado"
      } 
    }

    if (image.size > maxImageSize) {
      return {
        status: 400,
        message: "La imagen es demasiado grande (10MB máximo)"
      }
    }

    const extension = image.type.split('/').pop()
    const hash = await generateHashFromStream(image.stream()) as string

    // Check if the image is duplicated
    const duplicatedImage = await GalleryRepository.findImageByHash(hash)
    if (duplicatedImage) {
      return {
        status: 400,
        message: "La imagen ya existe"
      }
    }

    // Store the image in the filesystem
    const outputPath = `storage/gallery/${hash}.${extension}`
    fs.mkdirSync("./public/storage/gallery", { recursive: true })
    const writableStream = fs.createWriteStream(`./public/${outputPath}`)
    const readableStream = Readable.from(image.stream())

    await new Promise<void>((resolve, reject) => {
      readableStream.pipe(writableStream)
      writableStream.on("finish", resolve)
      writableStream.on("error", reject)
    })

    // Insert in the db
    const insertImage: GalleryInsert = {
      id: generateIdFromEntropySize(10),
      path: outputPath
    }

    await GalleryRepository.insertImages([insertImage])

    return {
      status: 200,
      message: "Imagen creada correctamente"
    }
  }

  static async deleteImage(formData: FormData):Promise<CommonResponse> {
    const imageId = formData.get('id') as string;

    if (!imageId) {
      return {
        status: 400,
        message: "El ID de la imagen es requerido"
      }
    }

    const imagePath = await GalleryRepository.findImagePathById(imageId)

    if (!imagePath) {
      return {
        status: 400,
        message: "El ID de imagen no existe"
      }
    }

    // Delete the image from the database
    await GalleryRepository.deleteImageById(imageId)
    // Delete the image from the filesystem
    fs.rmSync(`./public/${imagePath}`, { force: true })

    return { 
      status: 200, 
      message: "Imagen eliminada correctamente"
    }
  }

  static async clearData(): Promise<void> {
    // Delete the files
    fs.rmdirSync("./public/storage/gallery", { recursive: true })

    // Delete the table data
    await GalleryRepository.clearTable()
  }

  static async seedData(): Promise<void> {
    // Create storage path if it doesn't exist
    if (!fs.existsSync(`./public/${storagePath}`)) {
      fs.mkdirSync(`./public/${storagePath}`, { recursive: true })
    }

    const images = fs.readdirSync(seedPath)

    const galleryImages: GalleryInsert[] = []

    await Promise.all(images.map(async (image) => {
      const inputPath = `${seedPath}/${image}`
      const extension = image.split('.').pop()

      // Hash name based on file's content
      const hashName = await generateHashFromFile(inputPath)

      const outputPath = `${storagePath}/${hashName}.${extension}`

      fs.copyFileSync(inputPath, `./public/${outputPath}`)

      galleryImages.push({
        id: generateIdFromEntropySize(10),
        path: outputPath
      })
    }))

    await GalleryRepository.insertImages(galleryImages)
  }
}
import fs from 'node:fs'
import { GalleryRepository } from "@src/repositories/GalleryRepository"
import { generateHashFromStream } from "@src/utils/Hash"
import { Readable } from "node:stream"

export class GalleryService {
  static async createImage(formData: FormData):Promise<{ status: number, message: string }> {
    const image = formData.get('image') as File;

    if (!image) {
      return {
        status: 400,
        message: "La imagen es requerida"
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
    await GalleryRepository.insertImage(outputPath)

    return {
      status: 200,
      message: "Imagen creada correctamente"
    }
  }

  static async deleteImage(formData: FormData):Promise<{ status: number, message: string }> {
    const imageId = formData.get('id') as string;

    if (!imageId) {
      return {
        status: 400,
        message: "ID de imagen requerido"
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
}
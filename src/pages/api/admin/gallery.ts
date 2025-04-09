import fs from "node:fs"
import type { APIContext } from "astro";
import { db, GalleryImage, eq, like } from "astro:db"
import { generateHashFromStream } from "@src/utils/Hash"
import { Readable } from "node:stream"

export async function POST(context: APIContext):Promise<Response> {
  try {
    const formData = await context.request.formData();
    const image = formData.get('image') as File;
    const extension = image.type.split('/').pop()

    // Get hash
    const hash = await generateHashFromStream(image.stream())

    // Check if the image is duplicated
    const duplicatedImage = 
      await db
        .select()
        .from(GalleryImage)
        .where(
          like(GalleryImage.path, `%${hash}%`)
        )

    if (duplicatedImage.length > 0) {
      return new Response(JSON.stringify({
        error: "La imagen ya existe"
      }), { status: 400 })
    }

    // Store the image in the filesystem
    fs.mkdirSync("./public/storage/gallery", { recursive: true })
    const outputPath = `storage/gallery/${hash}.${extension}`

    // Store the image in the database
    const writableStream = fs.createWriteStream(`./public/${outputPath}`)
    const readableStream = Readable.from(image.stream())

    readableStream.pipe(writableStream)

    writableStream.on('finish', async () => {
      // Insert the image into the database
      await db
        .insert(GalleryImage)
        .values({
          path: outputPath,
        })

      return new Response(JSON.stringify({
        success: true,
      }), { status: 200 })
   })

    writableStream.on('error', (err) => {
      throw err
    })

    return new Response(JSON.stringify({
      success: true
    }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Error interno del servidor"
    }), { status: 500 })
  }
}

export async function DELETE(context: APIContext):Promise<Response> {
  try {
    const formData = await context.request.formData();
    const imageId = formData.get('image_id') as string;

    if (!imageId) {
      return new Response(JSON.stringify({
        error: "ID de imagen requerido"
      }), { status: 400 })
    }

    // Get the path of the image
    const imagePath = 
      (
        await db
          .select({path: GalleryImage.path})
          .from(GalleryImage)
          .where(eq(GalleryImage.id, imageId))
      )[0].path

    if (!imagePath) {
      return new Response(JSON.stringify({
        error: "El ID de imagen no existe"
      }), { status: 400 })
    }

    // Delete the image from the database
    await db
      .delete(GalleryImage)
      .where(eq(GalleryImage.id, imageId))
      .execute() 
    
    // Check if the image was deleted
    const deletedImage = 
      await db
        .select()
        .from(GalleryImage)
        .where(eq(GalleryImage.id, imageId))
        .execute()

    if (deletedImage.length > 0) {
      return new Response(JSON.stringify({
        error: "Error al eliminar la imagen"
      }), { status: 500 })
    }

    // Delete from filesystem
    fs.rmSync(imagePath, { force: true })

    return new Response(JSON.stringify({
      success: true
    }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Error interno del servidor"
    }), { status: 500 })
  }
}
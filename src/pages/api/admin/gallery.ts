import type { APIContext } from "astro";
import fs from "node:fs"
import { db, GalleryImage, eq } from "astro:db"

export async function DELETE(context: APIContext):Promise<Response> {
  const formData = await context.request.formData();
  const imageId = formData.get('image_id') as string;

  try {
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
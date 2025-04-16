import { db, GalleryImage, like, eq } from "astro:db";

type GalleryImageSelect = typeof GalleryImage.$inferSelect

export class GalleryRepository {
  static async findImageByHash(hash: string):Promise<GalleryImageSelect | null> {
    const result = 
      await db
        .select()
        .from(GalleryImage)
        .where(like(GalleryImage.path, `%${hash}%`))
    return result.length > 0 ? result[0] : null
  }

  static async insertImage(path: string):Promise<void> {
    await db.insert(GalleryImage).values({ path })
  }

  static async findImagePathById(id: string): Promise<string | null> {
    const result = 
      await db
        .select({ path: GalleryImage.path })
        .from(GalleryImage)
        .where(eq(GalleryImage.id, id))

    return result.length > 0 ? result[0].path : null
  }

  static async deleteImageById(id: string):Promise<void> {
    await db.delete(GalleryImage).where(eq(GalleryImage.id, id)).execute()
  }
}
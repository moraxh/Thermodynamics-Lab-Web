import{ db } from "@db/connection"
import { Gallery } from "@db/tables"
import { eq, like } from "drizzle-orm"

export type GallerySelect = typeof Gallery.$inferSelect
export type GalleryInsert = typeof Gallery.$inferInsert

export class GalleryRepository {
  static async findImageByHash(hash: string):Promise<GallerySelect | null> {
    const result = 
      await db
        .select()
        .from(Gallery)
        .where(like(Gallery.path, `%${hash}%`))
    return result.length > 0 ? result[0] : null
  }

  static async insertImages(images: GalleryInsert[]):Promise<void> {
    await db.insert(Gallery).values(images)
  }

  static async findImagePathById(id: string): Promise<string | null> {
    const result = 
      await db
        .select({ path: Gallery.path })
        .from(Gallery)
        .where(eq(Gallery.id, id))

    return result.length > 0 ? result[0].path : null
  }

  static async deleteImageById(id: string):Promise<void> {
    await db.delete(Gallery).where(eq(Gallery.id, id)).execute()
  }

  static async clearTable():Promise<void> {
    await db.delete(Gallery).execute()
  }
}
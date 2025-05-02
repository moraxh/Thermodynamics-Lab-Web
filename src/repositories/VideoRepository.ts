import { desc, count } from "drizzle-orm"
import { db } from "@db/connection"
import { Video } from "@db/tables"

type VideoSelect = typeof Video.$inferSelect

export class VideoRepository {
 static async getVideos(page: number = 1, max_size: number = 5): Promise<VideoSelect[]> {
    const offset = (page - 1 ) * max_size
    const limit = max_size
  
    const videos = await db
      .select()
      .from(Video)
      .orderBy(desc(Video.uploadedAt))
      .limit(limit)
      .offset(offset)
  
    return videos
 }

 static async getNumberOfVideos(): Promise<number> {
  const videosCount = await db
    .select({ count: count() })
    .from(Video)

  return videosCount[0].count
 }

 static async clearTable(): Promise<void> {
  await db.delete(Video).execute()
 }
}
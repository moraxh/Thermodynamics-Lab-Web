import {
  count,
  desc,
  eq,
  like
  } from 'drizzle-orm';
import { db } from '@db/connection';
import { Video } from '@db/tables';

export type VideoSelect = typeof Video.$inferSelect
export type VideoInsert = typeof Video.$inferInsert

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

  static async getVideoById(id: string): Promise<VideoSelect | null> {
    const video = await db
      .select()
      .from(Video)
      .where(eq(Video.id, id))
      .limit(1)

    return video[0] || null
  }

  static async getVideoByTitle(title: string): Promise<VideoSelect | null> {
    const video = await db
      .select()
      .from(Video)
      .where(eq(Video.title, title))
      .limit(1)

    return video[0] || null
  }

  static async getVideoByVideoHash(videoHash: string): Promise<VideoSelect | null> {
    const video = await db
      .select()
      .from(Video)
      .where(like(Video.videoPath, `%${videoHash}%`))
      .limit(1)

    return video[0] || null
  }

  static async getVideoByThumbnailHash(thumbnailHash: string): Promise<VideoSelect | null> {
    const video = await db
      .select()
      .from(Video)
      .where(like(Video.thumbnailPath, `%${thumbnailHash}%`))
      .limit(1)

    return video[0] || null
  }

  static async createVideos(videos: VideoInsert[]): Promise<void> {
    await db.insert(Video)
      .values(videos)
      .execute()
  }

  static async updateVideo(id: string, video: Partial<VideoInsert>): Promise<void> {
    await db.update(Video)
      .set(video)
      .where(eq(Video.id, id))
      .execute()
  }

  static async deleteVideo(id: string): Promise<void> {
    await db.delete(Video)
      .where(eq(Video.id, id))
      .execute()
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

  static async insertVideos(videos: VideoInsert[]): Promise<void> {
    await db.insert(Video).values(videos).execute()
  }  
}
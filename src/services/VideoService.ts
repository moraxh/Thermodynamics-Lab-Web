import { VideoRepository } from "@src/repositories/VideoRepository";
import { Video } from "@db/tables";
import type { PaginatedResponse } from "@src/types";

type VideoSelect = typeof Video.$inferSelect

interface VideoResponse extends PaginatedResponse {
  videos?: VideoSelect[];
}

export class VideoService {
  static async getPublications(searchParams: URLSearchParams): Promise<VideoResponse> {
    // Check if there is pagination 
    const page = Number(searchParams.get('page')) || 1;
    // Check if there is a size limit
    const limit = Number(searchParams.get('limit')) || 5;

    const videos = await VideoRepository.getVideos(page, limit);
    const total = await VideoRepository.getNumberOfVideos()

    return {
      status: 200,
      info: {
        total,
        page,
        size: videos.length,
        limit
      },
      videos
    }

  }
}
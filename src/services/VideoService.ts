import { generateHashFromStream } from '@src/utils/Hash';
import { generateIdFromEntropySize } from 'lucia';
import { isValidUrl } from '@src/utils/url';
import { Video } from '@db/tables';
import { VideoRepository } from '@src/repositories/VideoRepository';
import { VideoSchema } from '@db/schemas';
import fs from "node:fs"
import type { PaginatedResponse } from "@src/types";
import type { VideoSelect, VideoInsert } from "@src/repositories/VideoRepository";
import type { CommonResponse } from "@src/types";
import { randomUUID } from 'node:crypto';

interface VideoResponse extends PaginatedResponse {
  videos?: VideoSelect[];
}

const storagePath = "storage/videos"
const videoPath = `${storagePath}/files`
const thumbnailPath = `${storagePath}/thumbnails`

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

  static async createVideo(formData: FormData): Promise<CommonResponse> {
    const fields = Object.fromEntries((formData.entries()))
    const validation = VideoSchema.safeParse(fields)

    if (!validation.success) {
      return {
        status: 400,
        message: validation.error.errors[0].message,
      }
    }

    const { title, description, videoUrl, thumbnail, videoFile } = validation.data;

    let data: VideoInsert = {
      id: randomUUID(),
      title, 
      description,
      videoPath: "", // Will be set below if available
    }

    // Check if the title is already in use
    if (await VideoRepository.getVideoByTitle(title)) {
      return {
        status: 400,
        message: "El título ya está en uso",
      }
    }

    if (videoUrl) {
      data.videoPath = videoUrl;
    } else if (videoFile) {
      // Get the file hash
      const videoHash = await generateHashFromStream(videoFile.stream())

      // Check if the video is already in use
      if (await VideoRepository.getVideoByVideoHash(videoHash)) {
        return {
          status: 400,
          message: "El video ya está en uso",
        }
      }

      // Save the video file
      fs.mkdirSync(`./public/${videoPath}`, { recursive: true })
      const filePath = `${videoPath}/${videoHash}.${videoFile.name.split('.').pop()}`

      fs.writeFileSync(`./public/${filePath}`, Buffer.from(await videoFile.arrayBuffer()))

      data.videoPath = filePath;
    } else {
      return {
        status: 400,
        message: "El video o la URL del video es requerido",
      }
    }

    if (videoFile && thumbnail) {
      const thumbnailHash = await generateHashFromStream(thumbnail.stream())

      // Check if the thumbnail is already in use
      if (await VideoRepository.getVideoByThumbnailHash(thumbnailHash)) {
        return {
          status: 400,
          message: "La miniatura ya está en uso",
        }
      }

      fs.mkdirSync(`./public/${thumbnailPath}`, { recursive: true })

      const thumbnailFilePath = `${thumbnailPath}/${thumbnailHash}.${thumbnail.name.split('.').pop()}`
      fs.writeFileSync(`./public/${thumbnailFilePath}`, Buffer.from(await thumbnail.arrayBuffer()))

      data.thumbnailPath = thumbnailFilePath;
    }

    await VideoRepository.createVideos([data])

    return {
      status: 200,
      message: "Video creado correctamente",
    }
  }

  static async updateVideo(formData: FormData): Promise<CommonResponse> {
    const videoId = formData.get("id") as string;

    if (!videoId) {
      return {
        status: 400,
        message: "El ID del video es requerido",
      }
    }

    const video = await VideoRepository.getVideoById(videoId);

    if (!video) {
      return {
        status: 404,
        message: "El video no existe",
      }
    }

    const fields = Object.fromEntries((formData.entries()))
    const validation = VideoSchema.safeParse(fields)

    if (!validation.success) {
      return {
        status: 400,
        message: validation.error.errors[0].message,
      }
    }

    const { title, description, videoUrl, thumbnail, videoFile } = validation.data;

    // Check if the title is already in use
    const existingVideo = await VideoRepository.getVideoByTitle(title);
    if (existingVideo && existingVideo.id !== videoId) {
      return {
        status: 400,
        message: "El título ya está en uso",
      }
    }

    let updateData: Partial<VideoInsert> = {
      title,
      description,
      videoPath: video.videoPath, // Keep the existing path unless updated
      thumbnailPath: video.thumbnailPath, // Keep the existing thumbnail unless updated
    }

    if (videoUrl) {
      updateData.videoPath = videoUrl;
    } else if (videoFile) {
      // Delete the existing video file if it exists
      if (!isValidUrl(video.videoPath)) {
        fs.rmSync(`./public/${video.videoPath}`, { force: true, recursive: true })
      }

      const videoHash = await generateHashFromStream(videoFile.stream())

      const existingVideoFile = await VideoRepository.getVideoByVideoHash(videoHash);

      if (existingVideoFile && existingVideoFile.id !== videoId) {
        return {
          status: 400,
          message: "El video ya está en uso",
        }
      }

      // Save the video file
      fs.mkdirSync(`./public/${videoPath}`, { recursive: true })
      const filePath = `${videoPath}/${videoHash}.${videoFile.name.split('.').pop()}`
      fs.writeFileSync(`./public/${filePath}`, Buffer.from(await videoFile.arrayBuffer()))
      updateData.videoPath = filePath;
    }

    if (!videoUrl && thumbnail) {
      // Delete the existing thumbnail if it exists
      fs.rmSync(`./public/${video.thumbnailPath}`, { force: true, recursive: true })

      const thumbnailHash = await generateHashFromStream(thumbnail.stream())

      const existingThumbnail = await VideoRepository.getVideoByThumbnailHash(thumbnailHash);

      if (existingThumbnail && existingThumbnail.id !== videoId) {
        return {
          status: 400,
          message: "La miniatura ya está en uso",
        }
      }

      fs.mkdirSync(`./public/${thumbnailPath}`, { recursive: true })
      const thumbnailFilePath = `${thumbnailPath}/${thumbnailHash}.${thumbnail.name.split('.').pop()}`
      fs.writeFileSync(`./public/${thumbnailFilePath}`, Buffer.from(await thumbnail.arrayBuffer()))
      updateData.thumbnailPath = thumbnailFilePath;
    }

    VideoRepository.updateVideo(videoId, updateData)

    return {
      status: 200,
      message: "Video actualizado correctamente",
    }
  }

  static async deleteVideo(formData: FormData): Promise<CommonResponse> {
    const videoId = formData.get("id") as string;

    if (!videoId) {
      return {
        status: 400,
        message: "El ID del video es requerido",
      }
    }

    // Check if the video exists
    const video = await VideoRepository.getVideoById(videoId);

    if (!video) {
      return {
        status: 404,
        message: "El video no existe",
      }
    }

    // Delete the video file
    if (!isValidUrl(video.videoPath)) {
      fs.rmSync(`./public/${video.videoPath}`, { force: true, recursive: true })
    }
    fs.rmSync(`./public/${video.thumbnailPath}`, { force: true, recursive: true })

    // Delete the video from the database
    await VideoRepository.deleteVideo(videoId)

    return {
      status: 200,
      message: "Video eliminado correctamente",
    }
  }

  static async clearData(): Promise<void> {
    // Delete the files
    fs.rmdirSync("./public/storage/videos", { recursive: true})

    // Clear the table data
    await VideoRepository.clearTable()
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
    const files = fs.readdirSync(`${seedPath}/mp4`)  
    const imgs = fs.readdirSync(`${seedPath}/webp`)  

    if (files.length !== imgs.length) {
      throw new Error("The number of mp4 files and webp files must be the same")
    }

    const videos: VideoInsert[] = files.map((file, i) => {
      return {
        id: generateIdFromEntropySize(10),
        title: `Title of the video ${i + 1}`,
        description: `Description of the video ${i + 1}`,
        thumbnailPath: `${storagePath}/thumbnails/${imgs[i]}`,
        videoPath: `${storagePath}/files/${file}`,
        duration: Math.floor(Math.random() * 1000) + 1,
        uploadedAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
      }
    })

    await VideoRepository.insertVideos(videos)

    // Copy the files to the public directory
    files.forEach((file) => {
      const inputPath = `${seedPath}/mp4/${file}`
      const outputPath = `${filesPath}/${file}`

      fs.copyFileSync(inputPath, `./public/${outputPath}`)
    })

    imgs.forEach((file) => {
      const inputPath = `${seedPath}/webp/${file}`
      const outputPath = `${thumbnailsPath}/${file}`

      fs.copyFileSync(inputPath, `./public/${outputPath}`)
    })
  }
}
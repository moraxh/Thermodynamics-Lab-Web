import fs from "node:fs"
import { VideoRepository } from "@src/repositories/VideoRepository";
import type { PaginatedResponse } from "@src/types";
import type { VideoSelect, VideoInsert } from "@src/repositories/VideoRepository";
import { generateIdFromEntropySize } from "lucia";

interface VideoResponse extends PaginatedResponse {
  videos?: VideoSelect[];
}

const storagePath = "storage/videos"

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
import fs from "node:fs"
import { db } from "@db/connection"
import { Video } from "@db/tables"
import { generateIdFromEntropySize } from "lucia"

type VideoInsert = typeof Video.$inferInsert

// IMPORTANT: This data is only for development purposes. Do not use it in production.
const test_videos: VideoInsert[] = []

for (let i = 0; i < 9; i++) {
  const video: VideoInsert = {
    id: generateIdFromEntropySize(10),
    title: `Title of the video ${i + 1}`,
    description: `Description of the video ${i + 1}`,
    thumbnailPath: `storage/videos/thumbnails/thumbnail(${i + 1}).webp`,
    videoPath: `storage/videos/files/video(${i + 1}).mp4`,
    duration: Math.floor(Math.random() * 1000) + 1,
    uploadedAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
  }

  test_videos.push(video)
}

// Copy the files to the public directory
fs.mkdirSync("./public/storage/videos/files", { recursive: true })
fs.mkdirSync("./public/storage/videos/thumbnails", { recursive: true })

// Files
fs.readdirSync("./seed/test/videos/files").forEach((file) => {
  const inputPath = `./seed/test/videos/files/${file}`
  const outputPath = `storage/videos/files/${file}`

  fs.copyFileSync(inputPath, `./public/${outputPath}`)
})

// Thumbnails
fs.readdirSync("./seed/test/videos/thumbnails").forEach((file) => {
  const inputPath = `./seed/test/videos/thumbnails/${file}`
  const outputPath = `storage/videos/thumbnails/${file}`

  fs.copyFileSync(inputPath, `./public/${outputPath}`)
})

export async function seedVideos() {
  await db.insert(Video).values(test_videos).execute()
}

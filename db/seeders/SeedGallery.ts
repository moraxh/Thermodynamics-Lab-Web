import { GalleryImage } from "astro:db"
import { generateIdFromEntropySize } from 'lucia';
import { generateHashFromFile } from "@src/utils/Hash"
import fs from "node:fs"

interface GalleryImageSeed {
  id: string;
  path: string;
}

const gallerySeedPath = "./seed/images/gallery"
const images = fs.readdirSync(gallerySeedPath)

export const galleryImages: GalleryImageSeed[] = []

fs.mkdirSync("./public/storage/gallery", { recursive: true })

await Promise.all(images.map(async (image) => {
  const inputPath = `${gallerySeedPath}/${image}`
  const extension = image.split('.').pop()

  // Hash name based on file's content
  const hashName = await generateHashFromFile(inputPath)

  const outputPath = `storage/gallery/${hashName}.${extension}`

  fs.copyFileSync(inputPath, `./public/${outputPath}`)

  galleryImages.push({
    id: generateIdFromEntropySize(10),
    path: outputPath
  })
}))

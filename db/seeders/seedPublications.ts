import fs from "node:fs"
import { db } from "@db/connection"
import { Publication, publicationTypeEnum } from "@db/tables"
import { generateIdFromEntropySize } from "lucia"

type PublicationInsert = typeof Publication.$inferInsert

// IMPORTANT: This data is for testing purposes only and should not be used in production.
const publicationsTypes = publicationTypeEnum.enumValues
const test_authors = ["Sofía","Mateo","Valentina","Sebastián","Isabella","Santiago","Camila","Lucas","Victoria","Benjamín","Emma","Martín","Antonella","Diego","Renata","Nicolás","Catalina","Alejandro","Lucía","Tomás"];

const test_publications: PublicationInsert[] = [];

for (let i = 0; i < 9; i++) {
  const publication: PublicationInsert = {
    id: generateIdFromEntropySize(10),
    title: `Title of the publication ${i + 1}`,
    description: `Description of the publication ${i + 1}`,
    type: publicationsTypes[Math.floor(Math.random() * publicationsTypes.length)],
    authors: test_authors.slice(0, Math.floor(Math.random() * test_authors.length)).map(author => author),
    publicationDate: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
    filePath: `storage/publications/docs/publications(${i + 1}).pdf`,
    thumbnailPath: `storage/publications/thumbnails/thumbnail (${i + 1}).webp`
  }

  test_publications.push(publication)
}

// Copy the files to the public directory 
fs.mkdirSync("./public/storage/publications/docs", { recursive: true })
fs.mkdirSync("./public/storage/publications/thumbnails", { recursive: true })

const seedPath = "./seed/test/publications"

// Copy the docs
fs.readdirSync(`${seedPath}/docs`).forEach((file) => {
  const inputPath = `${seedPath}/docs/${file}`
  const outputPath = `storage/publications/docs/${file}`

  fs.copyFileSync(inputPath, `./public/${outputPath}`)
})

// Copy the thumbnails
fs.readdirSync(`${seedPath}/thumbnails`).forEach((file) => {
  const inputPath = `${seedPath}/thumbnails/${file}`
  const outputPath = `storage/publications/thumbnails/${file}`

  fs.copyFileSync(inputPath, `./public/${outputPath}`)
})


export async function seedPublications() {
  await db.insert(Publication).values(test_publications)
}
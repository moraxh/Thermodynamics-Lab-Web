import fs from "node:fs"
import { db } from "@db/connection"
import { EducationalMaterial } from "@db/tables"
import { generateIdFromEntropySize } from "lucia"

type EducationalMaterialInsert = typeof EducationalMaterial.$inferInsert

// IMPORTANT: This data is only for development purposes. Do not use it in production.
const test_educational_materials: EducationalMaterialInsert[] = []

for (let i = 0; i < 9; i++) {
  const EducationalMaterial: EducationalMaterialInsert = {
    id: generateIdFromEntropySize(10),
    title: `Title of the educational material ${i + 1}`,
    description: `Description of the educational material ${i + 1}`,
    filePath: `storage/educational_material/publication(${i + 1}).pdf`,
    uploadedAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
  }

  test_educational_materials.push(EducationalMaterial)
}

// Copy images to membersImagesPath
fs.mkdirSync("./public/storage/educational_material", { recursive: true })

fs.readdirSync("./seed/test/educational_material").forEach((file) => {
  const inputPath = `./seed/test/educational_material/${file}`
  const outputPath = `storage/educational_material/${file}`

  fs.copyFileSync(inputPath, `./public/${outputPath}`)
})


export async function seedEducationalMaterial() {
  await db.insert(EducationalMaterial).values(test_educational_materials)
}
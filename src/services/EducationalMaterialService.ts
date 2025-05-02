import fs from "node:fs"
import { EducationalMaterialRepository } from "@src/repositories/EducationalMaterialRepository";
import type { PaginatedResponse } from "@src/types";
import type { EducationalMaterialSelect, EducationalMaterialInsert } from "@src/repositories/EducationalMaterialRepository";
import { generateIdFromEntropySize } from "lucia";
import { fips } from "node:crypto";

interface EducationalMaterialResponse extends PaginatedResponse {
  resources?: EducationalMaterialSelect[];
}

const storagePath = "storage/educational_material"

export class EducationalMaterialService {
  static async getResources(searchParams: URLSearchParams): Promise<EducationalMaterialResponse> {
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 5;

    const resources = await EducationalMaterialRepository.getResources(page, limit);
    const total = await EducationalMaterialRepository.getNumberOfResources()

    return {
      status: 200,
      info: {
        total,
        page,
        size: resources.length,
        limit
      },
      resources
    }
  }

  static async clearData(): Promise<void> {
    // Delete the files
    fs.rmdirSync("./public/storage/resources", { recursive: true });

    // Delete the table data
    await EducationalMaterialRepository.clearTable()
  }

  static async seedData(): Promise<void> {
    if (!fs.existsSync(`./public/${storagePath}`)) {
      fs.mkdirSync(`./public/${storagePath}`, { recursive: true })
    }

    // On production
    if (import.meta.env.PROD) {
      // TODO
      return
    }

    const seedPath = "./seed_data/development/common/pdf"
    const docs = fs.readdirSync(`${seedPath}`)

    const educational_material: EducationalMaterialInsert[] = docs.map((file, i) => {
      return {
        id: generateIdFromEntropySize(10),
        title: `Title of the educational material ${i + 1}`,
        description: `Description of the educational material ${i + 1}`,
        filePath: `${storagePath}/${file}`,
        uploadedAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
      }
    })

    await EducationalMaterialRepository.insertEducationalMaterial(educational_material)

    // Copy files to the storage path
    docs.forEach((file) => {
      const inputPath = `${seedPath}/${file}`
      const outputPath = `${storagePath}/${file}` 

      fs.copyFileSync(inputPath, `./public/${outputPath}`)
    })
  }
}
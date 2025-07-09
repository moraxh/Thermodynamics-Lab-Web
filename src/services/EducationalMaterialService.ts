import { EducationalMaterialRepository } from '@src/repositories/EducationalMaterialRepository';
import { EducationalMaterialSchema } from '@db/schemas';
import { generateHashFromStream } from '@src/utils/Hash';
import { generateIdFromEntropySize } from 'lucia';
import fs from "node:fs"
import type { CommonResponse, PaginatedResponse } from "@src/types";
import type { EducationalMaterialSelect, EducationalMaterialInsert } from "@src/repositories/EducationalMaterialRepository";

interface EducationalMaterialResponse extends PaginatedResponse {
  educational_materials?: EducationalMaterialSelect[];
}

const storagePath = "storage/educational_material"

export class EducationalMaterialService {
  static async getEducationalMaterial(searchParams: URLSearchParams): Promise<EducationalMaterialResponse> {
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 5;

    const educational_materials = await EducationalMaterialRepository.getEducationalMaterial(page, limit);
    const total = await EducationalMaterialRepository.getNumberOfEducationalMaterial()

    return {
      status: 200,
      info: {
        total,
        page,
        size: educational_materials.length,
        limit
      },
      educational_materials
    }
  }

  static async createEducationalMaterial(formData: FormData): Promise<CommonResponse> {
    const fields = Object.fromEntries((formData.entries()))
    const validation = EducationalMaterialSchema.safeParse(fields)

    if (!validation.success) {
      return {
        status: 400,
        message: validation.error.errors[0].message,
      }
    }

    const { title, description, file, fileUrl } = validation.data;

    let data: EducationalMaterialInsert = {
      id: generateIdFromEntropySize(10),
      title,
      description,
      filePath: "", // Will be set below if available
      uploadedAt: new Date()
    }

    // Check if the title already exists
    if (await EducationalMaterialRepository.getEducationalMaterialByTitle(title)) {
      return {
        status: 400,
        message: "Ya existe un recurso educativo con ese título"
      }
    }

    // If the file is provided, save it to the storage path
    if (fileUrl) {
      data.filePath = fileUrl;
    } else if (file) {
      const fileHash = await generateHashFromStream(file.stream())

      if (await EducationalMaterialRepository.getEducationalMaterialByFileHash(fileHash)) {
        return {
          status: 400,
          message: "Ya existe un recurso educativo con ese archivo"
        }
      }

      // Save the file
      fs.mkdirSync(`./public/${storagePath}`, { recursive: true })
      const filePath = `${storagePath}/${fileHash}.${file.name.split('.').pop()}`
      fs.writeFileSync(`./public/${filePath}`, Buffer.from(await file.arrayBuffer()))

      data.filePath = filePath;
    } else {
      return {
        status: 400,
        message: "Debe proporcionar un archivo o una URL de archivo"
      }
    }

    await EducationalMaterialRepository.insertEducationalMaterial([data])

    return {
      status: 200,
      message: "Recurso educativo creado exitosamente",
    }
  }

  static async deleteEducationalMaterial(formData: FormData): Promise<CommonResponse> {
    const educationalMaterialId = formData.get("id") as string;

    if (!educationalMaterialId) {
      return {
        status: 400,
        message: "El ID del recurso educativo es requerido"
      }
    }

    // Check if the educational material exists
    const educationalMaterial = await EducationalMaterialRepository.getEducationalMetarialById(educationalMaterialId);
    if (!educationalMaterial) {
      return {
        status: 404,
        message: "Recurso educativo no encontrado"
      }
    }

    // Delete the file from the storage
    const filePath = `./public/${educationalMaterial.filePath}`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete the educational material from the database
    await EducationalMaterialRepository.deleteEducationalMaterial(educationalMaterialId);

    return {
      status: 200,
      message: "Recurso educativo eliminado exitosamente"
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
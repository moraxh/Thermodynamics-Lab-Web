import fs from "node:fs"
import { EducationalMaterial } from "@db/tables";
import { ResourceRepository } from "@src/repositories/ResourceRepository";
import type { PaginatedResponse } from "@src/types";

type EducationalMaterialSelect = typeof EducationalMaterial.$inferSelect

interface ResourceResponse extends PaginatedResponse {
  resources?: EducationalMaterialSelect[];
}

export class ResourceService {
  static async getResources(searchParams: URLSearchParams): Promise<ResourceResponse> {
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 5;

    const resources = await ResourceRepository.getResources(page, limit);
    const total = await ResourceRepository.getNumberOfResources()

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
    await ResourceRepository.clearTable()
  }
}
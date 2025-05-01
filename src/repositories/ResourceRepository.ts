import { desc, count } from "drizzle-orm";
import { db } from "@db/connection";
import { EducationalMaterial } from "@db/tables";

type EducationalMaterialSelect = typeof EducationalMaterial.$inferSelect

export class ResourceRepository {
  static async getResources(page: number = 1, max_size: number = 5): Promise<EducationalMaterialSelect[]> {
    const offset = (page - 1) * max_size
    const limit = max_size

    const resources = await db
      .select()
      .from(EducationalMaterial)
      .orderBy(desc(EducationalMaterial.uploadedAt))
      .limit(limit)
      .offset(offset)

    return resources
  }

  static async getNumberOfResources(): Promise<number> {
    const resourcesCount = await db
      .select({ count: count() })
      .from(EducationalMaterial)

    return resourcesCount[0].count
  }
}
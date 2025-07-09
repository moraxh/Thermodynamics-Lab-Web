import { count, desc, eq } from 'drizzle-orm';
import { db } from '@db/connection';
import { EducationalMaterial } from '@db/tables';

export type EducationalMaterialSelect = typeof EducationalMaterial.$inferSelect
export type EducationalMaterialInsert = typeof EducationalMaterial.$inferSelect

export class EducationalMaterialRepository {
  static async getEducationalMaterial(page: number = 1, max_size: number = 5): Promise<EducationalMaterialSelect[]> {
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

  static async getEducationalMaterialByTitle(title: string): Promise<EducationalMaterialSelect | null> {
    const resource = await db
      .select()
      .from(EducationalMaterial)
      .where(eq(EducationalMaterial.title, title))
      .limit(1)

    return resource[0] || null
  }

  static async getEducationalMetarialById(id: string): Promise<EducationalMaterialSelect | null> {
    const resource = await db
      .select()
      .from(EducationalMaterial)
      .where(eq(EducationalMaterial.id, id))
      .limit(1)

    return resource[0] || null
  }

  static async getEducationalMaterialByFileHash(fileHash: string): Promise<EducationalMaterialSelect | null> {
    const resource = await db
      .select()
      .from(EducationalMaterial)
      .where(eq(EducationalMaterial.filePath, `%${fileHash}%`))
      .limit(1)

    return resource[0] || null
  }

  static async deleteEducationalMaterial(id: string): Promise<void> {
    await db
      .delete(EducationalMaterial)
      .where(eq(EducationalMaterial.id, id))
      .execute()
  }

  static async getNumberOfEducationalMaterial(): Promise<number> {
    const resourcesCount = await db
      .select({ count: count() })
      .from(EducationalMaterial)

    return resourcesCount[0].count
  }

  static async clearTable(): Promise<void> {
    await db.delete(EducationalMaterial).execute()
  }

  static async insertEducationalMaterial(educationalMaterial: EducationalMaterialInsert[]): Promise<void> {
    await db.insert(EducationalMaterial).values(educationalMaterial).execute()
  }
}
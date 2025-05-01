import { eq, count, desc } from "drizzle-orm"
import { db } from "@db/connection"
import { Publication, publicationTypeEnum } from "@db/tables"

type PublicationSelect = typeof Publication.$inferSelect
type PublicationType = typeof publicationTypeEnum.enumValues

export class PublicationRepository {
  static async getPublications(page: number = 1, type: string = 'all', max_size: number = 9): Promise<PublicationSelect[]> {
    const offset = (page - 1 ) * max_size
    const limit = max_size

    const publications = await db
      .select()
      .from(Publication)
      .where(type === 'all' ? undefined : eq(Publication.type, type as PublicationType[number]))
      .orderBy(desc(Publication.publicationDate))
      .limit(limit)
      .offset(offset)

    return publications
  }

  static async getNumberOfPublications(type: string = 'all'): Promise<number> {
    const publicationsCount = await db
      .select({ count: count() })
      .from(Publication)
      .where(type === 'all' ? undefined : eq(Publication.type, type as PublicationType[number]))

    return publicationsCount[0].count
  }
}
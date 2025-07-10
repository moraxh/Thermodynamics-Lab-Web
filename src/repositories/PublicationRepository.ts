import { count, desc, eq } from 'drizzle-orm';
import { db } from '@db/connection';
import { Publication, publicationTypeEnum } from '@db/tables';

export type PublicationSelect = typeof Publication.$inferSelect
export type PublicationInsert = typeof Publication.$inferInsert
export type PublicationType = typeof publicationTypeEnum.enumValues

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

  static async getPublicationById(id: string): Promise<PublicationSelect | null> {
    const publication = await db
      .select()
      .from(Publication)
      .where(eq(Publication.id, id))
      .limit(1)

    return publication.length > 0 ? publication[0] : null
  }

  static async getPublicationByTitle(title: string): Promise<PublicationSelect | null> {
    const publication = await db
      .select()
      .from(Publication)
      .where(eq(Publication.title, title))
      .limit(1)

    return publication.length > 0 ? publication[0] : null
  }

  static async getPublicationByFileHash(fileHash: string): Promise<PublicationSelect | null> {
    const publication = await db
      .select()
      .from(Publication)
      .where(eq(Publication.filePath, `%${fileHash}%`))
      .limit(1)

    return publication.length > 0 ? publication[0] : null
  }

  static async getPublicationByThumbnailHash(thumbnailHash: string): Promise<PublicationSelect | null> {
    const publication = await db
      .select()
      .from(Publication)
      .where(eq(Publication.thumbnailPath, `%${thumbnailHash}%`))
      .limit(1)

    return publication.length > 0 ? publication[0] : null
  }

  static async updatePublicationById(id: string, updateData: Partial<PublicationInsert>): Promise<void> {
    await db
      .update(Publication)
      .set(updateData)
      .where(eq(Publication.id, id))
      .execute()
  }

  static async deletePublicationById(id: string): Promise<void> {
    await db
      .delete(Publication)
      .where(eq(Publication.id, id))
      .execute()
  }

  static async getNumberOfPublications(type: string = 'all'): Promise<number> {
    const publicationsCount = await db
      .select({ count: count() })
      .from(Publication)
      .where(type === 'all' ? undefined : eq(Publication.type, type as PublicationType[number]))

    return publicationsCount[0].count
  }

  static async clearTable(): Promise<void> {
    await db.delete(Publication).execute()
  }

  static async insertPublications(publications: PublicationInsert[]) {
    await db.insert(Publication).values(publications).execute()
  }
}
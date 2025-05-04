import { db } from "@db/connection"
import { MemberType } from "@db/tables"
import { eq } from "drizzle-orm"

export type MemberTypeSelect = typeof MemberType.$inferSelect
export type MemberTypeInsert = typeof MemberType.$inferInsert

export class MemberTypeRepository {
  static async getMemberTypes(): Promise<MemberTypeSelect[]> {
    const memberTypes =
      await db
        .select()
        .from(MemberType)
        .orderBy(MemberType.order)

    return memberTypes
  }

  static async findMemberTypeByName(name: string): Promise<MemberTypeSelect | null> {
    const result =
      await db
        .select()
        .from(MemberType)
        .where(eq(MemberType.name, name));
    return result.length > 0 ? result[0] : null;
  }

  static async clearTable(): Promise<void> {
    await db.delete(MemberType).execute()
  }

  static async insertMemberTypes(memberTypes: MemberTypeInsert[]): Promise<void> {
    await db.insert(MemberType).values(memberTypes).execute()
  }
}
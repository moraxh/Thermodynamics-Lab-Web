import { db } from "@db/connection";
import { Member } from "@db/tables";
import { eq, like } from "drizzle-orm";

export type MemberInsert = typeof Member.$inferInsert
export type MemberSelect = typeof Member.$inferSelect

export class MemberRepository {
  static async findMemberByHash(hash: string): Promise<MemberSelect | null> {
    const result =
      await db
        .select()
        .from(Member)
        .where(like(Member.photo, `%${hash}%`));
    return result.length > 0 ? result[0] : null;
  }

  static async insertMembers(members: MemberInsert[]): Promise<void> {
    await db.insert(Member).values(members).execute()

  }

  static async findMemberImagePathById(id: string): Promise<string | null> {
    const result =
      await db
        .select({ path: Member.photo })
        .from(Member)
        .where(eq(Member.id, id));
    return result.length > 0 ? result[0].path : null;
  }

  static async deleteMember(id: string): Promise<void> {
    await db.delete(Member).where(eq(Member.id, id))
  }

  static async clearTable(): Promise<void> {
    await db.delete(Member).execute()
  }
}
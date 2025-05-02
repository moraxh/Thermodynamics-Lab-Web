import { db } from "@db/connection";
import { Member, MemberType } from "@db/tables";
import { eq, like } from "drizzle-orm";

type NewMember = typeof Member.$inferInsert
type MemberSelect = typeof Member.$inferSelect
type MemberTypeSelect = typeof MemberType.$inferSelect

export class MemberRepository {
  static async findMemberByHash(hash: string): Promise<MemberSelect | null> {
    const result =
      await db
        .select()
        .from(Member)
        .where(like(Member.photo, `%${hash}%`));
    return result.length > 0 ? result[0] : null;
  }

  static async findMemberTypeByName(name: string): Promise<MemberTypeSelect | null> {
    const result =
      await db
        .select()
        .from(MemberType)
        .where(eq(MemberType.name, name));
    return result.length > 0 ? result[0] : null;
  }

  static async createMember(member: NewMember): Promise<void> {
    await db.insert(Member).values(member)
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
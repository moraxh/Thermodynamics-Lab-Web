import { eq } from "drizzle-orm";
import { db } from "@db/connection";
import { User } from "@db/tables";

export type UserInsert = typeof User.$inferInsert
export type UserSelect = typeof User.$inferSelect

export class UserRepository {
  static async findUserByUsername(username: string): Promise<UserSelect | null> {
    const user = await db
      .select()
      .from(User)
      .where(eq(User.username, username))
      .limit(1)
      .execute()
    return user.at(0) || null
  }

  static async updateUser(username: string, hashedPassword: string) {
    await db
    .update(User)
    .set({
      username: username,
      passwordHash: hashedPassword
    })
    .execute()
  }

  static async clearTable(): Promise<void> {
    db.delete(User).execute()
  }

  static async insertUsers(users: UserInsert[]): Promise<void> {
    await db.insert(User).values(users).execute()
  }
}
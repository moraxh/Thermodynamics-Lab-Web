import { db } from "@db/connection";
import { User } from "@db/tables";

export type UserInsert = typeof User.$inferInsert
export type UserSelect = typeof User.$inferSelect

export class UserRepository {
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
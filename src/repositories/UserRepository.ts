import { db } from "@db/connection";
import { User } from "@db/tables";

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
}
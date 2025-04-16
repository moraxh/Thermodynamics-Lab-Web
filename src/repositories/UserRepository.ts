import { db, User } from "astro:db";

export class UserRepository {
  static async updateUser(username: string, hashedPassword: string) {
    await db
    .update(User)
    .set({
      username: username,
      password_hash: hashedPassword
    })
    .execute()
  }
}
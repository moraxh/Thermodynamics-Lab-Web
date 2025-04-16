import type { APIContext } from "astro"
import { UserSchema } from "@db/schemas";
import { db, User } from "astro:db"
import { hash } from "@node-rs/argon2"
import { passwordHashingOptions } from "../login";
import { UserController } from "@src/controllers/UserController";

export async function PATCH(context: APIContext):Promise<Response> {
  return UserController.updateUser(context)
}
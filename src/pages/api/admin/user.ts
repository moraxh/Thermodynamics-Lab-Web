import type { APIContext } from "astro"
import { UserController } from "@src/controllers/UserController";

export async function PATCH(context: APIContext):Promise<Response> {
  return UserController.updateUser(context)
}
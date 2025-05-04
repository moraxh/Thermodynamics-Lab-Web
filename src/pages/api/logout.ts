import { UserController } from "@src/controllers/UserController";
import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {
  return context.redirect('/login')
}

export async function POST(context: APIContext): Promise<Response> {
  return UserController.logout(context)
}
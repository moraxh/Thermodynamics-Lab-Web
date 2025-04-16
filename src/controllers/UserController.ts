import { UserSchema } from "@db/schemas";
import { UserService } from "@src/services/UserService";
import type { APIContext } from "astro";

export class UserController {
  static async updateUser(context: APIContext): Promise<Response> {
    try {
      const formData = await context.request.formData();
      const response = await UserService.updateUser(formData)
      return new Response(JSON.stringify(response), { status: response.status })
    } catch (error) {
      return new Response(JSON.stringify({
        message: "Error interno del servidor"
      }), { status: 500 })
    }
  }
}
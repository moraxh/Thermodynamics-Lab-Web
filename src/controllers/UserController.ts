import { UserSchema } from "@db/schemas";
import { UserService } from "@src/services/UserService";
import type { APIContext } from "astro";

export class UserController {
  static async updateUser(context: APIContext): Promise<Response> {
    try {
      const formData = await context.request.formData();
      const username = formData.get('username') as string
      const password = formData.get('password') as string
      const confirmPassword = formData.get('confirm_password') as string

      const response = await UserService.updateUser(username, password, confirmPassword)
      return new Response(JSON.stringify(response), { status: response.status })
    } catch (error) {
      return new Response(JSON.stringify({
        error: "Error interno del servidor"
      }), { status: 500 })
    }

    }
}
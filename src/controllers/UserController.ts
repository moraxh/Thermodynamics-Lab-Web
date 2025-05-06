import { UserService } from "@src/services/UserService";
import type { APIContext } from "astro";

export class UserController {
  static async login(context: APIContext): Promise<Response> {
    try {
      const formData = await context.request.formData();
      const response = await UserService.login(formData, context)
      return new Response(JSON.stringify(response), { status: response.status })
    } catch (error) {
      return new Response(JSON.stringify({
        message: "No se pudo iniciar sesión"
      }), { status: 500 })
    }
  }

  static async logout(context: APIContext): Promise<Response> {
    try {
      // Delete the session cookie
      const authSession = context.cookies.get('auth_session')
      const response = await UserService.logout(authSession, context)
      return new Response(JSON.stringify(response), { status: response.status })
    } catch (error) {
      return new Response(JSON.stringify({
        message: "No se pudo cerrar sesión"
      }), { status: 500 })
    }
  }

  static async updateUser(context: APIContext): Promise<Response> {
    try {
      const formData = await context.request.formData();
      const response = await UserService.updateUser(formData)
      return new Response(JSON.stringify(response), { status: response.status })
    } catch (error) {
      return new Response(JSON.stringify({
        message: "No se pudo actualizar el usuario"
      }), { status: 500 })
    }
  }
}
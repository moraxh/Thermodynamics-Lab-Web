import { MemberService } from "@src/services/MemberService";
import type { APIContext } from "astro";

export class MemberController {
  static async getMembers(context: APIContext): Promise<Response> {
    try {
      const response = await MemberService.getMembersByTypes()
      return new Response(JSON.stringify(response), { status: response.status })
    } catch (error) {
      return new Response(JSON.stringify({
        message: "Error al obtener los miembros"
      }), { status: 500 })
    }
  }

  static async createMember(context: APIContext): Promise<Response> {
    try {
      const formData = await context.request.formData();
      const response = await MemberService.createMember(formData)
      return new Response(JSON.stringify(response), { status: response.status })
    } catch (error) {
      console.log(error)
      return new Response(JSON.stringify({
        message: "Error al crear el miembro"
      }), { status: 500 })
    }
  }

  static async deleteMember(context: APIContext): Promise<Response> {
    try {
      const formData = await context.request.formData();
      const response = await MemberService.deleteMember(formData)
      return new Response(JSON.stringify(response), { status: response.status })
    } catch (error) {
      return new Response(JSON.stringify({
        message: "Error al eliminar el miembro"
      }), { status: 500 })
    }
  }
}
import type { APIContext } from "astro";
import { MemberController } from "@src/controllers/MemberController";

export async function GET(context: APIContext):Promise<Response> {
  return MemberController.getMembers(context)
}

export async function POST(context: APIContext):Promise<Response> {
  return MemberController.createMember(context)
}

export async function DELETE(context: APIContext):Promise<Response> {
  return MemberController.deleteMember(context)
}
import fs from "node:fs"
import type { APIContext } from "astro";
import { db, Member, eq, like } from "astro:db"
import { generateHashFromStream } from "@src/utils/Hash";
import { Readable } from "node:stream"
import MembersEdit from "@src/components/pages/admin/us/MembersEdit.astro";

export async function DELETE(context: APIContext):Promise<Response> {
  try {
    const formData = await context.request.formData();
    const memberId = formData.get('id') as string;

    if (!memberId) {
      return new Response(JSON.stringify({
        error: "El id es requerido"
      }), { status: 400 })
    }

    // Get the path of the image
    const imagePath = 
      (
        await db
        .select({path: Member.photo})
        .from(Member)
        .where(eq(Member.id, memberId))
      )[0].path

    if (!imagePath) {
      return new Response(JSON.stringify({
        error: "El id no coincide con ningún miembro"
      }), { status: 400 })
    }

    // Delete the register from the database
    await db
      .delete(Member)
      .where(eq(Member.id, memberId))

    // Check if the register was deleted
    const deletedMember = 
      await db
        .select()
        .from(Member)
        .where(eq(Member.id, memberId))
        .execute()
      
    if (deletedMember.length > 0) {
      return new Response(JSON.stringify({
        error: "Error al eliminar el miembro"
      }), { status: 400 })
    }

    // Delete from the filesystem
    fs.rmSync(`./public/${imagePath}`, { force: true })

    return new Response(JSON.stringify({
      success: true,
    }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Error al eliminar el miembro"
    }), { status: 500 })
  }
}
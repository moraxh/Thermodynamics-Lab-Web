import fs from "node:fs"
import type { APIContext } from "astro";
import { db, Member, MemberType, eq, like } from "astro:db"
import { generateHashFromStream } from "@src/utils/Hash";
import { Readable } from "node:stream"
import MembersEdit from "@src/components/pages/admin/us/MembersEdit.astro";
import { generateIdFromEntropySize } from "lucia";

export async function POST(context: APIContext):Promise<Response> {
  try {
    const formData = await context.request.formData();
    const image = formData.get('memberPhoto') as File;
    const name = formData.get('name') as string;
    const position = formData.get('position') as string;
    const typeOfMember = formData.get('typeOfMember') as string;

    if (!image || !name || !position || !typeOfMember) {
      let error;
      if (!image) error = "La imagen es requerida"
      if (!name) error = "El nombre es requerido"
      if (!position) error = "La posición es requerida"
      if (!typeOfMember) error = "El tipo de miembro es requerido"
      return new Response(JSON.stringify({
        error
      }), { status: 400 })
    }

    // Get extension
    const extension = image.type.split('/').pop()

    // Get hash
    const hash = await generateHashFromStream(image.stream())

    // Check if the image is duplicated
    const duplicatedImage =
      await db
        .select()
        .from(Member)
        .where(
          like(Member.photo, `%${hash}%`)
        )

    if (duplicatedImage.length > 0) {
      return new Response(JSON.stringify({
        error: "La imagen ya esta asignada a otro miembro"
      }), { status: 400 })
    }

    // Check if type of member is valid
    const isValidType = 
      await db
        .select()
        .from(MemberType)
        .where(eq(MemberType.name, typeOfMember))
      
    if (!isValidType.length) {
      return new Response(JSON.stringify({
        error: "El tipo de miembro no es válido"
      }), { status: 400 })
    }

    // Store the image in the filesystem
    fs.mkdirSync("./public/storage/members", { recursive: true })
    const outputPath = `storage/members/${hash}.${extension}`

    const writableStream = fs.createWriteStream(`./public/${outputPath}`)
    const readableStream = Readable.from(image.stream())

    readableStream.pipe(writableStream)

    writableStream.on('finish', async() => {
      // Insert the image into the database
      await db
        .insert(Member)
        .values({
          id: generateIdFromEntropySize(10),
          fullName: name,
          position: position,
          photo: outputPath,
          typeOfMember: typeOfMember,
        })

      return new Response(JSON.stringify({
        success: true,
      }), { status: 200 })
    })

    writableStream.on('error', (err) => {
      throw err
    })

    return new Response(JSON.stringify({
      success: true,
    }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Error al obtener el miembro"
    }), { status: 500 })
  }
}

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
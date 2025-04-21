import fs from "node:fs";
import { MemberRepository } from "@src/repositories/MemberRepository";
import { generateHashFromStream } from "@src/utils/Hash";
import { Readable } from "node:stream"
import { MemberSchema } from "@db/schemas";
import { generateIdFromEntropySize } from "lucia";

export class MemberService {
  static async createMember(formData: FormData): Promise<{ status: number, message: string }> {
    const image = formData.get('memberPhoto') as File
    const fullName = formData.get('name') as string
    const position = formData.get('position') as string
    const typeOfMember = formData.get('typeOfMember') as string

    if (!image || !fullName || !position || !typeOfMember) {
      let error;
      if (!image) error = "La imagen es requerida"
      else if (!fullName) error = "El nombre es requerido"
      else if (!position) error = "La posición es requerida"
      else if (!typeOfMember) error = "El tipo de miembro es requerido"
      else error = "Todos los campos son requeridos"

      return {
        status: 400,
        message: error
      }
    }

    // Validate
    const validation = MemberSchema.safeParse({
      fullName,
      position,
      typeOfMember
    })

    if (!validation.success) {
      return {
        status: 400,
        message: validation.error.issues[0].message || "Campos inválidos"
      }
    }

    // Get extension
    const extension = image.type.split('/').pop()

    // Get hash
    const hash = await generateHashFromStream(image.stream()) as string

    // Check if the image is duplicated
    const duplacatedImage = await MemberRepository.findMemberByHash(hash)
    if (duplacatedImage) {
      return {
        status: 400,
        message: "La imagen ya está asignada a otro miembro"
      }
    }

    // Check if type of member is valid
    const isValidType = await MemberRepository.findMemberTypeByName(typeOfMember)
    if (!isValidType) {
      return {
        status: 400,
        message: "El tipo de miembro no es válido"
      }
    }

    // Store the image in the filesystem
    const outputPath = `storage/members/${hash}.${extension}`
    fs.mkdirSync("./public/storage/members", { recursive: true })
    const writableStream = fs.createWriteStream(`./public/${outputPath}`)
    const readableStream = Readable.from(image.stream())

    await new Promise<void>((resolve, reject) => {
      readableStream.pipe(writableStream)
      writableStream.on("finish", resolve)
      writableStream.on("error", reject)
    })

    // Insert in the db
    await MemberRepository.createMember({
      id: generateIdFromEntropySize(10),
      fullName: fullName,
      position: position,
      typeOfMember: typeOfMember,
      photo: outputPath
    })

    return {
      status: 200,
      message: "Miembro creado correctamente"
    }

  }

  static async deleteMember(formData: FormData): Promise<{ status: number, message: string }> {
    const memberId = formData.get('id') as string;

    if (!memberId) {
      return {
        status: 400,
        message: "El id es requerido"
      }
    }

    // Get the path of the image
    const imagePath = await MemberRepository.findMemberImagePathById(memberId)
    if (!imagePath) {
      return {
        status: 400,
        message: "El id no coincide con ningún miembro"
      }
    }

    // Delete the register from the database
    await MemberRepository.deleteMember(memberId)
    // Delete from the filesystem
    fs.rmSync(`./public/${imagePath}`, { force: true })

    // Check if the register was deleted from the filesystem
    if (fs.existsSync(`./public/${imagePath}`)) {
      return {
        status: 500,
        message: "Error al eliminar el miembro del sistema de archivos"
      }
    }

    // Check if the register was deleted from the database
    const deletedMember = await MemberRepository.findMemberImagePathById(memberId)

    if (deletedMember) {
      return {
        status: 400,
        message: "Error al eliminar el miembro de la base de datos"
      }
    }

    return {
      status: 200,
      message: "Miembro eliminado correctamente"
    }
  }
}
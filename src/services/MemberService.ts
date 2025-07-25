import { generateHashFromFile, generateHashFromStream } from '@src/utils/Hash';
import { generateIdFromEntropySize } from 'lucia';
import { MemberRepository } from '@src/repositories/MemberRepository';
import { MemberSchema } from '@db/schemas';
import { MemberTypeRepository } from '@src/repositories/MemberTypeRepository';
import fs from "node:fs";
import { Readable } from "node:stream"
import type { MemberInsert, MemberSelect } from "@src/repositories/MemberRepository";
import type { CommonResponse } from "@src/types";

const seedPath = "./seed_data/production/members"
const storagePath = "storage/members"

interface MembersResponse extends CommonResponse {
  members: Record<string, MemberSelect[]>
}

export class MemberService {
  static async getMembersByTypes(): Promise<MembersResponse> {
    const members: Record<string, MemberSelect[]> = {}

    const allMembers = await MemberRepository.getMembers()
    const memberTypes = await MemberTypeRepository.getMemberTypes()

    // Group by type
    for (const member of allMembers) {
      if (member.typeOfMember && members[member.typeOfMember] === undefined) {
        members[member.typeOfMember] = []
      }
      if (member.typeOfMember !== null) {
        members[member.typeOfMember].push(member)
      }
    }

    // Sort by order using the order property of the member type
    const sortedMembers = Object.fromEntries(
      Object.entries(members).sort((a, b) => {
        const aOrder = memberTypes.find(type => type.name === a[0])?.order || 0
        const bOrder = memberTypes.find(type => type.name === b[0])?.order || 0
        return aOrder - bOrder
      })
    )

    return {
      status: 200,
      message: "Miembros obtenidos correctamente",
      members: sortedMembers,
    }
  }

  static async createMember(formData: FormData): Promise<CommonResponse> {
    const fields = Object.fromEntries(formData.entries())

    // Validate inputs
    const validation = MemberSchema.safeParse(fields)

    if (!validation.success) {
      return {
        status: 400,
        message: validation.error.issues[0].message || "Campos inválidos"
      }
    }

    const { memberPhoto, fullName, position, typeOfMember } = validation.data

    // Get extension
    const extension = memberPhoto.type.split('/').pop()

    // Get hash
    const hash = await generateHashFromStream(memberPhoto.stream()) as string

    // Check if the image is duplicated
    const duplacatedImage = await MemberRepository.findMemberByHash(hash)
    if (duplacatedImage) {
      return {
        status: 400,
        message: "La imagen ya está asignada a otro miembro"
      }
    }

    // Check if type of member is valid
    const isValidType = await MemberTypeRepository.findMemberTypeByName(typeOfMember)
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
    const readableStream = Readable.from(memberPhoto.stream())

    await new Promise<void>((resolve, reject) => {
      readableStream.pipe(writableStream)
      writableStream.on("finish", resolve)
      writableStream.on("error", reject)
    })

    // Insert in the db
    const member = {
      id: generateIdFromEntropySize(10),
      fullName: fullName,
      position: position,
      typeOfMember: typeOfMember,
      photo: outputPath
    }

    await MemberRepository.insertMembers([member])

    return {
      status: 200,
      message: "Miembro creado correctamente"
    }
  }

  static async deleteMember(formData: FormData): Promise<CommonResponse> {
    const memberId = formData.get('id') as string;

    if (!memberId) {
      return {
        status: 400,
        message: "El id es requerido"
      }
    }

    // Get the path of the image
    const imagePath = await MemberRepository.findMemberImagePathById(memberId)

    // Check if the image exists
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

    return {
      status: 200,
      message: "Miembro eliminado correctamente"
    }
  }

  static async clearData(): Promise<void> {
    // Clear the files
    fs.rmdirSync("./public/storage/members", { recursive: true })

    // Delete the table data
    await MemberRepository.clearTable()
  }

  static async seedData(): Promise<void> {
    // Create the directory if it doesn't exist 
    if (!fs.existsSync(`./public/${storagePath}`)) {
      fs.mkdirSync(`./public/${storagePath}`, { recursive: true })
    }

    const membersJSON = JSON.parse(fs.readFileSync(`${seedPath}/members.json`, 'utf-8')) as Omit<MemberInsert, 'id'>[]
    const membersImages = fs.readdirSync(`${seedPath}/images_improved`)

    // Copy images to the storage path
    await Promise.all(membersImages.map(async (file) => {
      const inputPath = `${seedPath}/images_improved/${file}`
      const extension = file.split('.').pop()

      const hashname = await generateHashFromFile(inputPath)

      fs.copyFileSync(`${seedPath}/images_improved/${file}`, `./public/${storagePath}/${hashname}.${extension}`)

      membersJSON.find(member => member.photo === file)!.photo = `${storagePath}/${hashname}.${extension}`
    }))

    const members = membersJSON.map(member => {
      return {
        id: generateIdFromEntropySize(10),
        ...member,
        photo: member.photo ? member.photo : null,
      }
    })

    await MemberRepository.insertMembers(members)
  }
}
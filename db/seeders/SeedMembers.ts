import fs from 'node:fs'
import { generateIdFromEntropySize } from 'lucia';
import { generateHashFromFile } from '@src/utils/Hash';

import membersJSON from "@seed/members.json"

export const membersType = [
  { name: "Fundador", plural_name: "Fundadores",order: 1 },
  { name: "Colaborador", plural_name: "Colaboradores", order: 2 },
  { name: "Miembro", plural_name: "Miembros", order: 3 },
]

// ----------
// Members
// ----------
const seedImagesPath = "./seed/images/members_improved"
const membersImagesPath = "storage/members"
const fullMembersImagesPath = `./public/${membersImagesPath}`

// Copy images to membersImagesPath
fs.mkdirSync(fullMembersImagesPath, { recursive: true })

const files = fs.readdirSync(seedImagesPath)

await Promise.all(files.map(async (file) => {
  const inputPath = `${seedImagesPath}/${file}`
  const extension = file.split('.').pop()

  // Hashed name based on content files
  const hashName = await generateHashFromFile(inputPath)

  fs.copyFileSync(`${seedImagesPath}/${file}`, `${fullMembersImagesPath}/${hashName}.${extension}`)

  membersJSON.find(member => member.photo === file)!.photo = `${hashName}.${extension}`
}))

export const members = membersJSON.map(member => {
  return {
    id: generateIdFromEntropySize(10),
    ...member,
    photo: member.photo ? `${membersImagesPath}/${member.photo}` : null,
  }
})

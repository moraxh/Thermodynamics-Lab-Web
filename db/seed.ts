import { db, User, Member, MemberType } from 'astro:db';
import { hash } from "@node-rs/argon2"
import { passwordHashingOptions } from '@src/pages/api/login';
import { generateIdFromEntropySize } from 'lucia';
import * as crypto from 'node:crypto'



import fs from 'node:fs'
const NODE_ENV = import.meta.env.MODE
import membersJSON from "../seed/members.json"

// ----------
// User admin 
// ----------

const defaultUserPassword = 
  NODE_ENV === "development"
    ? "admin"
    : crypto.randomBytes(10).toString('hex')

if (NODE_ENV === "development") {
  console.info(`Default credentials: \nUsername: admin \nPassword: ${defaultUserPassword}`)
}

const defaultUser = { 
  id: generateIdFromEntropySize(10),
  username: "admin",
  password_hash: await hash(defaultUserPassword, passwordHashingOptions),
}

// ----------
// Members Type
// ----------

const membersType = [
  { name: "Fundadores", order: 1 },
  { name: "Colaboradores", order: 2 },
  { name: "Miembros", order: 3 },
]

// ----------
// Members
// ----------
const seedImagesPath = "./seed/images/members_improved"
const membersImagesPath = "storage/members"
const fullMembersImagesPath = `./public/${membersImagesPath}`

// Copy images to membersImagesPath
fs.mkdirSync(fullMembersImagesPath, { recursive: true })
fs.readdirSync(seedImagesPath).forEach(file => {
  fs.copyFileSync(`${seedImagesPath}/${file}`, `${fullMembersImagesPath}/${file}`)
})

const members = membersJSON.map(member => {
  return {
    id: generateIdFromEntropySize(10),
    ...member,
    photo: `/${membersImagesPath}/${member.photo}`,
  }
})

export default async function() {
  await db.insert(User).values([defaultUser]);
  await db.insert(MemberType).values(membersType);
  await db.insert(Member).values(members);
}
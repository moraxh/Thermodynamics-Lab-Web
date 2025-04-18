import { db } from "@db/connection"
import { User } from "@db/tables"
import { hash } from "@node-rs/argon2"
import { generateIdFromEntropySize } from 'lucia';
import { passwordHashingOptions } from '@src/pages/api/login';

import * as crypto from 'node:crypto'

type UserInsertable = typeof User.$inferInsert

const NODE_ENV = import.meta.env.MODE

const defaultUserPassword = 
  NODE_ENV === "development"
    ? "admin"
    : crypto.randomBytes(10).toString('hex')

if (NODE_ENV === "development") {
  console.info(`Default credentials: \nUsername: admin \nPassword: ${defaultUserPassword}`)
}

export const defaultUser: UserInsertable = { 
  id: generateIdFromEntropySize(10),
  username: "admin",
  passwordHash: await hash(defaultUserPassword, passwordHashingOptions),
}

export async function seedUsers() {
  await db.insert(User).values([defaultUser]).execute()
}
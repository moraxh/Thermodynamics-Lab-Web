import { db, User } from 'astro:db';
import { hash } from "@node-rs/argon2"
import { passwordHashingOptions } from '@src/pages/api/login';
import { generateIdFromEntropySize } from 'lucia';

const defaultUser = { 
  username: "admin",
  password_hash: await hash("admin", passwordHashingOptions),
  id: generateIdFromEntropySize(10)
}

export default async function() {
  await db.insert(User).values([defaultUser]);
}
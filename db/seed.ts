import { db, User, Member, MemberType } from 'astro:db';

import { defaultUser } from "./seeders/SeedUsers"
import { members, membersType } from "./seeders/SeedMembers"
import { galleryImages } from './seeders/SeedGallery';

export default async function() {
  await db.insert(User).values([defaultUser]);
  await db.insert(MemberType).values(membersType);
  await db.insert(Member).values(members);
}
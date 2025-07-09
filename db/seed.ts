import { ArticleService } from '@src/services/ArticleService';
import { db } from '@db/connection';
import { EducationalMaterialService } from '@src/services/EducationalMaterialService';
import { ensureDatabaseExists } from '@db/utils';
import { EventService } from '@src/services/EventService';
import { exec } from 'child_process';
import { GalleryService } from '@src/services/GalleryService';
import { MemberService } from '@src/services/MemberService';
import { MemberTypeService } from '@src/services/MemberTypeService';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { PublicationService } from '@src/services/PublicationService';
import { UserService } from '@src/services/UserService';
import { VideoService } from '@src/services/VideoService';


export default async function seedDatabase() {
  await ensureDatabaseExists();

  // Generate the migration files
  await new Promise((resolve, reject) => {
    exec("npx drizzle-kit generate", async (error, stdout, stderr) => {
      if (error) {
        throw new Error(`Error generating migrations: ${error}`);
      }
      resolve(stdout)
    });
  })

  await migrate(db, { migrationsFolder: "./drizzle" });

  await ArticleService.seedData()
  await EventService.seedData()
  await GalleryService.seedData()
  await EducationalMaterialService.seedData() 
  await MemberTypeService.seedData()
  await MemberService.seedData()
  await PublicationService.seedData()
  await UserService.seedData()
  await VideoService.seedData()

  console.log("Database seeded ☺️");
}
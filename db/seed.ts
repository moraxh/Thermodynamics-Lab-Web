import { ensureDatabaseExists } from "@db/utils";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "@db/connection";
import { exec } from "child_process"

import { ArticleService } from "@src/services/ArticleService";
import { EventService } from "@src/services/EventService";
import { GalleryService } from "@src/services/GalleryService";
import { EducationalMaterialService } from "@src/services/EducationalMaterialService";
import { MemberTypeService } from "@src/services/MemberTypeService";
import { MemberService } from "@src/services/MemberService";
import { PublicationService } from "@src/services/PublicationService";
import { UserService } from "@src/services/UserService";
import { VideoService } from "@src/services/VideoService";

export default async function seedDatabase() {
  await ensureDatabaseExists();

  // Generate the migration files
  await new Promise((resolve, reject) => {
    exec("npx drizzle-kit generate", async (error, stdout, stderr) => {
      if (error) {
        console.error(`Error generating migrations: ${error}`);
        reject(error)
      }
      if (stderr) {
        console.log(`Error in the standard error: ${stderr}`);
        reject(stderr)
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
import { seedGallery } from "./seeders/SeedGallery";
import { seedUsers } from "./seeders/SeedUsers";
import { seedMembers } from "./seeders/SeedMembers";
import { seedPublications } from "./seeders/seedPublications";

import { ensureDatabaseExists } from "@db/utils";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "@db/connection";
import { exec } from "child_process"
import { resolve } from "path";
import { seedVideos } from "./seeders/seedVideos";
import { seedEducationalMaterial } from "./seeders/seedEducationalMaterial";
import { seedEvents } from "./seeders/seedEvents";
import { seedArticles } from "./seeders/seedArticles";

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

  await seedUsers();
  await seedMembers();
  await seedGallery();
  // Publications
  await seedPublications();
  // Divulgation
  await seedVideos()
  await seedEducationalMaterial()
  await seedEvents()
  await seedArticles()
  console.log("Database seeded ☺️");
}
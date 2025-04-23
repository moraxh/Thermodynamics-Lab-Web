import { seedGallery } from "./seeders/SeedGallery";
import { seedUsers } from "./seeders/SeedUsers";
import { seedMembers } from "./seeders/SeedMembers";
import { seedPublications } from "./seeders/seedPublications";

import { ensureDatabaseExists } from "@db/utils";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "@db/connection";
import { exec } from "child_process"
import { resolve } from "path";

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
  await seedPublications();
  console.log("Database seeded ☺️");
}
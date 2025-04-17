import { seedGallery } from "./seeders/SeedGallery";
import { seedUsers } from "./seeders/SeedUsers";
import { seedMembers } from "./seeders/SeedMembers";
import 'dotenv/config'
import pkg from "pg";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "@db/connection";

if (!process.env.CONNECTION_STRING) {
  throw new Error("CONNECTION_STRING is not defined in .env file")
}

const { CONNECTION_STRING } = process.env;
const { Client } = pkg;

const databaseName = new URL(CONNECTION_STRING).pathname.slice(1);

// Create the database if it doesn't exist
async function ensureDatabaseExists() {
  const client = new Client({
    connectionString: CONNECTION_STRING.replace(`/${databaseName}`, "/postgres"), // Connect to the default database
  });

  try {
    await client.connect();
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [databaseName]
    );

    // Delete the database if it exists
    if (res.rowCount && res.rowCount > 0) {
      console.log(`Database "${databaseName}" already exists, deleting it...`);
      await client.query(`DROP DATABASE IF EXISTS "${databaseName}"`);
    } 

    await client.query(`CREATE DATABASE "${databaseName}"`);
    console.log(`A new database "${databaseName}" was created successfully.`);
  } catch (error) {
    console.error("An error occurred while checking/creating the database:", error);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
}

export default async function seedDatabase() {
  await ensureDatabaseExists();

  await migrate(db, { migrationsFolder: "./drizzle" });

  await seedUsers();
  await seedMembers();
  await seedGallery();
  console.log("Database seeded successfully.");
}
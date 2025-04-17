import { drizzle } from "drizzle-orm/node-postgres";
import { CONNECTION_STRING } from "astro:env/server";
import pkg from "pg";

const { Pool } = pkg;

const pool = new Pool({
  connectionString: CONNECTION_STRING,
});

const db = drizzle(pool);

export { db };

import type { Config } from "drizzle-kit";
import 'dotenv/config'

if (!process.env.CONNECTION_STRING) {
  throw new Error("CONNECTION_STRING is not defined in .env file")
}

export default {
  schema: "./db/tables.ts",
  out: "./drizzle",
  dialect: "postgresql",
  driver: "pglite",
  dbCredentials: {
    url: process.env.CONNECTION_STRING,
  },
} satisfies Config;

import 'dotenv/config'
import pkg from "pg";

if (!process.env.CONNECTION_STRING) {
  throw new Error("CONNECTION_STRING is not defined in .env file")
}

const { CONNECTION_STRING } = process.env;
const { Client } = pkg;

const databaseName = new URL(CONNECTION_STRING).pathname.slice(1);

// Create the database if it doesn't exist
export async function ensureDatabaseExists() {
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
      await client.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = $1
        AND pid <> pg_backend_pid();
        `, [databaseName]);

      await client.query(`DROP DATABASE IF EXISTS "${databaseName}"`);
    } 

    await client.query(`CREATE DATABASE "${databaseName}"`);
  } catch (error) {
    throw new Error(`Error ensuring database exists, does your database is up?: ${error}`);
  } finally {
    await client.end();
  }
}

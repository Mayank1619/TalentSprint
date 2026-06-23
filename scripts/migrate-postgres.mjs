import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;
const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const databaseUrl = process.env.DATABASE_URL;
const authMode = process.env.NEXT_PUBLIC_AUTH_MODE;

if (!databaseUrl) {
  if (authMode === "postgres") {
    throw new Error("NEXT_PUBLIC_AUTH_MODE=postgres requires DATABASE_URL before deploying.");
  }

  console.log("Skipping Postgres migration because DATABASE_URL is not configured.");
  process.exit(0);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: shouldUseSsl(databaseUrl) ? { rejectUnauthorized: false } : undefined,
  max: 1,
});

try {
  const migrationPath = join(rootDir, "db", "migrations", "0001_better_auth_postgres.sql");
  const migrationSql = await readFile(migrationPath, "utf8");
  await pool.query(migrationSql);
  console.log("Postgres migration completed.");
} finally {
  await pool.end();
}

function shouldUseSsl(connectionString) {
  return !connectionString.includes("localhost") && !connectionString.includes("127.0.0.1");
}

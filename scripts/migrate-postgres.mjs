import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { hashPassword } from "better-auth/crypto";
import pg from "pg";

const { Pool } = pg;
const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const databaseUrl = process.env.DATABASE_URL;
const authMode = process.env.NEXT_PUBLIC_AUTH_MODE;
const defaultAdmin = {
  id: "admin-demo",
  name: "Admin Demo",
  email: "admin@talentsprint.dev",
  password: "Admin@2026!",
};

if (!databaseUrl) {
  if (authMode === "postgres") {
    throw new Error("NEXT_PUBLIC_AUTH_MODE=postgres requires DATABASE_URL before deploying.");
  }

  console.log("Skipping Postgres migration because DATABASE_URL is not configured.");
  process.exit(0);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: shouldUseSsl(databaseUrl) ? true : undefined,
  max: 1,
});

try {
  const migrationPath = join(rootDir, "db", "migrations", "0001_better_auth_postgres.sql");
  const migrationSql = await readFile(migrationPath, "utf8");
  await pool.query(migrationSql);
  await seedAdministrator(pool);
  console.log("Postgres migration completed.");
} finally {
  await pool.end();
}

function shouldUseSsl(connectionString) {
  return !connectionString.includes("localhost") && !connectionString.includes("127.0.0.1");
}

async function seedAdministrator(pool) {
  const email = defaultAdmin.email.toLowerCase();
  const passwordHash = await hashPassword(defaultAdmin.password);
  const client = await pool.connect();

  try {
    await client.query("begin");
    const existingUser = await client.query('select id from "user" where lower(email) = $1 limit 1', [email]);
    const userId = existingUser.rows[0]?.id ?? defaultAdmin.id;

    await client.query(
      `
        insert into "user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
        values ($1, $2, $3, true, now(), now())
        on conflict (id) do update set
          name = excluded.name,
          email = excluded.email,
          "emailVerified" = true,
          "updatedAt" = now()
      `,
      [userId, defaultAdmin.name, email],
    );

    await client.query(
      `
        insert into "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
        values ($1, $2, 'credential', $2, $3, now(), now())
        on conflict (id) do update set
          password = excluded.password,
          "updatedAt" = now()
      `,
      [`${userId}-credential`, userId, passwordHash],
    );

    await client.query(
      `
        insert into talent_profiles (auth_user_id, display_name, email, role, status, created_at, updated_at)
        values ($1, $2, $3, 'administrator', 'active', now(), now())
        on conflict (auth_user_id) do update set
          display_name = excluded.display_name,
          email = excluded.email,
          role = 'administrator',
          status = 'active',
          disabled_at = null,
          updated_at = now()
      `,
      [userId, defaultAdmin.name, email],
    );

    await client.query("commit");
    console.log(`Seeded administrator account for ${email}.`);
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

import { Pool } from "pg";

const fallbackDatabaseUrl = "postgres://postgres:postgres@localhost:5432/talent_sprint";

type GlobalWithPool = typeof globalThis & {
  __talentSprintPool?: Pool;
};

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getDatabaseUrl() {
  return process.env.DATABASE_URL ?? fallbackDatabaseUrl;
}

export function getPostgresPool() {
  const globalForPool = globalThis as GlobalWithPool;
  if (!globalForPool.__talentSprintPool) {
    const connectionString = getDatabaseUrl();
    globalForPool.__talentSprintPool = new Pool({
      connectionString,
      ssl: shouldUseSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
      max: Number(process.env.POSTGRES_POOL_MAX ?? 5),
    });
  }

  return globalForPool.__talentSprintPool;
}

function shouldUseSsl(connectionString: string) {
  return !connectionString.includes("localhost") && !connectionString.includes("127.0.0.1");
}

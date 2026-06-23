import { auth } from "@/lib/better-auth";
import {
  normalizeEmail,
  parseAccountStatus,
  parseRole,
  type AccountStatus,
  type DemoUser,
  type ManagedUser,
  type Role,
} from "@/lib/auth";
import { getPostgresPool } from "@/lib/postgres";

type BetterAuthUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

type ProfileRow = {
  auth_user_id: string;
  display_name: string;
  email: string;
  role: string;
  status: string;
  created_at?: Date | string;
  updated_at?: Date | string;
  invited_at?: Date | string | null;
  disabled_at?: Date | string | null;
};

type AuthUserRow = {
  id: string;
  name: string | null;
  email?: string | null;
  auth_email?: string | null;
  profile_email?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export async function getCurrentAuthUser(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return null;

  const profile = await ensureProfileForAuthUser(session.user);
  return profile.status === "disabled" ? null : profile;
}

export async function ensureProfileForAuthUser(user: BetterAuthUser): Promise<ManagedUser> {
  await ensureProfileTables();

  const email = normalizeEmail(user.email ?? "");
  const existing = await getProfileByUserId(user.id);
  if (existing) return mapProfileRow(existing, user);

  const role: Role = isMasterAdminEmail(email) ? "administrator" : "candidate";
  const displayName = user.name?.trim() || fallbackName(email);
  const pool = getPostgresPool();

  const result = await pool.query<ProfileRow>(
    `
      insert into talent_profiles (auth_user_id, display_name, email, role, status)
      values ($1, $2, $3, $4, 'active')
      on conflict (auth_user_id) do update set
        display_name = excluded.display_name,
        email = excluded.email,
        updated_at = now()
      returning *
    `,
    [user.id, displayName, email, role],
  );

  return mapProfileRow(result.rows[0], user);
}

export async function listManagedAuthUsers(): Promise<ManagedUser[]> {
  await ensureProfileTables();

  const pool = getPostgresPool();
  const result = await pool.query<AuthUserRow & ProfileRow>(
    `
      select
        u.id,
        u.name,
        u.email as auth_email,
        u."createdAt",
        p.auth_user_id,
        p.display_name,
        p.email as profile_email,
        p.role,
        p.status,
        p.invited_at,
        p.disabled_at
      from "user" u
      left join talent_profiles p on p.auth_user_id = u.id
      order by u."createdAt" desc
    `,
  );

  return result.rows.map((row) => {
    const email = normalizeEmail(row.profile_email ?? row.auth_email ?? "");
    return {
      id: row.id,
      name: row.display_name || row.name || fallbackName(email),
      email,
      role: row.role ? parseRole(row.role) : isMasterAdminEmail(email) ? "administrator" : "candidate",
      status: parseAccountStatus(row.status),
      createdAt: formatDate(row.createdAt),
      invitedAt: formatDate(row.invited_at),
    };
  });
}

export async function upsertExaminerProfile(input: {
  id: string;
  name: string;
  email: string;
  invitedAt?: string;
}) {
  await ensureProfileTables();

  const pool = getPostgresPool();
  const result = await pool.query<ProfileRow>(
    `
      insert into talent_profiles (auth_user_id, display_name, email, role, status, invited_at)
      values ($1, $2, $3, 'examiner', 'active', coalesce($4::timestamptz, now()))
      on conflict (auth_user_id) do update set
        display_name = excluded.display_name,
        email = excluded.email,
        role = 'examiner',
        status = 'active',
        invited_at = coalesce(talent_profiles.invited_at, excluded.invited_at),
        disabled_at = null,
        updated_at = now()
      returning *
    `,
    [input.id, input.name.trim(), normalizeEmail(input.email), input.invitedAt ?? null],
  );

  return mapProfileRow(result.rows[0], {
    id: input.id,
    name: input.name,
    email: input.email,
  });
}

export async function updateExaminerProfile(id: string, input: { name: string; email: string }) {
  await ensureProfileTables();

  const email = normalizeEmail(input.email);
  const pool = getPostgresPool();
  await pool.query(
    `
      update "user"
      set name = $2, email = $3, "updatedAt" = now()
      where id = $1
    `,
    [id, input.name.trim(), email],
  );
  const result = await pool.query<ProfileRow>(
    `
      update talent_profiles
      set display_name = $2, email = $3, updated_at = now()
      where auth_user_id = $1 and role = 'examiner'
      returning *
    `,
    [id, input.name.trim(), email],
  );

  return result.rows[0] ? mapProfileRow(result.rows[0], { id, name: input.name, email }) : null;
}

export async function markAuthUserEmailVerified(id: string) {
  const pool = getPostgresPool();
  await pool.query(
    `
      update "user"
      set "emailVerified" = true, "updatedAt" = now()
      where id = $1
    `,
    [id],
  );
}

export async function setExaminerProfileStatus(id: string, status: AccountStatus) {
  await ensureProfileTables();

  const pool = getPostgresPool();
  const result = await pool.query<ProfileRow>(
    `
      update talent_profiles
      set
        status = $2,
        disabled_at = case when $2 = 'disabled' then now() else null end,
        updated_at = now()
      where auth_user_id = $1 and role = 'examiner'
      returning *
    `,
    [id, status],
  );

  return result.rows[0] ? mapProfileRow(result.rows[0], { id }) : null;
}

export async function removeExaminerAccount(id: string) {
  await ensureProfileTables();

  const pool = getPostgresPool();
  const client = await pool.connect();
  try {
    await client.query("begin");
    const profileResult = await client.query(
      "delete from talent_profiles where auth_user_id = $1 and role = 'examiner' returning auth_user_id",
      [id],
    );
    if ((profileResult.rowCount ?? 0) === 0) {
      await client.query("rollback");
      return false;
    }

    await client.query('delete from "session" where "userId" = $1', [id]);
    await client.query('delete from "account" where "userId" = $1', [id]);
    const userResult = await client.query('delete from "user" where id = $1 returning id', [id]);
    await client.query("commit");
    return (userResult.rowCount ?? 0) > 0;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function findAuthUserByEmail(email: string) {
  const pool = getPostgresPool();
  const result = await pool.query<AuthUserRow>(
    'select id, name, email, "createdAt", "updatedAt" from "user" where lower(email) = $1 limit 1',
    [normalizeEmail(email)],
  );

  return result.rows[0] ?? null;
}

export async function ensureProfileTables() {
  const pool = getPostgresPool();
  await pool.query(`
    create table if not exists talent_profiles (
      auth_user_id text primary key,
      display_name text not null,
      email text not null unique,
      role text not null check (role in ('candidate', 'examiner', 'administrator')),
      status text not null default 'active' check (status in ('active', 'disabled')),
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      invited_at timestamptz,
      disabled_at timestamptz
    )
  `);
  await pool.query("create index if not exists talent_profiles_role_idx on talent_profiles(role)");
  await pool.query("create index if not exists talent_profiles_status_idx on talent_profiles(status)");
}

export function managedUserToDemoUser(user: ManagedUser): DemoUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function mapProfileRow(row: ProfileRow, user: Partial<BetterAuthUser>): ManagedUser {
  const email = normalizeEmail(row.email || user.email || "");
  return {
    id: row.auth_user_id || user.id || "",
    name: row.display_name || user.name || fallbackName(email),
    email,
    role: parseRole(row.role),
    status: parseAccountStatus(row.status),
    createdAt: formatDate(row.created_at ?? user.createdAt),
    invitedAt: formatDate(row.invited_at),
  };
}

function getProfileByUserId(id: string) {
  return getPostgresPool()
    .query<ProfileRow>("select * from talent_profiles where auth_user_id = $1 limit 1", [id])
    .then((result) => result.rows[0] ?? null);
}

function isMasterAdminEmail(email: string) {
  const configuredEmails =
    process.env.MASTER_ADMIN_EMAIL ?? process.env.NEXT_PUBLIC_MASTER_ADMIN_EMAIL ?? "admin@talentsprint.dev";
  return configuredEmails
    .split(",")
    .map((value) => normalizeEmail(value))
    .filter(Boolean)
    .includes(normalizeEmail(email));
}

function fallbackName(email: string) {
  return email ? email.split("@")[0] : "Talent Sprint User";
}

function formatDate(value: unknown) {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString() : String(value);
}

create table if not exists "user" (
  id text primary key,
  name text not null,
  email text not null unique,
  "emailVerified" boolean not null default false,
  image text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists "session" (
  id text primary key,
  "expiresAt" timestamptz not null,
  token text not null unique,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  "ipAddress" text,
  "userAgent" text,
  "userId" text not null references "user"(id) on delete cascade
);

create table if not exists "account" (
  id text primary key,
  "accountId" text not null,
  "providerId" text not null,
  "userId" text not null references "user"(id) on delete cascade,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  scope text,
  password text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists "verification" (
  id text primary key,
  identifier text not null,
  value text not null,
  "expiresAt" timestamptz not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists talent_profiles (
  auth_user_id text primary key references "user"(id) on delete cascade,
  display_name text not null,
  email text not null unique,
  role text not null check (role in ('candidate', 'examiner', 'administrator')),
  status text not null default 'active' check (status in ('active', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  invited_at timestamptz,
  disabled_at timestamptz
);

create index if not exists session_user_id_idx on "session"("userId");
create index if not exists account_user_id_idx on "account"("userId");
create index if not exists account_provider_account_idx on "account"("providerId", "accountId");
create index if not exists verification_identifier_idx on "verification"(identifier);
create index if not exists talent_profiles_role_idx on talent_profiles(role);
create index if not exists talent_profiles_status_idx on talent_profiles(status);

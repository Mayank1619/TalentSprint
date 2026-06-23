# Authentication and Authorization

Talent Sprint uses a self-hosted authentication stack for production and a local browser fallback
for development and Playwright tests.

## Production Provider

Production auth is implemented with Better Auth backed by Postgres. Set these variables locally and
in the deployment environment:

```text
NEXT_PUBLIC_AUTH_MODE=postgres
DATABASE_URL=postgres://user:password@host:5432/talent_sprint
BETTER_AUTH_SECRET=<long random secret>
BETTER_AUTH_URL=https://your-app.example.com
NEXT_PUBLIC_SITE_URL=https://your-app.example.com
NEXT_PUBLIC_MASTER_ADMIN_EMAIL=admin@example.com
MASTER_ADMIN_EMAIL=admin@example.com
RESEND_API_KEY=<optional, required for real reset emails>
RESEND_FROM_EMAIL=Talent Sprint <verified-sender@example.com>
```

When `NEXT_PUBLIC_AUTH_MODE=postgres`:

- Candidate registration calls Better Auth email/password sign-up and requires email verification
  before the candidate can log in.
- Login, sign-out, sessions, and password reset are handled by Better Auth.
- Core auth records live in the Better Auth `user`, `session`, `account`, and `verification` tables.
- Talent Sprint role and status records live in `talent_profiles`.
- Examiner creation and access changes run only through server-side admin routes.

Run the checked-in migration before enabling production auth:

```bash
psql "$DATABASE_URL" -f db/migrations/0001_better_auth_postgres.sql
```

## Roles

Application roles live in `talent_profiles.role`:

- `candidate`: self-registers and can practice or take assigned assessments.
- `examiner`: created by an administrator and can manage assessment/report workflows.
- `administrator`: configured by `MASTER_ADMIN_EMAIL` or stored in the profile table.

Candidate sign-up creates a Better Auth user and the app ensures a matching `talent_profiles` row on
session load after the candidate clicks the activation link sent by email. Unverified candidates are
blocked from login; when they try to sign in, Talent Sprint requests a fresh activation email.
Users matching `MASTER_ADMIN_EMAIL` are promoted to administrator automatically.

Examiner accounts are created from the admin workspace. The admin route creates or reuses a Better
Auth user, marks the admin-created email as verified, stores the examiner profile, and requests a
password setup email.

## Role Routing

After login:

- Candidate users go to `/practice`.
- Examiner users go to `/examiner`.
- Administrator users go to `/admin`.

Navigation is role-aware:

- Admin is only visible to administrators.
- Examiner is only visible to examiners and administrators.
- Candidate practice and assessment links are only visible to candidates.

## Development Fallback

If `NEXT_PUBLIC_AUTH_MODE` is not set to `postgres`, the app uses local browser auth so local demos
and automated tests run without a database. This fallback must not be used as the production security
boundary.

Local/demo seeded accounts:

```text
Candidate: candidate@talentsprint.dev / Password123!
Examiner: examiner@talentsprint.dev / Password123!
Admin: admin@talentsprint.dev / Admin@2026!
```

For production, create the first administrator by signing up with an email in `MASTER_ADMIN_EMAIL`,
then set a secure password through the normal password reset flow.

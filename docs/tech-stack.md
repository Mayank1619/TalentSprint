# Tech Stack Recommendation

**Product**: Talent Sprint

**Status**: Active MVP decision

**Last reviewed**: 2026-06-22

## Decision Summary

Talent Sprint uses a Vercel-friendly full-stack TypeScript architecture with self-hosted
authentication:

- **Web framework**: Next.js with App Router
- **Frontend**: React and TypeScript
- **Styling**: Tailwind CSS plus CSS variables/design tokens
- **Database**: Postgres
- **Authentication**: Better Auth email/password on Postgres
- **Authorization**: Application RBAC through `talent_profiles`
- **Email**: Resend, with mock mode when no key is configured
- **Code execution**: Judge0/Piston-compatible sandbox adapter
- **Testing**: Vitest and Playwright
- **Deployment**: Vercel for the Next.js app

This avoids inactive free-tier auth project pausing while keeping the stack free-first and portable.

## Recommended Stack by Layer

| Layer | Recommendation | Why |
| --- | --- | --- |
| App hosting | Vercel | Best fit for Next.js, preview deployments, and GitHub workflow |
| Web framework | Next.js App Router | Supports public pages, dashboards, route handlers, and server components |
| Language | TypeScript | Safer contracts for grading, RBAC, and data models |
| UI | React | Works naturally with Next.js and the existing component model |
| Styling | Tailwind CSS + CSS variables | Fast UI iteration with light/dark-neon tokens |
| Database | Postgres | Relational fit for users, questions, attempts, reports, and audits |
| Auth | Better Auth | Self-hosted, app-owned, email/password auth without external project pausing |
| Authorization | App RBAC | Clear server-side role checks for candidate/examiner/admin workflows |
| Email | Resend | Simple transactional email for resets and report notifications |
| Code editor | Browser editor components | Candidate workspace can evolve toward Monaco when needed |
| Code execution | External runner adapter | Keeps untrusted code outside Vercel Functions |
| Unit tests | Vitest | Fast TypeScript unit testing |
| E2E tests | Playwright | Verifies full candidate, examiner, and admin flows |

## Authentication and Data Model

Better Auth owns the core auth tables:

- `user`
- `session`
- `account`
- `verification`

Talent Sprint owns role and access state in `talent_profiles`:

- `auth_user_id`
- `display_name`
- `email`
- `role`
- `status`
- `created_at`
- `updated_at`
- `invited_at`
- `disabled_at`

Candidate users can self-register. Examiner users are created and managed by administrators. Master
administrator emails are configured through `MASTER_ADMIN_EMAIL` and
`NEXT_PUBLIC_MASTER_ADMIN_EMAIL`.

## Code Execution Architecture

Candidate-submitted Java, Python, or C# must not run directly inside Vercel Functions.

Recommended MVP architecture:

```text
Next.js on Vercel
  -> Code Execution Adapter
  -> Judge0/Piston-compatible execution service
  -> Result returned to Talent Sprint API
  -> Stored or displayed by Talent Sprint
```

The app depends on an internal execution interface so the sandbox provider can be changed without
rewriting the candidate workspace or examiner reporting.

## Email Plan

Use Resend for transactional email:

- Password reset and examiner setup links
- Candidate score summary
- Examiner result-ready notification
- Question-set review emails

When `RESEND_API_KEY` is missing, the app runs in mock email mode and returns successful local
responses without sending real email.

## Local Development

Default local mode requires no database:

```text
NEXT_PUBLIC_AUTH_MODE=local
```

To test production-style auth locally:

```text
NEXT_PUBLIC_AUTH_MODE=postgres
DATABASE_URL=postgres://postgres:postgres@localhost:5432/talent_sprint
BETTER_AUTH_SECRET=change-me-to-a-long-random-secret
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Then run:

```bash
psql "$DATABASE_URL" -f db/migrations/0001_better_auth_postgres.sql
npm run dev
```

## Current MVP Implementation Note

The current implementation includes:

- Public landing page with theme switching
- Candidate practice workspace
- Timed assessment demo
- Large seeded question bank
- Examiner reporting dashboard
- Admin user and question-library views
- Better Auth/Postgres production auth path
- Local browser auth fallback for tests and demos
- Resend-compatible email route with mock mode
- Judge0-compatible execution adapter with deterministic fallback checks

## Open Decisions

- Confirm the preferred Postgres host for production.
- Confirm whether code execution will be self-hosted Judge0, hosted Judge0-compatible API, or Piston.
- Confirm expected candidate volume for database, email, and execution sizing.
- Confirm whether reports need file exports in MVP.

## Decision Record

Recommended for MVP:

```text
Next.js + React + TypeScript on Vercel
Postgres + Better Auth
Resend for email
Judge0-compatible external code execution adapter
Tailwind CSS + design tokens for light/dark-neon themes
Vitest + Playwright for verification
```

This gives Talent Sprint a practical free-first stack while preserving the ability to swap hosting
providers later.

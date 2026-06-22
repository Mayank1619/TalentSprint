# Tech Stack Recommendation

**Product**: Talent Sprint

**Status**: Draft decision

**Last reviewed**: 2026-06-22

## Decision Summary

Talent Sprint should use a Vercel-friendly full-stack TypeScript architecture with self-hosted,
open-source authentication instead of a managed auth service that can pause or impose auth-specific
usage limits.

- **Web framework**: Next.js with App Router
- **Frontend**: React, TypeScript
- **Styling**: Tailwind CSS, CSS variables/design tokens, shadcn/ui-style component patterns
- **Authentication**: Better Auth
- **Auth storage**: Application-owned database tables
- **Database**: PostgreSQL for shared/staging/production; SQLite is acceptable for local-only
  development or single-machine prototypes
- **Authorization**: Application RBAC with server-side route/action checks
- **ORM / database migrations**: Drizzle ORM and Drizzle Kit
- **Validation**: Zod
- **Email**: Resend for invitations and auth emails, behind an internal email adapter
- **Code editor**: Monaco Editor
- **Code execution**: Judge0-compatible execution service behind an adapter
- **Testing**: Vitest, React Testing Library, Playwright
- **Deployment**: Vercel for the Next.js application, or a small always-on Node host if SQLite is
  chosen for a low-traffic internal deployment

This updates the earlier Supabase and Firebase recommendations. Supabase Free Plan project pausing is
a poor fit for an app that may sit idle between assessment cycles. Firebase is managed and convenient,
but still has quotas and billing-plan limits. Better Auth keeps authentication in the Talent Sprint
application and database, avoiding third-party auth inactivity pauses and per-user auth billing.

Important constraint: no hosted platform is truly "free with no usage limits." Better Auth removes
auth-provider usage limits because the auth framework is self-hosted and open source. The practical
limits become the app hosting, database hosting, email provider, and code execution provider.

## Recommended Stack by Layer

| Layer | Recommendation | Why |
| --- | --- | --- |
| App hosting | Vercel for normal Next.js deployment | Best fit for Next.js, preview deployments, and GitHub workflow |
| Alternative hosting | Small always-on Node server | Useful if the team wants SQLite persistence for a very low-use internal deployment |
| Web framework | Next.js App Router | React-first, supports public pages, dashboards, route handlers, server components |
| Language | TypeScript | Safer contracts for assessment, grading, RBAC, and data models |
| UI | React | Matches preference and works naturally with Next.js |
| Styling | Tailwind CSS + CSS variables | Good for fast UI, responsive layouts, light/dark-neon theme tokens |
| Component patterns | shadcn/ui-style components | Free, accessible patterns, easy to own in the codebase |
| Authentication | Better Auth | Open-source, self-hosted, TypeScript-first auth with email/password and session management |
| Database | PostgreSQL | Strong fit for relational assessment data, reporting, attempts, and audit logs |
| Local/prototype database | SQLite | Simple for local development and single-machine prototypes |
| ORM | Drizzle ORM | Lightweight TypeScript SQL layer, good for Postgres and SQLite migrations |
| Validation | Zod | Shared runtime validation for API inputs, forms, and service boundaries |
| Email | Resend | Good developer experience for transactional email; can be swapped through an adapter |
| Code editor | Monaco Editor | Mature browser editor experience for Java, Python, and C# |
| Code execution | Judge0 adapter | Keeps untrusted code outside Vercel Functions and preserves future portability |
| Unit tests | Vitest | Fast TypeScript unit testing |
| Component tests | React Testing Library | Tests UI behavior from the user's perspective |
| E2E tests | Playwright | Verifies full candidate and examiner flows |

## Why Better Auth For MVP

Talent Sprint may have long quiet periods between candidate assessment cycles. A managed auth project
that can pause due to inactivity creates avoidable operational risk: candidates and examiners could
arrive for an assessment and find login unavailable until the project is restored.

Better Auth is a better fit for this usage pattern because:

- It runs inside the Talent Sprint application instead of depending on a managed auth tenant staying
  awake.
- It stores users, sessions, accounts, and verification data in the application database.
- It supports email/password authentication for candidates, examiners, and administrators.
- It supports secure password hashing and session management.
- It has a Next.js integration for mounting auth handlers under the application API routes.
- It has CLI support for generating or migrating the auth schema.
- It has no per-user auth billing or inactivity pause because the framework is open source and
  self-hosted.

## Database Strategy

Use PostgreSQL for shared environments:

- Development cloud environment
- Staging
- Production
- Any Vercel deployment
- Any deployment where multiple server instances may run

Use SQLite only for:

- Local development
- Automated tests
- Single-machine prototypes
- A very small internal deployment on an always-on server where the SQLite file is persisted and
  backed up

Do not use SQLite as a persistent database on Vercel serverless deployments. Vercel's serverless file
system is not appropriate as the source of truth for application data.

## Data Storage Plan

Use the application database for:

- Better Auth user, session, account, and verification tables
- Profiles and role assignments
- Questions
- Language starter templates
- Test case metadata
- Assessment definitions
- Assessment snapshots
- Invitations
- Attempts
- Draft answers
- Final submissions
- Evaluation results
- Notification records
- Audit logs

Use object storage only if needed for:

- Public landing preview images
- Candidate avatar images
- Future downloadable reports

For MVP, screenshots and mock screenshots can live in the application repo unless they need runtime
uploading.

## Authentication and Authorization

Use Better Auth for:

- Candidate registration
- Candidate login
- Examiner/admin login
- Session management
- Password reset
- Email verification

Use Better Auth's database-backed user and session model as the authentication foundation.

Use an application `profiles` table for Talent Sprint identity:

- `id`
- `auth_user_id`
- `display_name`
- `email`
- `status`
- `created_at`
- `updated_at`

Use a `role_assignments` table for RBAC:

- `profile_id`
- `role`
- `created_by`
- `created_at`

Initial roles:

- `candidate`
- `examiner`
- `administrator`

The application must enforce role checks in server-side code for every protected route, server action,
and route handler. Client-side role checks can improve navigation but must never be the only
authorization layer.

## Code Execution Architecture

Do not run candidate-submitted Java, Python, or C# directly inside Vercel Functions.

Reasons:

- Vercel Functions are request/response serverless functions with duration, payload, and resource limits.
- Java and C# compilation/runtime execution is heavier than normal API work.
- Untrusted code needs strict isolation, no access to app secrets, no network access, memory limits,
  CPU limits, output limits, and filesystem/process restrictions.

Recommended MVP architecture:

```text
Next.js application
  -> Code Execution Adapter
  -> Judge0-compatible execution service
  -> Result returned to Talent Sprint API
  -> Stored in application database
```

The app should depend on an internal interface such as:

```ts
interface CodeExecutionProvider {
  runSampleTests(request: SampleRunRequest): Promise<SampleRunResult>;
  gradeSubmission(request: GradeSubmissionRequest): Promise<GradingResult>;
}
```

This lets us start with one provider and change hosting later without rewriting the candidate
workspace or examiner reporting.

### Execution Provider Options

| Option | Cost profile | Recommendation |
| --- | --- | --- |
| Local Judge0 Docker for development | Free locally | Use for local dev and test fixtures |
| Self-hosted Judge0 Community Edition | Software is free, hosting may cost money | Best long-term control if we can host a small VM |
| Judge0 Cloud or similar hosted judge API | May have free or trial limits, then paid | Useful for early MVP if self-hosting is not available |
| Custom sandbox service | Open-source possible, high security effort | Defer until we outgrow Judge0-compatible approach |

## Vercel Deployment Model

Vercel should host:

- Public landing page
- Candidate app
- Examiner app
- Admin app
- Next.js route handlers for normal API operations
- Server actions for app-only mutations where appropriate
- Lightweight scheduled jobs if needed

Vercel should not host:

- Long-running code execution workers
- Docker-based language sandboxes
- Untrusted candidate code execution
- Heavy background grading queues
- SQLite as the persistent production database

## Low-Usage Operating Model

For a low-usage internal tool, the best free-first model is:

- Run Better Auth in the app.
- Keep auth data in the app database.
- Use SQLite locally and for tests.
- Use PostgreSQL for any shared deployment.
- Keep database schema and seed data in the repo.
- Add a runbook for creating administrator and examiner accounts.
- Add backup/restore instructions before any pilot.

This avoids a managed auth project becoming unavailable simply because nobody used the app for a
while. The remaining providers still need normal care:

- Database hosting may have its own free-tier limits.
- Email providers have sending limits.
- Code execution providers have runtime and concurrency limits.
- Vercel or any host has compute and bandwidth limits.

## Email Plan

Use Resend for transactional email:

- Assessment invitation
- Candidate score summary
- Examiner result-ready notification
- Email verification
- Password reset

Email sending should be wrapped behind an internal service interface so the provider can be replaced.

## UI and Theme Plan

Use Tailwind CSS plus semantic CSS variables:

```text
--bg-app
--bg-surface
--bg-elevated
--text-primary
--text-secondary
--border-subtle
--brand-primary
--brand-secondary
--accent-neon
--success
--warning
--error
--focus-ring
```

Themes:

- Light mode: clean, bright, readable, enterprise-friendly.
- Dark neon mode: dark base with controlled neon accents for active states, focus, highlights, and
  carousel states.

Theme preference should be stored locally for anonymous users and may later be stored per user.

## Suggested Initial Project Structure

```text
app/
  (public)/
  (candidate)/
  (examiner)/
  (admin)/
  api/
    auth/
      [...all]/
        route.ts
  layout.tsx

components/
  ui/
  landing/
  auth/
  practice/
  assessment/
  examiner/

lib/
  auth/
  db/
  email/
  execution/
  validation/
  telemetry/

db/
  schema/
  migrations/
  seed/

tests/
  unit/
  integration/
  e2e/
```

## MVP Package Choices

Expected packages:

```text
next
react
react-dom
typescript
better-auth
drizzle-orm
drizzle-kit
zod
resend
@monaco-editor/react
tailwindcss
class-variance-authority
clsx
tailwind-merge
lucide-react
vitest
@testing-library/react
@playwright/test
```

Database driver depends on deployment choice:

```text
pg
better-sqlite3
```

## Open Decisions

- Confirm whether the first shared deployment will use PostgreSQL on an existing internal host, a
  small always-on VM, or a managed Postgres provider.
- Confirm whether SQLite is only for local/test usage or also acceptable for a single-machine
  internal deployment.
- Confirm whether candidates can self-register or must arrive through invitations only.
- Confirm whether examiner accounts are created only by administrators.
- Confirm whether password login is enough for MVP or whether email-link/passwordless login should be
  added.
- Confirm whether the execution provider will be self-hosted Judge0, hosted Judge0-compatible API, or
  another sandbox provider.
- Confirm whether production must stay entirely free or whether free/open-source technology with
  low-cost hosting is acceptable for database and code execution.
- Confirm expected candidate volume for database, email, and execution sizing.
- Confirm whether reports need file exports in MVP.

## Decision Record

Recommended for MVP:

```text
Next.js + React + TypeScript
Better Auth for self-hosted authentication
PostgreSQL for shared/staging/production data
SQLite for local development and tests
Drizzle ORM and Drizzle Kit
Resend for transactional email
Judge0-compatible external code execution adapter
Tailwind CSS + design tokens for light/dark-neon themes
Vitest + Playwright for verification
```

This gives Talent Sprint a practical self-hosted auth stack with no auth-provider inactivity pause or
per-user auth billing. Infrastructure limits still come from the chosen database host, application
host, email provider, and execution provider.

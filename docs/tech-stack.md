# Tech Stack Recommendation

**Product**: Talent Sprint

**Status**: Draft decision

**Last reviewed**: 2026-06-09

## Decision Summary

Talent Sprint should use a Vercel-friendly full-stack TypeScript architecture:

- **Web framework**: Next.js with App Router
- **Frontend**: React, TypeScript
- **Styling**: Tailwind CSS, CSS variables/design tokens, shadcn/ui-style component patterns
- **Database**: Supabase Postgres
- **Authentication**: Supabase Auth
- **Authorization**: Application RBAC plus Supabase Row Level Security where practical
- **ORM / database migrations**: Drizzle ORM and Drizzle Kit
- **Validation**: Zod
- **Email**: Resend
- **Code editor**: Monaco Editor
- **Code execution**: Judge0-compatible execution service behind an adapter
- **Testing**: Vitest, React Testing Library, Playwright
- **Deployment**: Vercel for the Next.js application

This stack keeps the core app aligned with the preferred Node.js + React direction, stays friendly to
Vercel, and uses free or open-source technology for the MVP.

## Recommended Stack by Layer

| Layer | Recommendation | Why |
| --- | --- | --- |
| App hosting | Vercel | Best fit for Next.js, preview deployments, easy GitHub workflow |
| Web framework | Next.js App Router | React-first, supports public pages, dashboards, route handlers, server components |
| Language | TypeScript | Safer contracts for assessment, grading, RBAC, and data models |
| UI | React | Matches preference and works naturally with Next.js |
| Styling | Tailwind CSS + CSS variables | Good for fast UI, responsive layouts, light/dark-neon theme tokens |
| Component patterns | shadcn/ui-style components | Free, accessible patterns, easy to own in the codebase |
| Database | Supabase Postgres | Free tier, relational data, good fit for assessments/questions/attempts |
| Auth | Supabase Auth | Free tier includes enough users for MVP and reduces custom auth risk |
| Authorization | RBAC in app + RLS in database | Protects examiner/candidate/admin data at multiple layers |
| ORM | Drizzle ORM | Lightweight TypeScript SQL layer, good for Postgres and migrations |
| Validation | Zod | Shared runtime validation for API inputs, forms, and service boundaries |
| Email | Resend | Free transactional email tier, good developer experience |
| Code editor | Monaco Editor | Mature browser editor experience for Java, Python, and C# |
| Code execution | Judge0 adapter | Keeps untrusted code outside Vercel Functions and preserves future portability |
| Unit tests | Vitest | Fast TypeScript unit testing |
| Component tests | React Testing Library | Tests UI behavior from the user's perspective |
| E2E tests | Playwright | Verifies full candidate and examiner flows |

## Why Supabase Postgres for MVP

Talent Sprint needs relational data:

- Users and roles
- Question library
- Language templates
- Test cases
- Assessments
- Candidate invitations
- Attempts
- Answer drafts
- Submissions
- Evaluation results
- Examiner reports
- Audit events

Postgres is a strong fit because this data is relational and needs transactional consistency. Supabase
adds hosted Postgres, Auth, Storage, and Row Level Security without requiring us to build the auth and
database platform ourselves.

Supabase free tier is a good MVP fit for demos and early internal usage. The main limitation is that
free projects can pause after inactivity, so production or sustained internal usage may eventually
need a paid plan.

## Why Not Neon + Auth.js as the Default

Neon Postgres plus Auth.js is a strong alternative and is also Vercel-friendly. It gives more direct
control over auth and keeps the backend closer to pure Next.js.

For Talent Sprint MVP, Supabase is the better starting choice because:

- It gives database and auth together.
- It reduces the amount of custom account-management code.
- It supports Row Level Security for candidate/examiner data boundaries.
- It has a generous free tier for early usage.

Use Neon + Auth.js later if:

- We want fully custom authentication flows.
- Supabase project pausing or platform constraints become a problem.
- We want to separate auth from database hosting.

## Code Execution Architecture

Do not run candidate-submitted Java, Python, or C# directly inside Vercel Functions.

Reasons:

- Vercel Functions are request/response serverless functions with duration, payload, and resource limits.
- Java and C# compilation/runtime execution is heavier than normal API work.
- Untrusted code needs strict isolation, no access to app secrets, no network access, memory limits,
  CPU limits, output limits, and filesystem/process restrictions.

Recommended MVP architecture:

```text
Next.js on Vercel
  -> Code Execution Adapter
  -> Judge0-compatible execution service
  -> Result returned to Talent Sprint API
  -> Stored in Supabase Postgres
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
- Cron-triggered lightweight jobs if needed

Vercel should not host:

- Long-running code execution workers
- Docker-based language sandboxes
- Untrusted candidate code execution
- Heavy background grading queues

## Data Storage Plan

Use Supabase Postgres for:

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

Use Supabase Storage only if needed for:

- Public landing preview images
- Candidate avatar images
- Future downloadable reports

For MVP, screenshots and mock screenshots can live in the application repo unless they need runtime
uploading.

## Authentication and Authorization

Use Supabase Auth for:

- Candidate registration
- Candidate login
- Examiner/admin login
- Password reset
- Email verification

Use a `profiles` table for application identity:

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

The application must enforce role checks in server-side code. Supabase Row Level Security should also
be used where practical to protect candidate-owned and examiner-owned data.

## Email Plan

Use Resend for transactional email:

- Assessment invitation
- Candidate score summary
- Examiner result-ready notification
- Password reset and verification if not fully handled by Supabase Auth templates

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
├── (public)/
├── (candidate)/
├── (examiner)/
├── (admin)/
├── api/
└── layout.tsx

components/
├── ui/
├── landing/
├── auth/
├── practice/
├── assessment/
└── examiner/

lib/
├── auth/
├── db/
├── email/
├── execution/
├── validation/
└── telemetry/

db/
├── schema/
└── migrations/

tests/
├── unit/
├── integration/
└── e2e/
```

## MVP Package Choices

Expected packages:

```text
next
react
react-dom
typescript
@supabase/supabase-js
@supabase/ssr
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

## Open Decisions

- Confirm whether Supabase Auth is acceptable or whether the organization prefers custom auth.
- Confirm whether the execution provider will be self-hosted Judge0, hosted Judge0-compatible API, or
  another sandbox provider.
- Confirm whether production must stay entirely free or whether free/open-source technology with
  low-cost hosting is acceptable for the execution service.
- Confirm expected candidate volume for database, email, and execution sizing.
- Confirm whether reports need file exports in MVP.

## Decision Record

Recommended for MVP:

```text
Next.js + React + TypeScript on Vercel
Supabase Postgres + Supabase Auth
Drizzle ORM
Resend for email
Judge0-compatible external code execution adapter
Tailwind CSS + design tokens for light/dark-neon themes
Vitest + Playwright for verification
```

This gives Talent Sprint a practical free-first stack while preserving the ability to scale or swap
providers later.


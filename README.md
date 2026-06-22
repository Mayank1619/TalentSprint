# Talent Sprint

Talent Sprint is a spec-driven coding assessment platform for evaluating and practicing Java,
Python, C#, data structures, algorithms, and problem-solving skills.

## Local Development

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Useful commands:

```bash
npm run lint
npm run typecheck
npm run build
```

## Spec-Driven Workflow

Specs live under `specs/` and should be reviewed before implementation changes become production
work.

- Product overview: `specs/talent-sprint/overview.md`
- Feature specs: `specs/features/*/spec.md`
- Branching strategy: `docs/branching-strategy.md`
- Tech stack recommendation: `docs/tech-stack.md`
- CI/CD quality gates: `docs/ci-cd.md`
- Authentication and authorization: `docs/authentication.md`

## MVP Implementation

The current implementation is a local-first MVP/prototype:

- Public landing page with light/dark neon theme switcher
- Candidate practice workspace
- Practice leaderboard
- Timed assessment demo
- Large seeded question bank with practice-only, assessment-only, and shared questions
- Time-aware assessment scoring
- Examiner reporting dashboard
- Admin/question-library overview
- Mock evaluation service for local testing
- Better Auth/Postgres production auth path with local browser auth fallback

Real email delivery and secure code execution are intentionally behind provider boundaries. The app
can run without a database in local mode, or against Postgres with Better Auth enabled.

## Authentication Configuration

Local demos and tests use browser-only seeded accounts by default. To run the production-style auth
path, configure:

```bash
NEXT_PUBLIC_AUTH_MODE=postgres
DATABASE_URL=postgres://postgres:postgres@localhost:5432/talent_sprint
BETTER_AUTH_SECRET=change-me-to-a-long-random-secret
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Then apply `db/migrations/0001_better_auth_postgres.sql` to the configured database.

## Email Configuration

Report and question-set emails use a Resend-compatible API route.

Without environment variables, email actions run in mock mode and return a success message without
sending real mail. To send real email, configure:

```bash
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL="Talent Sprint <verified-sender@example.com>"
```

For the current prototype, candidate summary emails hide hidden-test details. Examiner report emails
include submitted code and test outcomes, but not hidden-test definitions.

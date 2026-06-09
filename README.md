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

Real email delivery, persistent database, authentication, and secure code execution are intentionally
behind provider boundaries and will be plugged in after local workflows are validated.

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

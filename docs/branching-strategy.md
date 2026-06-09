# Branching Strategy

Talent Sprint uses a spec-driven branching strategy.

## Branch Types

- `codex/specs/talent-sprint-foundation`: shared product overview and feature specs.
- `codex/feature/<feature-name>`: one implementation branch per approved feature.
- `codex/spec/<feature-name>`: optional branch for a single feature spec when a spec needs isolated review.

## Review Flow

1. Draft or update a feature spec.
2. Review and approve the spec.
3. Create an implementation branch for that feature.
4. Write tests for the approved user story slice.
5. Implement the slice.
6. Verify tests and acceptance criteria.
7. Merge the feature branch after review.

## Initial Feature Branches

- `codex/feature/talent-sprint-public-landing-theme`
- `codex/feature/assessment-auth-roles`
- `codex/feature/candidate-practice`
- `codex/feature/question-library-test-authoring`
- `codex/feature/candidate-timed-assessment`
- `codex/feature/code-execution-evaluation`
- `codex/feature/examiner-results-reporting`


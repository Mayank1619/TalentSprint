# Branching Strategy

Talent Sprint follows a spec-driven branching strategy. The goal is simple: every meaningful feature
starts with a reviewed spec, then moves into its own implementation branch. This keeps product intent,
technical planning, tests, and code changes easy to review.

## Principles

- Specs are reviewed before implementation starts.
- Each feature is developed on its own branch.
- Branches should stay focused on one feature, fix, or documentation change.
- Pull requests should be small enough to review with confidence.
- Tests and acceptance criteria from the spec define when a feature is ready to merge.
- Shared or foundational changes should be called out clearly because they can affect multiple feature branches.

## Main Branches

### `main`

`main` is the stable branch. It should contain reviewed and merged work only.

Rules:

- Do not commit directly to `main`.
- Merge through pull requests.
- Keep `main` deployable or at least buildable at all times.
- Create feature and spec branches from the latest `main` unless there is a specific reason to branch from another approved branch.

### `codex/specs/talent-sprint-foundation`

This is the first foundation branch for the Talent Sprint product overview and initial feature specs.

It currently contains:

- Product overview
- Initial feature specifications
- Branching strategy
- Repository README

This branch should be merged after the foundation specs are reviewed and accepted.

## Branch Types

### Product or Foundation Spec Branch

Use this branch type for broad product-level specs or shared architecture/design guidance.

Pattern:

```text
codex/specs/<scope>
```

Examples:

```text
codex/specs/talent-sprint-foundation
codex/specs/security-and-sandboxing
codex/specs/design-system
```

### Feature Spec Branch

Use this branch type when a single feature spec needs isolated review before implementation.

Pattern:

```text
codex/spec/<feature-name>
```

Examples:

```text
codex/spec/candidate-practice
codex/spec/code-execution-evaluation
codex/spec/examiner-results-reporting
```

Feature spec branches usually change files under:

```text
specs/features/<feature-name>/
```

### Feature Implementation Branch

Use this branch type for implementation after the feature spec is reviewed.

Pattern:

```text
codex/feature/<feature-name>
```

Examples:

```text
codex/feature/talent-sprint-public-landing-theme
codex/feature/assessment-auth-roles
codex/feature/candidate-practice
codex/feature/question-library-test-authoring
codex/feature/candidate-timed-assessment
codex/feature/code-execution-evaluation
codex/feature/examiner-results-reporting
```

Feature branches should include:

- Tests for the approved slice
- Implementation code
- Documentation updates needed for that feature
- Any spec update required by an approved scope change

### Bugfix Branch

Use this branch type for defects found after a feature has merged.

Pattern:

```text
codex/fix/<short-description>
```

Examples:

```text
codex/fix/theme-persistence-refresh
codex/fix/invitation-expiry-check
codex/fix/sample-run-error-redaction
```

### Documentation Branch

Use this branch type for documentation-only updates that do not change product behavior.

Pattern:

```text
codex/docs/<short-description>
```

Examples:

```text
codex/docs/branching-strategy
codex/docs/local-development
codex/docs/release-checklist
```

## Spec-Driven Workflow

### 1. Draft or Update the Spec

Create or update the feature specification under:

```text
specs/features/<feature-name>/spec.md
```

The spec should define:

- User stories
- Acceptance scenarios
- Edge cases
- Functional requirements
- Security and privacy requirements
- Experience and design requirements
- Observability requirements
- Key entities
- Test plan
- Success criteria

### 2. Review the Spec

Before implementation starts, reviewers should confirm:

- The feature goal is clear.
- The MVP scope is clear.
- Acceptance criteria are testable.
- Security and privacy expectations are explicit.
- Design and theme behavior is documented when the feature has UI.
- Open questions are either answered or intentionally deferred.

### 3. Create the Feature Branch

Once the spec is approved, create a feature branch from the latest `main`.

Example:

```bash
git checkout main
git pull origin main
git checkout -b codex/feature/candidate-practice
```

### 4. Implement in User Story Slices

Build one independently testable user story at a time.

Recommended order:

1. Add failing tests for the user story.
2. Implement the smallest code change that satisfies the tests.
3. Verify acceptance scenarios.
4. Commit the completed slice.
5. Move to the next user story.

### 5. Open a Pull Request

The pull request should include:

- Link to the feature spec.
- Summary of implemented user stories.
- Test evidence.
- Screenshots or screen recordings for UI changes.
- Security or privacy notes when relevant.
- Any spec changes made during implementation.

### 6. Merge After Review

Merge only when:

- Required tests pass.
- Acceptance criteria are met.
- Reviewer comments are resolved.
- The branch is up to date with `main` or conflicts have been resolved.
- Any required documentation is updated.

## Pull Request Naming

Use a clear title that starts with the branch purpose.

Examples:

```text
Spec: Candidate practice
Feature: Public landing page and theme system
Fix: Invitation expiry check
Docs: Branching strategy
```

## Commit Guidelines

Commit messages should describe the outcome, not just the file touched.

Good examples:

```text
Add Talent Sprint foundation specs
Document Talent Sprint branching strategy
Add candidate practice filter requirements
Implement theme preference persistence
```

Avoid vague messages:

```text
Update files
Changes
Fix stuff
WIP
```

## Keeping Branches Current

For long-running feature branches:

```bash
git fetch origin
git merge origin/main
```

Resolve conflicts carefully and avoid overwriting work from other feature branches. If a conflict
changes the approved behavior, update the spec or call it out in the pull request.

## Handling Shared Changes

Some work affects multiple features, such as theme tokens, authentication primitives, code execution
contracts, or shared data models.

For shared changes:

- Prefer a small foundation branch if multiple features depend on it.
- Document the shared behavior in the relevant spec or architecture note.
- Merge the foundation change before dependent feature branches when possible.
- If multiple branches need the same shared change, coordinate early to avoid duplicate implementations.

## What Not To Do

- Do not mix unrelated features in one branch.
- Do not start implementation before the feature spec is reviewed.
- Do not expose hidden tests or sensitive candidate data in public/spec examples.
- Do not commit directly to `main`.
- Do not use one branch for every future feature.
- Do not merge a branch that fails required tests.

## Quick Start for a New Developer

1. Clone the repository.
2. Read `README.md`.
3. Read `specs/talent-sprint/overview.md`.
4. Read the spec for the feature you are assigned.
5. Create a branch using the naming rules in this document.
6. Implement one user story slice at a time.
7. Open a pull request with test evidence and a link to the spec.


# Product Specification: Talent Sprint

**Created**: 2026-06-09

**Status**: Draft

**Application Name**: Talent Sprint

**Primary Users**: Candidates, examiners, organization administrators

---

## Overview

Talent Sprint is an internal HackerRank-style application for evaluating consultant coding skills in
Java, Python, and C#. It supports two primary modes:

- Candidate practice: candidates can register, sign in, and practice language-specific and problem-solving questions.
- Examiner assessment: examiners can build timed assessments from a question library, invite candidates by email, monitor attempts, and review scores and submitted code.

The platform evaluates coding submissions by executing candidate code against hidden and visible unit
tests. Candidates can write, run, test, and submit code inside the browser. Examiners can see detailed
attempt data, but candidates only receive a score/report summary after submission unless an examiner
explicitly releases more detail in a future feature.

This project will follow spec-driven development. Each feature must be reviewed at the spec level
before implementation begins. Implementation should proceed in independently shippable slices so an
approved feature can be built, tested, and merged while later specs continue to mature.

---

## Initial Feature Slices

1. **Public Landing Page and Theme System**
   - Public Talent Sprint landing page with product information, screenshots, skill areas, and calls
     to sign in or register.
   - Global light mode and dark neon mode with a top-of-screen theme switch button.

2. **Authentication and Role Access**
   - Candidate registration and login.
   - Examiner login and role-gated access.
   - Organization administrator role for managing examiners and platform settings.

3. **Candidate Practice**
   - Candidate practice area for Java, Python, C#, data structures, algorithms, and problem solving.
   - Immediate sample-test feedback without examiner invitations.

4. **Question Library and Test Authoring**
   - Question bank for Java, Python, C#, data structures, algorithms, and problem solving.
   - Examiner test creation using selected questions, time limits, scoring rules, and candidate invitations.

5. **Candidate Timed Assessment**
   - Email invitation with secure start link.
   - Timed test session with coding editor, run/test controls, final submission, and score summary.

6. **Code Execution and Evaluation**
   - Sandboxed code execution for Java, Python, and C#.
   - Unit-test-based scoring with visible sample tests and hidden grading tests.

7. **Examiner Results and Reporting**
   - Examiner dashboard showing invited candidates, attempt status, scores, submitted code, and test-case outcomes.
   - Email notifications to candidate and examiner when an attempt is complete.

---

## MVP Boundary

The MVP must support:

- Public Talent Sprint landing page.
- Global light mode and dark neon theme switcher.
- Candidate and examiner authentication.
- Role-based navigation and authorization.
- A manually managed question library.
- Examiner-created timed assessments.
- Candidate email invitation and secure assessment launch.
- Browser code editor for Java, Python, and C#.
- Running sample tests before submission.
- Final submission evaluated against hidden tests.
- Candidate score summary email.
- Examiner score and attempt detail view.

The MVP does not need to support:

- Plagiarism detection.
- Live proctoring or webcam monitoring.
- AI-assisted grading.
- Rich IDE features beyond editor, run, test, and submit.
- Public marketplace or multi-tenant billing.
- Candidate access to detailed hidden-test results.

---

## Cross-Feature Requirements

### Functional Requirements

- **FR-TS-001**: Talent Sprint MUST support Java, Python, and C# as first-class coding languages.
- **FR-TS-002**: Talent Sprint MUST support language-specific tests and language-agnostic problem-solving assessments.
- **FR-TS-003**: Candidates MUST be able to practice questions after creating an account.
- **FR-TS-004**: Examiners MUST be able to create timed assessments and invite candidates by email.
- **FR-TS-005**: Assessment links MUST be secure, candidate-specific, and time-bound.
- **FR-TS-006**: Talent Sprint MUST evaluate submissions using predefined unit tests.
- **FR-TS-007**: Candidates MUST be able to run sample tests before final submission.
- **FR-TS-008**: Candidates MUST receive a score/report summary after submission.
- **FR-TS-009**: Examiners MUST receive or access detailed attempt results after submission.
- **FR-TS-010**: Candidates MUST NOT be able to view hidden tests, hidden expected outputs, or examiner-only scoring detail.
- **FR-TS-011**: Talent Sprint MUST provide a light theme and a dark neon theme that can be switched
  from a persistent top-of-screen control.
- **FR-TS-012**: Talent Sprint MUST provide a public landing page that explains the assessment
  experience, skill areas, candidate expectations, and available practice/test categories.

### Design Requirements

- Talent Sprint MUST feel sharp, modern, credible, and energetic without becoming distracting during
  coding or assessment workflows.
- Light mode MUST use clean, basic light colors suitable for long reading and form work.
- Dark neon mode MUST use a dark base with restrained neon accents for active controls, highlights,
  cards, and carousel states.
- Theme colors MUST be implemented as semantic design tokens so switching themes updates the whole
  application consistently.
- A theme switch button MUST be available at the top of the screen across public, candidate, and
  examiner surfaces.
- The public landing page MUST include skill-area cards or carousel items for Java, Python, C#,
  algorithms, data structures, coding ability, and problem solving.
- The public landing page MUST include product screenshots or realistic mock screenshots that show
  what candidates can expect in the coding workspace and assessment flow.

### Security Requirements

- All authenticated routes MUST enforce role-based access control on the server.
- Assessment invitations MUST use non-guessable tokens and MUST not expose candidate or assessment identifiers that can be enumerated.
- Code execution MUST run in a sandbox with strict CPU, memory, filesystem, and network limits.
- Candidate code, test cases, scoring results, and invitation state MUST be auditable.
- Logs MUST not include passwords, invite tokens, raw authentication secrets, or unnecessary personal data.

### Quality Requirements

- Every feature spec MUST include user stories, acceptance criteria, edge cases, security/privacy requirements, observability requirements, entities, success criteria, and a test plan.
- Every implementation slice MUST include unit tests for business logic and integration or end-to-end tests for critical user journeys.
- Code evaluation behavior MUST be deterministic for the same input, code, language runtime, and test set.

---

## Review Workflow

1. Draft the feature spec.
2. Review and update the spec until approved.
3. Create implementation plan and contracts for the approved spec.
4. Generate tasks grouped by user story.
5. Implement tests first for each story.
6. Implement the smallest approved slice.
7. Run verification.
8. Merge after review.

---

## Open Questions

- Should examiner accounts be created only by administrators, or can examiners self-register using an organization domain?
- Which email provider should send candidate invitations and score notifications?
- Which sandbox/runtime provider should be used for secure execution: self-hosted containers, a managed judge service, or cloud job isolation?
- What is the expected maximum concurrent assessment volume for MVP?
- Should candidates be allowed to retake an assessment if an examiner reopens it?
- Should practice mode reuse the same question library as assessment mode, or use a curated practice-only subset?

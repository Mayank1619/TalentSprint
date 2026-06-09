# Feature Specification: Candidate Practice

**Feature Branch**: `candidate-practice`

**Created**: 2026-06-09

**Status**: Draft

**Product**: Talent Sprint

---

## Overview

This feature gives registered candidates a practice area where they can solve non-assessment
questions in Java, Python, and C#. Practice questions cover language fundamentals, deeper
language-specific topics, data structures, algorithms, and general problem solving. Practice is not
timed by default and does not send results to examiners unless a separate future feature explicitly
adds opt-in sharing.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Candidate Browses Practice Questions (Priority: P1)

As a candidate, I want to browse questions by language, topic, difficulty, and question type so I can
practice the areas I care about.

**Why this priority**: Practice discovery is the entry point for self-directed candidate learning.

**Independent Test**: Sign in as a candidate, filter practice questions by Python and data
structures, and open a question.

**Acceptance Scenarios**:

1. **Given** I am signed in as a candidate, **When** I open the practice area, **Then** I see
   available practice questions grouped or filterable by language, topic, difficulty, and type.
2. **Given** I apply filters, **When** matching questions exist, **Then** the list updates to show
   only matching practice questions.
3. **Given** no questions match my filters, **When** the list updates, **Then** I see a clear empty
   state and can reset filters.

---

### User Story 2 - Candidate Solves a Practice Question (Priority: P1)

As a candidate, I want to write and run code for a practice question so I can check my approach
before moving on.

**Why this priority**: The coding loop is the main practice value.

**Independent Test**: Open a practice question, choose Java, Python, or C#, run sample tests, and see
pass/fail feedback.

**Acceptance Scenarios**:

1. **Given** I open a practice question, **When** the workspace loads, **Then** I see the prompt,
   allowed languages, starter code, code editor, run control, and sample tests.
2. **Given** I select a supported language, **When** I switch languages, **Then** the editor loads
   the correct starter code for that language.
3. **Given** I click Run, **When** execution completes, **Then** I see visible sample-test results
   and safe compile/runtime feedback.

---

### User Story 3 - Candidate Tracks Practice Progress (Priority: P2)

As a candidate, I want to see which practice questions I have attempted or solved so I can continue
building skill over time.

**Why this priority**: Progress tracking helps candidates use the platform repeatedly, but it can
follow the basic browse-and-solve loop.

**Independent Test**: Solve or attempt practice questions and confirm status appears on the practice
list and candidate dashboard.

**Acceptance Scenarios**:

1. **Given** I have attempted a question, **When** I return to the practice list, **Then** the
   question shows attempted status.
2. **Given** my latest run passes all visible practice tests, **When** the question status updates,
   **Then** the question shows solved or passed-samples status according to MVP scoring rules.
3. **Given** I revisit a practice question, **When** prior draft code exists, **Then** I can continue
   from my last saved practice draft.

---

### Edge Cases

- What happens when a practice question uses hidden tests? MVP practice mode should not depend on
  hidden grading unless explicitly configured for solved status.
- What happens when a candidate switches language after writing code? The system must warn before
  replacing unsaved editor content.
- What happens when execution is unavailable? The candidate must be able to keep editing and save
  draft code.
- What happens when a question is archived? Existing candidate progress can remain visible, but the
  archived question should not appear as a new practice option.
- What happens when a candidate account is deleted? Practice drafts and progress must follow the
  account deletion retention policy.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-CP-001**: The system MUST provide a candidate practice area behind candidate authentication.
- **FR-CP-002**: Practice questions MUST be filterable by language, topic, difficulty, and question type.
- **FR-CP-003**: Practice questions MUST support Java, Python, C#, or a subset of these languages.
- **FR-CP-004**: Candidates MUST be able to open a practice question and write code in the browser.
- **FR-CP-005**: Candidates MUST be able to run visible sample tests for practice questions.
- **FR-CP-006**: The system MUST save candidate practice drafts.
- **FR-CP-007**: The system MUST track attempted and solved or passed-samples status per candidate.
- **FR-CP-008**: Practice progress MUST NOT be visible to examiners by default.
- **FR-CP-009**: Archived questions MUST be hidden from normal practice discovery while preserving
  historical candidate progress.
- **FR-CP-010**: Practice mode MUST use candidate-safe execution results and must not expose hidden tests.

### Security & Privacy Requirements *(mandatory)*

- Practice drafts and progress MUST be scoped to the signed-in candidate.
- Examiners MUST NOT access candidate practice code or progress in MVP unless a future opt-in sharing
  feature is specified and approved.
- Candidate code execution MUST use the same sandbox restrictions as assessment execution.
- Logs MUST not include full candidate source code unless explicitly required for controlled
  debugging and protected by retention rules.

### Experience Requirements *(mandatory for user-facing features)*

- Practice pages MUST feel like a usable coding workspace, not a marketing landing page.
- Practice pages MUST support the Talent Sprint light and dark neon themes defined in
  `specs/features/talent-sprint-public-landing-theme/spec.md`.
- The dark neon theme MUST keep the code editor, sample-test results, and filter controls readable
  during long practice sessions.
- Filters MUST be compact, scannable, and keyboard accessible.
- Practice question status must be clear without overstating assessment readiness.
- Run feedback must be easy to understand and must distinguish compile errors, runtime errors,
  failed tests, passed tests, and timeouts.

### Observability & Telemetry Requirements *(mandatory)*

- Emit privacy-safe events for `practice.viewed`, `practice.filter_applied`,
  `practice.question_opened`, `practice.draft_saved`, `practice.run_requested`,
  `practice.run_completed`, and `practice.status_updated`.
- Aggregate telemetry MUST support understanding question popularity, run failure rates by language,
  and candidate practice engagement without exposing source code.

### Key Entities

- **Practice Question**: Candidate-visible coding or problem-solving question available outside a timed assessment.
- **Practice Draft**: Candidate-owned saved code for one practice question and language.
- **Practice Run**: Candidate-triggered sample-test execution.
- **Practice Progress**: Candidate-owned attempted, solved, or passed-samples status.
- **Practice Filter**: Candidate-selected language, topic, difficulty, and type criteria.

## Test Plan

- Unit tests for filter logic, progress status transitions, draft ownership, and archived-question visibility.
- Integration tests for practice list retrieval, draft save/load, sample run, and progress update.
- End-to-end tests for candidate browsing, filtering, opening a question, running code, and returning
  to see updated status.
- Security tests confirming one candidate cannot access another candidate's drafts or progress and
  examiners cannot access practice details.

## Success Criteria *(mandatory)*

- **SC-CP-001**: Candidates can find and open a practice question by language and topic in under
  2 minutes.
- **SC-CP-002**: Practice drafts reload correctly for the same candidate in 100% of tested cases.
- **SC-CP-003**: Candidate practice progress is not returned to examiner-facing APIs.
- **SC-CP-004**: Java, Python, and C# sample practice runs return clear pass/fail/error feedback.

## Assumptions

- Practice mode uses the same question authoring foundation as assessments, with a practice-visible flag.
- Practice questions are untimed in MVP.
- Practice progress is private to the candidate in MVP.
- A future feature may allow candidates to share practice history, but it is out of scope here.

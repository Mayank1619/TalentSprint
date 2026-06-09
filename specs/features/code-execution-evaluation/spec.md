# Feature Specification: Code Execution and Evaluation

**Feature Branch**: `code-execution-evaluation`

**Created**: 2026-06-09

**Status**: Draft

**Product**: Talent Sprint

---

## Overview

This feature provides the execution and grading engine for candidate code. It compiles or runs Java,
Python, and C# submissions in an isolated sandbox, executes visible sample tests and hidden grading
tests, applies scoring rules, and returns candidate-safe or examiner-detailed results depending on
the caller's role.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Candidate Runs Sample Tests (Priority: P1)

As a candidate, I want to run my code against visible sample tests so I can check basic correctness
before submitting.

**Why this priority**: Candidates need fast feedback while working, and sample tests validate the
execution engine before hidden grading is introduced.

**Independent Test**: Run a Python, Java, and C# sample solution against visible tests and verify
candidate-safe results return.

**Acceptance Scenarios**:

1. **Given** I have code for a question, **When** I click Run, **Then** the system executes only
   visible sample tests.
2. **Given** my code fails to compile or run, **When** execution completes, **Then** I see a clear
   candidate-safe error.
3. **Given** execution exceeds limits, **When** the sandbox stops it, **Then** I see a timeout or
   resource-limit result.

---

### User Story 2 - System Grades Final Submission (Priority: P1)

As the system, I want to evaluate final submissions against hidden tests so scoring is consistent and
not exposed to candidates.

**Why this priority**: Unit-test-based grading is the foundation of the platform's assessment value.

**Independent Test**: Submit known passing and failing solutions for each language and verify final
scores match expected test outcomes.

**Acceptance Scenarios**:

1. **Given** a final submission exists, **When** grading starts, **Then** the system runs the
   question's hidden grading tests in the configured language runtime.
2. **Given** some tests pass and some fail, **When** scoring completes, **Then** the final score uses
   the configured scoring weights.
3. **Given** grading fails due to infrastructure error, **When** the attempt result is requested,
   **Then** the attempt is marked grading failed or retry pending without inventing a score.

---

### User Story 3 - Examiner Reviews Detailed Evaluation (Priority: P2)

As an examiner, I want to see test-case-level results and submitted code so I can understand how a
candidate performed.

**Why this priority**: Detailed review is necessary for hiring or consultant screening decisions.

**Independent Test**: Grade an attempt and verify an examiner can see per-question result details
while a candidate cannot.

**Acceptance Scenarios**:

1. **Given** I am an examiner, **When** I open a completed attempt, **Then** I can see submitted code,
   language, score, runtime errors, and test-case-level outcomes.
2. **Given** I am a candidate, **When** I request the same attempt details, **Then** hidden-test
   details are redacted.
3. **Given** a test case has internal assertion output, **When** examiner details render, **Then**
   sensitive platform secrets are still redacted.

---

### Edge Cases

- What happens when code attempts network access? The sandbox must block it.
- What happens when code writes large files or consumes too much memory? The sandbox must terminate
  execution and report a resource-limit result.
- What happens when Java or C# compilation succeeds but runtime fails? The result must distinguish
  compile errors from runtime errors.
- What happens when tests are flaky or nondeterministic? The platform must flag infrastructure or
  test instability rather than silently changing scores.
- What happens when a grading job is duplicated? Scoring must be idempotent for the same submission.
- What happens when a supported runtime version changes? Attempt records must preserve the runtime
  version used for grading.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-CEE-001**: The system MUST support executing Python, Java, and C# code.
- **FR-CEE-002**: The system MUST run code in a sandbox with CPU, memory, filesystem, process, and
  network restrictions.
- **FR-CEE-003**: The system MUST compile Java and C# before executing tests.
- **FR-CEE-004**: The system MUST run visible sample tests for candidate Run actions.
- **FR-CEE-005**: The system MUST run hidden grading tests for final submissions.
- **FR-CEE-006**: The system MUST return candidate-safe output for sample runs.
- **FR-CEE-007**: The system MUST calculate final scores using configured scoring weights.
- **FR-CEE-008**: The system MUST store language, runtime version, code snapshot, test outcomes,
  score, execution duration, and grading status.
- **FR-CEE-009**: The system MUST support retrying grading jobs after infrastructure failures without
  double-counting or changing submitted code.
- **FR-CEE-010**: The system MUST separate candidate-safe result views from examiner-detailed result views.

### Security & Privacy Requirements *(mandatory)*

- Candidate code execution MUST have no network access by default.
- Sandbox jobs MUST run with least privilege and no access to application secrets.
- Hidden tests MUST not be returned to candidate-facing APIs or written to client-visible logs.
- Execution logs MUST redact secrets and limit output size.
- The platform MUST defend against long-running, fork-heavy, memory-heavy, and filesystem-heavy code.

### Experience Requirements *(mandatory for user-facing features)*

- Candidate execution feedback MUST distinguish passed tests, failed tests, compile errors, runtime
  errors, and timeouts.
- Execution feedback components MUST support the Talent Sprint light and dark neon themes defined in
  `specs/features/talent-sprint-public-landing-theme/spec.md`.
- Error, warning, success, timeout, and pending states MUST remain distinguishable in both themes and
  must not rely on color alone.
- Sample run feedback MUST be fast enough to keep the coding flow usable.
- Examiner detail views MUST make scoring and failure reasons scannable without exposing unrelated
  infrastructure noise.

### Observability & Telemetry Requirements *(mandatory)*

- Emit events for `code.sample_run_started`, `code.sample_run_completed`, `code.grading_started`,
  `code.grading_completed`, `code.grading_failed`, and `code.sandbox_limit_exceeded`.
- Track execution latency, queue time, failure rate by language, timeout rate, and infrastructure
  error rate.

### Key Entities

- **Execution Job**: A request to compile/run code for sample or grading tests.
- **Runtime Profile**: Language runtime version, limits, compile command, and execution command.
- **Evaluation Result**: Output of running tests against a code snapshot.
- **Test Outcome**: Pass/fail/error/timeout result for one test case.
- **Score Calculation**: Deterministic score derived from test outcomes and weights.

## Test Plan

- Unit tests for scoring calculations, redaction rules, result status mapping, and idempotency.
- Integration tests for sample execution and final grading across Python, Java, and C# fixtures.
- Sandbox tests for timeout, memory limit, output limit, filesystem writes, and network blocking.
- Contract tests for candidate-safe versus examiner-detailed result responses.

## Success Criteria *(mandatory)*

- **SC-CEE-001**: Known passing and failing fixture submissions produce expected scores for Java,
  Python, and C#.
- **SC-CEE-002**: 100% of candidate-facing result payloads exclude hidden-test definitions.
- **SC-CEE-003**: Malicious or resource-heavy fixture programs are terminated within configured limits.
- **SC-CEE-004**: Re-running grading for the same submission produces the same score and does not
  duplicate final results.

## Assumptions

- A sandbox architecture decision is required before implementation planning.
- MVP can use one configured runtime version per language.
- Sample-run concurrency limits may be lower than final-grading job limits.
- Human review may handle disputed results in MVP; automatic appeals are out of scope.

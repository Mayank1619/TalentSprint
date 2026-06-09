# Feature Specification: Candidate Timed Assessment

**Feature Branch**: `candidate-timed-assessment`

**Created**: 2026-06-09

**Status**: Draft

**Product**: Talent Sprint

---

## Overview

This feature covers the candidate assessment-taking experience. A candidate receives an email with a
secure link, signs in or registers if needed, starts the test, writes code in the browser, runs sample
tests, and submits final answers before the timer expires. After submission, the candidate receives a
score/report summary but cannot inspect hidden tests or examiner-only details.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Candidate Starts from Email Invitation (Priority: P1)

As a candidate, I want to open my invitation link and start the assigned assessment so I can complete
the test requested by the organization.

**Why this priority**: Secure start links are the entry point for examiner-issued assessments.

**Independent Test**: Send a test invitation, open the link as the invited candidate, authenticate,
and start the assessment.

**Acceptance Scenarios**:

1. **Given** I received a valid invitation email, **When** I open the link, **Then** I see the
   assessment title, duration, rules, and start action.
2. **Given** I am not signed in, **When** I open the invitation link, **Then** I am prompted to sign
   in or register and returned to the start page after authentication.
3. **Given** my signed-in email does not match the invitation, **When** I try to start, **Then** the
   system denies access.

---

### User Story 2 - Candidate Completes a Timed Coding Test (Priority: P1)

As a candidate, I want a clear timed workspace with questions, code editor, language selector, run
button, and submit button so I can complete the assessment.

**Why this priority**: This is the core candidate value and the primary assessment workflow.

**Independent Test**: Start an assessment, answer a question in an allowed language, run visible
sample tests, submit, and confirm the attempt is locked.

**Acceptance Scenarios**:

1. **Given** I start an assessment, **When** the workspace loads, **Then** the timer starts and the
   questions are available.
2. **Given** a question supports multiple languages, **When** I choose Java, Python, or C#, **Then**
   the editor loads the correct starter code for that language.
3. **Given** I click Run, **When** sample tests finish, **Then** I see sample-test results without
   seeing hidden tests.
4. **Given** I submit final answers, **When** submission succeeds, **Then** the attempt is locked and
   I cannot edit the answers.

---

### User Story 3 - Candidate Receives Score Summary (Priority: P2)

As a candidate, I want a clear completion summary and email confirmation so I know my test was
submitted and scored.

**Why this priority**: Candidates need confidence that their assessment was received, but the
organization wants detailed diagnostic review limited to examiners.

**Independent Test**: Submit an assessment and verify the completion page and email include the score
summary without hidden-test details.

**Acceptance Scenarios**:

1. **Given** my submitted assessment is evaluated, **When** scoring completes, **Then** I see a
   completion page with overall score, assessment name, and submission time.
2. **Given** scoring completes, **When** the notification email is sent, **Then** it contains a score
   summary and does not include hidden-test cases.
3. **Given** scoring is delayed, **When** I reach the completion page, **Then** I see that scoring is
   in progress and will be emailed when ready.

---

### Edge Cases

- What happens when the timer expires while code is being edited? The system must auto-submit the
  latest saved answer state.
- What happens when the browser disconnects during the test? The candidate must be able to resume
  before expiry using the same invitation and authenticated account.
- What happens when code execution is temporarily unavailable? The candidate must see a clear error
  and still be able to save or submit answers.
- What happens when a candidate attempts to open the invitation after expiry? The system must block
  start and show an expired-invitation state.
- What happens when a candidate refreshes the page? The timer must continue from server-side attempt
  time, not restart.
- What happens when the candidate has already submitted? The link must show the submitted summary,
  not a fresh attempt.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-CTA-001**: The system MUST validate invitation token, candidate identity, invitation state,
  and expiry before allowing assessment start.
- **FR-CTA-002**: The system MUST start the assessment timer only once, at the first confirmed start.
- **FR-CTA-003**: The candidate workspace MUST show question prompts, language options, editor,
  timer, run control, and submit control.
- **FR-CTA-004**: The system MUST autosave candidate code during an active attempt.
- **FR-CTA-005**: The system MUST run visible sample tests on demand without revealing hidden tests.
- **FR-CTA-006**: The system MUST submit the latest saved answers when the candidate manually submits.
- **FR-CTA-007**: The system MUST auto-submit the latest saved answers when the timer expires.
- **FR-CTA-008**: The system MUST lock the attempt after final submission or auto-submission.
- **FR-CTA-009**: The candidate completion page MUST show score summary, submission time, and
  assessment name when scoring is complete.
- **FR-CTA-010**: Candidate-facing report details MUST exclude hidden tests, hidden expected output,
  examiner notes, and other candidates' results.

### Security & Privacy Requirements *(mandatory)*

- Invitation tokens MUST be single-candidate and non-enumerable.
- Assessment start and submit actions MUST require the authenticated candidate account associated
  with the invitation email.
- Timer state MUST be enforced on the server.
- Candidate code MUST be treated as private assessment data and shown only to authorized examiners
  and administrators.
- Candidate-facing APIs MUST never return hidden tests.

### Experience Requirements *(mandatory for user-facing features)*

- The assessment workspace MUST prioritize the coding surface with stable layout, visible timer, and
  no distracting marketing content.
- The assessment workspace MUST support the Talent Sprint light and dark neon themes defined in
  `specs/features/talent-sprint-public-landing-theme/spec.md`.
- Theme switching during an active timed assessment MUST preserve code, timer state, selected
  question, selected language, and scroll position where feasible.
- The dark neon theme MUST keep the timer, code editor, question prompt, run results, and submit
  controls highly readable and must not add distracting animation.
- Run and Submit actions MUST be visually distinct to reduce accidental final submission.
- The timer MUST use accessible text and must warn clearly near expiration.
- Errors from execution, save, or submit must be recoverable and written in plain language.

### Observability & Telemetry Requirements *(mandatory)*

- Emit events for `assessment.invitation_opened`, `assessment.started`, `assessment.autosaved`,
  `assessment.sample_run_requested`, `assessment.submitted`, `assessment.auto_submitted`,
  `assessment.completed_viewed`, and `assessment.candidate_email_sent`.
- Audit attempt start, final submission, auto-submission, and identity mismatch attempts.

### Key Entities

- **Assessment Attempt**: One candidate's active or completed test session.
- **Answer Draft**: Autosaved code and language selection for one question.
- **Run Result**: Candidate-visible result from sample tests.
- **Submission**: Locked final answer set for grading.
- **Candidate Report Summary**: Candidate-safe score summary.

## Test Plan

- Unit tests for invitation validation, server-side timer calculations, auto-submit rules, and
  report redaction.
- Integration tests for start, autosave, sample run, manual submit, auto-submit, and completion view.
- End-to-end tests for invited candidate registration/login, assessment start, run sample tests,
  submit, and see summary.
- Security tests verifying identity mismatch and expired invitations cannot start attempts.

## Success Criteria *(mandatory)*

- **SC-CTA-001**: 100% of started assessments use server-side start time and cannot restart the timer
  by refreshing the browser.
- **SC-CTA-002**: Candidates can complete a one-question assessment in supported languages without
  examiner intervention.
- **SC-CTA-003**: Attempts are locked after submission or expiry in 100% of tested cases.
- **SC-CTA-004**: Candidate report responses contain no hidden-test data.

## Assumptions

- Candidate identity is based on verified email for MVP.
- Copy/paste restrictions and proctoring are out of scope for MVP.
- Autosave stores code frequently enough to support auto-submit on expiry.
- Mobile viewing may be supported, but coding assessments are optimized for desktop.

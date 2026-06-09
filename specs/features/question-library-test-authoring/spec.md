# Feature Specification: Question Library and Test Authoring

**Feature Branch**: `question-library-test-authoring`

**Created**: 2026-06-09

**Status**: Draft

**Product**: Talent Sprint

---

## Overview

This feature lets examiners maintain a reusable question library and build timed coding assessments.
Questions can target Java, Python, C#, or language-agnostic problem solving. Each coding question
includes prompt text, allowed languages, starter code, visible sample tests, hidden grading tests,
difficulty, tags, scoring weight, and expected execution limits.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Examiner Creates a Question (Priority: P1)

As an examiner, I want to create a coding question with starter code and tests so candidates can be
graded consistently.

**Why this priority**: No assessment can be assembled without trusted question content and test cases.

**Independent Test**: Create a Python-capable question with sample and hidden tests, then preview it
as an examiner and verify the question is saved as draft.

**Acceptance Scenarios**:

1. **Given** I am an examiner, **When** I create a question with prompt, difficulty, tags, allowed
   languages, starter code, and tests, **Then** the question is saved as a draft.
2. **Given** a question has invalid or missing test definitions, **When** I attempt to publish it,
   **Then** the system prevents publishing and shows validation messages.
3. **Given** I preview a draft question, **When** the preview loads, **Then** I see the same prompt,
   language options, starter code, and visible sample tests a candidate would see.

---

### User Story 2 - Examiner Builds a Timed Assessment (Priority: P1)

As an examiner, I want to choose questions from the library and configure timing and scoring so I can
send a targeted assessment to candidates.

**Why this priority**: Assessment creation is the central examiner workflow.

**Independent Test**: Select published questions, set a duration, configure scoring weights, and save
the assessment as ready to send.

**Acceptance Scenarios**:

1. **Given** published questions exist, **When** I create an assessment and add questions, **Then**
   the assessment stores the selected question order and scoring weights.
2. **Given** I set a time limit, **When** I save the assessment, **Then** the time limit is retained
   and displayed in the assessment summary.
3. **Given** an assessment has no questions or no time limit, **When** I try to mark it ready,
   **Then** the system blocks the action.

---

### User Story 3 - Examiner Invites Candidates (Priority: P2)

As an examiner, I want to add candidate emails to an assessment so each candidate receives a secure
test invitation.

**Why this priority**: Invitation delivery connects authored assessments to candidate attempts.

**Independent Test**: Add candidate emails to a ready assessment, send invitations, and verify each
candidate receives a unique pending invitation.

**Acceptance Scenarios**:

1. **Given** an assessment is ready, **When** I add one or more candidate emails and send
   invitations, **Then** the system creates one invitation per candidate.
2. **Given** an email is invalid, **When** I send invitations, **Then** the invalid recipient is
   rejected with a clear validation message.
3. **Given** a candidate has already been invited to the same assessment, **When** I send the same
   email again, **Then** the system avoids duplicate active invitations.

---

### Edge Cases

- What happens when a question is edited after candidates have been invited? Existing invitations
  must use the assessment snapshot active at invitation time.
- What happens when a hidden test is accidentally marked visible? The publishing workflow must make
  visible and hidden classification explicit.
- What happens when a question supports only Java but an assessment is configured for any language?
  Candidate language choices must be constrained per question.
- What happens when an examiner deletes a question used in a sent assessment? Deletion must be
  blocked or converted to archive so historical attempts remain reproducible.
- What happens when candidate email sending partially fails? Successful invitations must remain
  recorded, failed recipients must be retryable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-QL-001**: The system MUST allow examiners to create, edit, archive, and publish questions.
- **FR-QL-002**: Questions MUST support Java, Python, C#, or any combination of these languages.
- **FR-QL-003**: Questions MUST include prompt, difficulty, tags, allowed languages, starter code,
  visible sample tests, hidden grading tests, and execution limits.
- **FR-QL-004**: The system MUST validate test definitions before a question can be published.
- **FR-QL-005**: The system MUST allow examiners to create assessments from published questions.
- **FR-QL-006**: Assessments MUST include title, description, duration, selected questions, scoring
  weights, allowed start rules, and invitation state.
- **FR-QL-007**: The system MUST snapshot assessment content when invitations are sent.
- **FR-QL-008**: The system MUST allow examiners to invite candidates by email.
- **FR-QL-009**: The system MUST prevent duplicate active invitations for the same assessment and email.
- **FR-QL-010**: The system MUST preserve historical question and assessment data required to review
  completed attempts.

### Security & Privacy Requirements *(mandatory)*

- Only examiners and administrators MAY create or modify questions and assessments.
- Hidden tests MUST never be exposed to candidates through API payloads, client state, logs, or error messages.
- Candidate invitation lists MUST be visible only to authorized examiners and administrators.
- Every create, publish, archive, and invitation action MUST be audit logged.

### Experience Requirements *(mandatory for user-facing features)*

- Question authoring MUST provide clear tabs or sections for prompt, language setup, tests, scoring,
  and preview.
- Examiner authoring screens MUST support the Talent Sprint light and dark neon themes defined in
  `specs/features/talent-sprint-public-landing-theme/spec.md`.
- The dark neon theme MUST not obscure hidden/visible test labels, readiness errors, scoring fields,
  or destructive archive actions.
- Test visibility must be explicit using visible/hidden controls.
- Assessment builder MUST show total duration, total score, question count, language coverage, and
  readiness state before invitations can be sent.

### Observability & Telemetry Requirements *(mandatory)*

- Emit events for `question.created`, `question.published`, `question.archived`,
  `assessment.created`, `assessment.ready`, `assessment.invitation_sent`, and
  `assessment.invitation_failed`.
- Track validation failure counts for question publishing and assessment readiness.

### Key Entities

- **Question**: Reusable coding or problem-solving prompt with metadata and tests.
- **Language Template**: Starter code and execution configuration for one language.
- **Test Case**: Input, expected output or assertion, visibility, and scoring metadata.
- **Assessment**: Examiner-authored test composed from selected questions.
- **Assessment Snapshot**: Immutable copy of assessment content sent to candidates.
- **Candidate Invitation**: Candidate-specific invitation record with email, token state, and expiry.

## Test Plan

- Unit tests for question validation, hidden/visible test classification, scoring-weight totals, and
  duplicate invitation detection.
- Integration tests for question CRUD, publish workflow, assessment creation, snapshot creation, and
  invitation sending.
- End-to-end tests for examiner creating a question, building an assessment, and sending invitations.
- Security tests verifying hidden tests are absent from candidate-facing API responses.

## Success Criteria *(mandatory)*

- **SC-QL-001**: 100% of published questions have at least one grading test and valid starter code
  for each allowed language.
- **SC-QL-002**: Examiners can create a basic two-question assessment and send invitations in under
  10 minutes during usability testing.
- **SC-QL-003**: Hidden tests are never present in candidate-facing network responses.
- **SC-QL-004**: Completed attempts remain reviewable after source questions are edited or archived.

## Assumptions

- Question import/export is not required for MVP.
- Rich text prompt editing may be simple Markdown in MVP.
- A single examiner owns an assessment, with administrator override access.
- Invitations are sent by email through a provider selected during implementation planning.

# Feature Specification: Examiner Results and Reporting

**Feature Branch**: `examiner-results-reporting`

**Created**: 2026-06-09

**Status**: Draft

**Product**: Talent Sprint

---

## Overview

This feature gives examiners visibility into sent assessments, candidate attempt status, scores,
submitted code, and detailed evaluation outcomes. It also sends completion notifications to the
candidate and examiner after scoring completes. Candidates receive only a summary report, while
examiners can inspect detailed attempt data.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Examiner Tracks Candidate Attempts (Priority: P1)

As an examiner, I want to see all candidates invited to an assessment and their current status so I
know who has not started, is in progress, submitted, expired, or completed.

**Why this priority**: Examiner follow-up depends on accurate invitation and attempt state.

**Independent Test**: Invite several candidates, simulate different attempt states, and verify the
assessment results page displays each state correctly.

**Acceptance Scenarios**:

1. **Given** candidates are invited, **When** I open the assessment results page, **Then** I see one
   row per candidate with invitation and attempt status.
2. **Given** a candidate has started but not submitted, **When** I view the list, **Then** the row
   shows in progress and the start time.
3. **Given** an invitation expired without start, **When** I view the list, **Then** the row shows
   expired.

---

### User Story 2 - Examiner Reviews Completed Attempt Details (Priority: P1)

As an examiner, I want to open a candidate attempt and review score, submitted code, language choice,
and test-case outcomes so I can make an informed screening decision.

**Why this priority**: Detailed attempt review is the main examiner value after candidates complete
tests.

**Independent Test**: Grade a completed attempt and verify examiner detail includes submitted code,
per-question scores, total score, and test outcomes.

**Acceptance Scenarios**:

1. **Given** a candidate completed an assessment, **When** I open the attempt detail, **Then** I see
   total score, per-question score, submitted code, selected language, and execution result summary.
2. **Given** a question has hidden grading tests, **When** I view examiner details, **Then** I see
   test outcomes according to examiner permissions.
3. **Given** grading failed, **When** I open the attempt detail, **Then** I see grading status and a
   retry or support path rather than a misleading score.

---

### User Story 3 - Completion Emails Are Sent (Priority: P2)

As the organization, I want both candidate and examiner to receive completion notifications so the
candidate has confirmation and the examiner knows results are ready.

**Why this priority**: Email closes the loop without requiring examiners to constantly refresh.

**Independent Test**: Submit and grade an attempt, then verify candidate and examiner emails are
queued with role-appropriate content.

**Acceptance Scenarios**:

1. **Given** scoring completes, **When** notifications are sent, **Then** the candidate receives a
   score summary email.
2. **Given** scoring completes, **When** notifications are sent, **Then** the examiner receives a
   results-ready email with a link to examiner details.
3. **Given** email sending fails, **When** the notification job is retried, **Then** duplicate emails
   are not sent to recipients who already received the notification.

---

### Edge Cases

- What happens when a candidate submits but grading is still queued? Examiner list must show submitted
  or grading pending, not completed.
- What happens when an examiner no longer has access to an assessment? Result access must be denied.
- What happens when multiple examiners collaborate on one assessment? Access rules must be explicit
  before enabling shared ownership.
- What happens when a candidate asks for detailed feedback? MVP candidate report remains summary-only
  unless an examiner-controlled release feature is later specified.
- What happens when notification email fails permanently? The failed state must be visible to
  authorized users and retryable.
- What happens when an attempt is auto-submitted at expiry? Reports must clearly label it as
  auto-submitted.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-ERR-001**: The system MUST show examiners a list of assessments they own or are authorized to view.
- **FR-ERR-002**: The system MUST show invited candidates for an assessment with invitation status,
  attempt status, start time, submit time, and score when available.
- **FR-ERR-003**: The system MUST allow authorized examiners to open completed attempt details.
- **FR-ERR-004**: Attempt details MUST include candidate identity, assessment snapshot, total score,
  per-question score, selected language, submitted code, grading status, and test outcomes.
- **FR-ERR-005**: Candidate-facing reports MUST include assessment name, completion timestamp, and
  score summary only.
- **FR-ERR-006**: The system MUST email the candidate a score/report summary after scoring completes.
- **FR-ERR-007**: The system MUST notify the examiner when a candidate's scored result is ready.
- **FR-ERR-008**: The system MUST support filtering results by status, assessment, candidate, and date.
- **FR-ERR-009**: The system MUST preserve assessment snapshot and attempt data needed for later review.
- **FR-ERR-010**: The system MUST make notification delivery state visible to authorized examiners or administrators.

### Security & Privacy Requirements *(mandatory)*

- Only authorized examiners and administrators MAY view candidate submitted code and detailed results.
- Candidate reports MUST not expose hidden tests, examiner notes, or other candidates' results.
- Result links in emails MUST require authentication and authorization unless they are candidate
  summary links protected by secure single-use or short-lived tokens.
- Access to attempt details MUST be audit logged.
- Exporting results, if added later, MUST be separately specified.

### Experience Requirements *(mandatory for user-facing features)*

- Results list MUST be optimized for scanning with status, score, date, and candidate identity visible.
- Results and reporting screens MUST support the Talent Sprint light and dark neon themes defined in
  `specs/features/talent-sprint-public-landing-theme/spec.md`.
- Dark neon mode MUST preserve readability for dense tables, code review panes, score summaries, and
  status filters.
- Attempt detail MUST separate summary, code, test outcomes, and notification history into clear sections.
- Candidate summary report MUST be concise and reassuring, with no hidden-test diagnostic detail.

### Observability & Telemetry Requirements *(mandatory)*

- Emit events for `results.list_viewed`, `results.attempt_opened`, `results.filter_applied`,
  `notification.candidate_score_sent`, `notification.examiner_result_sent`,
  `notification.delivery_failed`, and `notification.retry_requested`.
- Audit all detailed attempt access, including user id, attempt id, timestamp, and authorization result.

### Key Entities

- **Result Summary**: Assessment-level row for one candidate invitation/attempt.
- **Attempt Detail**: Examiner-visible full record of a candidate's completed or pending attempt.
- **Candidate Report**: Candidate-safe score summary.
- **Notification Job**: Email delivery task for candidate or examiner result messages.
- **Notification Receipt**: Delivery status record for each recipient and message type.

## Test Plan

- Unit tests for result redaction, status mapping, notification idempotency, and access checks.
- Integration tests for assessment results list, attempt detail retrieval, candidate report retrieval,
  and notification job state transitions.
- End-to-end tests for examiner viewing completed results and candidate receiving a summary report.
- Security tests confirming unauthorized users cannot view candidate code or detailed results.

## Success Criteria *(mandatory)*

- **SC-ERR-001**: Examiners can identify completed, pending, in-progress, and expired candidates from
  the results list without opening each row.
- **SC-ERR-002**: 100% of detailed result requests enforce authorization before returning submitted code.
- **SC-ERR-003**: Candidate emails and candidate report pages contain no hidden-test details.
- **SC-ERR-004**: Notification retries do not create duplicate completion emails for already-sent recipients.

## Assumptions

- Examiners initially see only assessments they created unless administrator access is granted.
- Candidate score emails are sent after grading completes, not immediately after submit if grading is queued.
- CSV/PDF exports are out of scope for MVP and should be specified separately.
- Detailed candidate feedback release is out of scope for MVP.

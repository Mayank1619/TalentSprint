# Feature Specification: Admin-Controlled Examiner Access

**Feature Branch**: `admin-examiner-access-control`
**Created**: 2026-06-11
**Status**: Draft
**Input**: Administrator-managed examiner onboarding, disabling, removal, and password setup.

## User Stories & Tests

### Story 1 - Invite Examiner

As an administrator, I want to create examiner access by entering a name and email so that examiners
cannot self-register or gain elevated access without approval.

**Acceptance Criteria**

1. Given I am signed in as an administrator, when I invite an examiner with a valid name and email,
   then the examiner account is created with examiner role metadata.
2. Given production Supabase admin credentials are configured, when the examiner is invited, then a
   secure email link is sent so the examiner can set their password.
3. Given a candidate or unauthenticated user calls the examiner invite endpoint, then the request is
   rejected before any account is created.

### Story 2 - Manage Examiner Access

As an administrator, I want to disable, enable, or remove examiner accounts so I can control who has
access to assessment authoring and candidate results.

**Acceptance Criteria**

1. Given an examiner is active, when an administrator disables the examiner, then that examiner can no
   longer sign in.
2. Given an examiner is disabled, when an administrator enables the examiner, then the examiner can
   sign in again.
3. Given an examiner should lose all access, when an administrator removes the account, then the
   account is deleted from the managed examiner list.

### Story 3 - Candidate Registration Remains Public

As a candidate, I want to self-register for practice while examiner access remains invitation-only.

**Acceptance Criteria**

1. Given I am on the login page, when I choose register, then the registration form only creates a
   candidate account.
2. Given I am not an administrator, when I view navigation, then the admin access management page is
   not visible.

## Functional Requirements

- **FR-AEAC-001**: Candidate self-registration MUST always assign the candidate role.
- **FR-AEAC-002**: Examiner accounts MUST be created only through an administrator-only workflow.
- **FR-AEAC-003**: The administrator workflow MUST collect examiner full name and email address.
- **FR-AEAC-004**: Production examiner invitations MUST use Supabase server-side admin APIs, never
  browser-exposed keys.
- **FR-AEAC-005**: Invited examiners MUST receive a secure email flow that lets them set their password.
- **FR-AEAC-006**: Administrators MUST be able to disable, re-enable, and remove examiner access.
- **FR-AEAC-007**: Disabled examiner accounts MUST be blocked from login.
- **FR-AEAC-008**: The admin dashboard MUST show examiner status and account details useful for access
  review.

## Security Requirements

- The Supabase service-role key MUST only be used server-side.
- The examiner management API MUST verify the current user is an administrator before any action.
- Administrator identity MAY come from user metadata or a configured master admin email.
- Candidate, examiner, and unauthenticated users MUST receive authorization errors for examiner
  management actions.
- Logs and UI messages MUST not expose service-role keys, invite tokens, or reset tokens.

## Environment

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project origin.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Browser-safe Supabase key.
- `SUPABASE_SERVICE_ROLE_KEY`: Server-only key for admin user management.
- `MASTER_ADMIN_EMAIL`: Server-side comma-separated email allowlist for master admin accounts.
- `NEXT_PUBLIC_MASTER_ADMIN_EMAIL`: Browser-side email mapping used for navigation and local role
  resolution.

## Test Strategy

- Unit tests for examiner invite validation and disabled-account login behavior.
- Playwright tests for administrator invite, disable, enable, and remove actions.
- Authorization tests for candidate denial on admin routes.
- CI security checks must continue to run before deployment.

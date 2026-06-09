# Authentication and Authorization

Talent Sprint is wired for Supabase Auth in production and local browser auth in development/test
when Supabase environment variables are absent.

## Production Provider

Set these variables locally and in Vercel:

```text
NEXT_PUBLIC_SUPABASE_URL=<your Supabase project URL>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your Supabase publishable key>
```

When both values exist:

- Registration calls Supabase `auth.signUp`.
- Login calls Supabase `auth.signInWithPassword`.
- Sign out calls Supabase `auth.signOut`.
- Session state is restored through Supabase `auth.getSession` and `onAuthStateChange`.

## Roles

Candidate registration assigns this user metadata:

```json
{
  "name": "Candidate Name",
  "role": "candidate"
}
```

Examiner and administrator accounts should be created or promoted by an administrator in Supabase by
setting user metadata:

```json
{
  "name": "Examiner Name",
  "role": "examiner"
}
```

```json
{
  "name": "Admin Name",
  "role": "administrator"
}
```

## Role Routing

After login:

- Candidate users go to `/practice`.
- Examiner users go to `/examiner`.
- Administrator users go to `/admin`.

Navigation is also role-aware:

- Admin is only visible to administrators.
- Examiner is only visible to examiners and administrators.
- Candidate practice and assessment links are only visible to candidates.

## Development Fallback

If Supabase variables are not configured, the app falls back to local browser auth so Playwright and
local demos still run. This fallback should not be used as the production security boundary.

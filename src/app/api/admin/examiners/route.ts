import { createClient, type User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  normalizeEmail,
  parseAccountStatus,
  parseRole,
  validateExaminerInvite,
  type ManagedExaminer,
} from "@/lib/auth";
import { normalizeSupabaseProjectUrl } from "@/lib/supabase-client";

type ExaminerAction =
  | { action?: "invite"; name?: string; email?: string }
  | { action?: "enable" | "disable" | "remove"; id?: string };

export async function GET(request: Request) {
  const admin = getAdminClient();
  if (!admin) return missingAdminConfig();

  const authorization = await requireAdministrator(admin, request);
  if (!authorization.ok) return authorization.response;

  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 502 });
  }

  const examiners = data.users
    .filter((user) => parseRole(user.user_metadata?.role) === "examiner")
    .map(mapSupabaseExaminer);

  return NextResponse.json({ ok: true, examiners });
}

export async function POST(request: Request) {
  const admin = getAdminClient();
  if (!admin) return missingAdminConfig();

  const authorization = await requireAdministrator(admin, request);
  if (!authorization.ok) return authorization.response;

  const payload = (await request.json()) as ExaminerAction;

  if (payload.action === "invite") {
    return inviteExaminer(admin, payload);
  }

  if (payload.action === "enable" || payload.action === "disable") {
    if (!payload.id) {
      return NextResponse.json({ ok: false, message: "Examiner id is required." }, { status: 400 });
    }

    const target = await getExaminerById(admin, payload.id);
    if (!target.ok) return target.response;

    const enabled = payload.action === "enable";
    const { error } = await admin.auth.admin.updateUserById(payload.id, {
      ban_duration: enabled ? "none" : "876000h",
      user_metadata: {
        ...target.user.user_metadata,
        role: "examiner",
        status: enabled ? "active" : "disabled",
      },
    });
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 502 });

    return NextResponse.json({
      ok: true,
      message: enabled ? "Examiner access enabled." : "Examiner access disabled.",
    });
  }

  if (payload.action === "remove") {
    if (!payload.id) {
      return NextResponse.json({ ok: false, message: "Examiner id is required." }, { status: 400 });
    }

    const target = await getExaminerById(admin, payload.id);
    if (!target.ok) return target.response;

    const { error } = await admin.auth.admin.deleteUser(payload.id);
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 502 });

    return NextResponse.json({ ok: true, message: "Examiner access removed." });
  }

  return NextResponse.json({ ok: false, message: "Unsupported examiner action." }, { status: 400 });
}

async function inviteExaminer(
  admin: ReturnType<typeof getAdminClient> extends infer T ? NonNullable<T> : never,
  payload: Extract<ExaminerAction, { action?: "invite" }>,
) {
  const validationMessage = validateExaminerInvite({
    name: payload.name ?? "",
    email: payload.email ?? "",
  });
  if (validationMessage) {
    return NextResponse.json({ ok: false, message: validationMessage }, { status: 400 });
  }

  const email = normalizeEmail(payload.email ?? "");
  const name = (payload.name ?? "").trim();
  const redirectTo = getAuthRedirectUrl("/reset-password");
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { name, role: "examiner", status: "active" },
    redirectTo,
  });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 502 });
  }

  if (data.user?.id) {
    await admin.auth.admin.updateUserById(data.user.id, {
      user_metadata: { name, role: "examiner", status: "active" },
    });
  }

  return NextResponse.json({
    ok: true,
    message: "Examiner invitation sent. They can set their password from the email link.",
  });
}

function getAdminClient() {
  const url = normalizeSupabaseProjectUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function requireAdministrator(admin: NonNullable<ReturnType<typeof getAdminClient>>, request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return {
      ok: false as const,
      response: NextResponse.json({ ok: false, message: "Administrator session is required." }, { status: 401 }),
    };
  }

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) {
    return {
      ok: false as const,
      response: NextResponse.json({ ok: false, message: "Invalid administrator session." }, { status: 401 }),
    };
  }

  const role = isMasterAdminEmail(data.user.email ?? "")
    ? "administrator"
    : parseRole(data.user.user_metadata?.role);
  if (role !== "administrator") {
    return {
      ok: false as const,
      response: NextResponse.json({ ok: false, message: "Administrator access is required." }, { status: 403 }),
    };
  }

  return { ok: true as const, user: data.user };
}

async function getExaminerById(admin: NonNullable<ReturnType<typeof getAdminClient>>, id: string) {
  const { data, error } = await admin.auth.admin.getUserById(id);
  if (error || !data.user) {
    return {
      ok: false as const,
      response: NextResponse.json({ ok: false, message: "Examiner account was not found." }, { status: 404 }),
    };
  }

  if (parseRole(data.user.user_metadata?.role) !== "examiner") {
    return {
      ok: false as const,
      response: NextResponse.json({ ok: false, message: "Only examiner accounts can be managed here." }, { status: 400 }),
    };
  }

  return { ok: true as const, user: data.user };
}

function mapSupabaseExaminer(user: User): ManagedExaminer {
  const metadata = user.user_metadata ?? {};
  const email = normalizeEmail(user.email ?? "");
  const fallbackName = email ? email.split("@")[0] : "Examiner";
  const status =
    user.banned_until && new Date(user.banned_until).getTime() > Date.now()
      ? "disabled"
      : parseAccountStatus(metadata.status);

  return {
    id: user.id,
    name: typeof metadata.name === "string" && metadata.name.trim() ? metadata.name : fallbackName,
    email,
    role: "examiner",
    status,
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at ?? undefined,
  };
}

function getAuthRedirectUrl(path: string) {
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL;
  const origin = configuredOrigin?.startsWith("http")
    ? configuredOrigin.replace(/\/+$/, "")
    : configuredOrigin
      ? `https://${configuredOrigin.replace(/\/+$/, "")}`
      : "http://localhost:3000";

  return `${origin}${path}`;
}

function isMasterAdminEmail(email: string) {
  const configuredEmails = process.env.MASTER_ADMIN_EMAIL ?? process.env.NEXT_PUBLIC_MASTER_ADMIN_EMAIL ?? "admin@talentsprint.dev";
  return configuredEmails
    .split(",")
    .map((value) => normalizeEmail(value))
    .filter(Boolean)
    .includes(normalizeEmail(email));
}

function missingAdminConfig() {
  return NextResponse.json(
    {
      ok: false,
      message:
        "Supabase admin API is not configured. Add SUPABASE_SERVICE_ROLE_KEY to enable examiner invitations.",
    },
    { status: 501 },
  );
}

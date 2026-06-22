import { NextResponse } from "next/server";
import {
  ensureProfileForAuthUser,
  findAuthUserByEmail,
  getCurrentAuthUser,
  listManagedAuthUsers,
  removeExaminerAccount,
  setExaminerProfileStatus,
  updateExaminerProfile,
  upsertExaminerProfile,
} from "@/lib/auth-profiles";
import { auth } from "@/lib/better-auth";
import {
  normalizeEmail,
  parseAccountStatus,
  validateExaminerInvite,
  type ManagedExaminer,
} from "@/lib/auth";

type ExaminerAction =
  | { action?: "invite"; name?: string; email?: string }
  | { action?: "update"; id?: string; name?: string; email?: string }
  | { action?: "enable" | "disable" | "remove"; id?: string };

export async function GET(request: Request) {
  const authorization = await requireAdministrator(request);
  if (!authorization.ok) return authorization.response;

  const users = await listManagedAuthUsers();
  const examiners = users.filter((user): user is ManagedExaminer => user.role === "examiner");

  return NextResponse.json({ ok: true, users, examiners });
}

export async function POST(request: Request) {
  const authorization = await requireAdministrator(request);
  if (!authorization.ok) return authorization.response;

  const payload = (await request.json()) as ExaminerAction;

  if (payload.action === "invite") {
    return inviteExaminer(payload);
  }

  if (payload.action === "update") {
    if (!payload.id) {
      return NextResponse.json({ ok: false, message: "Examiner id is required." }, { status: 400 });
    }

    const validationMessage = validateExaminerInvite({
      name: payload.name ?? "",
      email: payload.email ?? "",
    });
    if (validationMessage) {
      return NextResponse.json({ ok: false, message: validationMessage }, { status: 400 });
    }

    const updated = await updateExaminerProfile(payload.id, {
      name: payload.name ?? "",
      email: payload.email ?? "",
    });
    if (!updated) {
      return NextResponse.json({ ok: false, message: "Examiner account was not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: "Examiner details updated." });
  }

  if (payload.action === "enable" || payload.action === "disable") {
    if (!payload.id) {
      return NextResponse.json({ ok: false, message: "Examiner id is required." }, { status: 400 });
    }

    const enabled = payload.action === "enable";
    const updated = await setExaminerProfileStatus(payload.id, enabled ? "active" : "disabled");
    if (!updated) {
      return NextResponse.json({ ok: false, message: "Examiner account was not found." }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      message: enabled ? "Examiner access enabled." : "Examiner access disabled.",
    });
  }

  if (payload.action === "remove") {
    if (!payload.id) {
      return NextResponse.json({ ok: false, message: "Examiner id is required." }, { status: 400 });
    }

    const removed = await removeExaminerAccount(payload.id);
    if (!removed) {
      return NextResponse.json({ ok: false, message: "Examiner account was not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: "Examiner access removed." });
  }

  return NextResponse.json({ ok: false, message: "Unsupported examiner action." }, { status: 400 });
}

async function inviteExaminer(payload: Extract<ExaminerAction, { action?: "invite" }>) {
  const validationMessage = validateExaminerInvite({
    name: payload.name ?? "",
    email: payload.email ?? "",
  });
  if (validationMessage) {
    return NextResponse.json({ ok: false, message: validationMessage }, { status: 400 });
  }

  const email = normalizeEmail(payload.email ?? "");
  const name = (payload.name ?? "").trim();
  const existing = await findAuthUserByEmail(email);
  if (existing) {
    const profile = await ensureProfileForAuthUser(existing);
    if (profile.role !== "examiner") {
      return NextResponse.json(
        { ok: false, message: "That email already belongs to a non-examiner account." },
        { status: 409 },
      );
    }
  }

  const authUser =
    existing ??
    (
      await auth.api.signUpEmail({
        body: {
          name,
          email,
          password: createTemporaryPassword(),
        },
      })
    ).user;

  await upsertExaminerProfile({
    id: authUser.id,
    name,
    email,
    invitedAt: new Date().toISOString(),
  });

  try {
    await auth.api.requestPasswordReset({
      body: {
        email,
        redirectTo: getAuthRedirectUrl("/reset-password"),
      },
    });
  } catch {
    return NextResponse.json({
      ok: true,
      message:
        "Examiner access created. Password setup email could not be sent, so send a reset link after email is configured.",
    });
  }

  return NextResponse.json({
    ok: true,
    message: "Examiner access created and password setup email requested.",
  });
}

async function requireAdministrator(request: Request) {
  try {
    const user = await getCurrentAuthUser(request);
    if (!user) {
      return {
        ok: false as const,
        response: NextResponse.json({ ok: false, message: "Administrator session is required." }, { status: 401 }),
      };
    }

    if (user.role !== "administrator" || parseAccountStatus(user.status) !== "active") {
      return {
        ok: false as const,
        response: NextResponse.json({ ok: false, message: "Administrator access is required." }, { status: 403 }),
      };
    }

    return { ok: true as const, user };
  } catch (error) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          ok: false,
          message: error instanceof Error ? error.message : "Unable to verify administrator access.",
        },
        { status: 500 },
      ),
    };
  }
}

function getAuthRedirectUrl(path: string) {
  const configuredOrigin =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL;
  const origin = configuredOrigin?.startsWith("http")
    ? configuredOrigin.replace(/\/+$/, "")
    : configuredOrigin
      ? `https://${configuredOrigin.replace(/\/+$/, "")}`
      : "http://localhost:3000";

  return `${origin}${path}`;
}

function createTemporaryPassword() {
  return `Temp-${crypto.randomUUID()}A1!`;
}

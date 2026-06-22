import { NextResponse } from "next/server";
import { ensureProfileForAuthUser, managedUserToDemoUser } from "@/lib/auth-profiles";
import { auth } from "@/lib/better-auth";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return NextResponse.json({ ok: true, user: null });

  const managedUser = await ensureProfileForAuthUser(session.user);
  if (managedUser.status === "disabled") {
    return NextResponse.json(
      { ok: false, user: null, message: "This account is disabled. Contact your Talent Sprint administrator." },
      { status: 403 },
    );
  }

  return NextResponse.json({ ok: true, user: managedUserToDemoUser(managedUser) });
}

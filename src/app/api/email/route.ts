import { NextResponse } from "next/server";
import { sendTalentSprintEmail, type EmailRequest } from "@/lib/email";

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<EmailRequest>;

  if (!payload.kind || !payload.to) {
    return NextResponse.json(
      { ok: false, message: "Email kind and recipient are required." },
      { status: 400 },
    );
  }

  const result = await sendTalentSprintEmail({
    kind: payload.kind,
    candidateId: payload.candidateId,
    to: payload.to,
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}

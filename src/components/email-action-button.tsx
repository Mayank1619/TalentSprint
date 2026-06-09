"use client";

import { useState } from "react";
import { MailCheck, Send } from "lucide-react";
import type { EmailKind } from "@/lib/email";

export function EmailActionButton({
  candidateId,
  kind,
  label,
  to,
}: {
  candidateId?: string;
  kind: EmailKind;
  label: string;
  to: string;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  async function sendEmail() {
    setIsSending(true);
    setStatus(null);

    const response = await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateId, kind, to }),
    });
    const payload = (await response.json()) as { provider?: string; message?: string };
    setStatus(`${payload.provider ?? "email"}: ${payload.message ?? "Request completed."}`);
    setIsSending(false);
  }

  return (
    <div className="email-action">
      <button className="button secondary" disabled={isSending} onClick={sendEmail} type="button">
        {isSending ? <MailCheck size={18} /> : <Send size={18} />}
        {isSending ? "Sending..." : label}
      </button>
      {status && <span>{status}</span>}
    </div>
  );
}

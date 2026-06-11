"use client";

import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import type { AuthResult } from "@/components/auth-provider";

export function AuthNotice({ notice }: { notice: AuthResult | null }) {
  if (!notice) return null;

  const Icon = notice.ok ? CheckCircle2 : AlertCircle;

  return (
    <div
      aria-live="polite"
      className={`auth-notice ${notice.ok ? "success" : "error"}`}
      role={notice.ok ? "status" : "alert"}
    >
      <Icon size={18} />
      <span>{notice.message}</span>
    </div>
  );
}

export function AuthInfoNotice({ message }: { message: string }) {
  return (
    <div aria-live="polite" className="auth-notice info" role="status">
      <Info size={18} />
      <span>{message}</span>
    </div>
  );
}

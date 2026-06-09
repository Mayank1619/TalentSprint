"use client";

import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { canAccess, roleLabel, type Role } from "@/lib/auth";

export function AuthGate({
  allowedRoles,
  children,
  description,
}: {
  allowedRoles: Role[];
  children: React.ReactNode;
  description: string;
}) {
  const { user } = useAuth();

  if (!user) {
    return (
      <main className="page-shell">
        <section className="access-card">
          <LockKeyhole />
          <h1>Sign in required</h1>
          <p>{description}</p>
          <Link className="button primary" href="/login">
            Log in or register
          </Link>
        </section>
      </main>
    );
  }

  if (!canAccess(user.role, allowedRoles)) {
    return (
      <main className="page-shell">
        <section className="access-card">
          <LockKeyhole />
          <h1>Access denied</h1>
          <p>
            You are signed in as {roleLabel(user.role)}. This area requires{" "}
            {allowedRoles.map(roleLabel).join(" or ")} access.
          </p>
          <Link className="button secondary" href="/login">
            Log in with another account
          </Link>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}

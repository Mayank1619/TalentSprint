"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Moon, SunMedium, Trophy } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useTheme } from "@/components/theme-provider";
import { canAccess, roleLabel, type Role } from "@/lib/auth";

const navItems: Array<{ href: string; label: string; allowedRoles?: Role[] }> = [
  { href: "/", label: "Home" },
  { href: "/practice", label: "Practice", allowedRoles: ["candidate"] },
  { href: "/leaderboard", label: "Leaderboard", allowedRoles: ["candidate", "administrator"] },
  { href: "/assessment", label: "Assessment", allowedRoles: ["candidate"] },
  { href: "/examiner", label: "Examiner", allowedRoles: ["examiner", "administrator"] },
  { href: "/admin", label: "Admin", allowedRoles: ["administrator"] },
];

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const handleSignOut = () => {
    signOut();
    router.push("/");
  };

  return (
    <header className="top-nav">
      <Link className="brand" href="/">
        <span>
          <Trophy size={20} />
        </span>
        Talent Sprint
      </Link>
      <nav aria-label="Primary navigation">
        {navItems
          .filter((item) => !item.allowedRoles || canAccess(user?.role ?? null, item.allowedRoles))
          .map((item) => (
            <Link
              className={pathname === item.href ? "active" : ""}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
      </nav>
      <div className="nav-actions">
        {user ? (
          <>
            <span className="user-chip">
              {user.name}
              <small>{roleLabel(user.role)}</small>
            </span>
            <button className="icon-button" onClick={handleSignOut} aria-label="Sign out" type="button">
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <Link className="button ghost" href="/login">
            Sign in
          </Link>
        )}
        <button
          aria-label={theme === "light" ? "Switch to dark neon theme" : "Switch to light theme"}
          className="icon-button"
          onClick={toggleTheme}
          type="button"
        >
          {theme === "light" ? <Moon size={18} /> : <SunMedium size={18} />}
        </button>
      </div>
    </header>
  );
}

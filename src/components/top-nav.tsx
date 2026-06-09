"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Moon, SunMedium, Trophy } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useTheme } from "@/components/theme-provider";
import { roleLabel } from "@/lib/auth";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/practice", label: "Practice" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/assessment", label: "Assessment" },
  { href: "/examiner", label: "Examiner" },
  { href: "/admin", label: "Admin" },
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
        {navItems.map((item) => (
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

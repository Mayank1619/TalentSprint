"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, SunMedium, Trophy } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/practice", label: "Practice" },
  { href: "/assessment", label: "Assessment" },
  { href: "/examiner", label: "Examiner" },
  { href: "/admin", label: "Admin" },
];

export function TopNav() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

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
        <Link className="button ghost" href="/login">
          Sign in
        </Link>
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

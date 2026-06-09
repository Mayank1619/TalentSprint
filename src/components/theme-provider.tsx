"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "neon";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    window.requestAnimationFrame(() => {
      const stored = window.localStorage.getItem("talent-sprint-theme");
      if (stored === "light" || stored === "neon") {
        setTheme(stored);
        return;
      }

      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setTheme("neon");
      }
    });
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("talent-sprint-theme", theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((current) => (current === "light" ? "neon" : "light")),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}

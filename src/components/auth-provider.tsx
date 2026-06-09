"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { demoUsers, type DemoUser } from "@/lib/auth";

type AuthContextValue = {
  user: DemoUser | null;
  signIn: (userId: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);

  useEffect(() => {
    window.requestAnimationFrame(() => {
      const storedUserId = window.localStorage.getItem("talent-sprint-user");
      const storedUser = demoUsers.find((item) => item.id === storedUserId) ?? null;
      setUser(storedUser);
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      signIn: (userId: string) => {
        const nextUser = demoUsers.find((item) => item.id === userId) ?? null;
        if (!nextUser) return;
        window.localStorage.setItem("talent-sprint-user", nextUser.id);
        setUser(nextUser);
      },
      signOut: () => {
        window.localStorage.removeItem("talent-sprint-user");
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

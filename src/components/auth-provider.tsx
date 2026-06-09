"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  authStorageKeys,
  normalizeEmail,
  roleHomePath,
  seededAccounts,
  validateRegistration,
  type DemoUser,
  type RegistrationInput,
  type StoredAccount,
} from "@/lib/auth";

type AuthResult = {
  ok: boolean;
  message: string;
  redirectTo?: string;
};

type AuthContextValue = {
  user: DemoUser | null;
  accounts: StoredAccount[];
  signIn: (email: string, password: string) => AuthResult;
  registerCandidate: (input: RegistrationInput) => AuthResult;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);

  useEffect(() => {
    window.requestAnimationFrame(() => {
      const nextAccounts = loadAccounts();
      const storedUserId = window.localStorage.getItem(authStorageKeys.user);
      const storedUser = nextAccounts.find((item) => item.id === storedUserId) ?? null;
      setAccounts(nextAccounts);
      setUser(storedUser);
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      accounts,
      signIn: (email: string, password: string) => {
        const nextAccounts = accounts.length > 0 ? accounts : loadAccounts();
        const nextUser =
          nextAccounts.find((item) => item.email === normalizeEmail(email) && item.password === password) ??
          null;

        if (!nextUser) {
          return { ok: false, message: "Email or password is incorrect." };
        }

        window.localStorage.setItem(authStorageKeys.user, nextUser.id);
        setAccounts(nextAccounts);
        setUser(nextUser);
        return {
          ok: true,
          message: `Welcome back, ${nextUser.name}.`,
          redirectTo: roleHomePath(nextUser.role),
        };
      },
      registerCandidate: (input: RegistrationInput) => {
        const validationMessage = validateRegistration(input);
        if (validationMessage) return { ok: false, message: validationMessage };

        const nextAccounts = accounts.length > 0 ? accounts : loadAccounts();
        const email = normalizeEmail(input.email);
        if (nextAccounts.some((account) => account.email === email)) {
          return { ok: false, message: "An account already exists for this email." };
        }

        const nextUser: StoredAccount = {
          id: `candidate-${crypto.randomUUID()}`,
          name: input.name.trim(),
          email,
          role: "candidate",
          password: input.password,
          createdAt: new Date().toISOString(),
        };
        const updatedAccounts = [...nextAccounts, nextUser];

        saveAccounts(updatedAccounts);
        window.localStorage.setItem(authStorageKeys.user, nextUser.id);
        setAccounts(updatedAccounts);
        setUser(nextUser);
        return {
          ok: true,
          message: "Candidate account created.",
          redirectTo: roleHomePath(nextUser.role),
        };
      },
      signOut: () => {
        window.localStorage.removeItem(authStorageKeys.user);
        setUser(null);
      },
    }),
    [accounts, user],
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

function loadAccounts() {
  const stored = window.localStorage.getItem(authStorageKeys.accounts);
  const parsedAccounts = parseAccounts(stored);
  const accountMap = new Map<string, StoredAccount>();

  for (const account of [...seededAccounts, ...parsedAccounts]) {
    accountMap.set(account.email, account);
  }

  const accounts = Array.from(accountMap.values());
  saveAccounts(accounts);
  return accounts;
}

function saveAccounts(accounts: StoredAccount[]) {
  window.localStorage.setItem(authStorageKeys.accounts, JSON.stringify(accounts));
}

function parseAccounts(value: string | null) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as StoredAccount[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStoredAccount);
  } catch {
    return [];
  }
}

function isStoredAccount(value: StoredAccount) {
  return (
    typeof value?.id === "string" &&
    typeof value.name === "string" &&
    typeof value.email === "string" &&
    ["candidate", "examiner", "administrator"].includes(value.role) &&
    typeof value.password === "string" &&
    typeof value.createdAt === "string"
  );
}

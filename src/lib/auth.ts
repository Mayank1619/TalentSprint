export type Role = "candidate" | "examiner" | "administrator";

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isGuest?: boolean;
};

export type StoredAccount = DemoUser & {
  password: string;
  status?: AccountStatus;
  createdAt: string;
  invitedAt?: string;
  disabledAt?: string;
};

export type AuthMode = "supabase" | "local";
export type AccountStatus = "active" | "disabled";

export type RegistrationInput = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type ExaminerInviteInput = {
  name: string;
  email: string;
};

export type ManagedExaminer = {
  id: string;
  name: string;
  email: string;
  role: "examiner";
  status: AccountStatus;
  createdAt?: string;
  invitedAt?: string;
  lastSignInAt?: string;
};

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: AccountStatus;
  createdAt?: string;
  invitedAt?: string;
  lastSignInAt?: string;
};

export type GuestPracticeInput = {
  name: string;
  email: string;
};

export const authStorageKeys = {
  accounts: "talent-sprint-accounts",
  guest: "talent-sprint-guest-user",
  rememberEmail: "talent-sprint-remembered-email",
  rememberMe: "talent-sprint-remember-me",
  user: "talent-sprint-user",
};

export const demoUsers: DemoUser[] = [
  {
    id: "candidate-demo",
    name: "Candidate Demo",
    email: "candidate@talentsprint.dev",
    role: "candidate",
  },
  {
    id: "examiner-demo",
    name: "Examiner Demo",
    email: "examiner@talentsprint.dev",
    role: "examiner",
  },
  {
    id: "admin-demo",
    name: "Admin Demo",
    email: "admin@talentsprint.dev",
    role: "administrator",
  },
];

export const seededAccounts: StoredAccount[] = [
  {
    ...demoUsers[0],
    password: "Password123!",
    createdAt: "2026-06-09T00:00:00.000Z",
  },
  {
    ...demoUsers[1],
    password: "Password123!",
    createdAt: "2026-06-09T00:00:00.000Z",
  },
  {
    ...demoUsers[2],
    password: "Admin@2026!",
    createdAt: "2026-06-09T00:00:00.000Z",
  },
];

export function canAccess(role: Role | null, allowedRoles: Role[]) {
  return role !== null && allowedRoles.includes(role);
}

export function roleLabel(role: Role) {
  const labels: Record<Role, string> = {
    candidate: "Candidate",
    examiner: "Examiner",
    administrator: "Administrator",
  };

  return labels[role];
}

export function roleHomePath(role: Role) {
  const paths: Record<Role, string> = {
    candidate: "/practice",
    examiner: "/examiner",
    administrator: "/admin",
  };

  return paths[role];
}

export function parseRole(value: unknown): Role {
  return value === "examiner" || value === "administrator" || value === "candidate"
    ? value
    : "candidate";
}

export function parseAccountStatus(value: unknown): AccountStatus {
  return value === "disabled" ? "disabled" : "active";
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validateRegistration(input: RegistrationInput) {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const password = input.password;

  if (name.length < 2) return "Enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must include an uppercase letter and a number.";
  }
  if (password !== input.confirmPassword) return "Passwords do not match.";

  return null;
}

export function validateExaminerInvite(input: ExaminerInviteInput) {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);

  if (name.length < 2) return "Enter the examiner's full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid examiner email address.";

  return null;
}

export function validateGuestPractice(input: GuestPracticeInput) {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);

  if (name.length < 2) return "Enter your name for the leaderboard.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";

  return null;
}

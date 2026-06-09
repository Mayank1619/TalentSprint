export type Role = "candidate" | "examiner" | "administrator";

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type StoredAccount = DemoUser & {
  password: string;
  createdAt: string;
};

export type RegistrationInput = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export const authStorageKeys = {
  accounts: "talent-sprint-accounts",
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

export const seededAccounts: StoredAccount[] = demoUsers.map((user) => ({
  ...user,
  password: "Password123!",
  createdAt: "2026-06-09T00:00:00.000Z",
}));

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

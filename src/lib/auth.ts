export type Role = "candidate" | "examiner" | "administrator";

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
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

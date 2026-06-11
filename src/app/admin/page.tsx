import { AuthGate } from "@/components/auth-gate";
import { AdminDashboard } from "@/components/admin-dashboard";

export default function AdminPage() {
  return (
    <AuthGate allowedRoles={["administrator"]} description="Admin settings require administrator access.">
      <main className="page-shell">
        <section className="page-heading">
          <p className="eyebrow text-only">Admin and authoring</p>
          <h1>Manage the question library and platform settings.</h1>
          <p>
            Admins approve examiner access, manage reusable question content, and keep assessment
            snapshots reproducible.
          </p>
        </section>

        <AdminDashboard />
      </main>
    </AuthGate>
  );
}

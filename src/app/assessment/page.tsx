import { AuthGate } from "@/components/auth-gate";
import { AssessmentExperience } from "@/components/assessment-experience";
import { assessment } from "@/lib/mock-data";

export default function AssessmentPage() {
  return (
    <AuthGate allowedRoles={["candidate"]} description="Timed assessments require candidate access.">
      <main className="page-shell">
        <section className="page-heading compact">
          <p className="eyebrow text-only">Candidate assessment</p>
          <h1>{assessment.title}</h1>
          <p>
            Demo invitation link accepted. The real version will validate candidate identity,
            invitation token, server-side timer, and assessment snapshot before start.
          </p>
        </section>
        <AssessmentExperience />
      </main>
    </AuthGate>
  );
}

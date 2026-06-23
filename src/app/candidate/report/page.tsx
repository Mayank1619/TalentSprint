import { AuthGate } from "@/components/auth-gate";
import { CandidateReportExperience } from "@/components/candidate-report-experience";

export default function CandidateReportPage() {
  return (
    <AuthGate allowedRoles={["candidate"]} description="Candidate reports require candidate access.">
      <CandidateReportExperience />
    </AuthGate>
  );
}

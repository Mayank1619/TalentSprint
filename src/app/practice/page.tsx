import { AuthGate } from "@/components/auth-gate";
import { PracticeExperience } from "@/components/practice-experience";

export default function PracticePage() {
  return (
    <AuthGate allowedRoles={["candidate"]} description="Practice is private to signed-in candidates.">
      <PracticeExperience />
    </AuthGate>
  );
}

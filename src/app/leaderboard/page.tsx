import { AuthGate } from "@/components/auth-gate";
import { LeaderboardExperience } from "@/components/leaderboard-experience";

export default function LeaderboardPage() {
  return (
    <AuthGate
      allowedRoles={["candidate", "administrator"]}
      description="Practice leaderboards require candidate or administrator access."
    >
      <LeaderboardExperience />
    </AuthGate>
  );
}

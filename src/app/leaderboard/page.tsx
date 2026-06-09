import { Award, Flame, Gauge, Medal, Timer, Trophy } from "lucide-react";
import { AuthGate } from "@/components/auth-gate";
import { practiceLeaderboard, practiceQuestions } from "@/lib/mock-data";

export default function LeaderboardPage() {
  const topThree = practiceLeaderboard.slice(0, 3);

  return (
    <AuthGate
      allowedRoles={["candidate", "administrator"]}
      description="Practice leaderboards require candidate or administrator access."
    >
      <main className="page-shell">
        <section className="page-heading">
          <p className="eyebrow text-only">Practice leaderboard</p>
          <h1>Track practice momentum.</h1>
          <p>
            Rankings combine solved practice questions, average score, attempt volume, streak, and
            solve speed. Assessment-only questions never appear in practice leaderboard calculations.
          </p>
        </section>

        <section className="stat-grid">
          <article>
            <Trophy />
            <span>{practiceLeaderboard[0].candidateName}</span>
            <p>Current leader</p>
          </article>
          <article>
            <Gauge />
            <span>{practiceQuestions.length}</span>
            <p>Practice question pool</p>
          </article>
          <article>
            <Timer />
            <span>{practiceLeaderboard[0].fastestSolve}</span>
            <p>Fastest solve</p>
          </article>
          <article>
            <Flame />
            <span>{practiceLeaderboard[0].streakDays} days</span>
            <p>Longest active streak</p>
          </article>
        </section>

        <section className="podium-grid">
          {topThree.map((entry) => (
            <article key={entry.rank}>
              <Medal />
              <p>Rank {entry.rank}</p>
              <h2>{entry.candidateName}</h2>
              <span>{entry.badge}</span>
            </article>
          ))}
        </section>

        <section className="table-card">
          <div className="table-heading">
            <h2>Practice standings</h2>
            <span>Private practice progress, visible in the demo leaderboard</span>
          </div>
          <div className="leaderboard-table">
            <div className="leaderboard-row header">
              <span>Rank</span>
              <span>Candidate</span>
              <span>Language</span>
              <span>Solved</span>
              <span>Attempts</span>
              <span>Avg score</span>
              <span>Fastest</span>
              <span>Streak</span>
            </div>
            {practiceLeaderboard.map((entry) => (
              <div className="leaderboard-row" key={entry.rank}>
                <span>
                  <Award size={16} /> {entry.rank}
                </span>
                <span>
                  <strong>{entry.candidateName}</strong>
                  <small>{entry.badge}</small>
                </span>
                <span>{entry.primaryLanguage}</span>
                <span>{entry.solved}</span>
                <span>{entry.attempts}</span>
                <span>{entry.averageScore}%</span>
                <span>{entry.fastestSolve}</span>
                <span>{entry.streakDays}d</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </AuthGate>
  );
}

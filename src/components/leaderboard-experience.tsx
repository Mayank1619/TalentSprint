"use client";

import { useMemo } from "react";
import { Award, Flame, Gauge, Medal, Timer, Trophy } from "lucide-react";
import { formatDuration, listAttempts } from "@/lib/attempt-store";
import { practiceQuestions } from "@/lib/mock-data";

type LeaderboardRow = {
  rank: number;
  candidateId: string;
  candidateName: string;
  primaryLanguage: string;
  solved: number;
  attempts: number;
  averageScore: number;
  fastestSolveSeconds: number;
  badge: string;
};

export function LeaderboardExperience() {
  const rows = useMemo(() => buildRows(), []);
  const leader = rows[0];

  return (
    <main className="page-shell">
      <section className="page-heading">
        <p className="eyebrow text-only">Practice leaderboard</p>
        <h1>Track practice momentum.</h1>
        <p>
          Rankings are calculated from saved practice submissions in this application session:
          solved questions, average score, attempt volume, and solve speed.
        </p>
      </section>

      <section className="stat-grid">
        <article>
          <Trophy />
          <span>{leader?.candidateName ?? "No attempts"}</span>
          <p>Current leader</p>
        </article>
        <article>
          <Gauge />
          <span>{practiceQuestions.length}</span>
          <p>Practice question pool</p>
        </article>
        <article>
          <Timer />
          <span>{leader ? formatDuration(leader.fastestSolveSeconds) : "-"}</span>
          <p>Fastest solve</p>
        </article>
        <article>
          <Flame />
          <span>{rows.reduce((sum, row) => sum + row.attempts, 0)}</span>
          <p>Total submitted attempts</p>
        </article>
      </section>

      {rows.length > 0 && (
        <section className="podium-grid">
          {rows.slice(0, 3).map((entry) => (
            <article key={entry.candidateId}>
              <Medal />
              <p>Rank {entry.rank}</p>
              <h2>{entry.candidateName}</h2>
              <span>{entry.badge}</span>
            </article>
          ))}
        </section>
      )}

      <section className="table-card">
        <div className="table-heading">
          <h2>Practice standings</h2>
          <span>{rows.length ? "Calculated from stored submissions" : "Submit practice to appear here"}</span>
        </div>
        {rows.length === 0 ? (
          <div className="empty-state-row">No practice submissions have been recorded yet.</div>
        ) : (
          <div className="leaderboard-table">
            <div className="leaderboard-row header">
              <span>Rank</span>
              <span>Candidate</span>
              <span>Language</span>
              <span>Solved</span>
              <span>Attempts</span>
              <span>Avg score</span>
              <span>Fastest</span>
              <span>Badge</span>
            </div>
            {rows.map((entry) => (
              <div className="leaderboard-row" key={entry.candidateId}>
                <span>
                  <Award size={16} /> {entry.rank}
                </span>
                <span>
                  <strong>{entry.candidateName}</strong>
                  <small>{entry.candidateId}</small>
                </span>
                <span>{entry.primaryLanguage}</span>
                <span>{entry.solved}</span>
                <span>{entry.attempts}</span>
                <span>{entry.averageScore}%</span>
                <span>{formatDuration(entry.fastestSolveSeconds)}</span>
                <span>{entry.badge}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function buildRows(): LeaderboardRow[] {
  const practiceAttempts = listAttempts().filter((attempt) => attempt.mode === "practice");
  const grouped = new Map<string, typeof practiceAttempts>();

  for (const attempt of practiceAttempts) {
    grouped.set(attempt.candidateId, [...(grouped.get(attempt.candidateId) ?? []), attempt]);
  }

  return Array.from(grouped.entries())
    .map(([candidateId, attempts]) => {
      const bestByQuestion = new Map<string, number>();
      for (const attempt of attempts) {
        bestByQuestion.set(
          attempt.questionId,
          Math.max(bestByQuestion.get(attempt.questionId) ?? 0, attempt.result.score),
        );
      }
      const solved = Array.from(bestByQuestion.values()).filter((score) => score >= 70).length;
      const averageScore = Math.round(
        attempts.reduce((sum, attempt) => sum + attempt.result.score, 0) / attempts.length,
      );
      const fastestSolveSeconds = Math.min(...attempts.map((attempt) => attempt.timeTakenSeconds));

      return {
        rank: 0,
        candidateId,
        candidateName: attempts[0].candidateName,
        primaryLanguage: attempts[0].language,
        solved,
        attempts: attempts.length,
        averageScore,
        fastestSolveSeconds,
        badge: scoreBadge(averageScore, solved),
      };
    })
    .sort((a, b) => b.solved - a.solved || b.averageScore - a.averageScore || a.fastestSolveSeconds - b.fastestSolveSeconds)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

function scoreBadge(averageScore: number, solved: number) {
  if (averageScore >= 90) return "Assessment Ready";
  if (averageScore >= 70 || solved > 0) return "Practice Builder";
  return "Getting Started";
}

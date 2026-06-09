"use client";

import type { CandidateAttempt } from "@/lib/submission-types";

const attemptsKey = "talent-sprint-attempts";

export function listAttempts() {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(attemptsKey);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored) as CandidateAttempt[];
    return Array.isArray(parsed) ? parsed.filter(isAttempt) : [];
  } catch {
    return [];
  }
}

export function saveAttempt(attempt: CandidateAttempt) {
  const attempts = [attempt, ...listAttempts().filter((item) => item.id !== attempt.id)];
  window.localStorage.setItem(attemptsKey, JSON.stringify(attempts));
  return attempts;
}

export function getLatestAttempt(candidateId: string, questionId: string) {
  return listAttempts()
    .filter((attempt) => attempt.candidateId === candidateId && attempt.questionId === questionId)
    .sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt))[0];
}

export function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

function isAttempt(value: CandidateAttempt) {
  return (
    typeof value?.id === "string" &&
    typeof value.candidateId === "string" &&
    typeof value.questionId === "string" &&
    typeof value.submittedAt === "string" &&
    typeof value.timeTakenSeconds === "number" &&
    typeof value.result?.score === "number"
  );
}

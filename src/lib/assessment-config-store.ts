"use client";

import { assessment } from "@/lib/mock-data";

export type AssessmentEmailSettings = {
  assessmentTitle: string;
  candidateEmails: string[];
  examinerEmail: string;
  questionIds: string[];
  sendCandidateReport: boolean;
  sendExaminerReport: boolean;
  updatedAt: string;
};

const settingsKey = "talent-sprint-assessment-email-settings";

export const defaultAssessmentEmailSettings: AssessmentEmailSettings = {
  assessmentTitle: assessment.title,
  candidateEmails: ["candidate@talentsprint.dev"],
  examinerEmail: "examiner@talentsprint.dev",
  questionIds: assessment.questions.map((question) => question.id),
  sendCandidateReport: true,
  sendExaminerReport: true,
  updatedAt: new Date(0).toISOString(),
};

export function loadAssessmentEmailSettings() {
  if (typeof window === "undefined") return defaultAssessmentEmailSettings;

  const stored = window.localStorage.getItem(settingsKey);
  if (!stored) return defaultAssessmentEmailSettings;

  try {
    const parsed = JSON.parse(stored) as AssessmentEmailSettings;
    return isAssessmentEmailSettings(parsed) ? parsed : defaultAssessmentEmailSettings;
  } catch {
    return defaultAssessmentEmailSettings;
  }
}

export function saveAssessmentEmailSettings(settings: AssessmentEmailSettings) {
  window.localStorage.setItem(settingsKey, JSON.stringify(settings));
  return settings;
}

export function parseEmailList(value: string) {
  return value
    .split(/[\n,;]+/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isAssessmentEmailSettings(value: AssessmentEmailSettings) {
  return (
    typeof value?.assessmentTitle === "string" &&
    Array.isArray(value.candidateEmails) &&
    value.candidateEmails.every(isEmail) &&
    typeof value.examinerEmail === "string" &&
    isEmail(value.examinerEmail) &&
    Array.isArray(value.questionIds) &&
    value.questionIds.every((item) => typeof item === "string") &&
    typeof value.sendCandidateReport === "boolean" &&
    typeof value.sendExaminerReport === "boolean" &&
    typeof value.updatedAt === "string"
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Clock3, FileCheck2, LockKeyhole, Mail } from "lucide-react";
import { CodeWorkspace } from "@/components/code-workspace";
import { useAuth } from "@/components/auth-provider";
import { isEmail, loadAssessmentEmailSettings } from "@/lib/assessment-config-store";
import { assessment, assessmentQuestions } from "@/lib/mock-data";
import type { EmailKind } from "@/lib/email";

const durationSeconds = 45 * 60;

export function AssessmentExperience() {
  const { user } = useAuth();
  const [started, setStarted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [emailSettings] = useState(() => loadAssessmentEmailSettings());

  const configuredQuestions = useMemo(() => {
    const selected = assessmentQuestions.filter((question) =>
      emailSettings.questionIds.includes(question.id),
    );
    return selected.length > 0 ? selected : assessment.questions;
  }, [emailSettings.questionIds]);

  useEffect(() => {
    if (!started || secondsLeft <= 0) return;
    const timer = window.setInterval(() => setSecondsLeft((current) => current - 1), 1000);
    return () => window.clearInterval(timer);
  }, [started, secondsLeft]);

  const time = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (secondsLeft % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [secondsLeft]);

  async function sendReportEmails() {
    const candidateRecipient =
      user?.email && isEmail(user.email) ? user.email : emailSettings.candidateEmails[0];
    const messages: string[] = [];

    if (!emailSettings.sendCandidateReport && !emailSettings.sendExaminerReport) {
      return ["Report emails skipped by examiner settings."];
    }

    if (emailSettings.sendCandidateReport) {
      if (candidateRecipient) {
        messages.push(await sendReportEmail("candidate-report", candidateRecipient, user?.id));
      } else {
        messages.push("Candidate report email skipped because no candidate email was available.");
      }
    }

    if (emailSettings.sendExaminerReport) {
      messages.push(await sendReportEmail("examiner-report", emailSettings.examinerEmail, user?.id));
    }

    return messages;
  }

  if (!started) {
    return (
      <section className="start-card">
        <div>
          <p className="eyebrow text-only">Secure invite</p>
          <h2>Ready to start?</h2>
          <p>
            Once started, the timer is fixed. In production this state will be enforced by the
            server, not the browser.
          </p>
        </div>
        <div className="assessment-rules">
          <span>
            <Clock3 size={18} /> {assessment.durationMinutes} minutes
          </span>
          <span>
            <FileCheck2 size={18} /> {configuredQuestions.length} questions
          </span>
          <span>
            <LockKeyhole size={18} /> Hidden tests after final submit
          </span>
          <span>
            <Mail size={18} /> Candidate email {emailSettings.sendCandidateReport ? "on" : "off"} ·
            examiner email {emailSettings.sendExaminerReport ? "on" : "off"}
          </span>
        </div>
        <button className="button primary" onClick={() => setStarted(true)} type="button">
          Start assessment
        </button>
      </section>
    );
  }

  return (
    <>
      <section className="assessment-bar">
        <div>
          <Clock3 size={18} />
          <strong>{time}</strong>
          <span>remaining · up to +10% speed bonus</span>
        </div>
        <div className="segmented">
          {configuredQuestions.map((question, index) => (
            <button
              className={questionIndex === index ? "selected" : ""}
              key={question.id}
              onClick={() => setQuestionIndex(index)}
              type="button"
            >
              Q{index + 1}
            </button>
          ))}
        </div>
        {secondsLeft < 300 && (
          <span className="status-pill warning">
            <AlertTriangle size={14} /> Final 5 minutes
          </span>
        )}
      </section>
      <CodeWorkspace
        assessmentMode
        durationSeconds={durationSeconds}
        onSubmissionComplete={sendReportEmails}
        question={configuredQuestions[Math.min(questionIndex, configuredQuestions.length - 1)]}
        secondsRemaining={secondsLeft}
      />
    </>
  );
}

async function sendReportEmail(kind: EmailKind, to: string, candidateId?: string) {
  try {
    const response = await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateId, kind, to }),
    });
    const payload = (await response.json()) as { message?: string; provider?: string };
    const recipientType = kind === "candidate-report" ? "Candidate" : "Examiner";
    return `${recipientType} report email: ${payload.provider ?? "email"} ${
      payload.message ?? (response.ok ? "sent." : "could not be sent.")
    }`;
  } catch {
    const recipientType = kind === "candidate-report" ? "Candidate" : "Examiner";
    return `${recipientType} report email could not be sent.`;
  }
}

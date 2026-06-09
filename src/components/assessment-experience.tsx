"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Clock3, FileCheck2, LockKeyhole } from "lucide-react";
import { CodeWorkspace } from "@/components/code-workspace";
import { assessment } from "@/lib/mock-data";

const durationSeconds = 45 * 60;

export function AssessmentExperience() {
  const [started, setStarted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const [questionIndex, setQuestionIndex] = useState(0);

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
            <FileCheck2 size={18} /> {assessment.questions.length} questions
          </span>
          <span>
            <LockKeyhole size={18} /> Hidden tests after final submit
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
          {assessment.questions.map((question, index) => (
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
        question={assessment.questions[questionIndex]}
        secondsRemaining={secondsLeft}
      />
    </>
  );
}

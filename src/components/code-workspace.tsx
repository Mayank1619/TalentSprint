"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock3, Play, RotateCcw, Send, TimerReset } from "lucide-react";
import { evaluateCode, type EvaluationResult } from "@/lib/evaluator";
import type { Language, Question } from "@/lib/mock-data";

type CodeWorkspaceProps = {
  question: Question;
  assessmentMode?: boolean;
  durationSeconds?: number;
  secondsRemaining?: number;
  submissionHref?: string;
  submissionLinkLabel?: string;
  redirectOnSubmit?: boolean;
  autoSubmitSeconds?: number;
};

const languages: Language[] = ["Python", "Java", "C#"];

export function CodeWorkspace({
  question,
  assessmentMode = false,
  durationSeconds,
  secondsRemaining,
  submissionHref = "/candidate/report",
  submissionLinkLabel = "Open candidate report summary",
  redirectOnSubmit = false,
  autoSubmitSeconds,
}: CodeWorkspaceProps) {
  const [language, setLanguage] = useState<Language>("Python");
  const [code, setCode] = useState(question.starterCode.Python);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(autoSubmitSeconds ?? null);
  const submitRef = useRef<() => void>(() => {});

  const resultTone = useMemo(() => {
    if (!result) return "";
    return result.status === "passed" ? "success" : result.status === "partial" ? "warning" : "error";
  }, [result]);

  const timerLabel = useMemo(() => {
    if (secondsLeft === null) return null;
    const minutes = Math.floor(secondsLeft / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (secondsLeft % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [secondsLeft]);

  const timerTone = secondsLeft !== null && secondsLeft <= 60 ? "warning" : "";

  const submit = useCallback(() => {
    const nextResult = evaluateCode(question, language, code, {
      assessmentMode,
      durationSeconds,
      secondsRemaining,
    });
    setResult(nextResult);
    setSubmitted(true);
    if (redirectOnSubmit) {
      window.location.assign(submissionHref);
    }
  }, [
    assessmentMode,
    code,
    durationSeconds,
    language,
    question,
    redirectOnSubmit,
    secondsRemaining,
    submissionHref,
  ]);

  useEffect(() => {
    submitRef.current = submit;
  }, [submit]);

  useEffect(() => {
    if (autoSubmitSeconds === undefined || submitted) return;

    const deadlineMs = Date.now() + autoSubmitSeconds * 1000;

    const timer = window.setInterval(() => {
      setSecondsLeft(Math.max(0, Math.ceil((deadlineMs - Date.now()) / 1000)));
    }, 1000);

    const autoSubmit = window.setTimeout(() => {
      setSecondsLeft(0);
      submitRef.current();
    }, autoSubmitSeconds * 1000);

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(autoSubmit);
    };
  }, [autoSubmitSeconds, question.id, submitted]);

  function handleLanguageChange(next: Language) {
    setLanguage(next);
    setCode(question.starterCode[next]);
    setResult(null);
    setSubmitted(false);
  }

  function runSamples() {
    setResult(evaluateCode(question, language, code));
  }

  return (
    <div className="workspace">
      <section className="question-panel">
        <div className="panel-label">Question</div>
        <h2>{question.title}</h2>
        <p>{question.prompt}</p>
        <div className="tag-row">
          <span>{question.difficulty}</span>
          {question.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="sample-list">
          <strong>Visible sample tests</strong>
          {question.sampleTests.map((test) => (
            <code key={test}>{test}</code>
          ))}
        </div>
      </section>

      <section className="editor-panel">
        <div className="editor-toolbar">
          <div className="segmented" aria-label="Language">
            {languages.map((item) => (
              <button
                className={item === language ? "selected" : ""}
                disabled={submitted}
                key={item}
                onClick={() => handleLanguageChange(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
          {assessmentMode && (
            <span className="status-pill">
              <TimerReset size={14} /> Autosaved
            </span>
          )}
          {timerLabel && (
            <span className={`status-pill ${timerTone}`} aria-live="polite">
              <Clock3 size={14} /> {timerLabel} remaining
            </span>
          )}
        </div>
        <textarea
          aria-label={`${question.title} ${language} editor`}
          className="code-editor"
          disabled={submitted}
          onChange={(event) => setCode(event.target.value)}
          spellCheck={false}
          value={code}
        />
        <div className="workspace-actions">
          <button className="button secondary" disabled={submitted} onClick={runSamples} type="button">
            <Play size={17} /> Run samples
          </button>
          <button className="button primary" disabled={submitted} onClick={submit} type="button">
            <Send size={17} /> Submit
          </button>
          {submitted && (
            <button
              className="button ghost"
              onClick={() => {
                setSubmitted(false);
                setResult(null);
              }}
              type="button"
            >
              <RotateCcw size={17} /> Reopen demo
            </button>
          )}
        </div>
        {result && (
          <div className={`result-box ${resultTone}`}>
            <h2>
              <CheckCircle2 size={18} />
              {result.passed}/{result.total} samples passed · {result.score}%
            </h2>
            {submitted && assessmentMode && (
              <p>
                Correctness {result.correctnessScore}% · Speed bonus +{result.timeBonus}% · Time
                taken {result.timeTakenLabel}
              </p>
            )}
            {result.feedback.map((line) => (
              <p key={line}>{line}</p>
            ))}
            {submitted && (
              <strong>
                Final submission locked. Candidate report shows the score summary; examiner view sees
                detailed outcomes.
              </strong>
            )}
            {submitted && (
              <Link className="inline-link" href={submissionHref}>
                {submissionLinkLabel}
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

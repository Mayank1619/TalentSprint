"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock3, Play, RotateCcw, Send, TimerReset } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { saveAttempt } from "@/lib/attempt-store";
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
  onSubmissionComplete?: (context: SubmissionContext) => Promise<string[] | void>;
};

const languages: Language[] = ["Python", "Java", "C#"];

export type SubmissionContext = {
  code: string;
  language: Language;
  result: EvaluationResult;
  submittedAt: string;
  timeTakenSeconds: number;
};

export function CodeWorkspace({
  question,
  assessmentMode = false,
  durationSeconds,
  secondsRemaining,
  submissionHref = "/candidate/report",
  submissionLinkLabel = "Open candidate report summary",
  redirectOnSubmit = false,
  autoSubmitSeconds,
  onSubmissionComplete,
}: CodeWorkspaceProps) {
  const { user } = useAuth();
  const [language, setLanguage] = useState<Language>("Python");
  const [code, setCode] = useState(question.starterCode.Python);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [deliveryMessages, setDeliveryMessages] = useState<string[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(autoSubmitSeconds ?? null);
  const startedAtRef = useRef(new Date().toISOString());
  const submitRef = useRef<() => Promise<void>>(async () => {});

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

  const evaluateCurrentCode = useCallback(async () => {
    const options = {
      assessmentMode,
      durationSeconds,
      secondsRemaining,
    };

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          language,
          code,
          ...options,
        }),
      });
      const payload = (await response.json()) as { ok?: boolean; result?: EvaluationResult };
      if (response.ok && payload.ok && payload.result) return payload.result;
    } catch {
      // Local fallback keeps the app usable during offline development.
    }

    return evaluateCode(question, language, code, options);
  }, [assessmentMode, code, durationSeconds, language, question, secondsRemaining]);

  const submit = useCallback(async () => {
    if (submitted) return;

    setDeliveryMessages([]);
    const nextResult = await evaluateCurrentCode();
    const submittedAt = new Date().toISOString();
    const timeTakenSeconds =
      autoSubmitSeconds === undefined || secondsLeft === null
        ? Math.max(0, Math.round((Date.parse(submittedAt) - Date.parse(startedAtRef.current)) / 1000))
        : Math.max(0, autoSubmitSeconds - secondsLeft);

    setResult(nextResult);
    setSubmitted(true);
    if (user) {
      saveAttempt({
        id: crypto.randomUUID(),
        candidateId: user.id,
        candidateName: user.name,
        questionId: question.id,
        questionTitle: question.title,
        language,
        code,
        mode: assessmentMode ? "assessment" : "practice",
        startedAt: startedAtRef.current,
        submittedAt,
        timeLimitSeconds: autoSubmitSeconds,
        timeTakenSeconds,
        result: nextResult,
      });
    }
    if (onSubmissionComplete) {
      const messages = await onSubmissionComplete({
        code,
        language,
        result: nextResult,
        submittedAt,
        timeTakenSeconds,
      });
      setDeliveryMessages(messages ?? []);
    }
    if (redirectOnSubmit) {
      window.location.assign(submissionHref);
    }
  }, [
    assessmentMode,
    autoSubmitSeconds,
    code,
    evaluateCurrentCode,
    language,
    onSubmissionComplete,
    question,
    redirectOnSubmit,
    secondsLeft,
    submissionHref,
    submitted,
    user,
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

  async function runSamples() {
    setResult(await evaluateCurrentCode());
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
                Correctness {result.correctnessScore}% · Code quality {result.codeQualityScore}% ·
                Complexity {result.complexityScore}% · Speed bonus +{result.timeBonus}% · Time taken{" "}
                {result.timeTakenLabel}
              </p>
            )}
            <div className="quality-metrics">
              <span>Estimated complexity: {result.complexityLabel}</span>
              <span>Code quality: {result.codeQualityScore}%</span>
              <span>Complexity score: {result.complexityScore}%</span>
            </div>
            {result.complexityNotes.slice(0, 2).map((line) => (
              <p key={line}>{line}</p>
            ))}
            {result.feedback.map((line) => (
              <p key={line}>{line}</p>
            ))}
            {submitted && (
              <strong>
                Final submission locked. Candidate report shows the score summary; examiner view sees
                detailed outcomes.
              </strong>
            )}
            {deliveryMessages.map((message) => (
              <p key={message}>{message}</p>
            ))}
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

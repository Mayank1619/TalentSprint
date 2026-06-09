"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Play, RotateCcw, Send, TimerReset } from "lucide-react";
import { evaluateCode, type EvaluationResult } from "@/lib/evaluator";
import type { Language, Question } from "@/lib/mock-data";

type CodeWorkspaceProps = {
  question: Question;
  assessmentMode?: boolean;
  durationSeconds?: number;
  secondsRemaining?: number;
};

const languages: Language[] = ["Python", "Java", "C#"];

export function CodeWorkspace({
  question,
  assessmentMode = false,
  durationSeconds,
  secondsRemaining,
}: CodeWorkspaceProps) {
  const [language, setLanguage] = useState<Language>("Python");
  const [code, setCode] = useState(question.starterCode.Python);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const resultTone = useMemo(() => {
    if (!result) return "";
    return result.status === "passed" ? "success" : result.status === "partial" ? "warning" : "error";
  }, [result]);

  function handleLanguageChange(next: Language) {
    setLanguage(next);
    setCode(question.starterCode[next]);
    setResult(null);
    setSubmitted(false);
  }

  function runSamples() {
    setResult(evaluateCode(question, language, code));
  }

  function submit() {
    const nextResult = evaluateCode(question, language, code, {
      assessmentMode,
      durationSeconds,
      secondsRemaining,
    });
    setResult(nextResult);
    setSubmitted(true);
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
                Final submission locked. Candidate report shows the score summary; examiner view
                sees detailed outcomes.
              </strong>
            )}
            {submitted && (
              <Link className="inline-link" href="/candidate/report">
                Open candidate report summary
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

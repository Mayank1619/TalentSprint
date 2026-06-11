"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Mail, Send, Settings2 } from "lucide-react";
import {
  defaultAssessmentEmailSettings,
  isEmail,
  loadAssessmentEmailSettings,
  parseEmailList,
  saveAssessmentEmailSettings,
  type AssessmentEmailSettings,
} from "@/lib/assessment-config-store";
import { assessmentQuestions } from "@/lib/mock-data";

export function ExaminerAssessmentBuilder() {
  const [settings, setSettings] = useState<AssessmentEmailSettings>(() =>
    loadAssessmentEmailSettings(),
  );
  const [candidateEmailText, setCandidateEmailText] = useState(() =>
    loadAssessmentEmailSettings().candidateEmails.join("\n"),
  );
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const selectedQuestions = useMemo(
    () => assessmentQuestions.filter((question) => settings.questionIds.includes(question.id)),
    [settings.questionIds],
  );
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(assessmentQuestions.map((question) => question.category)))],
    [],
  );
  const visibleQuestions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return assessmentQuestions
      .filter((question) => selectedCategory === "All" || question.category === selectedCategory)
      .filter((question) => {
        if (!normalizedSearch) return true;
        return [question.title, question.category, ...question.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
      })
      .slice(0, 60);
  }, [searchTerm, selectedCategory]);

  function toggleQuestion(questionId: string) {
    setMessage(null);
    setSettings((current) => {
      const isSelected = current.questionIds.includes(questionId);
      const questionIds = isSelected
        ? current.questionIds.filter((item) => item !== questionId)
        : [...current.questionIds, questionId];

      return {
        ...current,
        questionIds: questionIds.length > 0 ? questionIds : current.questionIds,
      };
    });
  }

  function saveSettings() {
    const candidateEmails = parseEmailList(candidateEmailText);
    if (settings.sendCandidateReport && candidateEmails.length === 0) {
      setMessage("Add at least one candidate email or turn candidate report emails off.");
      return;
    }
    if (settings.sendCandidateReport && candidateEmails.some((email) => !isEmail(email))) {
      setMessage("One or more candidate email addresses are invalid.");
      return;
    }
    if (settings.sendExaminerReport && !isEmail(settings.examinerEmail)) {
      setMessage("Enter a valid examiner email address.");
      return;
    }

    const saved = saveAssessmentEmailSettings({
      ...settings,
      candidateEmails,
      updatedAt: new Date().toISOString(),
    });
    setSettings(saved);
    setMessage(
      `Assessment saved with ${selectedQuestions.length} questions. Completion emails: ${
        saved.sendCandidateReport ? "candidate on" : "candidate off"
      }, ${saved.sendExaminerReport ? "examiner on" : "examiner off"}.`,
    );
  }

  function resetDefaults() {
    setSettings(defaultAssessmentEmailSettings);
    setCandidateEmailText(defaultAssessmentEmailSettings.candidateEmails.join("\n"));
    setMessage(null);
  }

  return (
    <section className="assessment-builder" aria-labelledby="assessment-builder-heading">
      <div className="builder-heading">
        <div>
          <p className="eyebrow text-only">Build assessment</p>
          <h2 id="assessment-builder-heading">Report email rules</h2>
          <p>
            Choose who receives the online report automatically after the candidate submits.
          </p>
        </div>
        <span className="status-pill">
          <Settings2 size={14} /> Local prototype settings
        </span>
      </div>

      <div className="builder-grid">
        <label className="form-field">
          <span>Test title</span>
          <input
            value={settings.assessmentTitle}
            onChange={(event) =>
              setSettings((current) => ({ ...current, assessmentTitle: event.target.value }))
            }
          />
        </label>
        <label className="form-field">
          <span>Examiner report email</span>
          <input
            type="email"
            value={settings.examinerEmail}
            onChange={(event) =>
              setSettings((current) => ({ ...current, examinerEmail: event.target.value }))
            }
          />
        </label>
      </div>

      <label className="form-field">
        <span>Candidate invite emails</span>
        <textarea
          rows={3}
          value={candidateEmailText}
          onChange={(event) => setCandidateEmailText(event.target.value)}
          placeholder={"candidate.one@example.com\ncandidate.two@example.com"}
        />
      </label>

      <div className="email-rule-grid">
        <label>
          <input
            checked={settings.sendCandidateReport}
            onChange={(event) =>
              setSettings((current) => ({ ...current, sendCandidateReport: event.target.checked }))
            }
            type="checkbox"
          />
          <span>
            <Mail size={16} />
            Email candidate score summary after completion
          </span>
        </label>
        <label>
          <input
            checked={settings.sendExaminerReport}
            onChange={(event) =>
              setSettings((current) => ({ ...current, sendExaminerReport: event.target.checked }))
            }
            type="checkbox"
          />
          <span>
            <Mail size={16} />
            Email detailed examiner report after completion
          </span>
        </label>
      </div>

      <div className="builder-heading compact">
        <div>
          <h3>Question set</h3>
          <p>
            {selectedQuestions.length} selected for the candidate test. Showing {visibleQuestions.length} of{" "}
            {assessmentQuestions.length} assessment-enabled questions.
          </p>
        </div>
      </div>
      <div className="builder-grid">
        <label className="form-field">
          <span>Question category</span>
          <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span>Search title or tag</span>
          <input
            placeholder="Streams, Graphs, LINQ, OOP..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </label>
      </div>
      <div className="assessment-question-grid">
        {visibleQuestions.map((question) => {
          const selected = settings.questionIds.includes(question.id);
          return (
            <button
              aria-pressed={selected}
              className={selected ? "selected" : ""}
              key={question.id}
              onClick={() => toggleQuestion(question.id)}
              type="button"
            >
              <strong>{question.title}</strong>
              <span>{question.difficulty}</span>
            </button>
          );
        })}
      </div>

      <div className="builder-actions">
        <button className="button primary" onClick={saveSettings} type="button">
          <Send size={17} /> Create test
        </button>
        <button className="button ghost" onClick={resetDefaults} type="button">
          Reset defaults
        </button>
      </div>
      {message && (
        <p className={message.includes("invalid") || message.includes("Add") ? "form-message error" : "form-message"}>
          {message.includes("saved") && <CheckCircle2 size={16} />}
          {message}
        </p>
      )}
    </section>
  );
}

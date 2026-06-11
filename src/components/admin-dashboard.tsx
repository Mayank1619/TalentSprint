"use client";

import { useState } from "react";
import { Archive, Database, Eye, FilePlus2, HelpCircle, Settings2, UserCog } from "lucide-react";
import { AdminExaminerAccessPanel } from "@/components/admin-examiner-access-panel";
import { questions } from "@/lib/mock-data";

type AdminTab = "users" | "questions" | "platform";

export function AdminDashboard() {
  const [tab, setTab] = useState<AdminTab>("users");

  return (
    <>
      <section className="admin-tabs" aria-label="Admin sections">
        <button className={tab === "users" ? "selected" : ""} onClick={() => setTab("users")} type="button">
          <UserCog size={18} /> Users
        </button>
        <button
          className={tab === "questions" ? "selected" : ""}
          onClick={() => setTab("questions")}
          type="button"
        >
          <FilePlus2 size={18} /> Questions
        </button>
        <button
          className={tab === "platform" ? "selected" : ""}
          onClick={() => setTab("platform")}
          type="button"
        >
          <Settings2 size={18} /> Platform
        </button>
      </section>

      {tab === "users" && <AdminExaminerAccessPanel />}
      {tab === "questions" && <AdminQuestionSection />}
      {tab === "platform" && <AdminPlatformSection />}
    </>
  );
}

function AdminQuestionSection() {
  return (
    <section className="authoring-grid">
      <div className="table-card">
        <div className="table-heading">
          <div>
            <h2>Question library</h2>
            <span>Published drafts for practice and assessments</span>
          </div>
          <button className="button primary" type="button">
            <FilePlus2 size={18} /> New question
          </button>
        </div>
        <div className="question-library">
          {questions.map((question) => (
            <article key={question.id}>
              <div>
                <p>{question.category}</p>
                <h3>{question.title}</h3>
                <div className="tag-row">
                  <span>
                    {question.visibility === "both"
                      ? "Practice + test"
                      : question.visibility === "practice"
                        ? "Practice only"
                        : "Assessment only"}
                  </span>
                  <span>{question.points} pts</span>
                  <span>{question.estimatedMinutes} min</span>
                  {question.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
              <div className="library-actions">
                <button aria-label={`Preview ${question.title}`} className="icon-button" type="button">
                  <Eye size={18} />
                </button>
                <button aria-label={`Archive ${question.title}`} className="icon-button" type="button">
                  <Archive size={18} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <aside className="system-card">
        <HelpCircle />
        <h2>Question controls</h2>
        <p>Questions can be marked as practice-only, assessment-only, or available in both areas.</p>
        <div className="readiness-list">
          <span>Practice questions appear on the candidate practice board</span>
          <span>Assessment questions are available to examiners when creating tests</span>
          <span>Archived questions stay out of new tests while preserving historical attempts</span>
        </div>
      </aside>
    </section>
  );
}

function AdminPlatformSection() {
  return (
    <section className="admin-access-grid">
      <aside className="system-card">
        <Database />
        <h2>Provider readiness</h2>
        <p>Supabase, Resend, and Judge0-compatible providers are planned behind interfaces.</p>
        <div className="readiness-list">
          <span>Database schema: designed</span>
          <span>Auth provider: active when Supabase variables are configured</span>
          <span>Email provider: active when Resend variables are configured</span>
          <span>Execution sandbox: pending provider</span>
        </div>
      </aside>

      <aside className="system-card">
        <Settings2 />
        <h2>Admin settings</h2>
        <p>Platform-level settings will live here as the prototype grows into production workflows.</p>
        <div className="readiness-list">
          <span>Master admin email is configured through environment variables</span>
          <span>Examiner invitations use Supabase Auth admin APIs</span>
          <span>Candidate registration remains self-service</span>
        </div>
      </aside>
    </section>
  );
}

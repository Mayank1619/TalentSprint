import { Archive, Database, Eye, FilePlus2, Settings2 } from "lucide-react";
import { questions } from "@/lib/mock-data";

export default function AdminPage() {
  return (
    <main className="page-shell">
      <section className="page-heading">
        <p className="eyebrow text-only">Admin and authoring</p>
        <h1>Manage the question library and platform settings.</h1>
        <p>
          Admins approve examiner access, manage reusable question content, and keep assessment
          snapshots reproducible.
        </p>
      </section>

      <section className="toolbar-band">
        <button className="button primary" type="button">
          <FilePlus2 size={18} /> New question
        </button>
        <button className="button secondary" type="button">
          <Settings2 size={18} /> Platform settings
        </button>
      </section>

      <section className="authoring-grid">
        <div className="table-card">
          <div className="table-heading">
            <h2>Question library</h2>
            <span>Published drafts for practice and assessments</span>
          </div>
          <div className="question-library">
            {questions.map((question) => (
              <article key={question.id}>
                <div>
                  <p>{question.category}</p>
                  <h3>{question.title}</h3>
                  <div className="tag-row">
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
          <Database />
          <h2>Provider readiness</h2>
          <p>Supabase, Resend, and Judge0-compatible providers are planned behind interfaces.</p>
          <div className="readiness-list">
            <span>Database schema: designed</span>
            <span>Auth provider: pending credentials</span>
            <span>Email provider: pending API key</span>
            <span>Execution sandbox: pending provider</span>
          </div>
        </aside>
      </section>
    </main>
  );
}

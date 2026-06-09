import { CodeWorkspace } from "@/components/code-workspace";
import { questions, skillAreas } from "@/lib/mock-data";

export default function PracticePage() {
  const activeQuestion = questions[0];

  return (
    <main className="page-shell">
      <section className="page-heading">
        <p className="eyebrow text-only">Candidate practice</p>
        <h1>Build skill before the timed test.</h1>
        <p>
          Practice questions are private to the candidate in the MVP. Examiners only see formal
          assessment attempts, not practice drafts.
        </p>
      </section>

      <section className="filter-band" aria-label="Practice filters">
        {skillAreas.slice(0, 6).map((skill) => (
          <button className="filter-chip" key={skill.title} type="button">
            {skill.title}
          </button>
        ))}
      </section>

      <section className="question-list">
        {questions.map((question, index) => (
          <article className={index === 0 ? "selected" : ""} key={question.id}>
            <div>
              <p>{question.category}</p>
              <h2>{question.title}</h2>
              <span>{question.difficulty}</span>
            </div>
            <div className="tag-row">
              {question.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </article>
        ))}
      </section>

      <CodeWorkspace question={activeQuestion} />
    </main>
  );
}

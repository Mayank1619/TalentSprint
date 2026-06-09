"use client";

import { useMemo, useState } from "react";
import { ArrowDown, CheckCircle2, MousePointerClick } from "lucide-react";
import { CodeWorkspace } from "@/components/code-workspace";
import { practiceQuestions, questions, skillAreas } from "@/lib/mock-data";

export function PracticeExperience() {
  const [selectedQuestionId, setSelectedQuestionId] = useState(practiceQuestions[0]?.id ?? "");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(practiceQuestions.map((question) => question.category)))],
    [],
  );

  const filteredQuestions = useMemo(() => {
    if (selectedCategory === "All") return practiceQuestions;
    return practiceQuestions.filter((question) => question.category === selectedCategory);
  }, [selectedCategory]);

  const selectedQuestion =
    practiceQuestions.find((question) => question.id === selectedQuestionId) ?? practiceQuestions[0];

  return (
    <main className="page-shell">
      <section className="page-heading">
        <p className="eyebrow text-only">Candidate practice</p>
        <h1>Choose a question, then solve it.</h1>
        <p>
          Two-click practice flow: first choose a question card, then use the workspace below to run
          samples and submit your solution. {practiceQuestions.length} of {questions.length} banked
          questions are available for practice.
        </p>
      </section>

      <section className="practice-steps" aria-label="Practice flow">
        <article>
          <span>1</span>
          <div>
            <h2>Pick a question card</h2>
            <p>Use skill filters or browse the bank. The selected card drives the workspace.</p>
          </div>
        </article>
        <article>
          <span>2</span>
          <div>
            <h2>Try and submit</h2>
            <p>Write code, run visible samples, and submit your practice solution.</p>
          </div>
        </article>
      </section>

      <section className="filter-band" aria-label="Practice filters">
        {categories.map((category) => (
          <button
            className={`filter-chip ${category === selectedCategory ? "selected" : ""}`}
            key={category}
            onClick={() => {
              setSelectedCategory(category);
              const nextQuestion =
                category === "All"
                  ? practiceQuestions[0]
                  : practiceQuestions.find((question) => question.category === category);
              if (nextQuestion) setSelectedQuestionId(nextQuestion.id);
            }}
            type="button"
          >
            {category}
          </button>
        ))}
      </section>

      <section className="question-picker">
        <div className="picker-heading">
          <div>
            <p className="eyebrow text-only">Step 1</p>
            <h2>Select a question</h2>
          </div>
          <span>
            <MousePointerClick size={16} /> Click any card to load it below
          </span>
        </div>
        <div className="question-list interactive">
          {filteredQuestions.map((question) => {
            const isSelected = question.id === selectedQuestion.id;
            return (
              <button
                aria-pressed={isSelected}
                className={isSelected ? "selected" : ""}
                key={question.id}
                onClick={() => setSelectedQuestionId(question.id)}
                type="button"
              >
                <article>
                  <div>
                    <p>{question.category}</p>
                    <h3>{question.title}</h3>
                    <span>
                      {question.difficulty} · {question.estimatedMinutes} min · {question.points} pts
                    </span>
                  </div>
                  <div className="tag-row">
                    <span>{question.visibility === "both" ? "Practice + test" : "Practice only"}</span>
                    {question.tags.slice(0, 3).map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  {isSelected && (
                    <strong>
                      <CheckCircle2 size={16} /> Selected
                    </strong>
                  )}
                </article>
              </button>
            );
          })}
        </div>
      </section>

      <section className="try-panel" aria-live="polite">
        <div className="picker-heading">
          <div>
            <p className="eyebrow text-only">Step 2</p>
            <h2>Try: {selectedQuestion.title}</h2>
          </div>
          <span>
            <ArrowDown size={16} /> Workspace loaded from selected card
          </span>
        </div>
        <CodeWorkspace key={selectedQuestion.id} question={selectedQuestion} />
      </section>

      <section className="skill-reminder">
        {skillAreas.slice(0, 4).map((skill) => (
          <span key={skill.title}>{skill.title}</span>
        ))}
      </section>
    </main>
  );
}

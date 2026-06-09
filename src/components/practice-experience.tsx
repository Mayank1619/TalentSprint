"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, MousePointerClick } from "lucide-react";
import { practiceQuestions, questions, skillAreas } from "@/lib/mock-data";

export function PracticeExperience() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(practiceQuestions.map((question) => question.category)))],
    [],
  );

  const filteredQuestions = useMemo(() => {
    if (selectedCategory === "All") return practiceQuestions;
    return practiceQuestions.filter((question) => question.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <main className="page-shell">
      <section className="page-heading">
        <p className="eyebrow text-only">Candidate practice</p>
        <h1>Choose your next practice sprint.</h1>
        <p>
          Screen 1 is just for selecting a question. Pick a card to open a dedicated coding
          workspace, submit your solution, review the practice report, then jump to the leaderboard
          or back to the question bank. {practiceQuestions.length} of {questions.length} banked
          questions are available for practice.
        </p>
      </section>

      <section className="practice-steps" aria-label="Practice flow">
        <article>
          <span>1</span>
          <div>
            <h2>Pick a question card</h2>
            <p>Use skill filters or browse the bank. Each card opens its own solve screen.</p>
          </div>
        </article>
        <article>
          <span>2</span>
          <div>
            <h2>Practice, report, rank</h2>
            <p>Run samples, submit, review your report, and continue to the leaderboard.</p>
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
            <MousePointerClick size={16} /> Click any card to start
          </span>
        </div>
        <div className="question-list interactive">
          {filteredQuestions.map((question) => (
            <Link href={`/practice/${question.id}`} key={question.id}>
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
                <strong>
                  <ArrowRight size={16} /> Start practice
                </strong>
              </article>
            </Link>
          ))}
        </div>
      </section>

      <section className="skill-reminder">
        {skillAreas.slice(0, 4).map((skill) => (
          <span key={skill.title}>{skill.title}</span>
        ))}
      </section>
    </main>
  );
}

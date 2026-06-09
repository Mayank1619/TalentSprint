"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { SkillArea } from "@/lib/mock-data";

export function SkillCarousel({ skills }: { skills: SkillArea[] }) {
  const [offset, setOffset] = useState(0);
  const visible = skills.slice(offset, offset + 4);
  const canGoBack = offset > 0;
  const canGoNext = offset + 4 < skills.length;

  return (
    <div className="carousel-shell">
      <div className="carousel-track" aria-live="polite">
        {visible.map((skill) => (
          <article className="skill-card" key={skill.title}>
            <div className="skill-icon">{skill.icon}</div>
            <p>{skill.category}</p>
            <h3>{skill.title}</h3>
            <span>{skill.description}</span>
          </article>
        ))}
      </div>
      <div className="carousel-controls">
        <button
          aria-label="Show previous skills"
          className="icon-button"
          disabled={!canGoBack}
          onClick={() => setOffset((current) => Math.max(0, current - 1))}
          type="button"
        >
          <ChevronLeft size={18} />
        </button>
        <span>
          {offset + 1}-{Math.min(offset + 4, skills.length)} of {skills.length}
        </span>
        <button
          aria-label="Show next skills"
          className="icon-button"
          disabled={!canGoNext}
          onClick={() => setOffset((current) => Math.min(skills.length - 4, current + 1))}
          type="button"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

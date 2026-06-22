import Link from "next/link";
import { ArrowLeft, BadgeCheck, BookOpenCheck, Code2, FileCode2, FlaskConical, ShieldCheck } from "lucide-react";

const fields = [
  ["id", "Stable URL-safe slug. Do not rename after attempts exist."],
  ["title", "Candidate-facing name shown in practice, assessment, and reports."],
  ["difficulty", "Easy, Medium, or Hard. Used for filtering, expectations, and point defaults."],
  ["category", "High-level section such as Java, Python, C#, Algorithms, or Data Structures."],
  ["tags", "Specific skills such as OOP, Streams, LINQ, Graphs, Heap, or Dynamic Programming."],
  ["visibility", "practice, assessment, or both. This controls where the question appears."],
  ["estimatedMinutes", "Expected solve time. Practice and assessment timers use this value."],
  ["points", "Maximum score weight shown to examiners and candidates."],
  ["prompt", "Clear task statement with inputs, outputs, constraints, and edge cases."],
  ["sampleTests", "Visible examples candidates can run before submitting."],
  ["hiddenTests", "Count of hidden checks used for scoring and examiner confidence."],
  ["returnType", "Starter-code helper type: array, boolean, number, or string."],
];

const reviewChecklist = [
  "Prompt explains input shape, output shape, constraints, and edge cases.",
  "Visible tests teach the candidate without revealing every hidden case.",
  "Hidden tests cover empty input, duplicates, boundaries, large input, and invalid ordering.",
  "Starter code compiles or parses for Java, Python, and C#.",
  "Expected complexity is documented for examiner review.",
  "Question visibility matches its purpose: practice, assessment, or both.",
];

export default function QuestionAuthoringGuidePage() {
  return (
    <main className="page-shell">
      <section className="report-header">
        <Link className="button ghost" href="/docs">
          <ArrowLeft size={18} /> Docs
        </Link>
        <div>
          <p className="eyebrow text-only">Question authoring guide</p>
          <h1>Add questions with testable scoring rules.</h1>
          <p>
            Admins and examiners should treat every question as a small product artifact: clear
            prompt, reliable tests, appropriate visibility, and reviewable evaluation outcomes.
          </p>
        </div>
      </section>

      <section className="report-summary">
        <article>
          <BookOpenCheck />
          <h2>1. Define the skill</h2>
          <p>
            Choose the section, topic tags, expected difficulty, candidate time, and whether the
            item belongs in practice, assessment, or both.
          </p>
        </article>
        <article>
          <FlaskConical />
          <h2>2. Design the tests</h2>
          <p>
            Add visible samples for feedback and hidden cases for scoring. Hidden tests should
            include boundaries, scale, and realistic failure modes.
          </p>
        </article>
        <article>
          <BadgeCheck />
          <h2>3. Review reports</h2>
          <p>
            Confirm that report output shows correctness, code quality, complexity, time taken, and
            enough detail for the examiner to make a hiring or placement decision.
          </p>
        </article>
      </section>

      <section className="docs-section">
        <div className="table-heading">
          <h2>Question metadata</h2>
          <span>Required fields for maintainable questions</span>
        </div>
        <div className="docs-table two-column">
          {fields.map(([field, detail]) => (
            <div key={field}>
              <strong>{field}</strong>
              <span>{detail}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="docs-section">
        <div className="table-heading">
          <h2>Definition example</h2>
          <span>Use this shape when adding a new item to the bank</span>
        </div>
        <pre className="code-doc">
{`{
  id: "java-stream-score-normalizer",
  title: "Java Stream Score Normalizer",
  difficulty: "Medium",
  category: "Java",
  tags: ["Java", "Streams", "Collections"],
  visibility: "both",
  estimatedMinutes: 22,
  points: 60,
  prompt: "Normalize consultant scores by candidate and return ranked averages.",
  sampleTests: ["two candidates -> sorted averages", "empty list -> []"],
  hiddenTests: 8,
  returnType: "array",
}`}
        </pre>
      </section>

      <section className="docs-section">
        <div className="table-heading">
          <h2>Review checklist</h2>
          <span>Use before publishing a question to a real assessment</span>
        </div>
        <div className="checklist-grid">
          {reviewChecklist.map((item) => (
            <div key={item}>
              <ShieldCheck size={18} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="security-note">
        <FileCode2 />
        <p>
          The current prototype stores question definitions in source. A production version should
          move authored questions, versions, test cases, expected outputs, and review status into
          Postgres tables with administrator approval workflows.
        </p>
      </section>

      <section className="toolbar-band">
        <span>
          <Code2 size={16} /> Add visible and hidden test cases together
        </span>
        <Link className="button primary" href="/admin">
          Open admin board
        </Link>
      </section>
    </main>
  );
}

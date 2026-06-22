import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Braces,
  Clock3,
  Code2,
  Database,
  FileCode2,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  UsersRound,
} from "lucide-react";
import { SkillCarousel } from "@/components/landing/skill-carousel";
import { skillAreas } from "@/lib/mock-data";

const candidateSteps = [
  "Open a secure invite",
  "Choose Java, Python, or C#",
  "Run visible samples",
  "Submit before time expires",
  "Receive a score summary",
];

const screenshots = [
  {
    title: "Timed coding workspace",
    detail: "Prompt, timer, editor, sample tests, and final submission in one focused view.",
  },
  {
    title: "Examiner result review",
    detail: "Score, language, code snapshot, test outcomes, and invitation status for each candidate.",
  },
  {
    title: "Practice mode",
    detail: "Skill filters and private practice progress before candidates take real tests.",
  },
];

export default function Home() {
  return (
    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={16} />
            Spec-driven technical screening
          </div>
          <h1>Talent Sprint</h1>
          <p className="hero-lede">
            A HackerRank and LeetCode-style platform for practicing, testing, and reviewing real
            coding ability across Java, Python, C#, algorithms, and data structures.
          </p>
          <div className="hero-actions">
            <Link className="button primary" href="/assessment">
              Try candidate test <ArrowRight size={18} />
            </Link>
            <Link className="button secondary" href="/examiner">
              View examiner console
            </Link>
          </div>
          <div className="metric-strip" aria-label="Talent Sprint capabilities">
            <span>
              <Code2 size={18} /> 3 core languages
            </span>
            <span>
              <Clock3 size={18} /> Timed assessments
            </span>
            <span>
              <ShieldCheck size={18} /> Hidden grading tests
            </span>
          </div>
        </div>

        <div className="hero-product" aria-label="Candidate workspace preview">
          <div className="window-bar">
            <span />
            <span />
            <span />
            <strong>candidate/assessment/two-sum</strong>
          </div>
          <div className="product-grid">
            <aside>
              <p className="panel-label">Question 1</p>
              <h2>Pair Sum</h2>
              <p>
                Return the indices of two values that add up to a target. Optimize for a single
                pass solution.
              </p>
              <div className="tag-row">
                <span>Hash Map</span>
                <span>Arrays</span>
                <span>Medium</span>
              </div>
            </aside>
            <div className="code-preview">
              <pre>{`function pairSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
}`}</pre>
            </div>
            <div className="result-preview">
              <span className="status-pill success">3/3 samples passed</span>
              <span className="status-pill">Hidden tests ready</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow text-only">Skill coverage</p>
          <h2>Practice and assess the skills consultants actually use.</h2>
        </div>
        <SkillCarousel skills={skillAreas} />
      </section>

      <section className="section split-band">
        <div>
          <p className="eyebrow text-only">Candidate flow</p>
          <h2>A predictable assessment experience.</h2>
          <div className="timeline">
            {candidateSteps.map((step, index) => (
              <div className="timeline-item" key={step}>
                <span>{index + 1}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="feature-grid tight">
          <article>
            <TerminalSquare />
            <h3>Browser coding</h3>
            <p>Focused editor, sample tests, language templates, and final submission controls.</p>
          </article>
          <article>
            <BadgeCheck />
            <h3>Unit-test scoring</h3>
            <p>Visible samples for confidence and hidden tests for fair examiner-grade evaluation.</p>
          </article>
          <article>
            <BarChart3 />
            <h3>Examiner insight</h3>
            <p>Attempt status, score breakdowns, submitted code, and evaluation outcomes.</p>
          </article>
          <article>
            <UsersRound />
            <h3>Role-based access</h3>
            <p>Candidate, examiner, and administrator experiences stay clearly separated.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow text-only">Interface previews</p>
          <h2>What candidates and examiners should expect.</h2>
        </div>
        <div className="screenshot-grid">
          {screenshots.map((shot, index) => (
            <article className="mock-shot" key={shot.title}>
              <div className="shot-header">
                <span>0{index + 1}</span>
                <strong>{shot.title}</strong>
              </div>
              <div className="shot-body">
                <div />
                <div />
                <div />
              </div>
              <p>{shot.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section cta-band">
        <div>
          <p className="eyebrow text-only">Build path</p>
          <h2>Start with a local MVP, then plug in Postgres auth, email, and sandbox execution.</h2>
        </div>
        <div className="feature-grid tight">
          <article>
            <Database />
            <h3>Data-ready model</h3>
            <p>Questions, invitations, attempts, submissions, results, and audit events.</p>
          </article>
          <article>
            <FileCode2 />
            <h3>Provider boundaries</h3>
            <p>Execution and email are wrapped so Vercel stays focused on the web app.</p>
          </article>
          <article>
            <Braces />
            <h3>Spec-first delivery</h3>
            <p>Each feature can move from approved spec into its own implementation branch.</p>
          </article>
        </div>
      </section>
    </main>
  );
}

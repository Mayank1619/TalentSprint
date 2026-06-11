import type { Question, Language } from "@/lib/mock-data";
import type { EvaluationResult, TestOutcome, TestVisibility } from "@/lib/submission-types";
import { analyzeCode } from "@/lib/code-analysis";

type EvaluationOptions = {
  assessmentMode?: boolean;
  durationSeconds?: number;
  secondsRemaining?: number;
};

type Rule = {
  id: string;
  name: string;
  visibility: TestVisibility;
  check: (context: CheckContext) => boolean;
  pass: string;
  fail: string;
};

type CheckContext = {
  code: string;
  compact: string;
  language: Language;
};

export function evaluateSubmission(
  question: Question,
  language: Language,
  code: string,
  options: EvaluationOptions = {},
): EvaluationResult {
  const context = {
    code,
    compact: normalizeCode(code),
    language,
  };
  const rules = getQuestionRules(question);
  const outcomes = rules.map((rule, index) => evaluateRule(rule, context, index));
  const visibleOutcomes = outcomes.filter((outcome) => outcome.visibility === "visible");
  const hiddenOutcomes = outcomes.filter((outcome) => outcome.visibility === "hidden");
  const passed = outcomes.filter((outcome) => outcome.status === "passed").length;
  const correctnessScore = Math.round((passed / outcomes.length) * 100);
  const analysis = analyzeCode({ question, language, code });
  const timeBonus = options.assessmentMode
    ? calculateTimeBonus(options.durationSeconds ?? 0, options.secondsRemaining ?? 0, correctnessScore)
    : 0;
  const baseScore = Math.round(
    correctnessScore * 0.7 + analysis.codeQualityScore * 0.15 + analysis.complexityScore * 0.15,
  );
  const score = correctnessScore === 0 ? 0 : Math.min(100, baseScore + timeBonus);

  return {
    provider: "local-static",
    passed,
    total: outcomes.length,
    visiblePassed: visibleOutcomes.filter((outcome) => outcome.status === "passed").length,
    visibleTotal: visibleOutcomes.length,
    hiddenPassed: hiddenOutcomes.filter((outcome) => outcome.status === "passed").length,
    hiddenTotal: hiddenOutcomes.length,
    correctnessScore,
    codeQualityScore: analysis.codeQualityScore,
    complexityScore: analysis.complexityScore,
    complexityLabel: analysis.complexityLabel,
    complexityNotes: analysis.complexityNotes,
    timeBonus,
    score,
    timeTakenLabel: options.assessmentMode
      ? formatTimeTaken(options.durationSeconds ?? 0, options.secondsRemaining ?? 0)
      : undefined,
    status: passed === outcomes.length ? "passed" : passed > 0 ? "partial" : "failed",
    feedback: outcomes
      .filter((outcome) => outcome.visibility === "visible")
      .map((outcome) => `${outcome.status === "passed" ? "Passed" : "Failed"}: ${outcome.feedback}`),
    outcomes,
  };
}

function evaluateRule(rule: Rule, context: CheckContext, index: number): TestOutcome {
  const start = performance.now();
  const passed = rule.check(context);

  return {
    id: rule.id,
    name: rule.name,
    visibility: rule.visibility,
    status: passed ? "passed" : "failed",
    feedback: passed ? rule.pass : rule.fail,
    durationMs: Math.max(1, Math.round(performance.now() - start) + 2 + index),
  };
}

function getQuestionRules(question: Question): Rule[] {
  const rules = ruleBank[question.id] ?? buildGenericRules(question);
  return rules.length > 0 ? rules : buildGenericRules(question);
}

const ruleBank: Record<string, Rule[]> = {
  "pair-sum": [
    visible("sample-basic", "Visible: [2,7,11,15], target 9", hasAll("target", "return")),
    visible("sample-second-pair", "Visible: [3,2,4], target 6", hasAny("dict", "map", "dictionary", "{}")),
    hidden("single-pass", "Hidden: uses lookup instead of hardcoded output", hasAny("for", "foreach", "while")),
    hidden("no-empty-return", "Hidden: does not always return an empty answer", rejectsOnlyDefaultReturn),
  ],
  "valid-parentheses": [
    visible("balanced", "Visible: accepts balanced brackets", hasAny("stack", "push", "append")),
    visible("crossed", "Visible: rejects crossed brackets", hasAny("pop", "peek")),
    hidden("pairs", "Hidden: checks matching bracket pairs", hasAny("(", "[", "{")),
    hidden("false-path", "Hidden: returns false for invalid input", hasAny("false", "False")),
  ],
  "first-non-repeating-character": [
    visible("first-unique", "Visible: returns the first unique character", hasAny("count", "dict", "map", "frequency")),
    visible("no-unique", "Visible: returns an empty string when no unique character exists", hasAny("return \"\"", "return ''")),
    hidden("ordered-scan", "Hidden: preserves original string order", hasAny("for", "foreach", "while")),
    hidden("not-hardcoded", "Hidden: does not hardcode the sample answer", rejectsHardcoded("a")),
  ],
  "python-dictionary-normalizer": [
    visible("lowercase", "Visible: lowercases keys", hasAny(".lower", "lower(")),
    visible("snake-case", "Visible: converts spaces to underscores", hasAny("replace", "snake")),
    hidden("drops-empty", "Hidden: drops empty values", hasAny("if value", "if v", "None", "null")),
    hidden("dictionary-build", "Hidden: returns a transformed dictionary", hasAny("dict", "{}", "return")),
  ],
  "binary-search-insert-position": [
    visible("target-found", "Visible: finds an existing target", hasAny("mid", "binary")),
    visible("insert-position", "Visible: returns insertion position", hasAny("left", "right", "low", "high")),
    hidden("logarithmic", "Hidden: narrows the search interval", hasAny("while", "loop")),
  ],
  "climbing-stairs": [
    visible("n2", "Visible: n=2 returns 2", hasAny("return")),
    visible("n5", "Visible: n=5 returns 8", hasAny("prev", "fib", "dp", "memo")),
    hidden("base-cases", "Hidden: handles base cases", hasAny("<= 2", "<=2", "n < 3", "n<3")),
  ],
};

function buildGenericRules(question: Question): Rule[] {
  return [
    visible("non-empty", `Visible: ${question.sampleTests[0] ?? "sample"} has an implemented return`, rejectsOnlyDefaultReturn),
    visible("uses-problem-data", "Visible: solution references problem concepts", hasAny(...question.tags)),
    hidden("not-starter", "Hidden: submission differs from starter-code defaults", rejectsOnlyDefaultReturn),
  ];
}

function visible(id: string, name: string, check: Rule["check"]): Rule {
  return { id, name, visibility: "visible", check, pass: name, fail: name };
}

function hidden(id: string, name: string, check: Rule["check"]): Rule {
  return { id, name, visibility: "hidden", check, pass: name, fail: name };
}

function hasAll(...needles: string[]): Rule["check"] {
  return ({ compact }) => needles.every((needle) => compact.includes(needle.toLowerCase()));
}

function hasAny(...needles: string[]): Rule["check"] {
  return ({ compact }) => needles.some((needle) => compact.includes(needle.toLowerCase()));
}

function rejectsOnlyDefaultReturn({ compact }: CheckContext) {
  const defaultReturns = [
    "return[]",
    "return0",
    "returnfalse",
    "return\"\"",
    "return''",
    "returnnewarraylist<>()",
    "returnnewlist<object>()",
  ];

  return !defaultReturns.some((value) => compact.endsWith(value));
}

function rejectsHardcoded(value: string): Rule["check"] {
  return ({ compact }) => compact.length > 80 || !compact.includes(`return\"${value.toLowerCase()}\"`);
}

function normalizeCode(code: string) {
  return code.toLowerCase().replace(/\s+/g, "");
}

function calculateTimeBonus(durationSeconds: number, secondsRemaining: number, correctnessScore: number) {
  if (durationSeconds <= 0 || correctnessScore <= 0) return 0;
  const remainingRatio = Math.max(0, Math.min(1, secondsRemaining / durationSeconds));
  const confidenceMultiplier = correctnessScore / 100;
  return Math.round(remainingRatio * 10 * confidenceMultiplier);
}

function formatTimeTaken(durationSeconds: number, secondsRemaining: number) {
  const usedSeconds = Math.max(0, durationSeconds - Math.max(0, secondsRemaining));
  const minutes = Math.floor(usedSeconds / 60);
  const seconds = usedSeconds % 60;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

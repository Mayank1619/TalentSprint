import type { Language, Question } from "@/lib/mock-data";

export type CodeAnalysis = {
  codeQualityScore: number;
  complexityScore: number;
  complexityLabel: string;
  complexityNotes: string[];
};

type AnalysisContext = {
  question: Question;
  language: Language;
  code: string;
};

export function analyzeCode({ question, language, code }: AnalysisContext): CodeAnalysis {
  const rawLines = code.split(/\r?\n/);
  const lines = rawLines
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("//") && !line.startsWith("#"));
  const compact = code.toLowerCase();
  const nonEmptyLineCount = lines.length;
  const loopCount = countMatches(compact, /\b(for|while|foreach)\b/g);
  const nestedLoopRisk = hasNestedLoop(rawLines);
  const recursionRisk = hasRecursionRisk(question, compact);
  const hashLookup = /\b(map|dict|dictionary|hashmap|set|hashset|counter|lookup)\b/.test(compact);
  const sortingUsed = /\b(sort|sorted|orderby|order\s*by)\b/.test(compact);
  const meaningfulNames = estimateMeaningfulNames(language, code);
  const defaultReturnOnly = /return\s*(\[\]|0|false|""|'')\s*;?\s*$/i.test(code.trim());
  const defensiveChecks = /\b(if|try|catch|except|guard|null|none|optional)\b/i.test(code);
  const decomposition = countMatches(compact, /\b(function|def|class|interface|record|private|public|=>)\b/g);

  const complexityLabel = estimateComplexity({
    hashLookup,
    loopCount,
    nestedLoopRisk,
    question,
    recursionRisk,
    sortingUsed,
  });
  const complexityScore = scoreComplexity(complexityLabel, question);
  const codeQualityScore = clampScore(
    42 +
      Math.min(18, meaningfulNames * 3) +
      Math.min(12, decomposition * 3) +
      (defensiveChecks ? 10 : 0) +
      (nonEmptyLineCount >= 4 ? 8 : 0) +
      (nonEmptyLineCount <= 80 ? 6 : -6) +
      (defaultReturnOnly ? -35 : 0),
  );

  return {
    codeQualityScore,
    complexityScore,
    complexityLabel,
    complexityNotes: buildNotes({
      codeQualityScore,
      complexityLabel,
      complexityScore,
      defaultReturnOnly,
      defensiveChecks,
      hashLookup,
      language,
      nestedLoopRisk,
      question,
      sortingUsed,
    }),
  };
}

function estimateComplexity({
  hashLookup,
  loopCount,
  nestedLoopRisk,
  question,
  recursionRisk,
  sortingUsed,
}: {
  hashLookup: boolean;
  loopCount: number;
  nestedLoopRisk: boolean;
  question: Question;
  recursionRisk: boolean;
  sortingUsed: boolean;
}) {
  const tags = question.tags.join(" ").toLowerCase();
  if (nestedLoopRisk) return "O(n^2)";
  if (tags.includes("binary search") || compactTitle(question).includes("binary search")) return "O(log n)";
  if (sortingUsed || tags.includes("sorting") || tags.includes("topological")) return "O(n log n)";
  if (recursionRisk && (tags.includes("tree") || tags.includes("graph"))) return "O(n)";
  if (hashLookup || loopCount > 0 || tags.includes("collections") || tags.includes("stream")) return "O(n)";
  return "O(1)";
}

function scoreComplexity(complexityLabel: string, question: Question) {
  const tags = question.tags.join(" ").toLowerCase();
  const expectsLog = tags.includes("binary search");
  const expectsSorting = tags.includes("sorting") || tags.includes("topological");
  const expectsLinear = tags.includes("arrays") || tags.includes("collections") || tags.includes("hash map");

  if (expectsLog) return complexityLabel === "O(log n)" ? 100 : 72;
  if (expectsSorting) return complexityLabel === "O(n log n)" || complexityLabel === "O(n)" ? 92 : 75;
  if (expectsLinear) return complexityLabel === "O(n)" || complexityLabel === "O(1)" ? 94 : 68;
  if (complexityLabel === "O(n^2)") return 62;
  return 86;
}

function buildNotes({
  codeQualityScore,
  complexityLabel,
  complexityScore,
  defaultReturnOnly,
  defensiveChecks,
  hashLookup,
  language,
  nestedLoopRisk,
  question,
  sortingUsed,
}: {
  codeQualityScore: number;
  complexityLabel: string;
  complexityScore: number;
  defaultReturnOnly: boolean;
  defensiveChecks: boolean;
  hashLookup: boolean;
  language: Language;
  nestedLoopRisk: boolean;
  question: Question;
  sortingUsed: boolean;
}) {
  const notes = [
    `Estimated time complexity: ${complexityLabel}.`,
    `Complexity score: ${complexityScore}%.`,
    `Code quality score: ${codeQualityScore}%.`,
  ];

  if (defaultReturnOnly) notes.push("Submission still looks close to starter-code defaults.");
  if (hashLookup) notes.push("Uses lookup-style data structures, which is usually strong for collection-heavy prompts.");
  if (sortingUsed) notes.push("Uses sorting; confirm this matches the expected tradeoff for the prompt.");
  if (nestedLoopRisk) notes.push("Nested loop pattern detected; consider whether a map, set, or indexed lookup can reduce runtime.");
  if (!defensiveChecks) notes.push("Consider adding edge-case guards for null, empty, invalid, or boundary inputs.");
  if (language === "Java" && question.tags.includes("Streams")) {
    notes.push("For Java stream questions, keep collector logic readable and avoid side effects inside lambdas.");
  }
  if (language === "C#" && question.tags.includes("LINQ")) {
    notes.push("For LINQ questions, prefer clear query composition and avoid repeated enumeration.");
  }
  if (language === "Python" && question.tags.includes("Asyncio")) {
    notes.push("For asyncio questions, make failure handling explicit so one task does not hide the rest.");
  }

  return notes.slice(0, 6);
}

function compactTitle(question: Question) {
  return question.title.toLowerCase();
}

function hasNestedLoop(lines: string[]) {
  let loopIndent: number | null = null;

  for (const line of lines) {
    const indent = line.search(/\S/);
    const isLoop = /\b(for|while|foreach)\b/i.test(line);
    if (isLoop && loopIndent !== null && indent > loopIndent) return true;
    if (isLoop) loopIndent = indent;
  }

  return false;
}

function hasRecursionRisk(question: Question, compact: string) {
  const normalizedTitle = question.id.replaceAll("-", "_");
  return compact.includes(`${normalizedTitle}(`) || /\b(dfs|bfs|recurse|recursive)\b/.test(compact);
}

function estimateMeaningfulNames(language: Language, code: string) {
  const keywordPattern =
    language === "Python"
      ? /\b(def|class|for|if|return|in|and|or|not|none|true|false)\b/gi
      : /\b(public|private|class|return|new|var|int|string|bool|boolean|if|for|while|using|static)\b/gi;
  const words = code
    .replace(keywordPattern, "")
    .match(/\b[a-zA-Z_][a-zA-Z0-9_]{3,}\b/g);

  return new Set(words ?? []).size;
}

function countMatches(value: string, pattern: RegExp) {
  return value.match(pattern)?.length ?? 0;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

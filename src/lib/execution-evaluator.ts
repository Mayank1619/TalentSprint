import type { Language, Question } from "@/lib/mock-data";
import type { EvaluationResult, TestOutcome, TestVisibility } from "@/lib/submission-types";
import { analyzeCode } from "@/lib/code-analysis";

type EvaluationOptions = {
  assessmentMode?: boolean;
  durationSeconds?: number;
  secondsRemaining?: number;
};

type ExecutableTestCase = {
  id: string;
  name: string;
  visibility: TestVisibility;
  args: unknown[];
  expected: unknown;
};

type ExecutableQuestion = {
  functionName: string;
  tests: ExecutableTestCase[];
};

type RunnerOutcome = {
  id: string;
  actual?: unknown;
  error?: string;
  passed: boolean;
  durationMs?: number;
};

type PistonResponse = {
  compile?: {
    stderr?: string;
    output?: string;
  };
  run?: {
    stdout?: string;
    stderr?: string;
    output?: string;
    code?: number;
    signal?: string | null;
  };
};

type Judge0Response = {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  status?: {
    id: number;
    description: string;
  };
};

const pistonBaseUrl = process.env.PISTON_API_URL;
const judge0BaseUrl = process.env.JUDGE0_API_URL ?? "https://ce.judge0.com";
const judge0ApiKey = process.env.JUDGE0_API_KEY;
const judge0ApiHost = process.env.JUDGE0_API_HOST;

export async function evaluateWithSandbox(
  question: Question,
  language: Language,
  code: string,
  options: EvaluationOptions = {},
): Promise<EvaluationResult | null> {
  if (language !== "Python") return null;

  const executableQuestion = executableQuestions[question.id];
  if (!executableQuestion) return null;

  const outcomes = await runPythonTests(code, executableQuestion);
  if (!outcomes) return null;

  return buildResult(question, language, code, outcomes, options);
}

const executableQuestions: Record<string, ExecutableQuestion> = {
  "pair-sum": {
    functionName: "pair_sum",
    tests: [
      visible("sample-basic", "Visible: [2,7,11,15], target 9", [[2, 7, 11, 15], 9], [0, 1]),
      visible("sample-second-pair", "Visible: [3,2,4], target 6", [[3, 2, 4], 6], [1, 2]),
      hidden("duplicates", "Hidden: duplicate values", [[3, 3], 6], [0, 1]),
      hidden("negative-values", "Hidden: negative values", [[-3, 4, 3, 90], 0], [0, 2]),
    ],
  },
  "valid-parentheses": {
    functionName: "valid_parentheses",
    tests: [
      visible("balanced", "Visible: accepts balanced brackets", ["()[]{}"], true),
      visible("crossed", "Visible: rejects crossed brackets", ["([)]"], false),
      visible("nested", "Visible: accepts nested brackets", ["{[]}"], true),
      hidden("unclosed", "Hidden: rejects unclosed brackets", ["((("], false),
      hidden("closing-first", "Hidden: rejects closing bracket first", [")("], false),
    ],
  },
  "first-non-repeating-character": {
    functionName: "first_non_repeating_character",
    tests: [
      visible("first-unique", "Visible: talent -> a", ["talent"], "a"),
      visible("no-unique", "Visible: aabb -> empty string", ["aabb"], ""),
      hidden("later-unique", "Hidden: stress -> t", ["stress"], "t"),
      hidden("case-sensitive", "Hidden: Aa -> A", ["Aa"], "A"),
    ],
  },
  "python-dictionary-normalizer": {
    functionName: "python_dictionary_normalizer",
    tests: [
      visible("lowercase", "Visible: lowercases keys", [{ "First Name": "Ada" }], { first_name: "Ada" }),
      visible("drops-empty", "Visible: drops empty values", [{ Name: "", Role: "Dev" }], { role: "Dev" }),
      hidden("multi-word", "Hidden: normalizes multi-word keys", [{ "Team Name": "Core" }], { team_name: "Core" }),
      hidden("none-value", "Hidden: drops null-like values", [{ Email: null, Active: true }], { active: true }),
    ],
  },
  "binary-search-insert-position": {
    functionName: "binary_search_insert_position",
    tests: [
      visible("target-found", "Visible: target exists", [[1, 3, 5, 6], 5], 2),
      visible("insert-middle", "Visible: insert in middle", [[1, 3, 5, 6], 2], 1),
      hidden("insert-end", "Hidden: insert at end", [[1, 3, 5, 6], 7], 4),
      hidden("insert-start", "Hidden: insert at start", [[1, 3, 5, 6], 0], 0),
    ],
  },
  "climbing-stairs": {
    functionName: "climbing_stairs",
    tests: [
      visible("n2", "Visible: n=2", [2], 2),
      visible("n5", "Visible: n=5", [5], 8),
      hidden("n1", "Hidden: n=1", [1], 1),
      hidden("n10", "Hidden: n=10", [10], 89),
    ],
  },
};

async function runPythonTests(
  code: string,
  question: ExecutableQuestion,
): Promise<TestOutcome[] | null> {
  const program = buildPythonProgram(code, question);

  const pistonResult = pistonBaseUrl ? await runPistonPythonTests(program, question) : null;
  if (pistonResult) return pistonResult;

  return runJudge0PythonTests(program, question);
}

async function runJudge0PythonTests(
  program: string,
  question: ExecutableQuestion,
): Promise<TestOutcome[] | null> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (judge0ApiKey) headers["X-RapidAPI-Key"] = judge0ApiKey;
    if (judge0ApiHost) headers["X-RapidAPI-Host"] = judge0ApiHost;

    const response = await fetch(`${judge0BaseUrl}/submissions?base64_encoded=false&wait=true`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        language_id: 71,
        source_code: program,
        cpu_time_limit: 3,
        wall_time_limit: 5,
        memory_limit: 128_000,
      }),
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as Judge0Response;
    return parseRunnerOutput(
      payload.stdout?.trim(),
      question,
      payload.stderr ?? payload.compile_output ?? payload.message ?? payload.status?.description,
    );
  } catch {
    return null;
  }
}

async function runPistonPythonTests(
  program: string,
  question: ExecutableQuestion,
): Promise<TestOutcome[] | null> {
  try {
    const response = await fetch(`${pistonBaseUrl}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "python",
        version: "3.10.0",
        files: [{ name: "main.py", content: program }],
        compile_timeout: 3_000,
        run_timeout: 3_000,
      }),
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as PistonResponse;
    return parseRunnerOutput(
      payload.run?.stdout?.trim(),
      question,
      payload.run?.stderr ?? payload.run?.output ?? payload.compile?.stderr,
    );
  } catch {
    return null;
  }
}

function parseRunnerOutput(
  runnerOutput: string | null | undefined,
  question: ExecutableQuestion,
  failureReason?: string | null,
): TestOutcome[] | null {
  const resultLine = runnerOutput
    ?.split("\n")
    .find((line) => line.startsWith("__TALENT_SPRINT_RESULT__"));
  if (!resultLine) {
    return question.tests.map((test, index) =>
      failedOutcome(test, index, failureReason ?? "Submission did not produce test output."),
    );
  }

  try {
    const parsed = JSON.parse(resultLine.replace("__TALENT_SPRINT_RESULT__", "")) as RunnerOutcome[];
    return question.tests.map((test, index) => {
      const outcome = parsed.find((item) => item.id === test.id);
      if (!outcome) return failedOutcome(test, index, "Test output missing.");

      return {
        id: test.id,
        name: test.name,
        visibility: test.visibility,
        status: outcome.passed ? "passed" : "failed",
        feedback: outcome.passed
          ? test.name
          : `${test.name}. Expected ${formatValue(test.expected)}, received ${formatValue(
              outcome.error ?? outcome.actual,
            )}.`,
        durationMs: outcome.durationMs ?? 2 + index,
      };
    });
  } catch {
    return null;
  }
}

function buildPythonProgram(code: string, question: ExecutableQuestion) {
  return `${code}

import inspect
import json
import time
import traceback

_talent_tests = json.loads(${JSON.stringify(JSON.stringify(question.tests))})

def _talent_normalize(value):
    if isinstance(value, tuple):
        return list(value)
    return value

def _talent_call(function, args):
    try:
        parameter_count = len(inspect.signature(function).parameters)
    except Exception:
        parameter_count = 1
    if parameter_count <= 1:
        return function(args[0] if len(args) == 1 else args)
    return function(*args)

_talent_results = []
for _talent_test in _talent_tests:
    _talent_started = time.perf_counter()
    try:
        _talent_actual = _talent_normalize(_talent_call(${question.functionName}, _talent_test["args"]))
        _talent_passed = _talent_actual == _talent_test["expected"]
        _talent_results.append({
            "id": _talent_test["id"],
            "actual": _talent_actual,
            "passed": _talent_passed,
            "durationMs": max(1, round((time.perf_counter() - _talent_started) * 1000)),
        })
    except Exception as _talent_error:
        _talent_results.append({
            "id": _talent_test["id"],
            "error": "".join(traceback.format_exception_only(type(_talent_error), _talent_error)).strip(),
            "passed": False,
            "durationMs": max(1, round((time.perf_counter() - _talent_started) * 1000)),
        })

print("__TALENT_SPRINT_RESULT__" + json.dumps(_talent_results, separators=(",", ":")))
`;
}

function buildResult(
  question: Question,
  language: Language,
  code: string,
  outcomes: TestOutcome[],
  options: EvaluationOptions,
): EvaluationResult {
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
    provider: "external-runner",
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
    feedback: visibleOutcomes.map(
      (outcome) => `${outcome.status === "passed" ? "Passed" : "Failed"}: ${outcome.feedback}`,
    ),
    outcomes,
  };
}

function visible(
  id: string,
  name: string,
  args: unknown[],
  expected: unknown,
): ExecutableTestCase {
  return { id, name, visibility: "visible", args, expected };
}

function hidden(
  id: string,
  name: string,
  args: unknown[],
  expected: unknown,
): ExecutableTestCase {
  return { id, name, visibility: "hidden", args, expected };
}

function failedOutcome(test: ExecutableTestCase, index: number, reason: string): TestOutcome {
  return {
    id: test.id,
    name: test.name,
    visibility: test.visibility,
    status: "failed",
    feedback: `${test.name}. ${reason}`,
    durationMs: 2 + index,
  };
}

function formatValue(value: unknown) {
  return typeof value === "string" ? value : JSON.stringify(value);
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

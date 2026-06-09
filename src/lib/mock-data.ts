export type Language = "Java" | "Python" | "C#";

export type SkillArea = {
  title: string;
  category: string;
  description: string;
  icon: string;
};

export type Question = {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  tags: string[];
  prompt: string;
  starterCode: Record<Language, string>;
  sampleTests: string[];
  hiddenTests: number;
};

export type CandidateResult = {
  id: string;
  name: string;
  email: string;
  status: "Invited" | "In progress" | "Submitted" | "Completed" | "Expired";
  assessment: string;
  score: number | null;
  language: Language | null;
  submittedAt: string | null;
};

export type ReportQuestion = {
  questionId: string;
  title: string;
  language: Language;
  score: number;
  maxScore: number;
  submittedCode: string;
  visiblePassed: number;
  visibleTotal: number;
  hiddenPassed: number;
  hiddenTotal: number;
  outcomes: {
    name: string;
    visibility: "Visible" | "Hidden";
    status: "Passed" | "Failed";
    durationMs: number;
  }[];
};

export type DetailedReport = {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  examinerEmail: string;
  assessmentTitle: string;
  status: "Completed" | "Submitted" | "Grading pending";
  score: number;
  submittedAt: string;
  durationUsed: string;
  summary: string;
  strengths: string[];
  concerns: string[];
  questions: ReportQuestion[];
};

export const skillAreas: SkillArea[] = [
  {
    title: "Java ability",
    category: "Language depth",
    description: "Collections, OOP, streams, exceptions, and production-style problem solving.",
    icon: "J",
  },
  {
    title: "Python ability",
    category: "Language depth",
    description: "Data types, iterators, dictionaries, clean functions, and readable solutions.",
    icon: "Py",
  },
  {
    title: "C# ability",
    category: "Language depth",
    description: "LINQ, generics, classes, dictionaries, and .NET-oriented coding fluency.",
    icon: "C#",
  },
  {
    title: "Algorithms",
    category: "Problem solving",
    description: "Search, sorting, recursion, dynamic programming, and complexity tradeoffs.",
    icon: "A",
  },
  {
    title: "Data structures",
    category: "Problem solving",
    description: "Arrays, maps, stacks, queues, trees, graphs, and sets.",
    icon: "DS",
  },
  {
    title: "Coding ability",
    category: "Assessment readiness",
    description: "Write, run, debug, and submit working code under realistic time pressure.",
    icon: "</>",
  },
  {
    title: "Problem solving",
    category: "Assessment readiness",
    description: "Break down prompts, choose approaches, and communicate the solution clearly.",
    icon: "?",
  },
];

export const questions: Question[] = [
  {
    id: "pair-sum",
    title: "Pair Sum",
    difficulty: "Medium",
    category: "Algorithms",
    tags: ["Arrays", "Hash Map", "Single pass"],
    prompt:
      "Given an array of integers and a target, return the indices of two values that add up to the target. Assume exactly one answer exists.",
    starterCode: {
      Java: `import java.util.*;

class Solution {
  public int[] pairSum(int[] nums, int target) {
    // Write your solution here.
    return new int[] {};
  }
}`,
      Python: `def pair_sum(nums, target):
    # Write your solution here.
    return []`,
      "C#": `using System.Collections.Generic;

public class Solution {
  public int[] PairSum(int[] nums, int target) {
    // Write your solution here.
    return new int[] {};
  }
}`,
    },
    sampleTests: ["nums=[2,7,11,15], target=9 -> [0,1]", "nums=[3,2,4], target=6 -> [1,2]"],
    hiddenTests: 8,
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    category: "Data Structures",
    tags: ["Stack", "Strings", "Parsing"],
    prompt:
      "Given a string containing bracket characters, determine whether every opening bracket is closed in the correct order.",
    starterCode: {
      Java: `import java.util.*;

class Solution {
  public boolean isValid(String text) {
    // Use a stack to track opening brackets.
    return false;
  }
}`,
      Python: `def is_valid(text):
    # Use a stack to track opening brackets.
    return False`,
      "C#": `using System.Collections.Generic;

public class Solution {
  public bool IsValid(string text) {
    // Use a stack to track opening brackets.
    return false;
  }
}`,
    },
    sampleTests: ['"()[]{}" -> true', '"([)]" -> false', '"{[]}" -> true'],
    hiddenTests: 6,
  },
  {
    id: "employee-score",
    title: "Employee Score Aggregator",
    difficulty: "Medium",
    category: "Language Depth",
    tags: ["Collections", "Objects", "Sorting"],
    prompt:
      "Build a function that receives consultant score records, groups them by consultant, and returns the top performer by average score.",
    starterCode: {
      Java: `import java.util.*;

class Solution {
  public String topPerformer(List<Record> records) {
    // Group records and calculate averages.
    return "";
  }
}`,
      Python: `def top_performer(records):
    # Group records and calculate averages.
    return ""`,
      "C#": `using System.Collections.Generic;
using System.Linq;

public class Solution {
  public string TopPerformer(List<Record> records) {
    // Group records and calculate averages.
    return "";
  }
}`,
    },
    sampleTests: ["A: 80,90 and B: 95 -> B", "A: 100 and B: 70,80 -> A"],
    hiddenTests: 7,
  },
];

export const assessment = {
  title: "Consultant Core Coding Screen",
  durationMinutes: 45,
  questions: [questions[0], questions[1]],
};

export const candidateResults: CandidateResult[] = [
  {
    id: "cand-001",
    name: "Aarav Mehta",
    email: "aarav@example.com",
    status: "Completed",
    assessment: "Consultant Core Coding Screen",
    score: 86,
    language: "Python",
    submittedAt: "2026-06-09 10:42",
  },
  {
    id: "cand-002",
    name: "Priya Shah",
    email: "priya@example.com",
    status: "Submitted",
    assessment: "Consultant Core Coding Screen",
    score: 72,
    language: "Java",
    submittedAt: "2026-06-09 11:03",
  },
  {
    id: "cand-003",
    name: "Daniel Kim",
    email: "daniel@example.com",
    status: "In progress",
    assessment: "Consultant Core Coding Screen",
    score: null,
    language: "C#",
    submittedAt: null,
  },
  {
    id: "cand-004",
    name: "Maya Iyer",
    email: "maya@example.com",
    status: "Invited",
    assessment: "Consultant Core Coding Screen",
    score: null,
    language: null,
    submittedAt: null,
  },
];

export const detailedReports: DetailedReport[] = [
  {
    candidateId: "cand-001",
    candidateName: "Aarav Mehta",
    candidateEmail: "aarav@example.com",
    examinerEmail: "examiner@talentsprint.dev",
    assessmentTitle: "Consultant Core Coding Screen",
    status: "Completed",
    score: 86,
    submittedAt: "2026-06-09 10:42",
    durationUsed: "38m 12s",
    summary:
      "Strong algorithmic approach with clean Python code. Minor edge-case risk around invalid input handling.",
    strengths: [
      "Used a single-pass hash map solution for Pair Sum.",
      "Kept code readable and direct under time pressure.",
      "Passed all visible tests and most hidden tests.",
    ],
    concerns: [
      "Could add stronger input validation.",
      "Parentheses solution missed one nested edge case in hidden tests.",
    ],
    questions: [
      {
        questionId: "pair-sum",
        title: "Pair Sum",
        language: "Python",
        score: 48,
        maxScore: 50,
        submittedCode: `def pair_sum(nums, target):
    seen = {}
    for index, value in enumerate(nums):
        need = target - value
        if need in seen:
            return [seen[need], index]
        seen[value] = index
    return []`,
        visiblePassed: 2,
        visibleTotal: 2,
        hiddenPassed: 7,
        hiddenTotal: 8,
        outcomes: [
          { name: "Sample: basic pair", visibility: "Visible", status: "Passed", durationMs: 32 },
          { name: "Sample: unordered pair", visibility: "Visible", status: "Passed", durationMs: 28 },
          { name: "Hidden: duplicate values", visibility: "Hidden", status: "Passed", durationMs: 35 },
          { name: "Hidden: negative numbers", visibility: "Hidden", status: "Passed", durationMs: 33 },
        ],
      },
      {
        questionId: "valid-parentheses",
        title: "Valid Parentheses",
        language: "Python",
        score: 38,
        maxScore: 50,
        submittedCode: `def is_valid(text):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for ch in text:
        if ch in pairs.values():
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
    return len(stack) == 0`,
        visiblePassed: 3,
        visibleTotal: 3,
        hiddenPassed: 4,
        hiddenTotal: 6,
        outcomes: [
          { name: "Sample: all bracket types", visibility: "Visible", status: "Passed", durationMs: 19 },
          { name: "Sample: crossed brackets", visibility: "Visible", status: "Passed", durationMs: 17 },
          { name: "Hidden: long nested string", visibility: "Hidden", status: "Passed", durationMs: 22 },
          { name: "Hidden: ignored characters", visibility: "Hidden", status: "Failed", durationMs: 18 },
        ],
      },
    ],
  },
];

export function getDetailedReport(candidateId: string) {
  return detailedReports.find((report) => report.candidateId === candidateId) ?? detailedReports[0];
}

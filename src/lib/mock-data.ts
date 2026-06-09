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

export type Language = "Java" | "Python" | "C#";
export type QuestionVisibility = "practice" | "assessment" | "both";

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
  visibility: QuestionVisibility;
  estimatedMinutes: number;
  points: number;
  prompt: string;
  starterCode: Record<Language, string>;
  sampleTests: string[];
  hiddenTests: number;
};

type QuestionDefinition = Omit<Question, "starterCode"> & {
  returnType?: "array" | "boolean" | "number" | "string";
};

export type QuestionBankSection = {
  category: string;
  targetCount: number;
};

export type PracticeLeaderboardEntry = {
  rank: number;
  candidateName: string;
  primaryLanguage: Language;
  solved: number;
  attempts: number;
  averageScore: number;
  fastestSolve: string;
  streakDays: number;
  badge: string;
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
  codeQualityScore: number;
  complexityScore: number;
  complexityLabel: string;
  complexityNotes: string[];
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

const seedQuestions: Question[] = [
  makeQuestion({
    id: "pair-sum",
    title: "Pair Sum",
    difficulty: "Medium",
    category: "Algorithms",
    tags: ["Arrays", "Hash Map", "Single pass"],
    visibility: "both",
    estimatedMinutes: 18,
    points: 50,
    prompt:
      "Given an array of integers and a target, return the indices of two values that add up to the target. Assume exactly one answer exists.",
    sampleTests: ["nums=[2,7,11,15], target=9 -> [0,1]", "nums=[3,2,4], target=6 -> [1,2]"],
    hiddenTests: 8,
  }),
  makeQuestion({
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    category: "Data Structures",
    tags: ["Stack", "Strings", "Parsing"],
    visibility: "both",
    estimatedMinutes: 12,
    points: 40,
    prompt:
      "Given a string containing bracket characters, determine whether every opening bracket is closed in the correct order.",
    sampleTests: ['"()[]{}" -> true', '"([)]" -> false', '"{[]}" -> true'],
    hiddenTests: 6,
  }),
  makeQuestion({
    id: "employee-score",
    title: "Employee Score Aggregator",
    difficulty: "Medium",
    category: "Language Depth",
    tags: ["Collections", "Objects", "Sorting"],
    visibility: "assessment",
    estimatedMinutes: 22,
    points: 60,
    prompt:
      "Build a function that receives consultant score records, groups them by consultant, and returns the top performer by average score.",
    sampleTests: ["A: 80,90 and B: 95 -> B", "A: 100 and B: 70,80 -> A"],
    hiddenTests: 7,
  }),
];

const generatedQuestionDefinitions: QuestionDefinition[] = [
  {
    id: "merge-intervals",
    title: "Merge Intervals",
    difficulty: "Medium",
    category: "Algorithms",
    tags: ["Sorting", "Intervals", "Arrays"],
    visibility: "assessment",
    estimatedMinutes: 25,
    points: 60,
    prompt: "Merge all overlapping intervals and return the condensed interval list.",
    sampleTests: ["[[1,3],[2,6],[8,10]] -> [[1,6],[8,10]]", "[[1,4],[4,5]] -> [[1,5]]"],
    hiddenTests: 9,
    returnType: "array",
  },
  {
    id: "binary-search-insert-position",
    title: "Binary Search Insert Position",
    difficulty: "Easy",
    category: "Algorithms",
    tags: ["Binary Search", "Arrays"],
    visibility: "practice",
    estimatedMinutes: 10,
    points: 30,
    prompt: "Return the index of the target or the position where it should be inserted.",
    sampleTests: ["nums=[1,3,5,6], target=5 -> 2", "nums=[1,3,5,6], target=2 -> 1"],
    hiddenTests: 5,
    returnType: "number",
  },
  {
    id: "first-non-repeating-character",
    title: "First Non-Repeating Character",
    difficulty: "Easy",
    category: "Data Structures",
    tags: ["Hash Map", "Strings", "Counting"],
    visibility: "both",
    estimatedMinutes: 12,
    points: 35,
    prompt: "Return the first character in a string that appears exactly once, or an empty string.",
    sampleTests: ['"talent" -> "a"', '"aabb" -> ""'],
    hiddenTests: 6,
    returnType: "string",
  },
  {
    id: "kth-largest-element",
    title: "Kth Largest Element",
    difficulty: "Medium",
    category: "Data Structures",
    tags: ["Heap", "Sorting", "Arrays"],
    visibility: "assessment",
    estimatedMinutes: 20,
    points: 55,
    prompt: "Return the kth largest value in an unsorted array.",
    sampleTests: ["nums=[3,2,1,5,6,4], k=2 -> 5", "nums=[3,2,3,1,2,4,5,5,6], k=4 -> 4"],
    hiddenTests: 9,
    returnType: "number",
  },
  {
    id: "reverse-linked-list",
    title: "Reverse Linked List",
    difficulty: "Easy",
    category: "Data Structures",
    tags: ["Linked List", "Pointers"],
    visibility: "practice",
    estimatedMinutes: 14,
    points: 35,
    prompt: "Reverse a singly linked list and return the new head.",
    sampleTests: ["1->2->3 -> 3->2->1", "empty -> empty"],
    hiddenTests: 5,
    returnType: "array",
  },
  {
    id: "lowest-common-ancestor",
    title: "Lowest Common Ancestor",
    difficulty: "Medium",
    category: "Trees",
    tags: ["Tree", "DFS", "Recursion"],
    visibility: "assessment",
    estimatedMinutes: 24,
    points: 65,
    prompt: "Find the lowest common ancestor of two nodes in a binary tree.",
    sampleTests: ["root=[3,5,1,6,2,0,8], p=5, q=1 -> 3", "p=5, q=4 -> 5"],
    hiddenTests: 8,
    returnType: "number",
  },
  {
    id: "level-order-traversal",
    title: "Level Order Traversal",
    difficulty: "Medium",
    category: "Trees",
    tags: ["Tree", "BFS", "Queue"],
    visibility: "both",
    estimatedMinutes: 18,
    points: 50,
    prompt: "Return the values of a binary tree grouped by depth from top to bottom.",
    sampleTests: ["[3,9,20,null,null,15,7] -> [[3],[9,20],[15,7]]", "[] -> []"],
    hiddenTests: 7,
    returnType: "array",
  },
  {
    id: "detect-cycle-directed-graph",
    title: "Detect Cycle in Directed Graph",
    difficulty: "Medium",
    category: "Graphs",
    tags: ["Graph", "DFS", "Topological Sort"],
    visibility: "assessment",
    estimatedMinutes: 28,
    points: 70,
    prompt: "Determine whether a directed graph contains a cycle.",
    sampleTests: ["0->1->2->0 -> true", "0->1, 1->2 -> false"],
    hiddenTests: 10,
    returnType: "boolean",
  },
  {
    id: "shortest-path-grid",
    title: "Shortest Path in Grid",
    difficulty: "Medium",
    category: "Graphs",
    tags: ["BFS", "Matrix", "Queue"],
    visibility: "assessment",
    estimatedMinutes: 30,
    points: 75,
    prompt: "Return the shortest path length from the top-left cell to the bottom-right cell in a grid.",
    sampleTests: ["[[0,0],[1,0]] -> 3", "blocked path -> -1"],
    hiddenTests: 11,
    returnType: "number",
  },
  {
    id: "climbing-stairs",
    title: "Climbing Stairs",
    difficulty: "Easy",
    category: "Dynamic Programming",
    tags: ["DP", "Fibonacci"],
    visibility: "practice",
    estimatedMinutes: 10,
    points: 30,
    prompt: "Return how many distinct ways there are to climb n stairs taking 1 or 2 steps.",
    sampleTests: ["n=2 -> 2", "n=5 -> 8"],
    hiddenTests: 5,
    returnType: "number",
  },
  {
    id: "coin-change-minimum",
    title: "Coin Change Minimum",
    difficulty: "Medium",
    category: "Dynamic Programming",
    tags: ["DP", "Arrays", "Optimization"],
    visibility: "assessment",
    estimatedMinutes: 30,
    points: 75,
    prompt: "Return the minimum number of coins needed to make an amount, or -1 if impossible.",
    sampleTests: ["coins=[1,2,5], amount=11 -> 3", "coins=[2], amount=3 -> -1"],
    hiddenTests: 10,
    returnType: "number",
  },
  {
    id: "longest-increasing-subsequence",
    title: "Longest Increasing Subsequence",
    difficulty: "Hard",
    category: "Dynamic Programming",
    tags: ["DP", "Binary Search", "Arrays"],
    visibility: "assessment",
    estimatedMinutes: 35,
    points: 90,
    prompt: "Return the length of the longest strictly increasing subsequence.",
    sampleTests: ["[10,9,2,5,3,7,101,18] -> 4", "[0,1,0,3,2,3] -> 4"],
    hiddenTests: 12,
    returnType: "number",
  },
  {
    id: "java-stream-grouping",
    title: "Java Stream Grouping",
    difficulty: "Medium",
    category: "Java",
    tags: ["Java", "Streams", "Collections"],
    visibility: "practice",
    estimatedMinutes: 20,
    points: 45,
    prompt: "Group orders by customer and return the total order value per customer.",
    sampleTests: ["A:10,A:15,B:7 -> A:25,B:7", "empty -> empty"],
    hiddenTests: 6,
    returnType: "array",
  },
  {
    id: "java-exception-safe-parser",
    title: "Java Exception-Safe Parser",
    difficulty: "Easy",
    category: "Java",
    tags: ["Java", "Exceptions", "Parsing"],
    visibility: "practice",
    estimatedMinutes: 12,
    points: 30,
    prompt: "Parse a list of strings into integers and skip invalid values without failing.",
    sampleTests: ['["1","x","2"] -> [1,2]', '["bad"] -> []'],
    hiddenTests: 5,
    returnType: "array",
  },
  {
    id: "python-dictionary-normalizer",
    title: "Python Dictionary Normalizer",
    difficulty: "Easy",
    category: "Python",
    tags: ["Python", "Dictionary", "Strings"],
    visibility: "practice",
    estimatedMinutes: 10,
    points: 30,
    prompt: "Normalize dictionary keys to lowercase snake_case and remove empty values.",
    sampleTests: ['{"First Name":"Ada"} -> {"first_name":"Ada"}', "empty values removed"],
    hiddenTests: 5,
    returnType: "array",
  },
  {
    id: "python-generator-window",
    title: "Python Sliding Window Generator",
    difficulty: "Medium",
    category: "Python",
    tags: ["Python", "Generators", "Sliding Window"],
    visibility: "assessment",
    estimatedMinutes: 22,
    points: 55,
    prompt: "Yield all fixed-size windows from an iterable without materializing unnecessary state.",
    sampleTests: ["[1,2,3,4], size=2 -> [1,2],[2,3],[3,4]", "size too large -> []"],
    hiddenTests: 8,
    returnType: "array",
  },
  {
    id: "csharp-linq-top-customers",
    title: "C# LINQ Top Customers",
    difficulty: "Medium",
    category: "C#",
    tags: ["C#", "LINQ", "Collections"],
    visibility: "practice",
    estimatedMinutes: 20,
    points: 45,
    prompt: "Return the top three customers by total purchase amount using clean collection logic.",
    sampleTests: ["A:20,B:50,A:40 -> A,B", "ties sorted by name"],
    hiddenTests: 7,
    returnType: "array",
  },
  {
    id: "csharp-null-safe-transform",
    title: "C# Null-Safe Transform",
    difficulty: "Easy",
    category: "C#",
    tags: ["C#", "Null Safety", "Strings"],
    visibility: "practice",
    estimatedMinutes: 12,
    points: 30,
    prompt: "Transform optional profile fields into display names while safely handling nulls.",
    sampleTests: ["first=Grace,last=Hopper -> Grace Hopper", "null fields -> Unknown"],
    hiddenTests: 5,
    returnType: "string",
  },
  {
    id: "java-interface-notification-router",
    title: "Java Interface Notification Router",
    difficulty: "Medium",
    category: "Java",
    tags: ["Java", "OOP", "Interfaces", "Abstraction"],
    visibility: "assessment",
    estimatedMinutes: 24,
    points: 60,
    prompt:
      "Design a notification router that accepts channel implementations through an interface and dispatches messages only to enabled channels.",
    sampleTests: ["email+sms enabled -> 2 sends", "disabled push channel -> skipped"],
    hiddenTests: 8,
    returnType: "array",
  },
  {
    id: "java-abstract-shape-calculator",
    title: "Java Abstract Shape Calculator",
    difficulty: "Medium",
    category: "Java",
    tags: ["Java", "OOP", "Abstract Classes", "Polymorphism"],
    visibility: "practice",
    estimatedMinutes: 22,
    points: 55,
    prompt:
      "Model shapes with a shared abstraction and return the total area for a mixed list of circles and rectangles.",
    sampleTests: ["circle r=1 + rectangle 2x3 -> 9.14", "empty shapes -> 0"],
    hiddenTests: 7,
    returnType: "number",
  },
  {
    id: "java-generic-cache",
    title: "Java Generic Cache",
    difficulty: "Medium",
    category: "Java",
    tags: ["Java", "Generics", "Collections"],
    visibility: "both",
    estimatedMinutes: 24,
    points: 60,
    prompt:
      "Implement a type-safe generic cache with put, get, contains, and remove behavior while preserving insertion order.",
    sampleTests: ["put user:1 -> get returns value", "remove missing key -> no failure"],
    hiddenTests: 8,
    returnType: "array",
  },
  {
    id: "java-stream-top-skills",
    title: "Java Stream Top Skills",
    difficulty: "Medium",
    category: "Java",
    tags: ["Java", "Streams", "Collectors", "Sorting"],
    visibility: "practice",
    estimatedMinutes: 20,
    points: 50,
    prompt:
      "Use stream-style collection processing to count candidate skills and return the top skills by frequency, breaking ties alphabetically.",
    sampleTests: ["java,python,java -> java:2,python:1", "ties -> alphabetical"],
    hiddenTests: 7,
    returnType: "array",
  },
  {
    id: "java-lambda-rule-engine",
    title: "Java Lambda Rule Engine",
    difficulty: "Medium",
    category: "Java",
    tags: ["Java", "Lambdas", "Functional Interfaces", "Validation"],
    visibility: "assessment",
    estimatedMinutes: 26,
    points: 65,
    prompt:
      "Apply a configurable list of predicate-style validation rules to candidate profiles and return every failed rule code.",
    sampleTests: ["missing email -> EMAIL_REQUIRED", "valid profile -> []"],
    hiddenTests: 9,
    returnType: "array",
  },
  {
    id: "java-collection-deduplicator",
    title: "Java Collection Deduplicator",
    difficulty: "Easy",
    category: "Java",
    tags: ["Java", "Collections", "Sets", "Ordering"],
    visibility: "practice",
    estimatedMinutes: 12,
    points: 35,
    prompt:
      "Remove duplicate consultant identifiers while preserving the first-seen order and normalizing whitespace.",
    sampleTests: ['[" A ","B","A"] -> ["A","B"]', "empty list -> []"],
    hiddenTests: 6,
    returnType: "array",
  },
  {
    id: "java-thread-safe-counter",
    title: "Java Thread-Safe Counter",
    difficulty: "Hard",
    category: "Java",
    tags: ["Java", "Concurrency", "Synchronization", "Multithreading"],
    visibility: "assessment",
    estimatedMinutes: 32,
    points: 90,
    prompt:
      "Implement a counter service that supports concurrent increments and returns deterministic totals for each named metric.",
    sampleTests: ["10 increments across workers -> 10", "two metric names tracked separately"],
    hiddenTests: 12,
    returnType: "array",
  },
  {
    id: "java-completablefuture-aggregator",
    title: "Java CompletableFuture Aggregator",
    difficulty: "Hard",
    category: "Java",
    tags: ["Java", "CompletableFuture", "Async", "Concurrency"],
    visibility: "assessment",
    estimatedMinutes: 34,
    points: 90,
    prompt:
      "Combine asynchronous score lookups, ignore failed lookups, and return the average completed score per consultant.",
    sampleTests: ["A scores 80,90 -> 85", "failed lookup skipped"],
    hiddenTests: 12,
    returnType: "array",
  },
  {
    id: "java-optional-profile-formatter",
    title: "Java Optional Profile Formatter",
    difficulty: "Easy",
    category: "Java",
    tags: ["Java", "Optional", "Null Safety", "Strings"],
    visibility: "practice",
    estimatedMinutes: 12,
    points: 35,
    prompt:
      "Format candidate profile display names using optional fields without throwing on missing first name, last name, or title.",
    sampleTests: ["Ada Lovelace -> Ada Lovelace", "missing names -> Unknown Candidate"],
    hiddenTests: 6,
    returnType: "string",
  },
  {
    id: "java-record-immutability-check",
    title: "Java Record Immutability Check",
    difficulty: "Medium",
    category: "Java",
    tags: ["Java", "Records", "Immutability", "Value Objects"],
    visibility: "assessment",
    estimatedMinutes: 18,
    points: 50,
    prompt:
      "Convert raw assessment rows into immutable value objects and reject rows with missing candidate id or negative scores.",
    sampleTests: ["valid row -> record emitted", "negative score -> rejected"],
    hiddenTests: 7,
    returnType: "array",
  },
  {
    id: "java-enum-state-machine",
    title: "Java Enum State Machine",
    difficulty: "Medium",
    category: "Java",
    tags: ["Java", "Enums", "State Machine", "OOP"],
    visibility: "both",
    estimatedMinutes: 20,
    points: 50,
    prompt:
      "Implement legal assessment status transitions using enum-based state rules and reject invalid transitions.",
    sampleTests: ["Invited -> InProgress -> Submitted", "Completed -> InProgress rejected"],
    hiddenTests: 8,
    returnType: "boolean",
  },
  {
    id: "java-collector-partitioning",
    title: "Java Collector Partitioning",
    difficulty: "Medium",
    category: "Java",
    tags: ["Java", "Streams", "Partitioning", "Collectors"],
    visibility: "practice",
    estimatedMinutes: 18,
    points: 45,
    prompt:
      "Partition assessment submissions into passing and needs-review groups, returning stable candidate id ordering in each group.",
    sampleTests: ["scores 90,40 -> pass:[90], review:[40]", "threshold boundary included"],
    hiddenTests: 7,
    returnType: "array",
  },
  {
    id: "python-dataclass-scorebook",
    title: "Python Dataclass Scorebook",
    difficulty: "Medium",
    category: "Python",
    tags: ["Python", "Dataclasses", "OOP", "Collections"],
    visibility: "both",
    estimatedMinutes: 22,
    points: 55,
    prompt:
      "Represent candidate scores with dataclasses and return each candidate's best score with deterministic ordering.",
    sampleTests: ["Ada:70,Ada:95 -> Ada:95", "ties sorted by name"],
    hiddenTests: 8,
    returnType: "array",
  },
  {
    id: "python-abc-payment-strategy",
    title: "Python ABC Payment Strategy",
    difficulty: "Medium",
    category: "Python",
    tags: ["Python", "ABC", "Abstraction", "Strategy Pattern"],
    visibility: "assessment",
    estimatedMinutes: 24,
    points: 60,
    prompt:
      "Use a strategy-style abstraction to calculate invoice totals for hourly, fixed-price, and discounted engagements.",
    sampleTests: ["hourly 10x50 -> 500", "discounted fixed -> reduced total"],
    hiddenTests: 8,
    returnType: "number",
  },
  {
    id: "python-comprehension-indexer",
    title: "Python Comprehension Indexer",
    difficulty: "Easy",
    category: "Python",
    tags: ["Python", "Comprehensions", "Dictionaries", "Collections"],
    visibility: "practice",
    estimatedMinutes: 12,
    points: 35,
    prompt:
      "Build a normalized lookup dictionary from candidate rows using comprehensions while skipping inactive records.",
    sampleTests: ["active Ada -> {'ada': row}", "inactive skipped"],
    hiddenTests: 6,
    returnType: "array",
  },
  {
    id: "python-lambda-sorter",
    title: "Python Lambda Sorter",
    difficulty: "Easy",
    category: "Python",
    tags: ["Python", "Lambdas", "Sorting", "Tuples"],
    visibility: "practice",
    estimatedMinutes: 12,
    points: 35,
    prompt:
      "Sort candidate tuples by descending score, then ascending completion time, then name using key functions.",
    sampleTests: ["score tie uses faster time", "time tie uses name"],
    hiddenTests: 6,
    returnType: "array",
  },
  {
    id: "python-typing-generic-repository",
    title: "Python Typed Generic Repository",
    difficulty: "Medium",
    category: "Python",
    tags: ["Python", "Typing", "Generics", "Repository Pattern"],
    visibility: "assessment",
    estimatedMinutes: 24,
    points: 60,
    prompt:
      "Implement a typed repository-style API that stores entities by id and returns predictable snapshots for tests.",
    sampleTests: ["save id=1 -> get id=1", "missing id -> none/default"],
    hiddenTests: 8,
    returnType: "array",
  },
  {
    id: "python-context-manager-timer",
    title: "Python Context Manager Timer",
    difficulty: "Medium",
    category: "Python",
    tags: ["Python", "Context Managers", "Timing", "Resource Handling"],
    visibility: "practice",
    estimatedMinutes: 20,
    points: 50,
    prompt:
      "Create a context-manager-style timing collector that records named operation durations and returns summary metrics.",
    sampleTests: ["two operations recorded", "empty collector -> zero summary"],
    hiddenTests: 7,
    returnType: "array",
  },
  {
    id: "python-asyncio-score-fetcher",
    title: "Python Asyncio Score Fetcher",
    difficulty: "Hard",
    category: "Python",
    tags: ["Python", "Asyncio", "Concurrency", "Error Handling"],
    visibility: "assessment",
    estimatedMinutes: 34,
    points: 90,
    prompt:
      "Run asynchronous candidate score fetches concurrently, collect successful results, and record failures without cancelling all work.",
    sampleTests: ["three successful fetches -> three scores", "one failure -> error entry"],
    hiddenTests: 12,
    returnType: "array",
  },
  {
    id: "python-threaded-work-queue",
    title: "Python Threaded Work Queue",
    difficulty: "Hard",
    category: "Python",
    tags: ["Python", "Threads", "Queue", "Concurrency"],
    visibility: "assessment",
    estimatedMinutes: 32,
    points: 85,
    prompt:
      "Process submitted jobs with worker threads and return completed job ids in completion order without losing failed jobs.",
    sampleTests: ["three jobs -> all completed", "failed job -> captured as failed"],
    hiddenTests: 11,
    returnType: "array",
  },
  {
    id: "python-decorator-permission-check",
    title: "Python Decorator Permission Check",
    difficulty: "Medium",
    category: "Python",
    tags: ["Python", "Decorators", "Authorization", "Functions"],
    visibility: "both",
    estimatedMinutes: 20,
    points: 50,
    prompt:
      "Write decorator-style access rules that allow examiners and admins to view detailed reports while blocking candidates.",
    sampleTests: ["admin -> allowed", "candidate -> blocked"],
    hiddenTests: 8,
    returnType: "boolean",
  },
  {
    id: "python-iterator-batch-reader",
    title: "Python Iterator Batch Reader",
    difficulty: "Medium",
    category: "Python",
    tags: ["Python", "Iterators", "Generators", "Batching"],
    visibility: "practice",
    estimatedMinutes: 18,
    points: 45,
    prompt:
      "Read an arbitrary iterable in fixed-size batches without materializing all input values at once.",
    sampleTests: ["1..5 size=2 -> [1,2],[3,4],[5]", "empty iterable -> []"],
    hiddenTests: 7,
    returnType: "array",
  },
  {
    id: "python-protocol-serializer",
    title: "Python Protocol Serializer",
    difficulty: "Medium",
    category: "Python",
    tags: ["Python", "Protocols", "Duck Typing", "Serialization"],
    visibility: "assessment",
    estimatedMinutes: 24,
    points: 60,
    prompt:
      "Serialize mixed objects that expose a compatible to_dict behavior and reject objects that do not satisfy the protocol.",
    sampleTests: ["object with to_dict -> dict", "plain object -> rejected"],
    hiddenTests: 8,
    returnType: "array",
  },
  {
    id: "python-collections-counter-report",
    title: "Python Collections Counter Report",
    difficulty: "Easy",
    category: "Python",
    tags: ["Python", "Counter", "Collections", "Reporting"],
    visibility: "practice",
    estimatedMinutes: 12,
    points: 35,
    prompt:
      "Use counter-style collection logic to return the most frequent failing test names from a submission log.",
    sampleTests: ["A,A,B -> A:2,B:1", "ties sorted alphabetically"],
    hiddenTests: 6,
    returnType: "array",
  },
  {
    id: "csharp-interface-discount-policy",
    title: "C# Interface Discount Policy",
    difficulty: "Medium",
    category: "C#",
    tags: ["C#", "Interfaces", "Abstraction", "OOP"],
    visibility: "assessment",
    estimatedMinutes: 24,
    points: 60,
    prompt:
      "Apply discount policy implementations through an interface and return the final invoice total for each consultant contract.",
    sampleTests: ["standard policy -> unchanged", "preferred policy -> discounted"],
    hiddenTests: 8,
    returnType: "array",
  },
  {
    id: "csharp-abstract-assessment-scorer",
    title: "C# Abstract Assessment Scorer",
    difficulty: "Medium",
    category: "C#",
    tags: ["C#", "Abstract Classes", "Polymorphism", "OOP"],
    visibility: "practice",
    estimatedMinutes: 22,
    points: 55,
    prompt:
      "Use a base scorer abstraction with concrete language scorers and return normalized totals for Java, Python, and C# attempts.",
    sampleTests: ["python scorer bonus applied", "unknown scorer skipped"],
    hiddenTests: 8,
    returnType: "array",
  },
  {
    id: "csharp-generic-result-wrapper",
    title: "C# Generic Result Wrapper",
    difficulty: "Medium",
    category: "C#",
    tags: ["C#", "Generics", "Result Pattern", "Error Handling"],
    visibility: "both",
    estimatedMinutes: 20,
    points: 50,
    prompt:
      "Implement a generic result wrapper that carries success values or validation errors and supports mapping to another value type.",
    sampleTests: ["Success<int>.Map -> Success<string>", "Failure.Map keeps errors"],
    hiddenTests: 8,
    returnType: "array",
  },
  {
    id: "csharp-lambda-predicate-filter",
    title: "C# Lambda Predicate Filter",
    difficulty: "Easy",
    category: "C#",
    tags: ["C#", "Lambdas", "Delegates", "Filtering"],
    visibility: "practice",
    estimatedMinutes: 12,
    points: 35,
    prompt:
      "Filter candidate rows using composable predicate delegates for role, active status, and minimum score.",
    sampleTests: ["active + score>=70 retained", "inactive skipped"],
    hiddenTests: 6,
    returnType: "array",
  },
  {
    id: "csharp-linq-skill-matrix",
    title: "C# LINQ Skill Matrix",
    difficulty: "Medium",
    category: "C#",
    tags: ["C#", "LINQ", "Grouping", "Collections"],
    visibility: "assessment",
    estimatedMinutes: 24,
    points: 60,
    prompt:
      "Group consultant skill ratings by skill using LINQ-style logic and return average rating per skill in descending order.",
    sampleTests: ["Java:4,Java:2 -> Java:3", "ties sorted by skill name"],
    hiddenTests: 8,
    returnType: "array",
  },
  {
    id: "csharp-record-value-equality",
    title: "C# Record Value Equality",
    difficulty: "Easy",
    category: "C#",
    tags: ["C#", "Records", "Immutability", "Value Objects"],
    visibility: "practice",
    estimatedMinutes: 14,
    points: 35,
    prompt:
      "Convert raw candidate rows into immutable value objects and remove duplicates using value equality semantics.",
    sampleTests: ["duplicate candidate row -> one value", "changed score -> distinct value"],
    hiddenTests: 6,
    returnType: "array",
  },
  {
    id: "csharp-async-report-loader",
    title: "C# Async Report Loader",
    difficulty: "Hard",
    category: "C#",
    tags: ["C#", "Async Await", "Tasks", "Concurrency"],
    visibility: "assessment",
    estimatedMinutes: 34,
    points: 90,
    prompt:
      "Load candidate report sections concurrently, handle failed sections, and return a completed report summary.",
    sampleTests: ["all sections succeed -> complete", "one failed section -> partial"],
    hiddenTests: 12,
    returnType: "array",
  },
  {
    id: "csharp-threadsafe-score-accumulator",
    title: "C# Thread-Safe Score Accumulator",
    difficulty: "Hard",
    category: "C#",
    tags: ["C#", "Threading", "Locks", "Concurrent Collections"],
    visibility: "assessment",
    estimatedMinutes: 32,
    points: 85,
    prompt:
      "Accumulate scores from concurrent workers and return deterministic totals per assessment without race conditions.",
    sampleTests: ["parallel updates total correctly", "separate assessments isolated"],
    hiddenTests: 11,
    returnType: "array",
  },
  {
    id: "csharp-extension-method-cleaner",
    title: "C# Extension Method Cleaner",
    difficulty: "Medium",
    category: "C#",
    tags: ["C#", "Extension Methods", "Strings", "Collections"],
    visibility: "practice",
    estimatedMinutes: 18,
    points: 45,
    prompt:
      "Create extension-style cleanup behavior for candidate names and emails, returning normalized unique contacts.",
    sampleTests: ["trim/lower email", "duplicate normalized email removed"],
    hiddenTests: 7,
    returnType: "array",
  },
  {
    id: "csharp-pattern-matching-router",
    title: "C# Pattern Matching Router",
    difficulty: "Medium",
    category: "C#",
    tags: ["C#", "Pattern Matching", "Switch Expressions", "OOP"],
    visibility: "both",
    estimatedMinutes: 20,
    points: 50,
    prompt:
      "Route assessment events to action codes using pattern matching on event type, role, and current status.",
    sampleTests: ["CandidateSubmitted -> grade", "AdminCancelled -> close"],
    hiddenTests: 8,
    returnType: "string",
  },
  {
    id: "csharp-ienumerable-pipeline",
    title: "C# IEnumerable Pipeline",
    difficulty: "Medium",
    category: "C#",
    tags: ["C#", "IEnumerable", "Yield", "Pipelines"],
    visibility: "practice",
    estimatedMinutes: 20,
    points: 50,
    prompt:
      "Build a lazy processing pipeline that filters, maps, and batches candidate activity records without eagerly materializing every step.",
    sampleTests: ["batch size 2 -> grouped records", "empty source -> no batches"],
    hiddenTests: 8,
    returnType: "array",
  },
  {
    id: "csharp-dictionary-merge",
    title: "C# Dictionary Merge",
    difficulty: "Easy",
    category: "C#",
    tags: ["C#", "Dictionary", "Collections", "Conflict Resolution"],
    visibility: "practice",
    estimatedMinutes: 12,
    points: 35,
    prompt:
      "Merge multiple dictionaries of skill scores, keeping the highest score for each skill and returning sorted keys.",
    sampleTests: ["Java:70 + Java:90 -> Java:90", "new keys retained"],
    hiddenTests: 6,
    returnType: "array",
  },
  {
    id: "rate-limiter",
    title: "Sliding Window Rate Limiter",
    difficulty: "Hard",
    category: "System Design Coding",
    tags: ["Design", "Queues", "Time"],
    visibility: "assessment",
    estimatedMinutes: 35,
    points: 95,
    prompt: "Implement an in-memory sliding window rate limiter with per-user limits.",
    sampleTests: ["3 requests in window -> allowed", "4th request -> blocked"],
    hiddenTests: 12,
    returnType: "boolean",
  },
  {
    id: "lru-cache",
    title: "LRU Cache",
    difficulty: "Hard",
    category: "System Design Coding",
    tags: ["Design", "Hash Map", "Linked List"],
    visibility: "assessment",
    estimatedMinutes: 35,
    points: 95,
    prompt: "Design an LRU cache with O(1) get and put operations.",
    sampleTests: ["put/get sequence -> expected evictions", "capacity=1 -> latest only"],
    hiddenTests: 12,
    returnType: "array",
  },
  {
    id: "api-response-flattener",
    title: "API Response Flattener",
    difficulty: "Medium",
    category: "Practical Coding",
    tags: ["Objects", "Recursion", "JSON"],
    visibility: "both",
    estimatedMinutes: 22,
    points: 55,
    prompt: "Flatten a nested object response into dot-notation keys.",
    sampleTests: ['{"a":{"b":1}} -> {"a.b":1}', "arrays preserved"],
    hiddenTests: 8,
    returnType: "array",
  },
  {
    id: "csv-cleaner",
    title: "CSV Cleaner",
    difficulty: "Medium",
    category: "Practical Coding",
    tags: ["Strings", "Parsing", "Validation"],
    visibility: "practice",
    estimatedMinutes: 18,
    points: 45,
    prompt: "Clean CSV rows by trimming whitespace, dropping invalid rows, and normalizing email fields.",
    sampleTests: ["valid rows retained", "bad email dropped"],
    hiddenTests: 7,
    returnType: "array",
  },
  {
    id: "anagram-groups",
    title: "Group Anagrams",
    difficulty: "Medium",
    category: "Data Structures",
    tags: ["Hash Map", "Strings", "Sorting"],
    visibility: "both",
    estimatedMinutes: 16,
    points: 45,
    prompt: "Group words that are anagrams of each other.",
    sampleTests: ['["eat","tea","tan","ate"] -> grouped anagrams', "empty -> []"],
    hiddenTests: 7,
    returnType: "array",
  },
  {
    id: "balanced-partition",
    title: "Balanced Partition",
    difficulty: "Hard",
    category: "Dynamic Programming",
    tags: ["DP", "Sets", "Optimization"],
    visibility: "assessment",
    estimatedMinutes: 34,
    points: 90,
    prompt: "Determine whether an array can be partitioned into two subsets with equal sum.",
    sampleTests: ["[1,5,11,5] -> true", "[1,2,3,5] -> false"],
    hiddenTests: 11,
    returnType: "boolean",
  },
  {
    id: "matrix-spiral",
    title: "Matrix Spiral",
    difficulty: "Medium",
    category: "Algorithms",
    tags: ["Matrix", "Simulation", "Arrays"],
    visibility: "practice",
    estimatedMinutes: 18,
    points: 45,
    prompt: "Return all matrix values in spiral order.",
    sampleTests: ["[[1,2,3],[4,5,6],[7,8,9]] -> [1,2,3,6,9,8,7,4,5]", "single row"],
    hiddenTests: 7,
    returnType: "array",
  },
  {
    id: "topological-course-order",
    title: "Course Order",
    difficulty: "Medium",
    category: "Graphs",
    tags: ["Graph", "Topological Sort", "Queue"],
    visibility: "assessment",
    estimatedMinutes: 28,
    points: 70,
    prompt: "Return a valid order to complete courses given prerequisite pairs.",
    sampleTests: ["2, [[1,0]] -> [0,1]", "cycle -> []"],
    hiddenTests: 10,
    returnType: "array",
  },
  {
    id: "string-compression",
    title: "String Compression",
    difficulty: "Easy",
    category: "Algorithms",
    tags: ["Strings", "Two Pointers"],
    visibility: "practice",
    estimatedMinutes: 14,
    points: 35,
    prompt: "Compress consecutive characters using run-length encoding.",
    sampleTests: ['"aaabb" -> "a3b2"', '"abc" -> "abc"'],
    hiddenTests: 5,
    returnType: "string",
  },
  {
    id: "max-profit-two-transactions",
    title: "Max Profit with Two Transactions",
    difficulty: "Hard",
    category: "Dynamic Programming",
    tags: ["DP", "Arrays", "Finance"],
    visibility: "assessment",
    estimatedMinutes: 36,
    points: 95,
    prompt: "Return the maximum profit from at most two stock transactions.",
    sampleTests: ["[3,3,5,0,0,3,1,4] -> 6", "[1,2,3,4,5] -> 4"],
    hiddenTests: 12,
    returnType: "number",
  },
  {
    id: "audit-log-filter",
    title: "Audit Log Filter",
    difficulty: "Medium",
    category: "Practical Coding",
    tags: ["Filtering", "Dates", "Security"],
    visibility: "both",
    estimatedMinutes: 20,
    points: 50,
    prompt: "Filter audit events by actor, action, and time range while preserving sort order.",
    sampleTests: ["actor=admin -> matching events", "date range excludes older events"],
    hiddenTests: 8,
    returnType: "array",
  },
  {
    id: "retry-backoff-scheduler",
    title: "Retry Backoff Scheduler",
    difficulty: "Medium",
    category: "System Design Coding",
    tags: ["Queues", "Time", "Reliability"],
    visibility: "assessment",
    estimatedMinutes: 26,
    points: 65,
    prompt: "Calculate retry timestamps using exponential backoff and a max delay cap.",
    sampleTests: ["base=2, attempts=3 -> [2,4,8]", "cap applied"],
    hiddenTests: 9,
    returnType: "array",
  },
];

export const questionBankTargets: QuestionBankSection[] = [
  { category: "Java", targetCount: 100 },
  { category: "Python", targetCount: 100 },
  { category: "C#", targetCount: 100 },
  { category: "Algorithms", targetCount: 100 },
  { category: "Data Structures", targetCount: 100 },
];

const bulkQuestionDefinitions = buildBulkQuestionDefinitions();

export const questions: Question[] = [
  ...seedQuestions,
  ...generatedQuestionDefinitions.map((definition) => makeQuestion(definition)),
  ...bulkQuestionDefinitions.map((definition) => makeQuestion(definition)),
];

export const practiceQuestions = questions.filter((question) => question.visibility !== "assessment");
export const assessmentQuestions = questions.filter((question) => question.visibility !== "practice");

export function getPracticeQuestion(questionId: string) {
  return practiceQuestions.find((question) => question.id === questionId);
}

export const assessment = {
  title: "Consultant Core Coding Screen",
  durationMinutes: 45,
  questions: assessmentQuestions.slice(0, 3),
};

export const practiceLeaderboard: PracticeLeaderboardEntry[] = [
  {
    rank: 1,
    candidateName: "Aarav Mehta",
    primaryLanguage: "Python",
    solved: 42,
    attempts: 51,
    averageScore: 94,
    fastestSolve: "04m 18s",
    streakDays: 12,
    badge: "Algorithm Sprinter",
  },
  {
    rank: 2,
    candidateName: "Priya Shah",
    primaryLanguage: "Java",
    solved: 39,
    attempts: 48,
    averageScore: 91,
    fastestSolve: "05m 02s",
    streakDays: 9,
    badge: "Java Ace",
  },
  {
    rank: 3,
    candidateName: "Maya Iyer",
    primaryLanguage: "C#",
    solved: 35,
    attempts: 44,
    averageScore: 88,
    fastestSolve: "05m 45s",
    streakDays: 7,
    badge: "Data Structure Pro",
  },
  {
    rank: 4,
    candidateName: "Daniel Kim",
    primaryLanguage: "Python",
    solved: 31,
    attempts: 42,
    averageScore: 84,
    fastestSolve: "06m 11s",
    streakDays: 5,
    badge: "Consistency Builder",
  },
  {
    rank: 5,
    candidateName: "Sofia Chen",
    primaryLanguage: "Java",
    solved: 28,
    attempts: 36,
    averageScore: 82,
    fastestSolve: "06m 40s",
    streakDays: 4,
    badge: "Practice Climber",
  },
  {
    rank: 6,
    candidateName: "Noah Patel",
    primaryLanguage: "C#",
    solved: 24,
    attempts: 33,
    averageScore: 79,
    fastestSolve: "07m 20s",
    streakDays: 3,
    badge: "Momentum",
  },
];

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
        codeQualityScore: 88,
        complexityScore: 94,
        complexityLabel: "O(n)",
        complexityNotes: [
          "Estimated time complexity: O(n).",
          "Uses lookup-style data structures for a single-pass solution.",
          "Code is compact and readable with clear variable names.",
        ],
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
        codeQualityScore: 81,
        complexityScore: 90,
        complexityLabel: "O(n)",
        complexityNotes: [
          "Estimated time complexity: O(n).",
          "Stack-based parsing gives linear scanning behavior.",
          "Add stronger guards for ignored characters and unusual input.",
        ],
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

function buildBulkQuestionDefinitions(): QuestionDefinition[] {
  const scenarios = [
    "candidate evaluation workflow",
    "consultant onboarding dataset",
    "assessment scoring service",
    "project staffing dashboard",
    "technical interview review",
    "training progress tracker",
    "code quality audit",
    "delivery readiness checklist",
    "skill gap analysis",
    "team allocation planner",
  ];
  const returnTypes: NonNullable<QuestionDefinition["returnType"]>[] = [
    "array",
    "boolean",
    "number",
    "string",
  ];
  const difficulties: Question["difficulty"][] = ["Easy", "Medium", "Medium", "Hard"];
  const visibilityCycle: QuestionVisibility[] = ["practice", "both", "assessment", "both"];
  const sections = [
    {
      category: "Java",
      topics: [
        "OOP",
        "Abstraction",
        "Streams",
        "Lambdas",
        "Generics",
        "Collections",
        "Multithreading",
        "Concurrency",
        "Exceptions",
        "Optionals",
      ],
      verbs: ["model", "aggregate", "transform", "validate", "coordinate"],
    },
    {
      category: "Python",
      topics: [
        "OOP",
        "Abstraction",
        "Lambdas",
        "Type Hints",
        "Collections",
        "Iterators",
        "Asyncio",
        "Threads",
        "Dataclasses",
        "Decorators",
      ],
      verbs: ["normalize", "compose", "stream", "validate", "summarize"],
    },
    {
      category: "C#",
      topics: [
        "OOP",
        "Abstraction",
        "LINQ",
        "Lambdas",
        "Generics",
        "Collections",
        "Threading",
        "Concurrency",
        "Async Await",
        "Interfaces",
      ],
      verbs: ["project", "filter", "compose", "validate", "coordinate"],
    },
    {
      category: "Algorithms",
      topics: [
        "Sorting",
        "Searching",
        "Recursion",
        "Dynamic Programming",
        "Greedy",
        "Backtracking",
        "Strings",
        "Bit Manipulation",
        "Math",
        "Sliding Window",
      ],
      verbs: ["optimize", "rank", "partition", "search", "schedule"],
    },
    {
      category: "Data Structures",
      topics: [
        "Arrays",
        "Hash Map",
        "Stack",
        "Queue",
        "Linked List",
        "Trees",
        "Graphs",
        "Heap",
        "Trie",
        "Sets",
      ],
      verbs: ["index", "merge", "traverse", "rebalance", "deduplicate"],
    },
  ];

  return sections.flatMap((section) =>
    Array.from({ length: 100 }, (_, index) => {
      const topic = section.topics[index % section.topics.length];
      const scenario = scenarios[index % scenarios.length];
      const verb = section.verbs[index % section.verbs.length];
      const difficulty = difficulties[index % difficulties.length];
      const questionNumber = (index + 1).toString().padStart(3, "0");
      const normalizedTopic = topic.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const normalizedCategory = section.category
        .toLowerCase()
        .replace("#", "sharp")
        .replaceAll(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const returnType = returnTypes[index % returnTypes.length];

      return {
        id: `${normalizedCategory}-${normalizedTopic}-sprint-${questionNumber}`,
        title: `${section.category} ${topic} Sprint ${questionNumber}`,
        difficulty,
        category: section.category,
        tags: [section.category, topic, scenarioTitle(scenario)],
        visibility: visibilityCycle[index % visibilityCycle.length],
        estimatedMinutes: difficulty === "Hard" ? 32 : difficulty === "Medium" ? 22 : 14,
        points: difficulty === "Hard" ? 90 : difficulty === "Medium" ? 60 : 35,
        prompt: `Use ${section.category} ${topic} techniques to ${verb} a ${scenario}. Return the requested result while handling empty input, duplicates, and boundary values.`,
        sampleTests: [
          `${scenario}: standard input -> expected ${returnType} result`,
          `${scenario}: empty or duplicate values -> graceful output`,
        ],
        hiddenTests: difficulty === "Hard" ? 12 : difficulty === "Medium" ? 8 : 5,
        returnType,
      };
    }),
  );
}

function scenarioTitle(value: string) {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function makeQuestion(definition: QuestionDefinition): Question {
  const returnType = definition.returnType ?? "array";
  return {
    ...definition,
    starterCode: buildStarterCode(definition.id, returnType),
  };
}

function buildStarterCode(
  id: string,
  returnType: NonNullable<QuestionDefinition["returnType"]>,
): Record<Language, string> {
  const camel = toCamelCase(id);
  const pascal = camel.charAt(0).toUpperCase() + camel.slice(1);
  const pythonName = id.replaceAll("-", "_");
  const javaReturnType = mapJavaReturnType(returnType);
  const csharpReturnType = mapCSharpReturnType(returnType);
  const pythonReturn = mapPythonReturnValue(returnType);
  const javaReturn = mapJavaReturnValue(returnType);
  const csharpReturn = mapCSharpReturnValue(returnType);

  return {
    Java: `import java.util.*;

class Solution {
  public ${javaReturnType} ${camel}(Object input) {
    // Write your solution here.
    ${javaReturn}
  }
}`,
    Python: `def ${pythonName}(input):
    # Write your solution here.
    ${pythonReturn}`,
    "C#": `using System.Collections.Generic;
using System.Linq;

public class Solution {
  public ${csharpReturnType} ${pascal}(object input) {
    // Write your solution here.
    ${csharpReturn}
  }
}`,
  };
}

function toCamelCase(value: string) {
  return value.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
}

function mapJavaReturnType(returnType: NonNullable<QuestionDefinition["returnType"]>) {
  const map = {
    array: "List<Object>",
    boolean: "boolean",
    number: "int",
    string: "String",
  };
  return map[returnType];
}

function mapCSharpReturnType(returnType: NonNullable<QuestionDefinition["returnType"]>) {
  const map = {
    array: "List<object>",
    boolean: "bool",
    number: "int",
    string: "string",
  };
  return map[returnType];
}

function mapPythonReturnValue(returnType: NonNullable<QuestionDefinition["returnType"]>) {
  const map = {
    array: "return []",
    boolean: "return False",
    number: "return 0",
    string: "return \"\"",
  };
  return map[returnType];
}

function mapJavaReturnValue(returnType: NonNullable<QuestionDefinition["returnType"]>) {
  const map = {
    array: "return new ArrayList<>();",
    boolean: "return false;",
    number: "return 0;",
    string: "return \"\";",
  };
  return map[returnType];
}

function mapCSharpReturnValue(returnType: NonNullable<QuestionDefinition["returnType"]>) {
  const map = {
    array: "return new List<object>();",
    boolean: "return false;",
    number: "return 0;",
    string: "return \"\";",
  };
  return map[returnType];
}

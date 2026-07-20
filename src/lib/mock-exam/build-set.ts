import type { ChoiceKey, ItemType, JlptLevel } from "@/lib/db/types";

export type MockExamBuildReviewStatus = "draft" | "approved" | "rejected";

export interface MockExamBuildQuestionSource {
  item_type: ItemType;
  jlpt_level: JlptLevel;
  question_type: string;
  question_text: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  correct_choice: ChoiceKey;
  explanation: string;
  review_status?: MockExamBuildReviewStatus;
  source_item?: string;
  source_reading?: string;
  source_day?: string;
  generation_batch?: string;
}

export interface BuildMockExamSetOptions {
  setCode: string;
  setTitle: string;
  jlptLevel: JlptLevel;
  seed?: string;
  vocabCount?: number;
  grammarCount?: number;
  timeLimitMinutes?: number;
  eligibleReviewStatuses?: MockExamBuildReviewStatus[];
}

export interface MockExamSetArtifactQuestion extends MockExamBuildQuestionSource {
  id: string;
  mock_exam_set_code: string;
  section_key: ItemType;
  section_sort_order: number;
  sort_order: number;
  points: number;
}

export interface MockExamSetArtifact {
  set: {
    set_code: string;
    set_title: string;
    jlpt_level: JlptLevel;
    mode: "lite";
    status: "draft";
    listening_included: false;
    time_limit_minutes: number;
    question_count: number;
    selection_rule: string;
  };
  sections: Array<{
    section_key: ItemType;
    section_title: string;
    sort_order: number;
    question_count: number;
    time_limit_minutes: number;
  }>;
  questions: MockExamSetArtifactQuestion[];
}

function seededRandom(seedText: string) {
  let seed = 2166136261;
  for (const char of seedText) {
    seed ^= char.charCodeAt(0);
    seed = Math.imul(seed, 16777619);
  }

  return () => {
    seed += 0x6d2b79f5;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function stableId(parts: string[]) {
  let hash = 2166136261;
  for (const part of parts.join("|")) {
    hash ^= part.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `mq_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function shuffle<T>(rows: T[], seed: string): T[] {
  const random = seededRandom(seed);
  const copy = [...rows];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function assertPoolHasEnough(kind: ItemType, available: number, required: number) {
  if (available < required) {
    throw new Error(`not enough ${kind} questions for mock exam set: required ${required}, available ${available}`);
  }
}

export function buildMockExamSet(
  sourceQuestions: MockExamBuildQuestionSource[],
  options: BuildMockExamSetOptions,
): MockExamSetArtifact {
  const vocabCount = options.vocabCount ?? 15;
  const grammarCount = options.grammarCount ?? 15;
  const timeLimitMinutes = options.timeLimitMinutes ?? 35;
  const eligibleReviewStatuses = new Set(options.eligibleReviewStatuses ?? ["approved"]);

  const eligible = sourceQuestions.filter((question) => {
    const reviewStatus = question.review_status ?? "approved";
    return (
      question.jlpt_level === options.jlptLevel &&
      eligibleReviewStatuses.has(reviewStatus) &&
      question.item_type !== undefined &&
      !question.question_type.toLowerCase().includes("listening")
    );
  });

  const vocab = shuffle(
    eligible.filter((question) => question.item_type === "vocab"),
    `${options.seed ?? options.setCode}:vocab`,
  );
  const grammar = shuffle(
    eligible.filter((question) => question.item_type === "grammar"),
    `${options.seed ?? options.setCode}:grammar`,
  );

  assertPoolHasEnough("vocab", vocab.length, vocabCount);
  assertPoolHasEnough("grammar", grammar.length, grammarCount);

  const selectedBySection = [
    {
      section_key: "vocab" as const,
      section_title: "文字・語彙",
      section_sort_order: 1,
      section_time_limit_minutes: Math.round(timeLimitMinutes * (vocabCount / (vocabCount + grammarCount))),
      rows: vocab.slice(0, vocabCount),
    },
    {
      section_key: "grammar" as const,
      section_title: "文法",
      section_sort_order: 2,
      section_time_limit_minutes:
        timeLimitMinutes - Math.round(timeLimitMinutes * (vocabCount / (vocabCount + grammarCount))),
      rows: grammar.slice(0, grammarCount),
    },
  ];

  const questions = selectedBySection.flatMap((section) =>
    section.rows.map((question, index) => {
      const sortOrder = questionsBeforeSection(selectedBySection, section.section_key) + index + 1;
      return {
        ...question,
        id: stableId([options.setCode, section.section_key, question.question_text]),
        mock_exam_set_code: options.setCode,
        section_key: section.section_key,
        section_sort_order: section.section_sort_order,
        sort_order: sortOrder,
        points: 1,
      };
    }),
  );

  return {
    set: {
      set_code: options.setCode,
      set_title: options.setTitle,
      jlpt_level: options.jlptLevel,
      mode: "lite",
      status: "draft",
      listening_included: false,
      time_limit_minutes: timeLimitMinutes,
      question_count: questions.length,
      selection_rule: "seeded random non-listening questions from eligible reviewed pool",
    },
    sections: selectedBySection.map((section) => ({
      section_key: section.section_key,
      section_title: section.section_title,
      sort_order: section.section_sort_order,
      question_count: section.rows.length,
      time_limit_minutes: section.section_time_limit_minutes,
    })),
    questions,
  };
}

function questionsBeforeSection(
  sections: Array<{ section_key: ItemType; rows: MockExamBuildQuestionSource[] }>,
  sectionKey: ItemType,
) {
  const section = sections.find((candidate) => candidate.section_key === sectionKey);
  if (!section) return 0;

  return sections
    .filter((candidate) => candidate !== section)
    .filter((candidate) => sections.indexOf(candidate) < sections.indexOf(section))
    .reduce((count, candidate) => count + candidate.rows.length, 0);
}

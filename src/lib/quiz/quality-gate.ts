import type { ChoiceKey, GrammarItem, JlptLevel, VocabItem } from "@/lib/db/types";

export type QualityGateItem = Pick<
  VocabItem | GrammarItem,
  | "jlpt_level"
  | "question_text"
  | "choice_a"
  | "choice_b"
  | "choice_c"
  | "choice_d"
  | "correct_choice"
  | "status"
>;

export interface QuizItemQualityOptions {
  requireActive?: boolean;
}

export interface QuizItemQualityResult {
  valid: boolean;
  errors: string[];
}

const CHOICE_KEYS: ChoiceKey[] = ["A", "B", "C", "D"];
const JLPT_LEVELS: JlptLevel[] = ["N1", "N2", "N3", "N4", "N5"];
const HANGUL_PATTERN = /[\u3131-\u318e\uac00-\ud7a3]/u;
const JAPANESE_PATTERN = /[\u3040-\u30ff\u3400-\u9fff]/u;

const KOREAN_PROMPT_PATTERNS = [
  /다음\s*(단어|문법|표현|문장|뜻)/u,
  /의미로\s*가장\s*알맞은/u,
  /뜻으로\s*가장\s*알맞은/u,
];

function hasHangul(value: string): boolean {
  return HANGUL_PATTERN.test(value);
}

function hasJapanese(value: string): boolean {
  return JAPANESE_PATTERN.test(value);
}

function choicesFromItem(item: QualityGateItem): string[] {
  return [item.choice_a, item.choice_b, item.choice_c, item.choice_d];
}

export function getQuizItemQualityErrors(
  item: QualityGateItem,
  options: QuizItemQualityOptions = {},
): string[] {
  const errors: string[] = [];
  const questionText = item.question_text.trim();
  const choices = choicesFromItem(item).map((choice) => choice.trim());

  if (options.requireActive && item.status !== "active") {
    errors.push("item must be active before quiz exposure");
  }

  if (!JLPT_LEVELS.includes(item.jlpt_level)) {
    errors.push("invalid jlpt_level");
  }

  if (!CHOICE_KEYS.includes(item.correct_choice)) {
    errors.push("invalid correct_choice");
  }

  if (questionText.length === 0) {
    errors.push("question_text is required");
  }

  if (hasHangul(questionText)) {
    errors.push("question_text must not contain Korean");
  }

  if (KOREAN_PROMPT_PATTERNS.some((pattern) => pattern.test(questionText))) {
    errors.push("question_text must not use Korean meaning-prompt format");
  }

  if (questionText.length > 0 && !hasJapanese(questionText)) {
    errors.push("question_text must contain Japanese");
  }

  choices.forEach((choice, index) => {
    const key = CHOICE_KEYS[index];
    if (choice.length === 0) {
      errors.push(`choice_${key.toLowerCase()} is required`);
    }

    if (hasHangul(choice)) {
      errors.push(`choice_${key.toLowerCase()} must not contain Korean`);
    }

    if (choice.length > 0 && !hasJapanese(choice)) {
      errors.push(`choice_${key.toLowerCase()} must contain Japanese`);
    }
  });

  if (new Set(choices).size !== choices.length) {
    errors.push("choices must be unique");
  }

  return errors;
}

export function validateQuizItem(
  item: QualityGateItem,
  options: QuizItemQualityOptions = {},
): QuizItemQualityResult {
  const errors = getQuizItemQualityErrors(item, options);

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function isQuizItemSafeForExposure(item: QualityGateItem): boolean {
  return validateQuizItem(item, { requireActive: true }).valid;
}

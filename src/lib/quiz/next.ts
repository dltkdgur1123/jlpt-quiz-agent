import type { GrammarItem, VocabItem } from "@/lib/db/types";

export type QuizItemType = "vocab" | "grammar";
export type QuizChoiceKey = "A" | "B" | "C" | "D";
export type QuizLevel = "N1" | "N2" | "N3" | "N4" | "N5";

export interface NextQuizQuery {
  item_type: string | null;
  jlpt_level: string | null;
}

export interface NextQuizChoice {
  key: QuizChoiceKey;
  text: string;
}

export interface NextQuizResponse {
  item_type: QuizItemType;
  item_id: string;
  question_text: string;
  choices: NextQuizChoice[];
}

export interface QuizRepository {
  findNextVocabQuiz(input: { jlptLevel: QuizLevel }): Promise<VocabItem | null>;
  findNextGrammarQuiz(input: { jlptLevel: QuizLevel }): Promise<GrammarItem | null>;
}

const ITEM_TYPES = new Set(["vocab", "grammar"]);
const LEVELS = new Set(["N1", "N2", "N3", "N4", "N5"]);

function assertItemType(value: string | null): QuizItemType {
  if (!value || !ITEM_TYPES.has(value)) {
    throw new Error("invalid item_type");
  }

  return value as QuizItemType;
}

function assertJlptLevel(value: string | null): QuizLevel {
  if (!value || !LEVELS.has(value)) {
    throw new Error("invalid jlpt_level");
  }

  return value as QuizLevel;
}

function choicesFromItem(item: VocabItem | GrammarItem): NextQuizChoice[] {
  return [
    { key: "A", text: item.choice_a },
    { key: "B", text: item.choice_b },
    { key: "C", text: item.choice_c },
    { key: "D", text: item.choice_d },
  ];
}

export async function getNextQuiz(
  repository: QuizRepository,
  query: NextQuizQuery,
): Promise<NextQuizResponse> {
  const itemType = assertItemType(query.item_type);
  const jlptLevel = assertJlptLevel(query.jlpt_level);
  const item =
    itemType === "vocab"
      ? await repository.findNextVocabQuiz({ jlptLevel })
      : await repository.findNextGrammarQuiz({ jlptLevel });

  if (!item) {
    throw new Error("quiz item not found");
  }

  return {
    item_type: itemType,
    item_id: item.id,
    question_text: item.question_text,
    choices: choicesFromItem(item),
  };
}

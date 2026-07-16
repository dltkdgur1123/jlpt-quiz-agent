import type { ChoiceKey, ItemType, QuizAttempt } from "@/lib/db/types";

export interface AnswerItem {
  id: string;
  correct_choice: ChoiceKey;
  explanation: string | null;
}

export interface SubmitAttemptInput {
  item_type: string;
  item_id: string;
  selected_choice: string;
  user_id?: string | null;
  response_time_ms?: number | null;
  feedback?: unknown;
}

export interface SaveAttemptInput {
  user_id: string | null;
  item_type: ItemType;
  item_id: string;
  selected_choice: ChoiceKey;
  is_correct: boolean;
  response_time_ms: number | null;
}

export interface AttemptRepository {
  findAnswerItem(input: { itemType: ItemType; itemId: string }): Promise<AnswerItem | null>;
  saveQuizAttempt(input: SaveAttemptInput): Promise<QuizAttempt>;
}

export interface SubmitAttemptResult {
  attempt_id: string;
  is_correct: boolean;
  correct_choice: ChoiceKey;
  explanation: string | null;
}

const ITEM_TYPES = new Set(["vocab", "grammar"]);
const CHOICES = new Set(["A", "B", "C", "D"]);

function assertItemType(value: string): ItemType {
  if (!ITEM_TYPES.has(value)) {
    throw new Error("invalid item_type");
  }

  return value as ItemType;
}

function assertChoice(value: string): ChoiceKey {
  if (!CHOICES.has(value)) {
    throw new Error("invalid selected_choice");
  }

  return value as ChoiceKey;
}

export async function submitQuizAttempt(
  repository: AttemptRepository,
  input: SubmitAttemptInput,
): Promise<SubmitAttemptResult> {
  const itemType = assertItemType(input.item_type);
  const selectedChoice = assertChoice(input.selected_choice);
  const item = await repository.findAnswerItem({ itemType, itemId: input.item_id });

  if (!item) {
    throw new Error("quiz item not found");
  }

  const isCorrect = selectedChoice === item.correct_choice;
  const attempt = await repository.saveQuizAttempt({
    user_id: input.user_id ?? null,
    item_type: itemType,
    item_id: input.item_id,
    selected_choice: selectedChoice,
    is_correct: isCorrect,
    response_time_ms: input.response_time_ms ?? null,
  });

  return {
    attempt_id: attempt.id,
    is_correct: isCorrect,
    correct_choice: item.correct_choice,
    explanation: item.explanation,
  };
}

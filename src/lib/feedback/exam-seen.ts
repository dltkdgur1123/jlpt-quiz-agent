import type { ExamSeenFeedback, FeedbackValue, ItemType } from "@/lib/db/types";

export interface SubmitFeedbackInput {
  session_user_id: string | null;
  item_type: string;
  item_id: string;
  feedback: string;
}

export interface UpsertFeedbackInput {
  user_id: string;
  item_type: ItemType;
  item_id: string;
  feedback: FeedbackValue;
}

export interface ExamSeenFeedbackRepository {
  upsertFeedback(input: UpsertFeedbackInput): Promise<ExamSeenFeedback>;
}

const ITEM_TYPES = new Set(["vocab", "grammar"]);
const FEEDBACK_VALUES = new Set(["yes", "no", "unknown"]);

function assertItemType(value: string): ItemType {
  if (!ITEM_TYPES.has(value)) {
    throw new Error("invalid item_type");
  }

  return value as ItemType;
}

function assertFeedback(value: string): FeedbackValue {
  if (!FEEDBACK_VALUES.has(value)) {
    throw new Error("invalid feedback");
  }

  return value as FeedbackValue;
}

export async function submitExamSeenFeedback(
  repository: ExamSeenFeedbackRepository,
  input: SubmitFeedbackInput,
): Promise<ExamSeenFeedback> {
  if (!input.session_user_id) {
    throw new Error("login required");
  }

  return repository.upsertFeedback({
    user_id: input.session_user_id,
    item_type: assertItemType(input.item_type),
    item_id: input.item_id,
    feedback: assertFeedback(input.feedback),
  });
}

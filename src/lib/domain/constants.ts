export const MVP_TABLES = [
  "users",
  "vocab_items",
  "grammar_items",
  "quiz_attempts",
  "exam_seen_feedback",
  "item_score_stats",
] as const;

export const SCORE_FIELD = "perceived_exam_score" as const;
export const SCORE_DISPLAY_LABEL = "출제 체감 score" as const;

export const FEEDBACK_VALUES = ["yes", "no", "unknown"] as const;

export type JlptLevel = "N1" | "N2" | "N3" | "N4" | "N5";
export type ItemType = "vocab" | "grammar";
export type ChoiceKey = "A" | "B" | "C" | "D";
export type FeedbackValue = "yes" | "no" | "unknown";
export type ItemStatus = "draft" | "active" | "archived";

export interface UserProfile {
  id: string;
  display_name: string | null;
  auth_provider: string;
  provider_user_id: string;
  target_jlpt_level: JlptLevel | null;
  created_at: string;
  last_seen_at: string | null;
}

export interface VocabItem {
  id: string;
  jlpt_level: JlptLevel;
  word: string;
  reading: string | null;
  meaning: string;
  question_text: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  correct_choice: ChoiceKey;
  explanation: string | null;
  status: ItemStatus;
  created_at: string;
  updated_at: string;
}

export interface GrammarItem {
  id: string;
  jlpt_level: JlptLevel;
  grammar_point: string;
  meaning: string;
  question_text: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  correct_choice: ChoiceKey;
  explanation: string | null;
  status: ItemStatus;
  created_at: string;
  updated_at: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string | null;
  item_type: ItemType;
  item_id: string;
  selected_choice: ChoiceKey;
  is_correct: boolean;
  answered_at: string;
  response_time_ms: number | null;
}

export interface ExamSeenFeedback {
  id: string;
  user_id: string;
  item_type: ItemType;
  item_id: string;
  feedback: FeedbackValue;
  created_at: string;
  updated_at: string;
}

export interface ItemScoreStats {
  item_type: ItemType;
  item_id: string;
  attempt_count: number;
  correct_count: number;
  incorrect_count: number;
  correct_rate: number | null;
  feedback_yes_count: number;
  feedback_no_count: number;
  feedback_unknown_count: number;
  feedback_total_count: number;
  seen_yes_rate: number | null;
  sample_confidence: number | null;
  perceived_exam_score: number | null;
  confusion_score: number | null;
  updated_at: string;
}

export type JlptLevel = "N1" | "N2" | "N3" | "N4" | "N5";
export type ItemType = "vocab" | "grammar";
export type MockExamItemType = ItemType | "reading";
export type ChoiceKey = "A" | "B" | "C" | "D";
export type FeedbackValue = "yes" | "no" | "unknown";
export type ItemStatus = "draft" | "active" | "archived";
export type SourceType = "shorts" | "manual" | "generated";
export type ReviewStatus = "draft" | "approved" | "rejected";
export type MockExamMode = "lite" | "full";
export type MockExamSetStatus = "draft" | "published" | "archived";
export type MockExamSectionKey = "vocab" | "grammar" | "reading" | "listening";
export type ActiveMockExamSectionKey = Exclude<MockExamSectionKey, "listening">;
export type MockExamAttemptStatus = "in_progress" | "submitted" | "abandoned";

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
  source_type: SourceType | null;
  source_day: string | null;
  source_item: string | null;
  source_reading: string | null;
  generation_batch: string | null;
  review_status: ReviewStatus | null;
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
  source_type: SourceType | null;
  source_day: string | null;
  source_item: string | null;
  source_reading: string | null;
  generation_batch: string | null;
  review_status: ReviewStatus | null;
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

export interface MockExamSet {
  id: string;
  jlpt_level: JlptLevel;
  set_code: string;
  set_title: string;
  mode: MockExamMode;
  status: MockExamSetStatus;
  time_limit_minutes: number;
  listening_included: false;
  question_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface MockExamSection {
  id: string;
  mock_exam_set_id: string;
  section_key: ActiveMockExamSectionKey;
  section_title: string;
  sort_order: number;
  question_count: number;
  time_limit_minutes: number | null;
  created_at: string;
}

export interface MockExamQuestion {
  id: string;
  mock_exam_set_id: string;
  section_id: string;
  item_type: MockExamItemType;
  item_id: string;
  sort_order: number;
  points: number;
  created_at: string;
}

export interface MockExamAttempt {
  id: string;
  mock_exam_set_id: string;
  user_id: string | null;
  status: MockExamAttemptStatus;
  started_at: string;
  submitted_at: string | null;
  elapsed_seconds: number | null;
  score_total: number | null;
  score_max: number | null;
  correct_count: number | null;
  question_count: number;
}

export interface MockExamAnswer {
  id: string;
  mock_exam_attempt_id: string;
  mock_exam_question_id: string;
  selected_choice: ChoiceKey | null;
  is_correct: boolean | null;
  answered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MockExamSectionResult {
  id: string;
  mock_exam_attempt_id: string;
  section_key: ActiveMockExamSectionKey;
  score: number;
  score_max: number;
  correct_count: number;
  question_count: number;
  correct_rate: number | null;
  weakness_label: string | null;
  created_at: string;
}

import type { FeedbackValue, ItemScoreStats, ItemType } from "@/lib/db/types";

export interface CalculateItemScoreInput {
  item_type: ItemType;
  item_id: string;
  attempts: boolean[];
  feedback: FeedbackValue[];
  confidenceSampleSize?: number;
}

function roundRate(value: number): number {
  return Math.round(value * 100000) / 100000;
}

export function calculateItemScoreStats(input: CalculateItemScoreInput): ItemScoreStats {
  const attemptCount = input.attempts.length;
  const correctCount = input.attempts.filter(Boolean).length;
  const incorrectCount = attemptCount - correctCount;
  const yesCount = input.feedback.filter((value) => value === "yes").length;
  const noCount = input.feedback.filter((value) => value === "no").length;
  const unknownCount = input.feedback.filter((value) => value === "unknown").length;
  const totalFeedback = yesCount + noCount + unknownCount;
  const yesNoTotal = yesCount + noCount;
  const confidenceBase = input.confidenceSampleSize ?? 10;
  const seenYesRate = yesNoTotal > 0 ? roundRate(yesCount / yesNoTotal) : null;
  const sampleConfidence = roundRate(Math.min(1, totalFeedback / confidenceBase));
  const perceivedExamScore = seenYesRate === null ? null : roundRate(seenYesRate * sampleConfidence);
  const correctRate = attemptCount > 0 ? roundRate(correctCount / attemptCount) : null;
  const confusionScore = correctRate === null ? null : roundRate(1 - correctRate);

  return {
    item_type: input.item_type,
    item_id: input.item_id,
    attempt_count: attemptCount,
    correct_count: correctCount,
    incorrect_count: incorrectCount,
    correct_rate: correctRate,
    feedback_yes_count: yesCount,
    feedback_no_count: noCount,
    feedback_unknown_count: unknownCount,
    feedback_total_count: totalFeedback,
    seen_yes_rate: seenYesRate,
    sample_confidence: sampleConfidence,
    perceived_exam_score: perceivedExamScore,
    confusion_score: confusionScore,
    updated_at: new Date().toISOString(),
  };
}

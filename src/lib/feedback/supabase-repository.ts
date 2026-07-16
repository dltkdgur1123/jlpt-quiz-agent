import type { SupabaseClient } from "@supabase/supabase-js";

import type { ExamSeenFeedback } from "@/lib/db/types";
import type { ExamSeenFeedbackRepository, UpsertFeedbackInput } from "@/lib/feedback/exam-seen";
import { calculateItemScoreStats } from "@/lib/score/calculate";

export function createSupabaseFeedbackRepository(client: SupabaseClient): ExamSeenFeedbackRepository {
  return {
    async upsertFeedback(input: UpsertFeedbackInput): Promise<ExamSeenFeedback> {
      const { data, error } = await client
        .from("exam_seen_feedback")
        .upsert(input, { onConflict: "user_id,item_type,item_id" })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      const [{ data: feedbackRows, error: feedbackError }, { data: attemptRows, error: attemptError }] =
        await Promise.all([
          client
            .from("exam_seen_feedback")
            .select("feedback")
            .eq("item_type", input.item_type)
            .eq("item_id", input.item_id),
          client
            .from("quiz_attempts")
            .select("is_correct")
            .eq("item_type", input.item_type)
            .eq("item_id", input.item_id),
        ]);

      if (feedbackError) {
        throw feedbackError;
      }

      if (attemptError) {
        throw attemptError;
      }

      const stats = calculateItemScoreStats({
        item_type: input.item_type,
        item_id: input.item_id,
        attempts: (attemptRows ?? []).map((row) => Boolean(row.is_correct)),
        feedback: (feedbackRows ?? []).map((row) => row.feedback),
      });

      const { error: scoreError } = await client
        .from("item_score_stats")
        .upsert(stats, { onConflict: "item_type,item_id" });

      if (scoreError) {
        throw scoreError;
      }

      return data as ExamSeenFeedback;
    },
  };
}

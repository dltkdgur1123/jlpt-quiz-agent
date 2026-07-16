import type { SupabaseClient } from "@supabase/supabase-js";

import type { ExamSeenFeedback } from "@/lib/db/types";
import type { ExamSeenFeedbackRepository, UpsertFeedbackInput } from "@/lib/feedback/exam-seen";

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

      return data as ExamSeenFeedback;
    },
  };
}

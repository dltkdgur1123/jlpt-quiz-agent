import type { SupabaseClient } from "@supabase/supabase-js";

import type { AttemptRepository, SaveAttemptInput } from "@/lib/quiz/attempt";
import type { ItemType, QuizAttempt } from "@/lib/db/types";

export function createSupabaseAttemptRepository(client: SupabaseClient): AttemptRepository {
  return {
    async findAnswerItem({ itemType, itemId }: { itemType: ItemType; itemId: string }) {
      const table = itemType === "vocab" ? "vocab_items" : "grammar_items";
      const { data, error } = await client
        .from(table)
        .select("id, correct_choice, explanation")
        .eq("id", itemId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data;
    },

    async saveQuizAttempt(input: SaveAttemptInput): Promise<QuizAttempt> {
      const { data, error } = await client
        .from("quiz_attempts")
        .insert(input)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return data as QuizAttempt;
    },
  };
}

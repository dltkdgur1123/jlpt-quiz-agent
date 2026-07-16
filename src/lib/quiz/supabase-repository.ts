import type { SupabaseClient } from "@supabase/supabase-js";

import type { GrammarItem, VocabItem } from "@/lib/db/types";
import type { QuizLevel, QuizRepository } from "@/lib/quiz/next";

export function createSupabaseQuizRepository(client: SupabaseClient): QuizRepository {
  return {
    async findNextVocabQuiz({ jlptLevel }: { jlptLevel: QuizLevel }): Promise<VocabItem | null> {
      const { data, error } = await client
        .from("vocab_items")
        .select("*")
        .eq("jlpt_level", jlptLevel)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data as VocabItem | null;
    },

    async findNextGrammarQuiz({ jlptLevel }: { jlptLevel: QuizLevel }): Promise<GrammarItem | null> {
      const { data, error } = await client
        .from("grammar_items")
        .select("*")
        .eq("jlpt_level", jlptLevel)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data as GrammarItem | null;
    },
  };
}

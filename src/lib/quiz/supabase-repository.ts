import type { SupabaseClient } from "@supabase/supabase-js";

import type { GrammarItem, VocabItem } from "@/lib/db/types";
import type { QuizLevel, QuizRepository } from "@/lib/quiz/next";

function pickRandomItem<T>(items: T[] | null): T | null {
  if (!items || items.length === 0) {
    return null;
  }

  return items[Math.floor(Math.random() * items.length)];
}

export function createSupabaseQuizRepository(client: SupabaseClient): QuizRepository {
  return {
    async findNextVocabQuiz({ jlptLevel }: { jlptLevel: QuizLevel }): Promise<VocabItem | null> {
      const { data, error } = await client
        .from("vocab_items")
        .select("*")
        .eq("jlpt_level", jlptLevel)
        .eq("status", "active")
        .limit(50);

      if (error) {
        throw error;
      }

      return pickRandomItem(data as VocabItem[] | null);
    },

    async findNextGrammarQuiz({ jlptLevel }: { jlptLevel: QuizLevel }): Promise<GrammarItem | null> {
      const { data, error } = await client
        .from("grammar_items")
        .select("*")
        .eq("jlpt_level", jlptLevel)
        .eq("status", "active")
        .limit(50);

      if (error) {
        throw error;
      }

      return pickRandomItem(data as GrammarItem[] | null);
    },
  };
}

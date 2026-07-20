import type { SupabaseClient } from "@supabase/supabase-js";

import type { GrammarItem, VocabItem } from "@/lib/db/types";
import { isQuizItemSafeForExposure } from "./quality-gate.ts";
import type { QuizLevel, QuizRepository } from "@/lib/quiz/next";

function pickRandomSafeItem<T extends VocabItem | GrammarItem>(items: T[] | null): T | null {
  const safeItems = items?.filter(isQuizItemSafeForExposure) ?? [];

  if (safeItems.length === 0) {
    return null;
  }

  return safeItems[Math.floor(Math.random() * safeItems.length)];
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

      return pickRandomSafeItem(data as VocabItem[] | null);
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

      return pickRandomSafeItem(data as GrammarItem[] | null);
    },
  };
}

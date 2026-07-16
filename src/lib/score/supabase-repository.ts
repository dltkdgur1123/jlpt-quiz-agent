import type { SupabaseClient } from "@supabase/supabase-js";

import type { ItemScoreStats, ItemType } from "@/lib/db/types";
import type { ScoreQueryRepository } from "@/lib/score/query";

export function createSupabaseScoreRepository(client: SupabaseClient): ScoreQueryRepository {
  return {
    async findItemScore({ itemType, itemId }: { itemType: ItemType; itemId: string }) {
      const { data, error } = await client
        .from("item_score_stats")
        .select("*")
        .eq("item_type", itemType)
        .eq("item_id", itemId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data as ItemScoreStats | null;
    },

    async findRanking({ limit }: { limit: number }) {
      const { data, error } = await client
        .from("item_score_stats")
        .select("*")
        .order("perceived_exam_score", { ascending: false, nullsFirst: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return (data ?? []) as ItemScoreStats[];
    },
  };
}

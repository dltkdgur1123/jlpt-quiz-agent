import type { ItemScoreStats, ItemType } from "@/lib/db/types";

export interface ScoreQueryRepository {
  findItemScore(input: { itemType: ItemType; itemId: string }): Promise<ItemScoreStats | null>;
  findRanking(input: { limit: number }): Promise<ItemScoreStats[]>;
}

export interface ScoreQueryInput {
  item_type: string;
  item_id: string;
  minimum_feedback_total?: number;
}

export interface RankingQueryInput {
  limit?: number;
  minimum_feedback_total?: number;
}

export interface ScoreResponse extends ItemScoreStats {
  has_enough_data: boolean;
}

const ITEM_TYPES = new Set(["vocab", "grammar"]);

function assertItemType(value: string): ItemType {
  if (!ITEM_TYPES.has(value)) {
    throw new Error("invalid item_type");
  }

  return value as ItemType;
}

function withDataFlag(score: ItemScoreStats, minimum: number): ScoreResponse {
  return {
    ...score,
    has_enough_data: score.feedback_total_count >= minimum,
  };
}

export async function getItemScore(
  repository: ScoreQueryRepository,
  input: ScoreQueryInput,
): Promise<ScoreResponse> {
  const itemType = assertItemType(input.item_type);
  const score = await repository.findItemScore({ itemType, itemId: input.item_id });

  if (!score) {
    throw new Error("score not found");
  }

  return withDataFlag(score, input.minimum_feedback_total ?? 3);
}

export async function getItemRanking(repository: ScoreQueryRepository, input: RankingQueryInput = {}) {
  const minimum = input.minimum_feedback_total ?? 3;
  const scores = await repository.findRanking({ limit: input.limit ?? 20 });

  return {
    items: scores.map((score) => withDataFlag(score, minimum)),
  };
}

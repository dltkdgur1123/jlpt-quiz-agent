import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { getItemScore, getItemRanking } from "../src/lib/score/query.ts";

const score = {
  item_type: "vocab",
  item_id: "item-1",
  attempt_count: 10,
  correct_count: 7,
  incorrect_count: 3,
  correct_rate: 0.7,
  feedback_yes_count: 3,
  feedback_no_count: 1,
  feedback_unknown_count: 1,
  feedback_total_count: 5,
  seen_yes_rate: 0.75,
  sample_confidence: 0.5,
  perceived_exam_score: 0.375,
  confusion_score: 0.3,
  updated_at: "2026-01-01T00:00:00.000Z",
};

const repository = {
  async findItemScore({ itemId }) {
    return itemId === "item-1" ? score : null;
  },
  async findRanking() {
    return [score];
  },
};

test("item score returns perceived score and feedback counts", async () => {
  const result = await getItemScore(repository, { item_type: "vocab", item_id: "item-1" });

  assert.equal(result.perceived_exam_score, 0.375);
  assert.equal(result.feedback_yes_count, 3);
  assert.equal(result.feedback_no_count, 1);
  assert.equal(result.feedback_unknown_count, 1);
  assert.equal(result.correct_rate, 0.7);
});

test("low sample score is marked as insufficient data", async () => {
  const result = await getItemScore(repository, { item_type: "vocab", item_id: "item-1", minimum_feedback_total: 10 });

  assert.equal(result.has_enough_data, false);
});

test("ranking returns score list without official ranking wording", async () => {
  const result = await getItemRanking(repository, { minimum_feedback_total: 1 });

  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].item_id, "item-1");
  assert.equal(JSON.stringify(result).includes("official"), false);
});

test("score API routes exist", () => {
  const scoreRoute = readFileSync(
    new URL("../src/app/api/items/[item_type]/[item_id]/score/route.ts", import.meta.url),
    "utf8",
  );
  const rankingRoute = readFileSync(new URL("../src/app/api/items/ranking/route.ts", import.meta.url), "utf8");

  assert.match(scoreRoute, /export async function GET/);
  assert.match(rankingRoute, /export async function GET/);
});

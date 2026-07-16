import assert from "node:assert/strict";
import test from "node:test";

import { calculateItemScoreStats } from "../src/lib/score/calculate.ts";

test("calculates feedback counts and rates", () => {
  const stats = calculateItemScoreStats({
    item_type: "vocab",
    item_id: "item-1",
    attempts: [true, false, true],
    feedback: ["yes", "yes", "no", "unknown"],
  });

  assert.equal(stats.feedback_yes_count, 2);
  assert.equal(stats.feedback_no_count, 1);
  assert.equal(stats.feedback_unknown_count, 1);
  assert.equal(stats.feedback_total_count, 4);
  assert.equal(stats.seen_yes_rate, 0.66667);
  assert.equal(stats.correct_rate, 0.66667);
  assert.equal(stats.confusion_score, 0.33333);
});

test("unknown is preserved and not merged into no", () => {
  const stats = calculateItemScoreStats({
    item_type: "grammar",
    item_id: "item-1",
    attempts: [],
    feedback: ["unknown", "unknown"],
  });

  assert.equal(stats.feedback_no_count, 0);
  assert.equal(stats.feedback_unknown_count, 2);
  assert.equal(stats.seen_yes_rate, null);
});

test("total zero is treated as insufficient data", () => {
  const stats = calculateItemScoreStats({
    item_type: "vocab",
    item_id: "item-1",
    attempts: [],
    feedback: [],
  });

  assert.equal(stats.feedback_total_count, 0);
  assert.equal(stats.sample_confidence, 0);
  assert.equal(stats.perceived_exam_score, null);
  assert.equal(stats.correct_rate, null);
});

test("low sample confidence reduces perceived score", () => {
  const stats = calculateItemScoreStats({
    item_type: "vocab",
    item_id: "item-1",
    attempts: [],
    feedback: ["yes"],
    confidenceSampleSize: 10,
  });

  assert.equal(stats.seen_yes_rate, 1);
  assert.equal(stats.sample_confidence, 0.1);
  assert.equal(stats.perceived_exam_score, 0.1);
});

import assert from "node:assert/strict";
import test from "node:test";
import {
  mergeRecentQuestionHistory,
  orderQuestionsAvoidingRecent,
  recentQuestionIdSet,
} from "../src/lib/mock-exam/recent-history.ts";

test("mergeRecentQuestionHistory keeps latest attempts first and removes duplicates", () => {
  const history = mergeRecentQuestionHistory(
    [
      { question_id: "old-1", seen_at: "2026-07-01T00:00:00.000Z" },
      { question_id: "repeat", seen_at: "2026-07-01T00:00:00.000Z" },
    ],
    ["repeat", "new-1"],
    "2026-07-20T00:00:00.000Z",
  );

  assert.deepEqual(
    history.map((entry) => entry.question_id),
    ["repeat", "new-1", "old-1"],
  );
  assert.equal(history[0].seen_at, "2026-07-20T00:00:00.000Z");
});

test("recentQuestionIdSet applies a rolling day window", () => {
  const recent = recentQuestionIdSet(
    [
      { question_id: "recent", seen_at: "2026-07-19T00:00:00.000Z" },
      { question_id: "stale", seen_at: "2026-07-01T00:00:00.000Z" },
    ],
    Date.parse("2026-07-20T00:00:00.000Z"),
    7,
  );

  assert.equal(recent.has("recent"), true);
  assert.equal(recent.has("stale"), false);
});

test("orderQuestionsAvoidingRecent moves recent questions behind fresh ones", () => {
  const ordered = orderQuestionsAvoidingRecent(
    [{ id: "recent-1" }, { id: "fresh-1" }, { id: "recent-2" }, { id: "fresh-2" }],
    new Set(["recent-1", "recent-2"]),
  );

  assert.deepEqual(
    ordered.map((question) => question.id),
    ["fresh-1", "fresh-2", "recent-1", "recent-2"],
  );
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { submitExamSeenFeedback } from "../src/lib/feedback/exam-seen.ts";

function createRepository() {
  const rows = new Map();
  return {
    rows,
    async upsertFeedback(input) {
      const key = `${input.user_id}:${input.item_type}:${input.item_id}`;
      const existing = rows.get(key);
      const row = {
        id: existing?.id ?? `feedback-${rows.size + 1}`,
        ...input,
        created_at: existing?.created_at ?? "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:01.000Z",
      };
      rows.set(key, row);
      return row;
    },
  };
}

test("logged-in user can submit first feedback", async () => {
  const repository = createRepository();
  const result = await submitExamSeenFeedback(repository, {
    session_user_id: "user-1",
    item_type: "vocab",
    item_id: "item-1",
    feedback: "yes",
  });

  assert.equal(result.feedback, "yes");
  assert.equal(repository.rows.size, 1);
});

test("repeat feedback updates same user item row", async () => {
  const repository = createRepository();
  await submitExamSeenFeedback(repository, {
    session_user_id: "user-1",
    item_type: "vocab",
    item_id: "item-1",
    feedback: "yes",
  });
  const result = await submitExamSeenFeedback(repository, {
    session_user_id: "user-1",
    item_type: "vocab",
    item_id: "item-1",
    feedback: "unknown",
  });

  assert.equal(result.feedback, "unknown");
  assert.equal(repository.rows.size, 1);
});

test("anonymous users cannot submit score feedback", async () => {
  const repository = createRepository();
  await assert.rejects(
    () =>
      submitExamSeenFeedback(repository, {
        session_user_id: null,
        item_type: "vocab",
        item_id: "item-1",
        feedback: "yes",
      }),
    /login required/,
  );
});

test("invalid feedback value is rejected", async () => {
  const repository = createRepository();
  await assert.rejects(
    () =>
      submitExamSeenFeedback(repository, {
        session_user_id: "user-1",
        item_type: "vocab",
        item_id: "item-1",
        feedback: "maybe",
      }),
    /invalid feedback/,
  );
});

test("feedback API route exists", () => {
  const route = readFileSync(
    new URL("../src/app/api/items/[item_type]/[item_id]/exam-seen-feedback/route.ts", import.meta.url),
    "utf8",
  );
  assert.match(route, /export async function POST/);
  assert.match(route, /submitExamSeenFeedback/);
});

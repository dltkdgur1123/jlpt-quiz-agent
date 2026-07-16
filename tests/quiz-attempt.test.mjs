import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { submitQuizAttempt } from "../src/lib/quiz/attempt.ts";

const item = {
  id: "vocab-1",
  correct_choice: "A",
  explanation: "먹다라는 뜻입니다.",
};

function createRepository() {
  const saved = [];
  return {
    saved,
    async findAnswerItem({ itemId }) {
      return itemId === item.id ? item : null;
    },
    async saveQuizAttempt(input) {
      saved.push(input);
      return { id: `attempt-${saved.length}`, ...input, answered_at: "2026-01-01T00:00:00.000Z" };
    },
  };
}

test("correct answer is saved and returns result with answer and explanation", async () => {
  const repository = createRepository();
  const result = await submitQuizAttempt(repository, {
    item_type: "vocab",
    item_id: "vocab-1",
    selected_choice: "A",
    user_id: "user-1",
    response_time_ms: 1200,
  });

  assert.equal(result.is_correct, true);
  assert.equal(result.correct_choice, "A");
  assert.equal(result.explanation, item.explanation);
  assert.equal(repository.saved.length, 1);
  assert.equal(repository.saved[0].is_correct, true);
});

test("wrong answer is saved as incorrect", async () => {
  const repository = createRepository();
  const result = await submitQuizAttempt(repository, {
    item_type: "vocab",
    item_id: "vocab-1",
    selected_choice: "B",
    user_id: null,
    response_time_ms: null,
  });

  assert.equal(result.is_correct, false);
  assert.equal(repository.saved[0].is_correct, false);
});

test("repeat attempts are allowed", async () => {
  const repository = createRepository();
  await submitQuizAttempt(repository, { item_type: "vocab", item_id: "vocab-1", selected_choice: "A" });
  await submitQuizAttempt(repository, { item_type: "vocab", item_id: "vocab-1", selected_choice: "B" });

  assert.equal(repository.saved.length, 2);
});

test("feedback is not accepted or stored in quiz attempts", async () => {
  const repository = createRepository();
  await submitQuizAttempt(repository, {
    item_type: "vocab",
    item_id: "vocab-1",
    selected_choice: "A",
    feedback: "yes",
  });

  assert.equal("feedback" in repository.saved[0], false);
});

test("attempt API route exists", () => {
  const route = readFileSync(new URL("../src/app/api/quiz/attempts/route.ts", import.meta.url), "utf8");
  assert.match(route, /export async function POST/);
  assert.match(route, /submitQuizAttempt/);
});

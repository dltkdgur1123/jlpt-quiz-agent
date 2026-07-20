import assert from "node:assert/strict";
import test from "node:test";

import {
  isQuizItemSafeForExposure,
  validateQuizItem,
} from "../src/lib/quiz/quality-gate.ts";

const safeItem = {
  jlpt_level: "N5",
  question_text: "ここで写真を撮っ（　　　）か。",
  choice_a: "てもいいです",
  choice_b: "てはいけません",
  choice_c: "たいです",
  choice_d: "たことがあります",
  correct_choice: "A",
  status: "active",
};

test("safe JLPT-style items pass the quality gate", () => {
  assert.deepEqual(validateQuizItem(safeItem), { valid: true, errors: [] });
  assert.equal(isQuizItemSafeForExposure(safeItem), true);
});

test("question text and choices cannot contain Korean before exposure", () => {
  const result = validateQuizItem({
    ...safeItem,
    question_text: "다음 문법 표현의 의미로 가장 알맞은 것은? 〜てもいい",
    choice_a: "~해도 된다",
  });

  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /question_text must not contain Korean/);
  assert.match(result.errors.join("\n"), /choice_a must not contain Korean/);
});

test("Korean explanations and meanings are outside the quiz exposure gate", () => {
  const result = validateQuizItem({
    ...safeItem,
    explanation: "한국어 해설은 제출 후에만 노출됩니다.",
    meaning: "~해도 된다",
  });

  assert.equal(result.valid, true);
});

test("unsafe status and invalid choice metadata fail exposure validation", () => {
  const result = validateQuizItem(
    {
      ...safeItem,
      correct_choice: "E",
      status: "draft",
    },
    { requireActive: true },
  );

  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /item must be active/);
  assert.match(result.errors.join("\n"), /invalid correct_choice/);
});

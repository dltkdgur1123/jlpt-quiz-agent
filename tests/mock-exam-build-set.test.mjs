import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildMockExamSet } from "../src/lib/mock-exam/build-set.ts";

function makeQuestion(item_type, index, review_status = "approved") {
  return {
    item_type,
    jlpt_level: "N5",
    question_type: item_type === "vocab" ? "vocab_context_blank" : "grammar_sentence_blank",
    question_text: `${item_type} question ${index}`,
    choice_a: "あ",
    choice_b: "い",
    choice_c: "う",
    choice_d: "え",
    correct_choice: "A",
    explanation: "테스트 해설",
    review_status,
    source_item: `${item_type}-${index}`,
  };
}

test("buildMockExamSet creates N5 Lite non-listening sections and seeded questions", () => {
  const pool = [
    ...Array.from({ length: 20 }, (_, index) => makeQuestion("vocab", index)),
    ...Array.from({ length: 20 }, (_, index) => makeQuestion("grammar", index)),
    { ...makeQuestion("vocab", 999), question_type: "listening_prompt" },
  ];

  const set = buildMockExamSet(pool, {
    setCode: "n5-mock-exam-lite-test",
    setTitle: "N5 모의고사 Lite Test",
    jlptLevel: "N5",
    seed: "fixed",
    vocabCount: 15,
    grammarCount: 15,
    timeLimitMinutes: 35,
  });

  assert.equal(set.set.mode, "lite");
  assert.equal(set.set.listening_included, false);
  assert.equal(set.set.question_count, 30);
  assert.deepEqual(
    set.sections.map((section) => section.section_key),
    ["vocab", "grammar"],
  );
  assert.equal(set.questions.filter((question) => question.section_key === "vocab").length, 15);
  assert.equal(set.questions.filter((question) => question.section_key === "grammar").length, 15);
  assert.equal(set.questions.some((question) => question.question_type.includes("listening")), false);
  assert.deepEqual(
    set.questions.map((question) => question.sort_order),
    Array.from({ length: 30 }, (_, index) => index + 1),
  );
});

test("buildMockExamSet defaults to approved rows and fails on small pools", () => {
  const pool = [
    ...Array.from({ length: 14 }, (_, index) => makeQuestion("vocab", index)),
    ...Array.from({ length: 15 }, (_, index) => makeQuestion("grammar", index)),
    makeQuestion("vocab", 100, "draft"),
  ];

  assert.throws(
    () =>
      buildMockExamSet(pool, {
        setCode: "n5-small-pool",
        setTitle: "Small Pool",
        jlptLevel: "N5",
      }),
    /not enough vocab questions/,
  );
});

test("generated N5 mock exam set artifact has 30 draft review questions", () => {
  const artifact = JSON.parse(
    readFileSync(new URL("../data/generated/n5-mock-exam-lite-set-001.json", import.meta.url), "utf8"),
  );

  assert.equal(artifact.set.set_code, "n5-mock-exam-lite-001");
  assert.equal(artifact.set.listening_included, false);
  assert.equal(artifact.set.question_count, 30);
  assert.equal(artifact.sections.length, 2);
  assert.equal(artifact.questions.filter((question) => question.section_key === "vocab").length, 15);
  assert.equal(artifact.questions.filter((question) => question.section_key === "grammar").length, 15);
  assert.equal(artifact.questions.some((question) => question.question_type.toLowerCase().includes("listening")), false);
});

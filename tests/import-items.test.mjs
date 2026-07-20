import assert from "node:assert/strict";
import test from "node:test";

import {
  buildInsertRows,
  validateImportRows,
} from "../src/lib/import/import-items.ts";

const validVocab = {
  word: "食べる",
  reading: "たべる",
  meaning: "먹다",
  jlpt_level: "N5",
  question_text: "あさごはんを（　　　）。",
  choice_a: "食べます",
  choice_b: "飲みます",
  choice_c: "見ます",
  choice_d: "行きます",
  correct_choice: "A",
  explanation: "食べる는 먹다라는 뜻입니다.",
  status: "active",
};

const validGrammar = {
  grammar_point: "〜てもいい",
  meaning: "~해도 된다",
  jlpt_level: "N5",
  question_text: "ここで写真を撮っ（　　　）か。",
  choice_a: "てもいいです",
  choice_b: "てはいけません",
  choice_c: "たいです",
  choice_d: "たことがあります",
  correct_choice: "A",
  explanation: "허가를 나타내는 표현입니다.",
  status: "active",
};

test("valid vocab rows become vocab_items insert rows without score fields", () => {
  const rows = buildInsertRows("vocab", [validVocab]);

  assert.equal(rows.length, 1);
  assert.equal(rows[0].word, "食べる");
  assert.equal(rows[0].correct_choice, "A");
  assert.equal("perceived_exam_score" in rows[0], false);
});

test("valid grammar rows become grammar_items insert rows", () => {
  const rows = buildInsertRows("grammar", [validGrammar]);

  assert.equal(rows.length, 1);
  assert.equal(rows[0].grammar_point, "〜てもいい");
  assert.equal(rows[0].jlpt_level, "N5");
});

test("missing required fields are rejected", () => {
  assert.throws(
    () => validateImportRows("vocab", [{ ...validVocab, meaning: "" }]),
    /missing required fields: meaning/,
  );
});

test("duplicate choices are rejected", () => {
  assert.throws(
    () => validateImportRows("grammar", [{ ...validGrammar, choice_b: "てもいいです" }]),
    /duplicate choices/,
  );
});

test("invalid correct choice is rejected", () => {
  assert.throws(
    () => validateImportRows("vocab", [{ ...validVocab, correct_choice: "E" }]),
    /invalid correct_choice/,
  );
});

test("Korean question text is rejected before import", () => {
  assert.throws(
    () =>
      validateImportRows("vocab", [
        { ...validVocab, question_text: "다음 단어의 뜻으로 가장 알맞은 것은? 食べる" },
      ]),
    /question_text must not contain Korean/,
  );
});

test("Korean choices are rejected before import, while Korean explanation is allowed", () => {
  assert.throws(
    () => validateImportRows("grammar", [{ ...validGrammar, choice_a: "~해도 된다" }]),
    /choice_a must not contain Korean/,
  );

  assert.doesNotThrow(() =>
    validateImportRows("grammar", [
      { ...validGrammar, explanation: "한국어 해설은 답안 제출 후에만 허용됩니다." },
    ]),
  );
});

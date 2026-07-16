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
  question_text: "다음 단어의 뜻으로 가장 알맞은 것은? 食べる",
  choice_a: "먹다",
  choice_b: "마시다",
  choice_c: "보다",
  choice_d: "가다",
  correct_choice: "A",
  explanation: "食べる는 먹다라는 뜻입니다.",
  status: "active",
};

const validGrammar = {
  grammar_point: "〜てもいい",
  meaning: "~해도 된다",
  jlpt_level: "N5",
  question_text: "다음 문법 표현의 의미로 가장 알맞은 것은? 〜てもいい",
  choice_a: "~해도 된다",
  choice_b: "~하지 않으면 안 된다",
  choice_c: "~하고 싶다",
  choice_d: "~한 적이 있다",
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
    () => validateImportRows("grammar", [{ ...validGrammar, choice_b: "~해도 된다" }]),
    /duplicate choices/,
  );
});

test("invalid correct choice is rejected", () => {
  assert.throws(
    () => validateImportRows("vocab", [{ ...validVocab, correct_choice: "E" }]),
    /invalid correct_choice/,
  );
});

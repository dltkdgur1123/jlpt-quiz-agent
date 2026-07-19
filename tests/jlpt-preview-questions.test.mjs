import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const preview = () =>
  JSON.parse(
    readFileSync(
      new URL("../data/generated/n5-jlpt-style-preview.json", import.meta.url),
      "utf8",
    ),
  );

const choiceKeys = ["choice_a", "choice_b", "choice_c", "choice_d"];

test("N5 JLPT-style preview contains 10 vocab and 10 grammar questions", () => {
  const rows = preview();
  assert.equal(rows.length, 20);
  assert.equal(rows.filter((row) => row.item_type === "vocab").length, 10);
  assert.equal(rows.filter((row) => row.item_type === "grammar").length, 10);
});

test("N5 JLPT-style preview rows are import-ready draft questions", () => {
  for (const row of preview()) {
    assert.equal(row.jlpt_level, "N5");
    assert.equal(row.review_status, "draft");
    assert.match(row.question_text, /（　　　）/);
    assert.match(row.correct_choice, /^[ABCD]$/);
    assert.ok(row.explanation.length > 20);
    const choices = choiceKeys.map((key) => row[key]);
    assert.equal(new Set(choices).size, 4);
  }
});

test("N5 JLPT-style preview uses selected structural question types", () => {
  const rows = preview();
  assert.ok(rows.filter((row) => row.question_type === "vocab_context_blank").length >= 10);
  assert.ok(rows.filter((row) => row.question_type === "grammar_sentence_blank").length >= 10);
});

test("N5 JLPT-style preview avoids officiality and prediction wording", () => {
  const source = readFileSync(
    new URL("../data/generated/n5-jlpt-style-preview.json", import.meta.url),
    "utf8",
  );
  for (const forbidden of ["기출", "공식 문제", "출제 예상", "반드시", "확률 보장"]) {
    assert.equal(source.includes(forbidden), false);
  }
});

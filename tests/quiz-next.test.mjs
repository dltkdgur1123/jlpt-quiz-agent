import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { getNextQuiz } from "../src/lib/quiz/next.ts";

const vocabItem = {
  id: "vocab-1",
  jlpt_level: "N5",
  word: "食べる",
  reading: "たべる",
  meaning: "먹다",
  question_text: "다음 단어의 뜻으로 가장 알맞은 것은? 食べる",
  choice_a: "먹다",
  choice_b: "마시다",
  choice_c: "보다",
  choice_d: "가다",
  correct_choice: "A",
  explanation: "먹다라는 뜻입니다.",
  status: "active",
};

const grammarItem = {
  id: "grammar-1",
  jlpt_level: "N5",
  grammar_point: "〜てもいい",
  meaning: "~해도 된다",
  question_text: "다음 문법 표현의 의미로 가장 알맞은 것은? 〜てもいい",
  choice_a: "~해도 된다",
  choice_b: "~하지 않으면 안 된다",
  choice_c: "~하고 싶다",
  choice_d: "~한 적이 있다",
  correct_choice: "A",
  explanation: "허가를 나타내는 표현입니다.",
  status: "active",
};

const repository = {
  async findNextVocabQuiz({ jlptLevel }) {
    return jlptLevel === "N5" ? vocabItem : null;
  },
  async findNextGrammarQuiz({ jlptLevel }) {
    return jlptLevel === "N5" ? grammarItem : null;
  },
};

test("vocab quiz lookup returns choices but hides answer and explanation", async () => {
  const quiz = await getNextQuiz(repository, { item_type: "vocab", jlpt_level: "N5" });

  assert.equal(quiz.item_type, "vocab");
  assert.equal(quiz.item_id, "vocab-1");
  assert.equal(quiz.question_text, vocabItem.question_text);
  assert.deepEqual(quiz.choices, [
    { key: "A", text: "먹다" },
    { key: "B", text: "마시다" },
    { key: "C", text: "보다" },
    { key: "D", text: "가다" },
  ]);
  assert.equal("correct_choice" in quiz, false);
  assert.equal("explanation" in quiz, false);
});

test("grammar quiz lookup returns grammar item choices", async () => {
  const quiz = await getNextQuiz(repository, { item_type: "grammar", jlpt_level: "N5" });

  assert.equal(quiz.item_type, "grammar");
  assert.equal(quiz.item_id, "grammar-1");
  assert.equal(quiz.choices[0].text, "~해도 된다");
});

test("invalid item_type is rejected", async () => {
  await assert.rejects(
    () => getNextQuiz(repository, { item_type: "kanji", jlpt_level: "N5" }),
    /invalid item_type/,
  );
});

test("invalid jlpt_level is rejected", async () => {
  await assert.rejects(
    () => getNextQuiz(repository, { item_type: "vocab", jlpt_level: "N0" }),
    /invalid jlpt_level/,
  );
});

test("API route exists at GET app/api/quiz/next", () => {
  const route = readFileSync(new URL("../src/app/api/quiz/next/route.ts", import.meta.url), "utf8");
  assert.match(route, /export async function GET/);
  assert.match(route, /item_type/);
  assert.match(route, /jlpt_level/);
});

test("Supabase quiz repository samples from multiple active rows", () => {
  const source = readFileSync(
    new URL("../src/lib/quiz/supabase-repository.ts", import.meta.url),
    "utf8",
  );
  assert.match(source, /pickRandomItem/);
  assert.match(source, /Math\.random/);
  assert.match(source, /limit\(50\)/);
  assert.equal(source.includes("maybeSingle"), false);
});

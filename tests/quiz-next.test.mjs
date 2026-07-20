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
  question_text: "あさごはんを（　　　）。",
  choice_a: "食べます",
  choice_b: "飲みます",
  choice_c: "見ます",
  choice_d: "行きます",
  correct_choice: "A",
  explanation: "먹다라는 뜻입니다.",
  status: "active",
};

const grammarItem = {
  id: "grammar-1",
  jlpt_level: "N5",
  grammar_point: "〜てもいい",
  meaning: "~해도 된다",
  question_text: "ここで写真を撮っ（　　　）か。",
  choice_a: "てもいいです",
  choice_b: "てはいけません",
  choice_c: "たいです",
  choice_d: "たことがあります",
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
    { key: "A", text: "食べます" },
    { key: "B", text: "飲みます" },
    { key: "C", text: "見ます" },
    { key: "D", text: "行きます" },
  ]);
  assert.equal("correct_choice" in quiz, false);
  assert.equal("explanation" in quiz, false);
});

test("grammar quiz lookup returns grammar item choices", async () => {
  const quiz = await getNextQuiz(repository, { item_type: "grammar", jlpt_level: "N5" });

  assert.equal(quiz.item_type, "grammar");
  assert.equal(quiz.item_id, "grammar-1");
  assert.equal(quiz.choices[0].text, "てもいいです");
});

test("quiz lookup blocks items that fail the exposure quality gate", async () => {
  const unsafeRepository = {
    async findNextVocabQuiz() {
      return { ...vocabItem, question_text: "다음 단어의 뜻으로 가장 알맞은 것은? 食べる" };
    },
    async findNextGrammarQuiz() {
      return grammarItem;
    },
  };

  await assert.rejects(
    () => getNextQuiz(unsafeRepository, { item_type: "vocab", jlpt_level: "N5" }),
    /quality gate/,
  );
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

test("Supabase quiz repository samples from multiple active safe rows", () => {
  const source = readFileSync(
    new URL("../src/lib/quiz/supabase-repository.ts", import.meta.url),
    "utf8",
  );
  assert.match(source, /pickRandomSafeItem/);
  assert.match(source, /isQuizItemSafeForExposure/);
  assert.match(source, /Math\.random/);
  assert.match(source, /limit\(50\)/);
  assert.equal(source.includes("maybeSingle"), false);
});

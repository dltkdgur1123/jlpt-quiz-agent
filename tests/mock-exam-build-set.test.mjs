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

test("buildMockExamSet creates seeded non-listening vocab and grammar sections", () => {
  const pool = [
    ...Array.from({ length: 20 }, (_, index) => makeQuestion("vocab", index)),
    ...Array.from({ length: 20 }, (_, index) => makeQuestion("grammar", index)),
    { ...makeQuestion("vocab", 999), question_type: "listening_prompt" },
  ];

  const set = buildMockExamSet(pool, {
    setCode: "n5-mock-exam-builder-test",
    setTitle: "N5 모의고사 Builder Test",
    jlptLevel: "N5",
    seed: "fixed",
    vocabCount: 15,
    grammarCount: 15,
    timeLimitMinutes: 35,
  });

  assert.equal(set.set.mode, "realistic");
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

test("buildMockExamSet moves recent question IDs behind fresh options when pool allows", () => {
  const pool = [
    ...Array.from({ length: 20 }, (_, index) => makeQuestion("vocab", index)),
    ...Array.from({ length: 20 }, (_, index) => makeQuestion("grammar", index)),
  ];
  const baseline = buildMockExamSet(pool, {
    setCode: "n5-recent-aware",
    setTitle: "Recent Aware",
    jlptLevel: "N5",
    seed: "fixed",
    vocabCount: 5,
    grammarCount: 5,
  });
  const recentQuestionIds = baseline.questions.slice(0, 2).map((question) => question.id);

  const recentAware = buildMockExamSet(pool, {
    setCode: "n5-recent-aware",
    setTitle: "Recent Aware",
    jlptLevel: "N5",
    seed: "fixed",
    vocabCount: 5,
    grammarCount: 5,
    recentQuestionIds,
  });

  assert.equal(recentAware.questions.slice(0, 5).some((question) => recentQuestionIds.includes(question.id)), false);
});

test("realistic N5 mock exam 001 has 50 non-listening questions", () => {
  const artifact = JSON.parse(
    readFileSync(new URL("../data/generated/n5-realistic-mock-exam-001.json", import.meta.url), "utf8"),
  );

  assert.equal(artifact.set.set_code, "n5-realistic-mock-exam-001");
  assert.equal(artifact.set.question_count, 50);
  assert.equal(artifact.set.listening_included, false);
  assert.deepEqual(
    artifact.sections.map((section) => `${section.section_key}:${section.question_count}`),
    ["vocab:20", "grammar:20", "reading:10"],
  );
  assert.equal(artifact.questions.filter((question) => question.section_key === "vocab").length, 20);
  assert.equal(artifact.questions.filter((question) => question.section_key === "grammar").length, 20);
  assert.equal(artifact.questions.filter((question) => question.section_key === "reading").length, 10);
  assert.equal(artifact.questions.some((question) => question.question_type.toLowerCase().includes("listening")), false);
});

test("realistic N5 mock exam 002 has production-ready draft composition", () => {
  const artifact = JSON.parse(
    readFileSync(new URL("../data/generated/n5-realistic-mock-exam-002.json", import.meta.url), "utf8"),
  );
  assertRealisticDraftArtifact(artifact, "n5-realistic-mock-exam-002", "N5");
});

test("realistic N5 mock exam 003 has production-ready draft composition and no prior overlap", () => {
  const artifact001 = JSON.parse(
    readFileSync(new URL("../data/generated/n5-realistic-mock-exam-001.json", import.meta.url), "utf8"),
  );
  const artifact002 = JSON.parse(
    readFileSync(new URL("../data/generated/n5-realistic-mock-exam-002.json", import.meta.url), "utf8"),
  );
  const artifact003 = JSON.parse(
    readFileSync(new URL("../data/generated/n5-realistic-mock-exam-003.json", import.meta.url), "utf8"),
  );
  assertRealisticDraftArtifact(artifact003, "n5-realistic-mock-exam-003", "N5");
  const priorQuestionTexts = new Set([...artifact001.questions, ...artifact002.questions].map((question) => question.question_text));
  assert.equal(artifact003.questions.some((question) => priorQuestionTexts.has(question.question_text)), false);
});

test("N4 through N1 realistic mock exams match the 50-question production draft contract", () => {
  const setCodes = [
    ["n4-realistic-mock-exam-001", "N4"],
    ["n4-realistic-mock-exam-002", "N4"],
    ["n4-realistic-mock-exam-003", "N4"],
    ["n3-realistic-mock-exam-001", "N3"],
    ["n3-realistic-mock-exam-002", "N3"],
    ["n2-realistic-mock-exam-001", "N2"],
    ["n2-realistic-mock-exam-002", "N2"],
    ["n1-realistic-mock-exam-001", "N1"],
    ["n1-realistic-mock-exam-002", "N1"],
  ];
  for (const [setCode, level] of setCodes) {
    const artifact = JSON.parse(
      readFileSync(new URL(`../data/generated/${setCode}.json`, import.meta.url), "utf8"),
    );
    assertRealisticDraftArtifact(artifact, setCode, level);
  }
});

test("realistic mock exam sentence-build and context blanks avoid known answer-quality regressions", () => {
  const artifactPaths = [
    "n5-realistic-mock-exam-001",
    "n5-realistic-mock-exam-002",
    "n5-realistic-mock-exam-003",
    "n4-realistic-mock-exam-001",
    "n4-realistic-mock-exam-002",
    "n4-realistic-mock-exam-003",
    "n3-realistic-mock-exam-001",
    "n3-realistic-mock-exam-002",
    "n2-realistic-mock-exam-001",
    "n2-realistic-mock-exam-002",
    "n1-realistic-mock-exam-001",
    "n1-realistic-mock-exam-002",
  ];

  for (const setCode of artifactPaths) {
    const artifact = JSON.parse(
      readFileSync(new URL(`../data/generated/${setCode}.json`, import.meta.url), "utf8"),
    );
    for (const question of artifact.questions) {
      assert.match(question.correct_choice, /^[ABCD]$/, `${setCode} ${question.sort_order} correct_choice must be A-D`);
      if (question.question_type === "grammar_sentence_build") {
        assert.match(
          `${question.question_text} ${question.choice_a} ${question.choice_b} ${question.choice_c} ${question.choice_d}`,
          /★/,
          `${setCode} ${question.sort_order} sentence-build must mark star target`,
        );
      }
    }
  }

  const n5Set001 = JSON.parse(
    readFileSync(new URL("../data/generated/n5-realistic-mock-exam-001.json", import.meta.url), "utf8"),
  );
  const headacheQuestion = n5Set001.questions.find((question) => question.source_item === "頭");
  assert.ok(headacheQuestion, "headache vocabulary question exists");
  assert.deepEqual(
    [headacheQuestion.choice_a, headacheQuestion.choice_b, headacheQuestion.choice_c, headacheQuestion.choice_d],
    ["机", "新聞", "切手", "頭"],
  );
  assert.equal(headacheQuestion.correct_choice, "D");

  const expectedSentenceBuildAnswers = new Map([
    ["n5-realistic-mock-exam-001:26", "B"],
    ["n5-realistic-mock-exam-001:27", "B"],
    ["n5-realistic-mock-exam-001:29", "B"],
    ["n5-realistic-mock-exam-002:31", "B"],
    ["n5-realistic-mock-exam-002:32", "C"],
    ["n5-realistic-mock-exam-003:31", "D"],
    ["n5-realistic-mock-exam-003:35", "D"],
  ]);

  for (const [key, expectedChoice] of expectedSentenceBuildAnswers) {
    const [setCode, sortOrder] = key.split(":");
    const artifact = JSON.parse(
      readFileSync(new URL(`../data/generated/${setCode}.json`, import.meta.url), "utf8"),
    );
    const question = artifact.questions.find((candidate) => candidate.sort_order === Number(sortOrder));
    assert.equal(question?.correct_choice, expectedChoice, key);
  }
});

function assertRealisticDraftArtifact(artifact, expectedSetCode, expectedLevel) {
  const preAnswerFields = ["question_text", "choice_a", "choice_b", "choice_c", "choice_d"];
  const hasKorean = /[가-힣]/;
  const readingMinimums = { N1: 300, N2: 240, N3: 190, N4: 140, N5: 120 };

  assert.equal(artifact.set.set_code, expectedSetCode);
  assert.equal(artifact.set.jlpt_level, expectedLevel);
  assert.equal(artifact.set.question_count, 50);
  assert.equal(artifact.set.listening_included, false);
  assert.deepEqual(
    artifact.sections.map((section) => `${section.section_key}:${section.question_count}`),
    ["vocab:20", "grammar:20", "reading:10"],
  );
  assert.deepEqual(
    Object.fromEntries(["vocab", "grammar", "reading"].map((section) => [
      section,
      artifact.questions.filter((question) => question.section_key === section).length,
    ])),
    { vocab: 20, grammar: 20, reading: 10 },
  );
  assert.equal(new Set(artifact.questions.map((question) => question.question_text)).size, artifact.questions.length);
  const readingQuestions = artifact.questions.filter((question) => question.section_key === "reading");
  assert.equal(
    readingQuestions.every((question) => question.question_text.length >= readingMinimums[expectedLevel]),
    true,
    `${expectedLevel} reading passages must be strengthened beyond placeholder length`,
  );
  assert.equal(artifact.questions.some((question) => question.question_type.toLowerCase().includes("listening")), false);
  assert.equal(
    artifact.questions.some((question) => preAnswerFields.some((field) => hasKorean.test(String(question[field] ?? "")))),
    false,
  );
  for (const questionType of [
    "vocab_reading",
    "vocab_orthography",
    "vocab_context_blank",
    "vocab_paraphrase",
    "grammar_sentence_blank",
    "grammar_sentence_build",
    "grammar_text_blank",
    "reading_short",
    "reading_medium",
    "reading_info",
  ]) {
    assert.ok(artifact.questions.some((question) => question.question_type === questionType), `${questionType} missing`);
  }
}

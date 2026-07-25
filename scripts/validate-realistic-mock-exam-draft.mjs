#!/usr/bin/env node
import { readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";

const targetPath = process.argv[2];
if (!targetPath) {
  console.error("Usage: node scripts/validate-realistic-mock-exam-draft.mjs data/generated/<set>.json");
  process.exit(2);
}

const readingMinimums = { N1: 300, N2: 240, N3: 190, N4: 140, N5: 120 };
const expectedTypes = {
  vocab: ["vocab_reading", "vocab_orthography", "vocab_context_blank", "vocab_paraphrase"],
  grammar: ["grammar_sentence_blank", "grammar_sentence_build", "grammar_text_blank"],
  reading: ["reading_short", "reading_medium", "reading_info"],
};
const hangul = /[ㄱ-ㅎㅏ-ㅣ가-힣]/u;

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function assert(condition, message, errors) {
  if (!condition) errors.push(message);
}

function collectExistingQuestionTexts(exceptFile) {
  const generatedDir = "data/generated";
  const texts = new Map();
  for (const fileName of readdirSync(generatedDir)) {
    if (!/^n[1-5]-realistic-mock-exam-\d{3}\.json$/.test(fileName)) continue;
    if (fileName === basename(exceptFile)) continue;
    const artifact = loadJson(join(generatedDir, fileName));
    for (const question of artifact.questions ?? []) {
      if (typeof question.question_text === "string") texts.set(question.question_text, fileName);
    }
  }
  return texts;
}

const artifact = loadJson(targetPath);
const errors = [];
const set = artifact.set ?? {};
const questions = artifact.questions ?? [];
const sections = artifact.sections ?? [];
const level = set.jlpt_level;
const expectedSetCode = basename(targetPath, ".json");

assert(set.set_code === expectedSetCode, `set.set_code must match filename: ${expectedSetCode}`, errors);
assert(["N1", "N2", "N3", "N4", "N5"].includes(level), "set.jlpt_level must be N1-N5", errors);
assert(set.mode === "realistic", "set.mode must be realistic", errors);
assert(set.status === "draft", "set.status must be draft before human review", errors);
assert(set.listening_included === false, "listening must be excluded", errors);
assert(set.question_count === 50, "set.question_count must be 50", errors);
assert(questions.length === 50, "questions length must be 50", errors);
assert(sections.length === 3, "sections length must be 3", errors);

const bySection = Object.groupBy(questions, (question) => question.section_key);
assert((bySection.vocab ?? []).length === 20, "vocab must have 20 questions", errors);
assert((bySection.grammar ?? []).length === 20, "grammar must have 20 questions", errors);
assert((bySection.reading ?? []).length === 10, "reading must have 10 questions", errors);

for (const [sectionKey, types] of Object.entries(expectedTypes)) {
  const present = new Set((bySection[sectionKey] ?? []).map((question) => question.question_type));
  for (const type of types) assert(present.has(type), `${sectionKey} must include ${type}`, errors);
}

const ids = new Set();
const questionTexts = new Set();
for (const question of questions) {
  assert(typeof question.id === "string" && question.id.length > 3, `question has invalid id: ${question.sort_order}`, errors);
  assert(!ids.has(question.id), `duplicate id: ${question.id}`, errors);
  ids.add(question.id);
  assert(question.mock_exam_set_code === set.set_code, `question ${question.id} has wrong mock_exam_set_code`, errors);
  assert(["A", "B", "C", "D"].includes(question.correct_choice), `question ${question.id} invalid correct_choice`, errors);
  for (const field of ["question_text", "choice_a", "choice_b", "choice_c", "choice_d"]) {
    assert(typeof question[field] === "string" && question[field].trim().length > 0, `question ${question.id} missing ${field}`, errors);
    assert(!hangul.test(question[field]), `question ${question.id} ${field} must not contain Korean before submit`, errors);
  }
  assert(!questionTexts.has(question.question_text), `duplicate question_text inside set: ${question.id}`, errors);
  questionTexts.add(question.question_text);
}

const minReadingLength = readingMinimums[level];
for (const question of bySection.reading ?? []) {
  assert(
    question.question_text.length >= minReadingLength,
    `reading ${question.id} is too short: ${question.question_text.length} < ${minReadingLength}`,
    errors,
  );
}

const existingTexts = collectExistingQuestionTexts(targetPath);
for (const question of questions) {
  const duplicateFile = existingTexts.get(question.question_text);
  assert(!duplicateFile, `question_text duplicated from ${duplicateFile}: ${question.id}`, errors);
}

const result = {
  ok: errors.length === 0,
  file: targetPath,
  set_code: set.set_code,
  level,
  counts: {
    total: questions.length,
    vocab: (bySection.vocab ?? []).length,
    grammar: (bySection.grammar ?? []).length,
    reading: (bySection.reading ?? []).length,
  },
  reading_min: Math.min(...(bySection.reading ?? []).map((question) => question.question_text.length)),
  errors,
};

console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);

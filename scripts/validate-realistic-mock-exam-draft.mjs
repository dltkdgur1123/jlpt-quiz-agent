#!/usr/bin/env node
import { readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";

const targetPath = process.argv[2];
if (!targetPath) {
  console.error("Usage: node scripts/validate-realistic-mock-exam-draft.mjs data/generated/<set>.json|--all");
  process.exit(2);
}

const generatedDir = "data/generated";
const artifactFilePattern = /^n[1-5]-realistic-mock-exam-\d{3}\.json$/;
const readingMinimums = { N1: 300, N2: 240, N3: 190, N4: 140, N5: 120 };
const expectedTypes = {
  vocab: ["vocab_reading", "vocab_orthography", "vocab_context_blank", "vocab_paraphrase"],
  grammar: ["grammar_sentence_blank", "grammar_sentence_build", "grammar_text_blank"],
  reading: ["reading_short", "reading_medium", "reading_info"],
};
const hangul = /[ㄱ-ㅎㅏ-ㅣ가-힣]/u;
const unsafeTrustWording = /公式|公式問題|本試験そのまま|実際の試験|予想問題|的中|合格保証|합격 ?보장|공식|기출 ?그대로|출제 ?예상/iu;
const choiceLetters = ["A", "B", "C", "D"];

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function assert(condition, message, errors) {
  if (!condition) errors.push(message);
}

function listArtifactPaths() {
  return readdirSync(generatedDir)
    .filter((fileName) => artifactFilePattern.test(fileName))
    .sort()
    .map((fileName) => join(generatedDir, fileName));
}

function collectExistingQuestionTexts(exceptFile) {
  const texts = new Map();
  for (const filePath of listArtifactPaths()) {
    if (basename(filePath) === basename(exceptFile)) continue;
    const artifact = loadJson(filePath);
    for (const question of artifact.questions ?? []) {
      if (typeof question.question_text === "string") texts.set(question.question_text, basename(filePath));
    }
  }
  return texts;
}

function validateArtifact(path) {
  const artifact = loadJson(path);
  const errors = [];
  const set = artifact.set ?? {};
  const questions = artifact.questions ?? [];
  const sections = artifact.sections ?? [];
  const level = set.jlpt_level;
  const expectedSetCode = basename(path, ".json");

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
  const correctChoiceCounts = Object.fromEntries(choiceLetters.map((choice) => [choice, 0]));
  for (const question of questions) {
    assert(typeof question.id === "string" && question.id.length > 3, `question has invalid id: ${question.sort_order}`, errors);
    assert(!ids.has(question.id), `duplicate id: ${question.id}`, errors);
    ids.add(question.id);
    assert(question.mock_exam_set_code === set.set_code, `question ${question.id} has wrong mock_exam_set_code`, errors);
    assert(choiceLetters.includes(question.correct_choice), `question ${question.id} invalid correct_choice`, errors);
    if (choiceLetters.includes(question.correct_choice)) correctChoiceCounts[question.correct_choice] += 1;
    const choices = choiceLetters.map((choice) => String(question[`choice_${choice.toLowerCase()}`] ?? "").trim());
    assert(new Set(choices).size === choices.length, `question ${question.id} has duplicate choices`, errors);
    for (const field of ["question_text", "choice_a", "choice_b", "choice_c", "choice_d"]) {
      assert(typeof question[field] === "string" && question[field].trim().length > 0, `question ${question.id} missing ${field}`, errors);
      assert(!hangul.test(question[field]), `question ${question.id} ${field} must not contain Korean before submit`, errors);
      assert(!unsafeTrustWording.test(question[field]), `question ${question.id} ${field} has unsafe trust wording`, errors);
    }
    assert(!unsafeTrustWording.test(String(question.explanation ?? "")), `question ${question.id} explanation has unsafe trust wording`, errors);
    if (question.question_type === "grammar_sentence_build") {
      assert(
        [question.question_text, ...choices].some((value) => value.includes("★")),
        `question ${question.id} sentence-build must mark star target`,
        errors,
      );
    }
    assert(!questionTexts.has(question.question_text), `duplicate question_text inside set: ${question.id}`, errors);
    questionTexts.add(question.question_text);
  }

  const maxCorrectChoiceCount = Math.max(...Object.values(correctChoiceCounts));
  const usedCorrectChoiceCount = Object.values(correctChoiceCounts).filter((count) => count > 0).length;
  assert(
    usedCorrectChoiceCount >= 2 && maxCorrectChoiceCount < questions.length,
    `correct choice distribution is too skewed: ${JSON.stringify(correctChoiceCounts)}`,
    errors,
  );

  const minReadingLength = readingMinimums[level];
  for (const question of bySection.reading ?? []) {
    assert(
      question.question_text.length >= minReadingLength,
      `reading ${question.id} is too short: ${question.question_text.length} < ${minReadingLength}`,
      errors,
    );
  }

  const existingTexts = collectExistingQuestionTexts(path);
  for (const question of questions) {
    const duplicateFile = existingTexts.get(question.question_text);
    assert(!duplicateFile, `question_text duplicated from ${duplicateFile}: ${question.id}`, errors);
  }

  return {
    ok: errors.length === 0,
    file: path,
    set_code: set.set_code,
    level,
    counts: {
      total: questions.length,
      vocab: (bySection.vocab ?? []).length,
      grammar: (bySection.grammar ?? []).length,
      reading: (bySection.reading ?? []).length,
    },
    correct_choice_counts: correctChoiceCounts,
    reading_min: Math.min(...(bySection.reading ?? []).map((question) => question.question_text.length)),
    errors,
  };
}

if (targetPath === "--all") {
  const results = listArtifactPaths().map(validateArtifact);
  const failed = results.filter((result) => !result.ok);
  console.log(JSON.stringify({ ok: failed.length === 0, checked_files: results.map((result) => result.file), failed }, null, 2));
  if (failed.length > 0) process.exit(1);
} else {
  const result = validateArtifact(targetPath);
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exit(1);
}

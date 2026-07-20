#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { buildMockExamSet } from "../src/lib/mock-exam/build-set.ts";

const inputPaths = process.argv.slice(2);
const defaultInputs = [
  "data/generated/n5-jlpt-style-preview.json",
  "data/generated/n5-jlpt-style-preview-batch-002.json",
  "data/generated/n5-jlpt-style-preview-batch-003.json",
];

const rows = (inputPaths.length ? inputPaths : defaultInputs).flatMap((path) => {
  const parsed = JSON.parse(readFileSync(path, "utf8"));
  return parsed.map((row) => ({
    ...row,
    generation_batch: row.generation_batch ?? path.match(/batch-\d+/)?.[0] ?? "batch-001",
  }));
});

const artifact = buildMockExamSet(rows, {
  setCode: "n5-mock-exam-lite-001",
  setTitle: "N5 모의고사 Lite 001",
  jlptLevel: "N5",
  seed: process.env.JLPT_MOCK_EXAM_SET_SEED ?? "n5-lite-001",
  vocabCount: Number(process.env.JLPT_MOCK_EXAM_VOCAB_COUNT ?? 15),
  grammarCount: Number(process.env.JLPT_MOCK_EXAM_GRAMMAR_COUNT ?? 15),
  timeLimitMinutes: Number(process.env.JLPT_MOCK_EXAM_TIME_LIMIT_MINUTES ?? 35),
  eligibleReviewStatuses: ["draft", "approved"],
});

const outputPath = "data/generated/n5-mock-exam-lite-set-001.json";
writeFileSync(outputPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(JSON.stringify({ ok: true, outputPath, question_count: artifact.set.question_count }, null, 2));

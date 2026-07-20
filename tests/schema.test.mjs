import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migrations = [
  "../supabase/migrations/0001_initial_mvp_schema.sql",
  "../supabase/migrations/0002_source_traceability.sql",
  "../supabase/migrations/0003_mock_exam_schema.sql",
];
const schema = migrations
  .map((path) => readFileSync(new URL(path, import.meta.url), "utf8"))
  .join("\n");
const types = readFileSync(new URL("../src/lib/db/types.ts", import.meta.url), "utf8");

const requiredTables = [
  "users",
  "vocab_items",
  "grammar_items",
  "quiz_attempts",
  "exam_seen_feedback",
  "item_score_stats",
];

test("schema defines all official MVP tables", () => {
  for (const table of requiredTables) {
    assert.match(schema, new RegExp(`create table if not exists public\\.${table}\\b`));
  }
});

test("feedback uniqueness and allowed values are enforced", () => {
  assert.match(schema, /unique \(user_id, item_type, item_id\)/);
  assert.match(schema, /feedback text not null check \(feedback in \('yes', 'no', 'unknown'\)\)/);
});

test("quiz attempts and exam seen feedback are separate tables", () => {
  const attemptsIndex = schema.indexOf("create table if not exists public.quiz_attempts");
  const feedbackIndex = schema.indexOf("create table if not exists public.exam_seen_feedback");
  assert.notEqual(attemptsIndex, -1);
  assert.notEqual(feedbackIndex, -1);
  assert.notEqual(attemptsIndex, feedbackIndex);
});

test("score stats use perceived_exam_score and preserve unknown count", () => {
  assert.match(schema, /perceived_exam_score numeric/);
  assert.match(schema, /feedback_unknown_count integer/);
  assert.match(schema, /feedback_yes_count \+ feedback_no_count \+ feedback_unknown_count = feedback_total_count/);
});

test("source traceability fields are added to quiz item tables", () => {
  for (const field of [
    "source_type",
    "source_day",
    "source_item",
    "source_reading",
    "generation_batch",
    "review_status",
  ]) {
    assert.match(schema, new RegExp(`add column if not exists ${field} text`));
    assert.match(types, new RegExp(`${field}: .* \\| null`));
  }
  assert.match(schema, /source_type in \('shorts', 'manual', 'generated'\)/);
  assert.match(schema, /review_status in \('draft', 'approved', 'rejected'\)/);
});

test("TypeScript DB types expose core domain names", () => {
  assert.match(types, /export type FeedbackValue = "yes" \| "no" \| "unknown"/);
  assert.match(types, /export type SourceType = "shorts" \| "manual" \| "generated"/);
  assert.match(types, /export interface ItemScoreStats/);
  assert.match(types, /perceived_exam_score: number \| null/);
});

test("mock exam schema defines non-listening set attempt answer result tables", () => {
  for (const table of [
    "mock_exam_sets",
    "mock_exam_sections",
    "mock_exam_questions",
    "mock_exam_attempts",
    "mock_exam_answers",
    "mock_exam_section_results",
  ]) {
    assert.match(schema, new RegExp(`create table if not exists public\\.${table}\\b`));
  }

  assert.match(schema, /listening_included boolean not null default false/);
  assert.match(schema, /check \(listening_included = false\)/);
  assert.match(schema, /check \(section_key <> 'listening'\)/);
  assert.match(schema, /item_type text not null check \(item_type in \('vocab', 'grammar', 'reading'\)\)/);
  assert.match(schema, /score_total is null or score_max is null or score_total <= score_max/);
});

test("TypeScript DB types expose mock exam domain names", () => {
  for (const name of [
    "MockExamSet",
    "MockExamSection",
    "MockExamQuestion",
    "MockExamAttempt",
    "MockExamAnswer",
    "MockExamSectionResult",
  ]) {
    assert.match(types, new RegExp(`export interface ${name}`));
  }

  assert.match(types, /export type MockExamAttemptStatus = "in_progress" \| "submitted" \| "abandoned"/);
  assert.match(types, /listening_included: false/);
  assert.match(types, /section_key: ActiveMockExamSectionKey/);
});

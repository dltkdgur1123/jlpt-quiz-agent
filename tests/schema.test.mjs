import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const schema = readFileSync(
  new URL("../supabase/migrations/0001_initial_mvp_schema.sql", import.meta.url),
  "utf8",
);
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

test("TypeScript DB types expose core domain names", () => {
  assert.match(types, /export type FeedbackValue = "yes" \| "no" \| "unknown"/);
  assert.match(types, /export interface ItemScoreStats/);
  assert.match(types, /perceived_exam_score: number \| null/);
});

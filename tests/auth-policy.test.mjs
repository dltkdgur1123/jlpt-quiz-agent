import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const authPolicy = readFileSync(new URL("../src/lib/auth/policy.ts", import.meta.url), "utf8");
const userSync = readFileSync(new URL("../src/lib/auth/user-sync.ts", import.meta.url), "utf8");
const rlsDraft = readFileSync(new URL("../supabase/policies/0002_auth_policy_draft.sql", import.meta.url), "utf8");
const doc = readFileSync(new URL("../docs/architecture/ns-ticket-003.md", import.meta.url), "utf8");

test("anonymous users may read quiz and submit attempts but cannot submit score feedback", () => {
  assert.match(authPolicy, /canReadQuiz.*true/s);
  assert.match(authPolicy, /canSubmitAttempt.*true/s);
  assert.match(authPolicy, /canSubmitExamSeenFeedback.*Boolean\(sessionUserId\)/s);
});

test("auth user sync maps Supabase user to MVP users table fields", () => {
  assert.match(userSync, /auth_provider: "supabase"/);
  assert.match(userSync, /provider_user_id: authUser\.id/);
  assert.match(userSync, /display_name/);
});

test("RLS draft allows public quiz reads and blocks anonymous feedback writes", () => {
  assert.match(rlsDraft, /alter table public\.vocab_items enable row level security/);
  assert.match(rlsDraft, /create policy "public can read active vocab items"/);
  assert.match(rlsDraft, /create policy "authenticated users can upsert own exam seen feedback"/);
  assert.match(rlsDraft, /auth\.uid\(\) = user_id/);
});

test("auth policy doc preserves MVP boundaries", () => {
  assert.match(doc, /비로그인 사용자는 퀴즈 조회와 답안 제출 가능/);
  assert.match(doc, /로그인 사용자만 출제 경험 feedback 제출/);
  assert.match(doc, /anonymous_id는 MVP score 반영용으로 사용하지 않는다/);
});

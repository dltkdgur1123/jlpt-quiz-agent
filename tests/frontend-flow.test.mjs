import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const quizClient = () => readFileSync(new URL("../src/components/quiz/QuizMvp.tsx", import.meta.url), "utf8");
const scoreCard = () => readFileSync(new URL("../src/components/score/ScoreCard.tsx", import.meta.url), "utf8");
const qaDoc = () => readFileSync(new URL("../docs/qa/mvp-integrated-qa.md", import.meta.url), "utf8");

test("front page contains level/type selection and mobile-first quiz flow", () => {
  const source = quizClient();
  assert.match(source, /JLPT 레벨/);
  assert.match(source, /문제 유형/);
  assert.match(source, /답안 제출/);
  assert.match(source, /choice-button/);
  assert.match(source, /\/api\/quiz\/next/);
});

test("answer result shows correctness, explanation, and real logged-in feedback choices only after answer", () => {
  const source = quizClient();
  assert.match(source, /정답입니다|오답입니다/);
  assert.match(source, /해설/);
  assert.match(source, /이 표현을 JLPT 시험에서 본 기억이 있나요/);
  assert.match(source, /예/);
  assert.match(source, /아니오/);
  assert.match(source, /모르겠다/);
  assert.match(source, /로그인하면 출제 경험 제보를 제출할 수 있습니다/);
  assert.match(source, /Authorization/);
  assert.match(source, /Bearer/);
  assert.match(source, /exam-seen-feedback/);
  assert.equal(source.includes("로그인 사용자 미리보기"), false);
});

test("score UI uses safe wording and data-insufficient state", () => {
  const source = scoreCard();
  assert.match(source, /출제 체감 score/);
  assert.match(source, /perceived_exam_score/);
  assert.match(source, /제보 수/);
  assert.match(source, /데이터 부족/);
  assert.match(source, /사용자 출제 경험 제보/);
});

test("integrated QA checklist covers MVP loop", () => {
  const source = qaDoc();
  for (const phrase of [
    "퀴즈 조회",
    "답안 제출",
    "정답 확인",
    "로그인 feedback",
    "중복 feedback update",
    "perceived_exam_score",
    "비로그인 feedback 차단",
    "금지 표현 없음",
  ]) {
    assert.match(source, new RegExp(phrase));
  }
});

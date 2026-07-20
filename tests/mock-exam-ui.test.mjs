import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const homePage = () => readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
const mockExamPage = () => readFileSync(new URL("../src/app/mock-exams/n5-lite-002/page.tsx", import.meta.url), "utf8");
const mockExamClient = () =>
  readFileSync(new URL("../src/components/mock-exam/MockExamLite.tsx", import.meta.url), "utf8");

test("home page promotes N5 mock exam Lite entry", () => {
  const source = homePage();
  assert.match(source, /JLPT Mock Exam Platform/);
  assert.match(source, /JLPT 모의고사 Lite/);
  assert.match(source, /\/mock-exams\/n5-lite-002/);
});

test("N5 mock exam page loads generated set artifact", () => {
  const source = mockExamPage();
  assert.match(source, /n5-mock-exam-lite-set-002\.json/);
  assert.match(source, /MockExamLite/);
});

test("mock exam client keeps answers hidden until full submit and shows section results", () => {
  const source = mockExamClient();
  for (const phrase of [
    "전체 제출",
    "미응답",
    "타이머",
    "공식 JLPT 점수 환산",
    "합격 판정",
    "sectionResults",
    "selectedAnswers",
    "seenFeedbacks",
    "출제 경험 체크",
    "본 적 있음",
    "로그인 기반 저장/API 연결은 다음 티켓",
  ]) {
    assert.match(source, new RegExp(phrase));
  }
  assert.match(source, /submitted \? \(/);
  assert.match(source, /청해 없이/);
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const homePage = () => readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
const mockExamPage = () => readFileSync(new URL("../src/app/mock-exams/n5-lite-002/page.tsx", import.meta.url), "utf8");
const realisticMockExamPage = () =>
  readFileSync(new URL("../src/app/mock-exams/n5-realistic-001/page.tsx", import.meta.url), "utf8");
const mockExamClient = () =>
  readFileSync(new URL("../src/components/mock-exam/MockExamLite.tsx", import.meta.url), "utf8");

test("home page promotes N5 mock exam Lite entry", () => {
  const source = homePage();
  assert.match(source, /JLPT Mock Exam Platform/);
  assert.match(source, /JLPT 모의고사 Lite/);
  assert.match(source, /\/mock-exams\/n5-realistic-001/);
  assert.match(source, /\/mock-exams\/n5-lite-002/);
});

test("N5 mock exam page loads generated set artifact", () => {
  const source = mockExamPage();
  assert.match(source, /n5-mock-exam-lite-set-002\.json/);
  assert.match(source, /MockExamLite/);
});

test("N5 realistic mock exam page loads generated 50-question set", () => {
  const source = realisticMockExamPage();
  assert.match(source, /n5-realistic-mock-exam-001\.json/);
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
    "問題６　次の文の ★ に入る最もよいものを、１・２・３・４から一つ選びなさい。",
    "풀이 안내:",
    "★ 자리에 들어갈 가장 알맞은 말을 고르세요.",
    "「　」 안 단어의 읽는 법을 고르세요.",
    "問題１　「　」のことばはどう読みますか。１・２・３・４から一つ選びなさい。",
    "CHOICE_NUMBERS",
    "問題{problem.problemNo}",
    "grammar_sentence_build",
    "attemptSeed",
    "buildRenderedChoices",
    "renderedCorrectChoice",
    "randomUUID",
    "originalCorrectIndex",
    "RECENT_HISTORY_STORAGE_KEY",
    "recentQuestionCount",
    "최근 풀이 중복",
    "최근 출제 문항 기록",
    "다음 랜덤 세트부터",
  ]) {
    assert.ok(source.includes(phrase), phrase);
  }
  assert.match(source, /submitted \? \(/);
  assert.match(source, /청해 없이/);
});

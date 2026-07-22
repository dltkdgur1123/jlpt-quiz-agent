import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const homePage = () => readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
const mockExamPage = () => readFileSync(new URL("../src/app/mock-exams/n5-lite-002/page.tsx", import.meta.url), "utf8");
const realisticMockExamPage = () =>
  readFileSync(new URL("../src/app/mock-exams/n5-realistic-001/page.tsx", import.meta.url), "utf8");
const dashboardPage = () => readFileSync(new URL("../src/app/dashboard/page.tsx", import.meta.url), "utf8");
const mockExamClient = () =>
  readFileSync(new URL("../src/components/mock-exam/MockExamLite.tsx", import.meta.url), "utf8");

test("home page promotes dashboard mock exam and Shorts entries", () => {
  const source = homePage();
  for (const phrase of [
    "HYOKU JLPT",
    "실전처럼 풀고,",
    "데이터로 합격에 가까워지세요.",
    "무료 모의고사 시작",
    "레벨별 모의고사",
    "이어서 학습하기",
    "최근 성적",
    "JLPT 쇼츠로 예열하기",
    "N5 필수 동사 会います 읽기",
    "home-shell",
    "home-level-grid",
    "home-auth-menu",
    "home-auth-popover",
  ]) {
    assert.ok(source.includes(phrase), phrase);
  }
  assert.match(source, /\/mock-exams\/n5-realistic-001/);
  assert.match(source, /\/mock-exams\/n5-lite-002/);
});

test("dashboard page matches Figma learning dashboard sections", () => {
  const source = dashboardPage();
  for (const phrase of [
    "안녕하세요, 효쿠님",
    "학습 요약",
    "주간 학습 활동",
    "7월 목표",
    "최근 모의고사",
    "현재 취약 영역",
    "dashboard-stat-grid",
    "dashboard-goal-card",
  ]) {
    assert.ok(source.includes(phrase), phrase);
  }
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
  assert.match(source, /exam-portal-layout/);
  assert.match(source, /exam-ad-sidebar/);
  assert.match(source, /Google Ad/);
});

test("mock exam client keeps answers hidden until full submit and shows section results", () => {
  const source = mockExamClient();
  for (const phrase of [
    "전체 제출",
    "미응답",
    "타이머",
    "Mock Test Result",
    "合否 結果通知書",
    "학습 참고용 모의 합격 여부",
    "상세 결과",
    "정답률",
    "선생님의 평가",
    "기록",
    "mock-radar-panel",
    "mock-history-chart",
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
    "복습 우선순위",
    "오답·미응답 노트",
    "reviewTargets",
    "weakestSections",
    "mock-exam-review-list",
    "progressPercent",
    "mock-exam-progress-bar",
    "mock-exam-hero",
    "mock-question-nav",
    "문제 목록",
  ]) {
    assert.ok(source.includes(phrase), phrase);
  }
  assert.match(source, /submitted \? \(/);
  assert.match(source, /청해 없이/);
});

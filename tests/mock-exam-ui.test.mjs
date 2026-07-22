import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const homePage = () => readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
const mockExamPage = () => readFileSync(new URL("../src/app/mock-exams/n5-lite-002/page.tsx", import.meta.url), "utf8");
const realisticMockExamPage = () =>
  readFileSync(new URL("../src/app/mock-exams/n5-realistic-001/page.tsx", import.meta.url), "utf8");
const dashboardPage = () => readFileSync(new URL("../src/app/dashboard/page.tsx", import.meta.url), "utf8");
const dashboardAttemptData = () =>
  readFileSync(new URL("../src/components/dashboard/DashboardAttemptData.tsx", import.meta.url), "utf8");
const mockExamAttemptRoute = () =>
  readFileSync(new URL("../src/app/api/mock-exams/attempts/route.ts", import.meta.url), "utf8");
const mockExamClient = () =>
  readFileSync(new URL("../src/components/mock-exam/MockExamLite.tsx", import.meta.url), "utf8");
const siteHeader = () => readFileSync(new URL("../src/components/layout/SiteHeader.tsx", import.meta.url), "utf8");
const levelSwitch = () => readFileSync(new URL("../src/components/home/LevelSwitch.tsx", import.meta.url), "utf8");

test("home page uses premium start cockpit and keeps learning/Shorts entries", () => {
  const source = `${homePage()}\n${levelSwitch()}`;
  const headerSource = siteHeader();
  for (const phrase of [
    "SiteHeader",
    "JLPT 모의고사를",
    "차분하게 시작하세요",
    "JLPT 레벨 선택",
    "모의고사 시작",
    "최근 학습",
    "최근 성적",
    "레벨별 JLPT Shorts",
    "https://www.youtube.com/@hyokujlpt/shorts",
    "getLatestHyokuShorts",
    "getShortLevel",
    "shortsByLevel",
    "i.ytimg.com/vi",
    "home-page-frame",
    "home-redesign-panel",
    "LevelSwitch",
    "home-level-switch",
    "home-progress-grid",
    "home-shorts-grid-section",
  ]) {
    assert.ok(source.includes(phrase), phrase);
  }
  assert.doesNotMatch(source, /home-level-grid/);
  assert.doesNotMatch(source, /home-hero-actions/);
  assert.doesNotMatch(source, /home-shorts-level-row/);
  assert.doesNotMatch(source, /Google Ad/);
  assert.doesNotMatch(source, /home-ad-rail/);
  assert.doesNotMatch(source, /조사 に \/ で 구분/);
  assert.doesNotMatch(source, /@JLPThyo_bot/);
  for (const phrase of ["HYOKU JLPT", "AuthHeaderButton"]) {
    assert.ok(headerSource.includes(phrase), phrase);
  }
  assert.ok(readFileSync(new URL("../src/components/auth/AuthHeaderButton.tsx", import.meta.url), "utf8").includes("home-login-button"));
  const levelSwitchSource = readFileSync(new URL("../src/components/home/LevelSwitch.tsx", import.meta.url), "utf8");
  for (const phrase of [
    "use client",
    "useState",
    "previewIndex",
    "activeIndicatorIndex",
    "home-level-switch-indicator",
    "aria-selected",
    "setSelectedIndex",
    "setPreviewIndex",
    "onMouseEnter",
    "onMouseLeave",
    "onPointerEnter",
    "onPointerLeave",
    "--active-level-index",
  ]) {
    assert.ok(levelSwitchSource.includes(phrase), phrase);
  }
  assert.match(source, /\/mock-exams\/n5-realistic-001/);
  assert.match(source, /\/mock-exams\/n5-lite-002/);
});

test("dashboard page matches Figma learning dashboard sections", () => {
  const source = dashboardPage();
  assert.match(source, /<SiteHeader active="history"/);
  for (const phrase of [
    "안녕하세요, 효쿠님",
    "학습 요약",
    "주간 학습 활동",
    "7월 목표",
    "최근 모의고사",
    "현재 취약 영역",
    "dashboard-stat-grid",
    "dashboard-goal-card",
    "DashboardAttemptData",
  ]) {
    assert.ok(source.includes(phrase), phrase);
  }
  const clientSource = dashboardAttemptData();
  assert.match(clientSource, /\/api\/mock-exams\/attempts/);
  assert.match(clientSource, /getSession/);
  assert.match(clientSource, /저장된 최근 기록/);
});

test("mock exam attempt API validates login and writes attempt answer result rows", () => {
  const source = mockExamAttemptRoute();
  for (const phrase of [
    "login required",
    "mock_exam_sets",
    "mock_exam_attempts",
    "mock_exam_answers",
    "mock_exam_section_results",
    "deterministicUuid",
    "auth.getUser",
    "onConflict: \"mock_exam_set_id,sort_order\"",
    "errorMessage",
  ]) {
    assert.ok(source.includes(phrase), phrase);
  }
});

test("N5 mock exam page loads generated set artifact", () => {
  const source = mockExamPage();
  assert.match(source, /n5-mock-exam-lite-set-002\.json/);
  assert.match(source, /<SiteHeader active="mock"/);
  assert.match(source, /MockExamLite/);
});

test("mock exam CSS keeps current question panel paper-like while aligned with home tone", () => {
  const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
  for (const phrase of [
    "align paper-like question sheet with Home visual tone",
    ".mock-page-shell .home-brand strong",
    "Cross-page header/button consistency fix",
    "Shared fixed header: keep header position identical across page transitions",
    "Canonical SiteHeader visual style: wrapper-independent",
    ".site-header .home-brand strong",
    ".site-header .home-nav a",
    ".site-header .home-login-button",
    "--site-header-width: min(1320px, calc(100vw - (var(--site-header-side) * 2)))",
    "position: fixed !important",
    "padding-top: var(--site-content-top-offset) !important",
    ".site-header .home-nav a.active::after",
    "content: none !important",
    ".mock-page-shell .mock-question-nav-item[data-current=\"true\"]",
    ".mock-exam-focus-panel .mock-exam-problem-instruction",
    "border-top: 1px solid rgba(96, 82, 65, .28)",
    "background: #fffdf9 !important",
    "background: #1d2027 !important",
    ".mock-exam-focus-panel .choice-button",
    "border-radius: 0 !important",
    "box-shadow: inset 3px 0 0 #9a8467",
  ]) {
    assert.ok(css.includes(phrase), phrase);
  }
});

test("N5 realistic mock exam page loads generated 50-question set", () => {
  const source = realisticMockExamPage();
  assert.match(source, /n5-realistic-mock-exam-001\.json/);
  assert.match(source, /<SiteHeader active="mock"/);
  assert.match(source, /MockExamLite/);
  assert.match(source, /exam-portal-layout/);
  assert.match(source, /exam-ad-sidebar/);
  assert.match(source, /Google Ad/);
});

test("mock exam client keeps answers hidden until full submit and shows section results", () => {
  const source = mockExamClient();
  for (const phrase of [
    "전체 제출",
    "시험 시작",
    "준비가 되면 시험을 시작하세요",
    "requestSubmitMockExam",
    "forceSubmitMockExam",
    "미응답 ${unansweredCount}문항이 있습니다",
    "mock-submit-warning",
    "mock-question-nav-submit",
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
    "問題{currentQuestion.problem.problemNo}",
    "currentQuestionIndex",
    "useRef",
    "scrollIntoView",
    "block: \"center\"",
    "questionNavScrollRef",
    "flattenedQuestions",
    "mock-exam-focus-panel",
    "mock-question-nav-item",
    "data-result",
    "resultState",
    "정답",
    "오답",
    "미응답",
    "mock-question-nav-scroll",
    "mock-question-nav-confirm",
    "mock-exam-submit-card",
    "mock-exam-bottom-nav",
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
    "모의고사 기록을 저장했습니다",
    "/api/mock-exams/attempts",
  ]) {
    assert.ok(source.includes(phrase), phrase);
  }
  assert.match(source, /submitted \? \(/);
  assert.match(source, /청해 없이/);
  const styles = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
  assert.match(styles, /\.mock-question-nav[\s\S]*position: fixed/);
  assert.match(styles, /max-height: calc\(100dvh - 140px\)/);
  assert.match(styles, /data-result="correct"/);
  assert.match(styles, /data-result="wrong"/);
  assert.match(styles, /prevent controls\/results from bleeding into right rail/);
});

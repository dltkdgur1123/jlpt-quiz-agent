import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const homePage = () => readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
const mockExamPage = () => readFileSync(new URL("../src/app/mock-exams/n5-lite-002/page.tsx", import.meta.url), "utf8");
const levelMockExamPage = (level) =>
  readFileSync(new URL(`../src/app/mock-exams/${level.toLowerCase()}-lite-001/page.tsx`, import.meta.url), "utf8");
const levelMockExamArtifact = (level) =>
  JSON.parse(readFileSync(new URL(`../data/generated/${level.toLowerCase()}-mock-exam-lite-001.json`, import.meta.url), "utf8"));
const realisticMockExamPage = () =>
  readFileSync(new URL("../src/app/mock-exams/n5-realistic-001/page.tsx", import.meta.url), "utf8");
const realisticMockExam002Page = () =>
  readFileSync(new URL("../src/app/mock-exams/n5-realistic-002/page.tsx", import.meta.url), "utf8");
const dashboardPage = () => readFileSync(new URL("../src/app/dashboard/page.tsx", import.meta.url), "utf8");
const dashboardAttemptData = () =>
  readFileSync(new URL("../src/components/dashboard/DashboardAttemptData.tsx", import.meta.url), "utf8");
const mockExamAttemptRoute = () =>
  readFileSync(new URL("../src/app/api/mock-exams/attempts/route.ts", import.meta.url), "utf8");
const mockExamClient = () =>
  readFileSync(new URL("../src/components/mock-exam/MockExamLite.tsx", import.meta.url), "utf8");
const siteHeader = () => readFileSync(new URL("../src/components/layout/SiteHeader.tsx", import.meta.url), "utf8");
const levelSwitch = () => readFileSync(new URL("../src/components/home/LevelSwitch.tsx", import.meta.url), "utf8");
const homeRecentMockExam = () =>
  readFileSync(new URL("../src/components/home/HomeRecentMockExam.tsx", import.meta.url), "utf8");
const jlptExamSchedule = () => readFileSync(new URL("../src/lib/jlpt/exam-schedule.ts", import.meta.url), "utf8");

test("home page uses premium start cockpit and keeps learning/Shorts entries", () => {
  const source = `${homePage()}\n${levelSwitch()}\n${homeRecentMockExam()}\n${jlptExamSchedule()}`;
  const headerSource = siteHeader();
  for (const phrase of [
    "SiteHeader",
    "JLPT D-DAY",
    "다음 JLPT까지",
    "getNextJlptExam",
    "JLPT_EXAM_SCHEDULES",
    "2026년 제2회 JLPT",
    "2026-12-06",
    "https://www.jlpt.or.kr/",
    "JLPT 레벨 선택",
    "모의고사 시작",
    "최근 모의고사 기록",
    "지난 문제 이어서 풀기",
    "대시보드로 이동 →",
    "IN_PROGRESS_STORAGE_KEY",
    "jlpt-mock-exam-in-progress",
    "selected_answers",
    "current_question_index",
    "레벨별 JLPT Shorts",
    "https://www.youtube.com/@hyokujlpt/shorts",
    "getLatestHyokuShorts",
    "YOUTUBE_API_KEY",
    "youtube/v3/channels",
    "youtube/v3/playlistItems",
    "youtube/v3/videos",
    "shortsByLevel",
    "getBestThumbnail",
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
  assert.doesNotMatch(source, /home-recent-actions/);
  assert.doesNotMatch(source, /home-recent-line/);
  assert.doesNotMatch(source, /HomeRecentMockExamLine/);
  assert.doesNotMatch(source, /최근 모의고사 빠른 이동/);
  assert.doesNotMatch(source, /home-shorts-level-row/);
  assert.doesNotMatch(source, /JLPT 모의고사를<br \/>차분하게 시작하세요/);
  assert.doesNotMatch(source, /N5 문자·어휘/);
  assert.doesNotMatch(source, /12분 전/);
  assert.doesNotMatch(source, /정답률 72%/);
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
  for (const route of ["n4-lite-001", "n3-lite-001", "n2-lite-001", "n1-lite-001"]) {
    assert.match(source, new RegExp(`/mock-exams/${route}`));
  }
});

test("dashboard page matches Figma learning dashboard sections", () => {
  const source = dashboardPage();
  assert.match(source, /<SiteHeader active="history"/);
  const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
  for (const style of [
    "Dashboard spacing correction: make section gaps visible",
    "Dashboard flat-container contract: no gradients or shadows on container boxes",
    "Dashboard card column alignment: top and bottom rows share the same left/right edges",
    "grid-template-columns: minmax(0, 1.45fr) minmax(320px, .8fr) !important",
    "JLPT red/white/gray theme override: #D32F2F primary, flat containers",
    "Red theme specificity patch: late screen-level containers stay flat",
    "Red theme interaction refinement: exam navigator is not red except actual wrong results",
    "Red theme level selector refinement: selected level uses primary red with white text",
    "Red theme level switch actual class patch",
    "Red theme level switch correction: keep animated indicator as the only selected background",
    ".home-level-switch .home-level-switch-indicator",
    ".site-header::before",
    ".site-header.is-scrolled::before",
    "--site-header-inner-x: 52px",
    "padding: 0 var(--site-header-inner-x, 52px) !important",
    "box-sizing: border-box !important",
    "Home Shorts spacing: match header inset and keep the lower area white",
    "Home footer continuation: keep the bottom below Shorts connected as white",
    "Mobile homepage responsive v1: single-column start flow and compact fixed header",
    "main:has(.home-page-frame)",
    "overflow-x: hidden !important",
    ".site-header .home-nav,",
    "display: none !important",
    ".home-dday-title strong",
    "font-size: clamp(4.15rem, 22vw, 5.85rem) !important",
    ".home-level-switch",
    "width: calc((100% - 8px) / 5) !important",
    ".home-exam-summary dl",
    "grid-template-columns: 1fr !important",
    ".home-progress-grid-item",
    ".home-shorts-grid-link",
    "aspect-ratio: 16 / 9 !important",
    "padding: clamp(30px, 4vw, 44px) var(--site-header-inner-x, 52px)",
    "main:has(.home-page-frame)",
    "padding-bottom: clamp(96px, 10vw, 160px) !important",
    "clamp(72px, 8vw, 112px)",
    "Header/account menu active-state correction",
    ".auth-profile-dropdown a:hover",
    ".auth-profile-dropdown button",
    ".site-header .home-nav a.active",
    "opacity: 0",
    "width: 100vw",
    "--jlpt-primary: #d32f2f",
    "--jlpt-primary-hover: #b71c1c",
    "--jlpt-background: #fafafa",
    "--jlpt-card: #ffffff",
    "--jlpt-title: #212121",
    "--jlpt-text: #616161",
    "--jlpt-border: #e5e5e5",
    "--jlpt-success: #2e7d32",
    "--jlpt-warning: #f9a825",
    "color: #ffffff !important",
    ".figma-shell.dashboard-page",
    "display: grid !important",
    "gap: 38px !important",
    ".dashboard-live-note,",
    "padding: 22px 26px !important",
    "box-shadow: none !important",
    "background-image: none !important",
    "min-height: 92px !important",
    "border-radius: 18px !important",
    "dashboard-wrong-note-card",
    "dashboard-weak-full",
    "dashboard-weak-grid",
    "dashboard-action-head",
    "Dashboard weekly activity graph v2: visible values, goal line, and flat JLPT red emphasis",
    ".dashboard-activity-summary",
    ".dashboard-bars-goal",
    "opacity: 1 !important",
    "repeating-linear-gradient",
    ".dashboard-bars::after",
    "bottom: 27px !important",
    "grid-template-rows: minmax(0, 1fr) !important",
    "padding-bottom: 0 !important",
    "min-height: 56px !important",
    "align-items: flex-end !important",
    "width: min(100%, 44px) !important",
    "padding: 0 4px 10px !important",
    "bottom: -24px !important",
    "border-radius: 10px 10px 0 0 !important",
    ".dashboard-bars .hot b",
    "transform: translateX(-50%) !important",
    "min-height: 28px !important",
    "min-height: 28px !important",
    "font-size: 14px !important",
    "font-weight: 850 !important",
    "padding: 26px !important",
    ".guide-hero",
    ".guide-grid",
    ".guide-level-row",
    ".guide-id-row",
    ".guide-two-column",
    ".guide-panel p span",
    "word-break: keep-all",
    ".settings-hero",
    ".settings-grid",
    ".settings-card-head > span",
    "grid-template-columns: auto minmax(0, 1fr)",
    ".settings-secondary-button:hover",
    ".settings-danger-button:hover",
    ".settings-danger-button:hover:not(:disabled)",
    "background: #fff",
    "color: #fff !important",
    "transition: none !important",
    "transform: none !important",
    ".settings-level-button[data-selected=\"true\"]",
    ".settings-level-button:hover:not([data-selected=\"true\"])",
    "border-color: var(--jlpt-border, #e5e5e5)",
    ".settings-toggle-row",
    ".settings-toggle-row:hover",
    ".settings-toggle-row:hover em",
    "transition: none !important",
    ".settings-toggle-row i[data-on=\"true\"]",
    ".settings-option-grid",
    ".settings-option-card:hover:not([data-selected=\"true\"])",
    ".settings-option-card[data-selected=\"true\"] strong",
    "Settings page: no hover animation/effect; only clicked/selected state changes fill",
    "background: #ffffff !important",
    "border-color: var(--jlpt-border) !important",
    ".settings-level-button[data-selected=\"true\"]:hover",
    ".settings-option-card[data-selected=\"true\"]:hover",
    ".settings-option-card[data-selected=\"true\"]:hover span",
    ".settings-toggle-row:hover i[data-on=\"true\"]",
    "background: var(--jlpt-primary) !important",
    ".settings-toggle-row i::after",
    "Mobile dashboard page should not look like narrow centered cards",
    "main:has(.dashboard-page)",
    ".figma-shell.dashboard-page",
    ".figma-shell.dashboard-page .dashboard-panel",
    "border-radius: 0 !important",
  ]) {
    assert.ok(css.includes(style), style);
  }
  for (const phrase of [
    "안녕하세요, 효쿠님",
    "학습 요약",
    "주간 학습 활동",
    "이번 달 목표",
    "최근 모의고사",
    "DashboardWrongNoteCard",
    "취약 영역 분석",
    "오답노트와 최근 모의고사 기준",
    "dashboard-action-head",
    "dashboard-weak-full",
    "dashboard-weak-grid",
    "weeklyTotal",
    "weeklyAverage",
    "weeklyPeakIndex",
    "weekLabels",
    "7/17 금",
    "Math.max(56",
    "dashboard-activity-head",
    "dashboard-activity-summary",
    "dashboard-bars-goal",
    "aria-label=\"최근 7일 요일별 문제 풀이 수\"",
    "dashboard-stat-grid",
    "dashboard-goal-card",
    "DashboardAttemptData",
  ]) {
    assert.ok(source.includes(phrase), phrase);
  }
  const clientSource = dashboardAttemptData();
  assert.match(css, /Mobile dashboard page should not look like narrow centered cards/);
  assert.match(css, /@media \(max-width: 760px\) \{[\s\S]*?main:has\(\.dashboard-page\) \{[\s\S]*?padding-left: 0 !important;[\s\S]*?padding-right: 0 !important/);
  assert.match(css, /@media \(max-width: 760px\) \{[\s\S]*?\.figma-shell\.dashboard-page \{[\s\S]*?width: 100% !important;[\s\S]*?max-width: none !important/);
  assert.match(css, /Mobile dashboard summary cards use a two-by-two grid/);
  assert.match(css, /Mobile dashboard summary cards remove vertical dividers for a boundaryless metric group/);
  assert.match(css, /@media \(max-width: 760px\) \{[\s\S]*?\.figma-shell\.dashboard-page \.dashboard-stat-grid \{[\s\S]*?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\) !important/);
  assert.match(css, /Mobile dashboard connected document flow: remove gray breaks between content sections/);
  assert.match(css, /Mobile dashboard section gaps: give every learning-record section a consistent soft break/);
  assert.match(css, /Mobile dashboard soft dividers: keep section lines quiet and non-boxy/);
  assert.match(css, /Mobile dashboard breathing room: connected sections keep comfortable vertical padding/);
  assert.match(css, /Mobile dashboard bottom rhythm: section bottoms end with the same quiet spacing/);
  assert.match(css, /Mobile dashboard weak area cards: stack as readable full-width rows on phones/);
  assert.match(css, /--dashboard-mobile-section-gap: 12px/);
  assert.match(css, /--dashboard-mobile-section-bottom-room: 18px/);
  assert.match(css, /--dashboard-mobile-section-y: 30px/);
  assert.match(css, /--dashboard-mobile-summary-y: 22px/);
  assert.match(css, /--dashboard-mobile-divider: #f1f1f1/);
  assert.match(css, /\.figma-shell\.dashboard-page \.dashboard-hero \{[\s\S]*?border-bottom: 1px solid var\(--dashboard-mobile-divider, #f1f1f1\) !important/);
  assert.doesNotMatch(css, /\.figma-shell\.dashboard-page \.dashboard-stat-card:nth-child\(odd\) \{[\s\S]*?border-right: 1px solid/);
  assert.match(css, /\.figma-shell\.dashboard-page \.dashboard-stat-card:nth-child\(odd\) \{[\s\S]*?border-right: 0 !important/);
  assert.match(css, /\.figma-shell\.dashboard-page \.dashboard-stat-card:nth-child\(n \+ 3\) \{[\s\S]*?border-top: 1px solid var\(--dashboard-mobile-divider, #f1f1f1\) !important/);
  assert.match(css, /\.figma-shell\.dashboard-page \.dashboard-panel,[\s\S]*?\.figma-shell\.dashboard-page \.dashboard-goal-card,[\s\S]*?\.figma-shell\.dashboard-page \.dashboard-stat-card \{[\s\S]*?padding: var\(--dashboard-mobile-section-y\) 18px !important/);
  assert.match(css, /\.figma-shell\.dashboard-page \.dashboard-stat-card \{[\s\S]*?padding: var\(--dashboard-mobile-summary-y\) 14px !important/);
  assert.match(css, /\.figma-shell\.dashboard-page \.dashboard-panel > :last-child,[\s\S]*?\.figma-shell\.dashboard-page \.dashboard-goal-card > :last-child,[\s\S]*?\.figma-shell\.dashboard-page \.dashboard-wrong-note-card > :last-child,[\s\S]*?\.figma-shell\.dashboard-page \.dashboard-weak-full > :last-child \{[\s\S]*?margin-bottom: var\(--dashboard-mobile-section-bottom-room\) !important/);
  assert.match(css, /\.figma-shell\.dashboard-page \.dashboard-bars \{[\s\S]*?margin-bottom: var\(--dashboard-mobile-section-bottom-room\) !important/);
  assert.match(css, /@media \(max-width: 760px\) \{[\s\S]*?\.figma-shell\.dashboard-page \{[\s\S]*?gap: var\(--dashboard-mobile-section-gap\) !important;[\s\S]*?background: #fafafa !important/);
  assert.match(css, /@media \(max-width: 760px\) \{[\s\S]*?\.figma-shell\.dashboard-page \.dashboard-grid-top,[\s\S]*?\.figma-shell\.dashboard-page \.dashboard-grid-bottom,[\s\S]*?\.figma-shell\.dashboard-page \.dashboard-weak-full \{[\s\S]*?gap: var\(--dashboard-mobile-section-gap\) !important/);
  assert.match(css, /\.figma-shell\.dashboard-page \.dashboard-stat-grid \{[\s\S]*?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\) !important;[\s\S]*?gap: 0 !important/);
  assert.match(css, /\.figma-shell\.dashboard-page \.dashboard-weak-grid \{[\s\S]*?grid-template-columns: 1fr !important;[\s\S]*?gap: 12px !important/);
  assert.match(css, /\.figma-shell\.dashboard-page \.dashboard-weak-grid \.weak-row \{[\s\S]*?display: grid !important;[\s\S]*?grid-template-columns: minmax\(0, 1fr\) auto/);
  assert.match(css, /\.figma-shell\.dashboard-page \.dashboard-weak-grid \.weak-row p \{[\s\S]*?white-space: nowrap !important/);
  assert.match(css, /@media \(max-width: 760px\) \{[\s\S]*?\.figma-shell\.dashboard-page \.dashboard-panel,/);
  assert.match(clientSource, /\/api\/mock-exams\/attempts/);
  assert.match(clientSource, /getSession/);
  assert.match(clientSource, /저장된 최근 기록/);
  assert.match(clientSource, /오답노트/);
  assert.match(clientSource, /wrong_note/);
  assert.match(clientSource, /복습할 문제/);
  assert.match(clientSource, /dashboard-wrong-note-card/);
  assert.match(clientSource, /다시 풀기/);
});

test("mock exam attempt API validates login and writes attempt answer result rows", () => {
  const source = mockExamAttemptRoute();
  for (const phrase of [
    "login required",
    "mock_exam_sets",
    "mock_exam_attempts",
    "mock_exam_answers",
    "mock_exam_section_results",
    "wrong_note",
    "mock_exam_questions(sort_order, mock_exam_sections(section_key))",
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

test("N4 through N1 mock exam pages load real 35-question non-listening draft artifacts", () => {
  for (const level of ["N4", "N3", "N2", "N1"]) {
    const pageSource = levelMockExamPage(level);
    const artifact = levelMockExamArtifact(level);
    const lower = level.toLowerCase();

    assert.match(pageSource, new RegExp(`${lower}-mock-exam-lite-001\\.json`));
    assert.match(pageSource, /<SiteHeader active="mock"/);
    assert.match(pageSource, /MockExamLite/);
    assert.equal(artifact.set.set_code, `${lower}-mock-exam-lite-001`);
    assert.equal(artifact.set.jlpt_level, level);
    assert.equal(artifact.set.question_count, 35);
    assert.equal(artifact.set.listening_included, false);
    assert.deepEqual(
      artifact.sections.map((section) => `${section.section_key}:${section.question_count}`),
      ["vocab:15", "grammar:15", "reading:5"],
    );
    assert.equal(artifact.questions.length, 35);
    assert.equal(artifact.questions.some((question) => question.question_type.toLowerCase().includes("listening")), false);
    assert.equal(artifact.questions.every((question) => question.review_status === "draft"), true);
  }
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
    "Common mock-exam start screen contract",
    ".mock-exam-shell--start",
    "width: min(636px, calc(100vw - 96px)) !important",
    "min-height: 60px !important",
    "padding: 12px 16px !important",
    "line-height: 1.6 !important",
    "margin: 0 0 12px !important",
    ".exam-portal-layout:has(.mock-exam-shell--start) .exam-ad-sidebar",
    "display: none !important",
    "height: 44px !important",
    "Common active mock-exam contract",
    ".mock-lite-page-stack:has(.mock-exam-shell--active)",
    "margin-left: 0 !important",
    "margin-right: 0 !important",
    "gap: 18px",
    "border: 0 !important",
    "border-radius: 14px",
    "mock-question-nav-progress-bar",
    ".mock-exam-sticky-status {\n    display: none !important;",
  ]) {
    assert.ok(css.includes(phrase), phrase);
  }
});

test("N5 realistic mock exam page loads generated 50-question set", () => {
  const source = realisticMockExamPage();
  const source002 = realisticMockExam002Page();
  assert.match(source, /n5-realistic-mock-exam-001\.json/);
  assert.match(source, /<SiteHeader active="mock"/);
  assert.match(source, /MockExamLite/);
  assert.match(source, /exam-portal-layout/);
  assert.match(source, /exam-ad-sidebar/);
  assert.match(source, /Google Ad/);
  assert.match(source002, /n5-realistic-mock-exam-002\.json/);
  assert.match(source002, /<SiteHeader active="mock"/);
  assert.match(source002, /MockExamLite/);
  assert.match(source002, /exam-portal-layout/);
});

test("mock exam start screen is optimized for mobile before the exam begins", () => {
  const clientSource = mockExamClient();
  const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");

  assert.match(clientSource, /mock-exam-start-summary/);
  assert.match(clientSource, /mock-exam-start-checklist/);
  assert.match(clientSource, /시험 시작/);
  assert.match(css, /Mobile mock exam start screen: full-width calm pre-exam briefing/);
  assert.match(css, /@media \(max-width: 760px\) \{[\s\S]*?main:has\(\.mock-exam-shell--start\) \{[\s\S]*?padding-left: 0 !important;[\s\S]*?padding-right: 0 !important/);
  assert.match(css, /@media \(max-width: 760px\) \{[\s\S]*?\.mock-exam-shell--start \{[\s\S]*?gap: 12px !important;[\s\S]*?background: #fafafa !important/);
  assert.match(css, /\.mock-exam-shell--start \.mock-exam-hero \{[\s\S]*?display: grid !important/);
  assert.match(css, /\.mock-exam-shell--start \.mock-exam-status-grid \{[\s\S]*?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\) !important/);
  assert.match(css, /\.mock-exam-start-summary \{[\s\S]*?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.mock-exam-shell--start \.mock-exam-start-card \{[\s\S]*?border-left: 0 !important;[\s\S]*?border-right: 0 !important;[\s\S]*?border-radius: 0 !important/);
});

test("mock exam client keeps answers hidden until full submit and shows section results", () => {
  const source = mockExamClient();
  for (const phrase of [
    "전체 제출",
    "시험 시작",
    "준비가 되면 시험을 시작하세요",
    "본 모의고사는 공식 JLPT 기출문제가 아니며",
    "JLPT 시험 형식을 참고해 제작한 학습용 연습 문제입니다",
    "결과와 점수는 학습 참고용으로 제공되며",
    "실제 시험의 합격 여부나 출제 가능성을 보장하지 않습니다",
    "requestSubmitMockExam",
    "forceSubmitMockExam",
    "requestRestartMockExam",
    "confirmRestartMockExam",
    "mock-exam-restart-button",
    "mock-question-nav-restart-button",
    "mock-restart-expanded",
    "↺ 처음부터 다시",
    "다시 시작",
    "현재 답안이 모두 지워집니다.",
    "처음부터 다시",
    "현재 답안과 결과를 지우고 1번 문제부터 다시 시작할까요?",
    "미응답 ${unansweredCount}문항이 있습니다",
    "mock-submit-warning",
    "mock-question-nav-submit",
    "mock-submit-confirm-panel",
    "아직 답하지 않은 문제가 있습니다.",
    "scrollMockExamToTop",
    "window.scrollTo",
    "top: 0",
    "behavior: \"smooth\"",
    "이 문제를 시험에서 본 적이 있습니까?",
    "그렇게 느껴짐",
    "그렇지 않음",
    "잘 모르겠음",
    "미응답",
    "mock-question-nav-progress-row",
    "mock-question-nav-progress-bar",
    "미응답",
    "타이머",
    "Mock Test Result",
    "mock-score-table-section-head",
    "mock-score-table-total-head",
    "合否 結果通知書",
    "학습 참고용 모의 합격 여부",
    "영역별 균형",
    "목표 기준",
    "청해 제외 세트이므로",
    "radarPolygonPoints",
    "mock-radar-panel--tri",
    "mock-radar-score-shape",
    "선생님의 평가",
    "mock-radar-panel",
    "sectionResults",
    "selectedAnswers",
    "seenFeedbacks",
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
    "behavior: \"smooth\"",
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
    "mock-mobile-nav-trigger",
    "mock-mobile-question-sheet",
    "mock-mobile-question-sheet__backdrop",
    "mock-mobile-question-sheet__panel",
    "mock-mobile-question-sheet__close",
    "문제 목록 보기",
    "닫기",
    "aria-expanded",
    "setMobileQuestionSheetOpen",
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
    "복습할 문제",
    "오답노트에 기록했습니다",
    "오답노트에 저장하려면 로그인이 필요합니다",
    "오답노트 기록을 완료하지 못했습니다",
    "isAuthenticatedForWrongNote",
    "authStatus === \"signed_in\"",
    "mock-wrong-note-card",
    "mock-wrong-note-counts",
    "학습기록에서 보기",
    "reviewTargets",
    "weakestSections",
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
  assert.doesNotMatch(source, /feedbackSummary/);
  assert.doesNotMatch(source, /출제 경험 체크/);
  assert.doesNotMatch(source, /본 적 있음 \{feedbackSummary\.yes\}/);
  assert.match(source, /청해 없이/);
  const styles = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
  assert.match(styles, /\.mock-question-nav[\s\S]*position: fixed/);
  assert.match(styles, /max-height: calc\(100dvh - 140px\)/);
  assert.match(styles, /data-result="correct"/);
  assert.match(styles, /data-result="wrong"/);
  assert.match(styles, /prevent controls\/results from bleeding into right rail/);
  assert.match(styles, /\.mock-mobile-nav-trigger \{[\s\S]*?display: none/);
  assert.match(styles, /@media \(max-width: 1180px\) \{[\s\S]*?\.mock-mobile-nav-trigger \{[\s\S]*?display: grid/);
  assert.match(styles, /\.mock-mobile-question-sheet__panel \{[\s\S]*?max-height: min\(70dvh, 620px\)/);
  assert.match(styles, /\.mock-mobile-question-sheet__number-grid \{[\s\S]*?overflow-y: auto/);
  assert.match(styles, /bottom: calc\(72px \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(styles, /mobile active exam must never show desktop question nav over the paper/);
  assert.match(styles, /@media \(max-width: 1180px\) \{[\s\S]*?\.mock-exam-shell--active \.mock-question-nav \{[\s\S]*?display: none !important/);
  assert.match(styles, /mobile active exam paper should read like a full-width document, not a centered card/);
  assert.match(styles, /@media \(max-width: 760px\) \{[\s\S]*?main:has\(\.mock-exam-shell--active\) \{[\s\S]*?padding-left: 0 !important;[\s\S]*?padding-right: 0 !important/);
  assert.match(styles, /@media \(max-width: 760px\) \{[\s\S]*?\.mock-exam-shell--active \.mock-exam-section \{[\s\S]*?border-left: 0 !important;[\s\S]*?border-right: 0 !important;[\s\S]*?border-radius: 0 !important/);
  assert.match(styles, /@media \(max-width: 760px\) \{[\s\S]*?\.mock-exam-shell--active \.mock-exam-current-card \{[\s\S]*?border: 0 !important;[\s\S]*?border-radius: 0 !important/);
  assert.match(styles, /mobile active exam keeps submit\/restart controls inside the question sheet only/);
  assert.match(styles, /@media \(max-width: 1180px\) \{[\s\S]*?\.mock-exam-shell--active \.mock-exam-submit-card \{[\s\S]*?display: none !important/);
  assert.match(styles, /@media \(max-width: 760px\) \{[\s\S]*?\.mock-exam-shell--active \.mock-exam-bottom-nav \{[\s\S]*?margin-bottom: 14px !important/);
});

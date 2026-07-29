import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const homePage = () => readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
const realisticMockExamPage = () =>
  readFileSync(new URL("../src/app/mock-exams/n5-realistic-001/page.tsx", import.meta.url), "utf8");
const realisticMockExam002Page = () =>
  readFileSync(new URL("../src/app/mock-exams/n5-realistic-002/page.tsx", import.meta.url), "utf8");
const realisticMockExam003Page = () =>
  readFileSync(new URL("../src/app/mock-exams/n5-realistic-003/page.tsx", import.meta.url), "utf8");
const autoLevelMockExamPage = () =>
  readFileSync(new URL("../src/app/mock-exams/[level]/page.tsx", import.meta.url), "utf8");
const autoMockExamRunner = () =>
  readFileSync(new URL("../src/components/mock-exam/AutoMockExamRunner.tsx", import.meta.url), "utf8");
const levelRealisticMockExamPage = (level) =>
  readFileSync(new URL(`../src/app/mock-exams/${level.toLowerCase()}-realistic-001/page.tsx`, import.meta.url), "utf8");
const dashboardPage = () => readFileSync(new URL("../src/app/dashboard/page.tsx", import.meta.url), "utf8");
const dashboardGreeting = () =>
  readFileSync(new URL("../src/components/dashboard/DashboardGreeting.tsx", import.meta.url), "utf8");
const dashboardAttemptData = () =>
  readFileSync(new URL("../src/components/dashboard/DashboardAttemptData.tsx", import.meta.url), "utf8");
const mockExamAttemptRoute = () =>
  readFileSync(new URL("../src/app/api/mock-exams/attempts/route.ts", import.meta.url), "utf8");
const mockExamClient = () =>
  readFileSync(new URL("../src/components/mock-exam/MockExamRunner.tsx", import.meta.url), "utf8");
const wrongNotePage = () => readFileSync(new URL("../src/app/wrong-note/page.tsx", import.meta.url), "utf8");
const wrongNoteClient = () => readFileSync(new URL("../src/components/wrong-note/WrongNoteClient.tsx", import.meta.url), "utf8");
const siteHeader = () => readFileSync(new URL("../src/components/layout/SiteHeader.tsx", import.meta.url), "utf8");
const levelSwitch = () => readFileSync(new URL("../src/components/home/LevelSwitch.tsx", import.meta.url), "utf8");
const homeRecentMockExam = () =>
  readFileSync(new URL("../src/components/home/HomeRecentMockExam.tsx", import.meta.url), "utf8");
const jlptExamSchedule = () => readFileSync(new URL("../src/lib/jlpt/exam-schedule.ts", import.meta.url), "utf8");
const globalStyles = () => readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");

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
  const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
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
  assert.match(css, /--home-level-switch-duration: \.36s/);
  assert.match(css, /--home-level-switch-ease: cubic-bezier\(\.16, 1, \.3, 1\)/);
  assert.match(css, /\.home-level-switch-indicator \{[\s\S]*?transition: transform var\(--home-level-switch-duration\) var\(--home-level-switch-ease\), background-color \.24s ease/);
  assert.match(css, /@media \(max-width: 760px\) \{[\s\S]*?\.home-level-switch \{[\s\S]*?--home-level-switch-duration: \.46s/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\.home-level-switch-indicator,[\s\S]*?transition: none/);
  assert.match(source, /\/mock-exams\/n5/);
  for (const route of ["n4", "n3", "n2", "n1"]) {
    assert.match(source, new RegExp(`/mock-exams/${route}`));
  }
  assert.doesNotMatch(homePage(), /\/mock-exams\/n[1-5]-realistic-001/);
});

test("level mock exam entry auto-assigns a set without exposing set selection UI", () => {
  const pageSource = autoLevelMockExamPage();
  const clientSource = autoMockExamRunner();
  const mockClient = mockExamClient();

  for (const phrase of [
    "generateStaticParams",
    "loadLevelArtifacts",
    "AutoMockExamRunner",
    "data/generated",
    "n5",
    "n4",
    "n3",
    "n2",
    "n1",
  ]) {
    assert.ok(pageSource.includes(phrase), phrase);
  }

  for (const phrase of [
    "pickAutoMockExamArtifact",
    "jlpt-mock-exam-local-attempts",
    "jlpt-mock-exam-in-progress",
    "unattempted",
    "oldestArtifact",
    "<MockExamRunner artifact={artifact} />",
  ]) {
    assert.ok(clientSource.includes(phrase), phrase);
  }

  assert.match(mockClient, /set_code\?: string/);
  assert.match(mockClient, /set_code: artifact\.set\.set_code/);
  assert.match(mockClient, /href=\{`\/mock-exams\/\$\{artifact\.set\.jlpt_level\.toLowerCase\(\)\}`\}/);
  assert.doesNotMatch(clientSource, /001|002|003 중 선택|세트 선택/);
});

test("dashboard page matches Figma learning dashboard sections", () => {
  const source = dashboardPage();
  const clientSource = dashboardAttemptData();
  const greetingSource = dashboardGreeting();
  const dashboardSource = `${source}\n${clientSource}\n${greetingSource}`;
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
    "min-height: 82px",
    "padding: 13px 14px",
    ".settings-option-card[data-selected=\"true\"]",
    "color: var(--jlpt-primary) !important",
    "Settings page: no hover animation/effect; only clicked/selected state changes fill",
    "background: #ffffff !important",
    "border-color: var(--jlpt-border) !important",
    ".settings-level-button[data-selected=\"true\"]:hover",
    ".settings-option-card[data-selected=\"true\"]:hover",
    ".settings-option-card[data-selected=\"true\"]:hover span",
    ".settings-toggle-row:hover i[data-on=\"true\"]",
    "background: var(--jlpt-primary) !important",
    ".settings-toggle-row i::after",
    "Settings page balanced compactness",
    ".figma-shell.settings-page .settings-hero",
    "padding: clamp(24px, 3.5vw, 38px) clamp(28px, 4vw, 42px) !important",
    ".figma-shell.settings-page .settings-card",
    "gap: 20px !important",
    "min-height: 220px !important",
    ".figma-shell.settings-page .settings-nickname-form input",
    "min-height: 42px !important",
    "grid-template-columns: repeat(3, minmax(172px, 220px)) !important",
    "justify-content: start !important",
    ".figma-shell.settings-page .settings-option-card",
    "min-height: 84px !important",
    ".dashboard-live-sections-locked .dashboard-locked-content",
    "filter: blur(7px)",
    "pointer-events: none",
    ".dashboard-live-sections-locked .dashboard-panel",
    "min-height: 220px",
    "padding: 30px",
    ".dashboard-login-lock",
    "width: min(560px, calc(100% - 32px))",
    "gap: 18px",
    "padding: clamp(34px, 5vw, 52px)",
    "backdrop-filter: blur(18px)",
    ".dashboard-login-lock .figma-primary",
    "min-height: 50px",
    "Mobile dashboard page should not look like narrow centered cards",
    "main:has(.dashboard-page)",
    ".figma-shell.dashboard-page",
    ".figma-shell.dashboard-page .dashboard-panel",
    "border-radius: 0 !important",
    ".dashboard-recent-list",
  ]) {
    assert.ok(css.includes(style), style);
  }
  for (const phrase of [
    "DashboardGreeting",
    "displayNameFromSession",
    "안녕하세요",
    "data.session ? displayNameFromSession(data.session) : \"\"",
    "학습 요약",
    "주간 학습 활동",
    "이번 달 목표",
    "최근 모의고사",
    "visibleAttempts",
    "attempts.slice(0, 5)",
    "dashboard-recent-list",
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
    "formatWeekday",
    "Math.max(56",
    "dashboard-activity-head",
    "dashboard-activity-summary",
    "dashboard-bars-goal",
    "aria-label=\"최근 7일 요일별 문제 풀이 수\"",
    "dashboard-stat-grid",
    "dashboard-live-sections",
    "dashboard-desktop-flow",
    "dashboard-mobile-record-flow",
    "aria-label=\"모바일 학습 기록\"",
    "history-mobile",
    "weakestSectionLabel",
    "모의고사",
    "평균 정답률",
    "오답",
    "취약 영역",
    "dashboard-goal-card",
    "DashboardLiveData",
    "dashboard-live-sections-locked",
    "dashboard-locked-content",
    "dashboard-login-lock",
    "로그인하면 학습 기록을 볼 수 있습니다",
    "모의고사 제출 기록, 오답노트, 취약 영역 분석은 로그인 후 저장됩니다",
    "href=\"/login?next=/dashboard\"",
    "모의고사 체험하기",
    "section_summary",
    "weekly_activity",
  ]) {
    assert.ok(dashboardSource.includes(phrase), phrase);
  }
  assert.doesNotMatch(source, /안녕하세요, 효쿠님/);
  assert.match(greetingSource, /displayName \? `안녕하세요, \$\{displayName\}님` : "안녕하세요"/);
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
  assert.match(css, /Mobile dashboard record flow: summary → recent exams → wrong note → weak areas → weekly activity/);
  assert.match(css, /\.dashboard-mobile-record-flow \{[\s\S]*?display: none/);
  assert.match(css, /\.figma-shell\.dashboard-page \.dashboard-mobile-record-flow \{[\s\S]*?display: grid !important/);
  assert.match(css, /\.figma-shell\.dashboard-page \.dashboard-desktop-flow \{[\s\S]*?display: none !important/);
  assert.match(css, /--dashboard-mobile-section-gap: 12px/);
  assert.match(css, /--dashboard-mobile-section-bottom-room: 18px/);
  assert.doesNotMatch(clientSource, /hiddenAttemptCount|dashboard-recent-more|외 \{hiddenAttemptCount\}건/);
  assert.match(css, /--dashboard-mobile-section-y: 30px/);
  assert.match(css, /--dashboard-mobile-summary-y: 16px/);
  assert.match(css, /--dashboard-mobile-divider: #f1f1f1/);
  assert.match(css, /\.figma-shell\.dashboard-page \.dashboard-grid-bottom \{[\s\S]*?order: 3 !important/);
  assert.match(css, /\.figma-shell\.dashboard-page \.dashboard-weak-full \{[\s\S]*?order: 4 !important/);
  assert.match(css, /\.figma-shell\.dashboard-page \.dashboard-grid-top \{[\s\S]*?order: 5 !important/);
  assert.match(css, /\.figma-shell\.dashboard-page \.dashboard-goal-card \{[\s\S]*?display: none !important/);
  assert.match(css, /\.figma-shell\.dashboard-page \.dashboard-live-data \{[\s\S]*?display: none !important/);
  assert.match(css, /\.figma-shell\.dashboard-page \.dashboard-hero \{[\s\S]*?border-bottom: 1px solid var\(--dashboard-mobile-divider, #f1f1f1\) !important/);
  assert.doesNotMatch(css, /\.figma-shell\.dashboard-page \.dashboard-stat-card:nth-child\(odd\) \{[\s\S]*?border-right: 1px solid/);
  assert.match(css, /\.figma-shell\.dashboard-page \.dashboard-stat-card:nth-child\(odd\) \{[\s\S]*?border-right: 0 !important/);
  assert.match(css, /\.figma-shell\.dashboard-page \.dashboard-stat-card:nth-child\(n \+ 3\) \{[\s\S]*?border-top: 1px solid var\(--dashboard-mobile-divider, #f1f1f1\) !important/);
  assert.match(css, /\.figma-shell\.dashboard-page \.dashboard-panel,[\s\S]*?\.figma-shell\.dashboard-page \.dashboard-goal-card,[\s\S]*?\.figma-shell\.dashboard-page \.dashboard-stat-card \{[\s\S]*?padding: var\(--dashboard-mobile-section-y\) 18px !important/);
  assert.match(css, /\.figma-shell\.dashboard-page \.dashboard-stat-card \{[\s\S]*?min-height: 96px !important;[\s\S]*?padding: var\(--dashboard-mobile-summary-y\) 14px !important/);
  assert.match(css, /\.figma-shell\.dashboard-page \.recent-exam-row \{[\s\S]*?grid-template-columns: 44px minmax\(0, 1fr\) auto !important/);
  assert.match(css, /\.figma-shell\.dashboard-page \.dashboard-wrong-note-head a \{[\s\S]*?background: var\(--jlpt-primary, #d32f2f\) !important;[\s\S]*?color: #ffffff !important/);
  assert.match(css, /\.figma-shell\.dashboard-page \.dashboard-panel > :last-child,[\s\S]*?\.figma-shell\.dashboard-page \.dashboard-goal-card > :last-child,[\s\S]*?\.figma-shell\.dashboard-page \.dashboard-wrong-note-card > :last-child,[\s\S]*?\.figma-shell\.dashboard-page \.dashboard-weak-full > :last-child \{[\s\S]*?margin-bottom: var\(--dashboard-mobile-section-bottom-room\) !important/);
  assert.match(css, /\.figma-shell\.dashboard-page \.dashboard-bars \{[\s\S]*?margin-bottom: var\(--dashboard-mobile-section-bottom-room\) !important/);
  assert.match(css, /@media \(max-width: 760px\) \{[\s\S]*?\.figma-shell\.dashboard-page \{[\s\S]*?gap: var\(--dashboard-mobile-section-gap\) !important;[\s\S]*?background: #fafafa !important/);
  assert.match(css, /@media \(max-width: 760px\) \{[\s\S]*?\.figma-shell\.dashboard-page \.dashboard-grid-top,[\s\S]*?\.figma-shell\.dashboard-page \.dashboard-grid-bottom,[\s\S]*?\.figma-shell\.dashboard-page \.dashboard-weak-full \{[\s\S]*?gap: var\(--dashboard-mobile-section-gap\) !important/);
  assert.match(css, /\.figma-shell\.dashboard-page \.dashboard-stat-grid \{[\s\S]*?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\) !important;[\s\S]*?gap: 0 !important/);
  assert.match(css, /\.figma-shell\.dashboard-page \.dashboard-weak-grid \{[\s\S]*?grid-template-columns: 1fr !important;[\s\S]*?gap: 12px !important/);
  assert.match(css, /\.figma-shell\.dashboard-page \.dashboard-weak-grid \.weak-row \{[\s\S]*?display: grid !important;[\s\S]*?grid-template-columns: minmax\(0, 1fr\) auto/);
  assert.match(css, /\.figma-shell\.dashboard-page \.dashboard-weak-grid \.weak-row p \{[\s\S]*?white-space: nowrap !important/);
  assert.match(css, /@media \(max-width: 760px\) \{[\s\S]*?\.figma-shell\.dashboard-page \.dashboard-panel,/);
  assert.match(css, /\.dashboard-wrong-note-summary em \{[\s\S]*?border-radius: 999px/);
  assert.doesNotMatch(css, /dashboard-wrong-note-priority/);
  assert.doesNotMatch(css, /dashboard-wrong-note-chips/);
  assert.match(clientSource, /\/api\/mock-exams\/attempts/);
  assert.match(clientSource, /getSession/);
  assert.match(clientSource, /localFallbackCount/);
  assert.match(clientSource, /DashboardBrowserOnlyNotice/);
  assert.match(clientSource, /이 브라우저에만 남은 제출 기록/);
  assert.match(clientSource, /서버에 저장된 기록만 반영됩니다/);
  assert.doesNotMatch(clientSource, /buildLocalDashboardResponse/);
  assert.doesNotMatch(clientSource, /임시 저장`| · 임시 저장/);
  assert.match(clientSource, /저장된 최근 기록/);
  assert.match(clientSource, /오답노트/);
  assert.match(clientSource, /wrong_note/);
  assert.match(clientSource, /틀린 문제/);
  assert.match(clientSource, /dashboard-wrong-note-card/);
  assert.match(clientSource, /dashboard-wrong-note-summary/);
  assert.match(clientSource, /최근 오답/);
  assert.doesNotMatch(clientSource, /먼저 오답부터/);
  assert.doesNotMatch(clientSource, /미응답부터 채우기/);
  assert.doesNotMatch(clientSource, /남은 미응답은 다음 회차/);
  assert.match(clientSource, /다시 풀기/);
  assert.match(clientSource, /href="\/wrong-note"/);
  assert.match(clientSource, /LOCAL_ATTEMPTS_STORAGE_KEY/);
  assert.match(clientSource, /readLocalDashboardAttempts/);
  assert.match(css, /dashboard-local-fallback-note/);
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
    "weekly_activity",
    "section_summary",
    "attempt_count",
    "mock_exam_questions(sort_order, mock_exam_sections(section_key))",
    "source_sort_order?: number",
    "full_question_count?: number",
    "sort_order: answer.source_sort_order ?? index + 1",
    ".not(\"selected_choice\", \"is\", null)",
    "unanswered_count: 0",
    "status: \"wrong\"",
    "deterministicUuid",
    "auth.getUser",
    "getSupabasePrivilegedClient",
    "getSupabaseServerClient",
    "onConflict: \"mock_exam_set_id,sort_order\"",
    "errorMessage",
  ]) {
    assert.ok(source.includes(phrase), phrase);
  }
});

test("N4 through N1 realistic mock exam pages load 50-question non-listening artifacts", () => {
  for (const level of ["N4", "N3", "N2", "N1"]) {
    const pageSource = levelRealisticMockExamPage(level);
    const lower = level.toLowerCase();

    assert.match(pageSource, new RegExp(`${lower}-realistic-mock-exam-001\\.json`));
    assert.match(pageSource, /<SiteHeader active="mock"/);
    assert.match(pageSource, /MockExamRunner/);
    assert.match(pageSource, /exam-portal-layout/);
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
    ".mock-page-stack:has(.mock-exam-shell--active)",
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
  assert.match(source, /MockExamRunner/);
  assert.match(source, /exam-portal-layout/);
  assert.match(source, /exam-ad-sidebar/);
  assert.match(source, /Google Ad/);
  assert.match(source002, /n5-realistic-mock-exam-002\.json/);
  assert.match(source002, /<SiteHeader active="mock"/);
  assert.match(source002, /MockExamRunner/);
  assert.match(source002, /exam-portal-layout/);
  const source003 = realisticMockExam003Page();
  assert.match(source003, /n5-realistic-mock-exam-003\.json/);
  assert.match(source003, /<SiteHeader active="mock"/);
  assert.match(source003, /MockExamRunner/);
  assert.match(source003, /exam-portal-layout/);
});

test("mock exam start screen is optimized for mobile before the exam begins", () => {
  const clientSource = mockExamClient();
  const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");

  assert.match(clientSource, /mock-exam-start-summary/);
  assert.match(clientSource, /mock-exam-start-checklist/);
  assert.match(clientSource, /<span>시간<\/span>\{artifact\.set\.time_limit_minutes\}분/);
  assert.match(clientSource, /className="mock-exam-order-line">한자읽기 → 표기 → 문맥규정 → 유의표현 → 문법 → 독해/);
  assert.doesNotMatch(clientSource, /문제 순서: 한자읽기/);
  assert.match(css, /\.mock-exam-order-line \{[\s\S]*?letter-spacing:\s*\.025em/);
  assert.match(css, /\.mock-exam-order-line \{[\s\S]*?word-spacing:\s*\.08em/);
  assert.doesNotMatch(clientSource, /<span>문제 순서<\/span>한자읽기/);
  assert.doesNotMatch(clientSource, /<li>제한 시간 \{artifact\.set\.time_limit_minutes\}분<\/li>/);
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
  const css = globalStyles();
  for (const phrase of [
    "전체 제출",
    "시험 시작",
    "준비가 되면 시험을 시작하세요",
    "시간",
    "한자읽기 → 표기 → 문맥규정 → 유의표현 → 문법 → 독해",
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
    "목표 {goalRate}% 대비",
    "mock-balance-dashboard",
    "mock-balance-row",
    "mock-balance-track",
    "sectionBalanceStatus",
    "청해 제외 세트이므로",
    "선생님의 평가",
    "teacherHeadline",
    "teacherActionItems",
    "teacherSummary",
    "teacherFeedback",
    "결과 기반 자동 평가",
    "mock-teacher-detail",
    "mock-teacher-caution",
    "mock-teacher-metrics",
    "mock-teacher-actions",
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
    "seededShuffle",
    "orderedProblemDefinitions",
    "SECTION_ORDER",
    "question-order",
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
    "로그인하면 제출 기록과 오답노트가 대시보드에 저장됩니다",
    "비로그인 상태에서는 체험 결과만 확인할 수 있습니다",
    "loginSubmitPromptOpen",
    "로그인하면 이번 결과가 저장됩니다",
    "비로그인 상태로 계속하면 결과 화면만 확인되고",
    "최근 모의고사·오답노트에는 저장되지 않습니다",
    "로그인하고 저장하기",
    "그냥 결과 보기",
    "isServerSaved",
    "local_saved",
    "브라우저에만 임시 저장했습니다",
    "대시보드와 오답노트에는 아직 반영되지 않았습니다",
    "결과 화면에서만 확인됩니다",
    "로그인 제출 시 오답노트에 저장됩니다",
    "모의고사 기록을 저장했습니다",
    "서버 저장을 완료하지 못했습니다. 이 결과는 이 브라우저에만 남아 있으며 대시보드 통계에는 반영되지 않습니다",
    "LOCAL_ATTEMPTS_STORAGE_KEY",
    "writeLocalMockExamAttempt",
    "readLocalMockExamAttempts",
    "/api/mock-exams/attempts",
    "source_sort_order: question.sort_order",
    "full_question_count: section.question_count",
  ]) {
    assert.ok(source.includes(phrase), phrase);
  }
  assert.doesNotMatch(source, /mock-balance-mini-chart|mock-radar|radarPolygonPoints|averageBalanceRate|balanceSpread/);
  assert.doesNotMatch(css, /mock-balance-mini-chart|mock-radar|mock-radar-score-shape/);
  assert.match(source, /submitted \? \(/);
  assert.match(source, /orderedProblemDefinitions\(\)\.flatMap/);
  assert.match(source, /SECTION_ORDER\.flatMap\(\(sectionKey\) =>[\s\S]*?PROBLEM_DEFINITIONS\.filter\(\(problem\) => problem\.sectionKey === sectionKey\)/);
  assert.match(source, /seededShuffle\([\s\S]*?problemQuestions\(artifact, problem\)[\s\S]*?question-order/);
  assert.doesNotMatch(source, /problem-order/);
  assert.match(source, /const originalCorrectIndex = CHOICE_KEYS\.indexOf\(question\.correct_choice\)/);
  assert.match(source, /const renderedCorrectIndex = shuffledChoices\.findIndex/);
  assert.match(source, /renderedCorrectIndex === originalCorrectIndex/);
  assert.match(source, /renderedCorrectChoice\(question, renderedChoices\)/);
  assert.doesNotMatch(source, /selectedAnswers\[question\.id\] === question\.correct_choice/);
  assert.doesNotMatch(source, /problemQuestions\(artifact, problem\)\.map/);
  assert.doesNotMatch(source, /feedbackSummary/);
  assert.doesNotMatch(source, /출제 경험 체크/);
  assert.doesNotMatch(source, /본 적 있음 \{feedbackSummary\.yes\}/);
  assert.match(source, /청해 없이/);
  const styles = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
  assert.match(styles, /\.mock-save-status\[data-status="local_saved"\]/);
  assert.match(styles, /\.mock-exam-save-guide,/);
  assert.match(styles, /\.mock-auth-save-note/);
  assert.match(styles, /\.mock-login-submit-prompt a/);
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
  assert.match(styles, /mobile active exam status bar: compact full-width document header/);
  assert.match(styles, /@media \(max-width: 760px\) \{[\s\S]*?\.mock-exam-shell--active \.mock-exam-sticky-status \{[\s\S]*?top: var\(--site-header-height, 64px\) !important/);
  assert.match(styles, /\.mock-exam-shell--active \.mock-exam-restart-button \{[\s\S]*?display: none !important/);
  assert.match(styles, /@media \(max-width: 760px\) \{[\s\S]*?main:has\(\.mock-exam-shell--active\) \{[\s\S]*?padding-left: 0 !important;[\s\S]*?padding-right: 0 !important/);
  assert.match(styles, /@media \(max-width: 760px\) \{[\s\S]*?\.mock-exam-shell--active \.mock-exam-section \{[\s\S]*?border-left: 0 !important;[\s\S]*?border-right: 0 !important;[\s\S]*?border-radius: 0 !important/);
  assert.match(styles, /@media \(max-width: 760px\) \{[\s\S]*?\.mock-exam-shell--active \.mock-exam-current-card \{[\s\S]*?border: 0 !important;[\s\S]*?border-radius: 0 !important/);
  assert.match(styles, /mobile active exam keeps submit\/restart controls inside the question sheet only/);
  assert.match(styles, /mobile active exam previous\/next controls: keep step buttons single-line and balanced/i);
  assert.match(styles, /\.mock-exam-shell--active \.mock-exam-bottom-nav \{[\s\S]*?grid-template-columns: minmax\(126px, \.34fr\) minmax\(0, 1fr\) !important/);
  assert.match(styles, /\.mock-exam-shell--active \.mock-exam-bottom-nav \.secondary-action,[\s\S]*?white-space: nowrap !important/);
  assert.match(styles, /\.mock-exam-shell--active \.mock-exam-bottom-nav \.secondary-action,[\s\S]*?word-break: keep-all !important/);
  assert.match(styles, /@media \(max-width: 1180px\) \{[\s\S]*?\.mock-exam-shell--active \.mock-exam-submit-card \{[\s\S]*?display: none !important/);
  assert.match(styles, /@media \(max-width: 760px\) \{[\s\S]*?\.mock-exam-shell--active \.mock-exam-bottom-nav \{[\s\S]*?margin-bottom: 14px !important/);
});


test("wrong-note retry page replays only attempted wrong local fallback questions", () => {
  const pageSource = wrongNotePage();
  const clientSource = wrongNoteClient();
  const mockSource = mockExamClient();
  const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");

  assert.match(pageSource, /WrongNoteClient/);
  assert.match(pageSource, /SiteHeader active="history"/);
  assert.match(clientSource, /오답 다시 풀기/);
  assert.match(clientSource, /마지막 문제를 확인하면 바로 다음 학습/);
  assert.match(clientSource, /LOCAL_ATTEMPTS_STORAGE_KEY/);
  assert.match(clientSource, /item\.status === "wrong" && item\.question/);
  assert.match(clientSource, /정답 확인/);
  assert.match(clientSource, /마지막 문제까지 확인했습니다/);
  assert.match(clientSource, /다시 한 번 풀기/);
  assert.match(clientSource, /새 모의고사 풀기/);
  assert.match(clientSource, /wrong-note-primary-cta/);
  assert.match(clientSource, /isLastItem && isRevealed/);
  assert.match(clientSource, /wrong-note-progress/);
  assert.match(clientSource, /wrong-note-inline-complete/);
  assert.match(clientSource, /다시 맞힌 문제/);
  assert.match(clientSource, /wrong-note-choice/);
  assert.match(mockSource, /question_text: question\.question_text/);
  assert.match(mockSource, /choice_a: question\.choice_a/);
  assert.match(mockSource, /correct_choice: question\.correct_choice/);
  assert.match(mockSource, /if \(!selectedChoice \|\| selectedChoice === correctChoice\) return \[\]/);
  assert.match(css, /\/\* Wrong-note retry page \*\//);
  assert.match(css, /\.figma-shell\.dashboard-page,\n\.wrong-note-shell \{\n  padding-top: var\(--site-content-top-offset\) !important;/);
  assert.match(css, /\.wrong-note-shell \{[\s\S]*?margin: 0 auto/);
  assert.match(css, /\.wrong-note-page \{[\s\S]*?grid-template-columns: minmax\(360px, 460px\) minmax\(560px, 720px\)/);
  assert.match(css, /\.wrong-note-inline-complete/);
  assert.match(css, /\.wrong-note-complete-actions \.wrong-note-primary-cta[\s\S]*?color: #ffffff !important/);
  assert.match(css, /-webkit-text-fill-color: #ffffff !important/);
  assert.match(css, /\.wrong-note-complete-actions \{[\s\S]*?grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.wrong-note-choice\[data-correct="true"\]/);
});


test("mock exam teacher feedback stays lightweight and rules-based", () => {
  const source = mockExamClient();
  const envExample = readFileSync(new URL("../.env.example", import.meta.url), "utf8");

  for (const phrase of [
    "TeacherFeedback",
    "teacherSummary",
    "결과 기반 자동 평가",
    "공식 JLPT 합격 예측이나 보장이 아닙니다",
    "오답과 미응답 문제를 먼저 다시 풀기",
  ]) {
    assert.ok(source.includes(phrase), phrase);
  }

  assert.doesNotMatch(source, /coach-feedback|LOCAL_LLM|AI 평가|AI 생성 중|자체 LLM/);
  assert.doesNotMatch(envExample, /LOCAL_LLM|self-hosted LLM|OpenAI-compatible/);
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const authPanel = () => readFileSync(new URL("../src/components/auth/AuthPanel.tsx", import.meta.url), "utf8");
const loginPage = () => readFileSync(new URL("../src/app/login/page.tsx", import.meta.url), "utf8");
const settingsPage = () => readFileSync(new URL("../src/app/settings/page.tsx", import.meta.url), "utf8");
const settingsClient = () => readFileSync(new URL("../src/components/settings/SettingsClient.tsx", import.meta.url), "utf8");
const homePage = () => readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
const guidePage = () => readFileSync(new URL("../src/app/guide/page.tsx", import.meta.url), "utf8");
const siteHeader = () => readFileSync(new URL("../src/components/layout/SiteHeader.tsx", import.meta.url), "utf8");
const authHeaderButton = () => readFileSync(new URL("../src/components/auth/AuthHeaderButton.tsx", import.meta.url), "utf8");
const callbackPage = () => readFileSync(new URL("../src/app/auth/callback/page.tsx", import.meta.url), "utf8");
const setupDoc = () => readFileSync(new URL("../docs/architecture/auth-provider-dashboard-setup.md", import.meta.url), "utf8");

test("auth panel exposes Google Kakao Naver and email login", () => {
  const source = authPanel();
  for (const label of ["Google", "Kakao", "Naver", "Email"]) {
    assert.match(source, new RegExp(label));
  }
  assert.match(source, /signInWithOAuth/);
  assert.match(source, /signInWithOtp/);
});

test("auth panel uses safe email magic link instead of password signup", () => {
  const source = authPanel();
  assert.match(source, /이메일 링크/);
  assert.equal(source.includes("password"), false);
});

test("auth panel switches to account actions when a session exists", () => {
  const source = authPanel();
  assert.match(source, /getSession/);
  assert.match(source, /onAuthStateChange/);
  assert.match(source, /isSignedIn/);
  assert.match(source, /auth-card--signed-in/);
  assert.match(source, /대시보드로 이동/);
  assert.match(source, /signOut/);
});

test("login page is a centered auth-only screen and headers are shared", () => {
  const loginSource = loginPage();
  const homeSource = homePage();
  const panelSource = authPanel();
  const headerSource = siteHeader();
  const headerButtonSource = authHeaderButton();
  assert.match(homeSource, /<SiteHeader active="home"/);
  assert.match(loginSource, /<SiteHeader active="home"/);
  assert.match(loginSource, /login-simple-stage/);
  assert.doesNotMatch(loginSource, /login-copy-card/);
  assert.match(loginSource, /<AuthPanel variant="page"/);
  assert.match(headerSource, /home-topbar site-header/);
  assert.match(headerSource, /home-nav/);
  assert.match(headerSource, /AuthHeaderButton/);
  assert.match(headerButtonSource, /getSession/);
  assert.match(headerButtonSource, /auth-profile-trigger/);
  assert.match(headerButtonSource, /auth-profile-avatar/);
  assert.match(headerButtonSource, /auth-profile-name/);
  assert.match(headerButtonSource, /auth-profile-dropdown/);
  assert.match(headerSource, /학습 기록/);
  assert.match(headerSource, /수험안내/);
  assert.match(headerSource, /active === "guide"/);
  assert.doesNotMatch(headerButtonSource, /학습 기록/);
  assert.match(headerButtonSource, /설정/);
  assert.match(headerButtonSource, /로그아웃/);
  assert.doesNotMatch(headerSource, />대시보드</);
  assert.match(panelSource, /auth-provider-button/);
  assert.match(panelSource, /auth-divider/);
});

test("guide page is available from header and keeps safe exam-guide wording", () => {
  const source = guidePage();
  assert.match(source, /<SiteHeader active="guide"/);
  assert.match(source, /JLPT 수험안내/);
  assert.match(source, /출처 : JLPT 서울실시위원회 참고/);
  assert.match(source, /실제 응시 전에는 반드시 공식 안내 원문과 시험장 공지를 다시 확인해주세요/);
  assert.match(source, /시험 당일 준비물/);
  assert.match(source, /"신분증, HB연필 또는 샤프,"/);
  assert.match(source, /"지우개를 준비하세요\."/);
  assert.match(source, /"볼펜·사인펜으로 작성한 답안지는"/);
  assert.match(source, /"채점이 어려울 수 있습니다\."/);
  assert.match(source, /"신분증 미지참 시 응시가 불가합니다\."/);
  assert.match(source, /"모바일 신분증은 네트워크 문제에 대비해"/);
  assert.match(source, /"실물 신분증 지참을 권장합니다\."/);
  assert.match(source, /"휴대전화, 스마트워치 등"/);
  assert.match(source, /"통신·촬영 기능이 있는"/);
  assert.match(source, /"전자기기는 시험 중 전원이 꺼져 있어야 합니다\."/);
  assert.match(source, /card\.body\.map/);
  assert.match(source, /규정 신분증 요약/);
  assert.match(source, /부정행위로 처리될 수 있는 경우/);
  assert.match(source, /성적·주소 관련 유의사항/);
  assert.match(source, /information_02\.html/);
  assert.match(source, /guide-id-row/);
  assert.doesNotMatch(source, /guide-source-panel/);
  assert.doesNotMatch(source, /공식 안내 출처/);
  assert.doesNotMatch(source, /N5 모의고사 시작/);
  assert.doesNotMatch(source, /시험 당일 준비물, 규정 신분증, 부정행위 유의사항을 한눈에 확인하세요/);
  assert.doesNotMatch(source, /합격 보장|출제 예상|공식 문제/);
});

test("settings page provides account learning defaults and safe service guidance", () => {
  const pageSource = settingsPage();
  const clientSource = settingsClient();
  assert.match(pageSource, /<SiteHeader \/>/);
  assert.match(pageSource, /<SettingsClient \/>/);
  assert.match(clientSource, /SETTINGS_STORAGE_KEY/);
  assert.match(clientSource, /jlpt-quiz-user-settings/);
  assert.match(clientSource, /기본 JLPT 레벨/);
  assert.match(clientSource, /N5/);
  assert.match(clientSource, /오답노트/);
  assert.match(clientSource, /미응답 문제 포함/);
  assert.match(clientSource, /취약 영역 기준/);
  assert.match(clientSource, /출제 체감 score는 학습자 응답 기반 참고 지표입니다/);
  assert.match(clientSource, /공식 JLPT 출제 이력이나 합격 가능성을 의미하지 않습니다/);
  assert.match(clientSource, /getSession/);
  assert.match(clientSource, /signOut/);
  assert.doesNotMatch(clientSource, /결제|구독|합격 보장|출제 예상/);
});

test("auth callback page handles OAuth code and magic link hash sessions", () => {
  const source = callbackPage();
  assert.match(source, /exchangeCodeForSession/);
  assert.match(source, /setSession/);
  assert.match(source, /access_token/);
  assert.match(source, /refresh_token/);
  assert.match(source, /replaceState/);
});

test("dashboard setup doc lists all selected providers and no secrets", () => {
  const source = setupDoc();
  for (const label of ["Google", "Kakao", "Naver", "Email"]) {
    assert.match(source, new RegExp(label));
  }
  assert.match(source, /secret 값은 문서나 채팅에 기록하지 않는다/);
});

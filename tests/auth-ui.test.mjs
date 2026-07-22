import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const authPanel = () => readFileSync(new URL("../src/components/auth/AuthPanel.tsx", import.meta.url), "utf8");
const loginPage = () => readFileSync(new URL("../src/app/login/page.tsx", import.meta.url), "utf8");
const homePage = () => readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
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
  assert.match(headerButtonSource, /학습 기록/);
  assert.match(headerButtonSource, /설정/);
  assert.match(headerButtonSource, /로그아웃/);
  assert.doesNotMatch(headerSource, />대시보드</);
  assert.match(panelSource, /auth-provider-button/);
  assert.match(panelSource, /auth-divider/);
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

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const authPanel = () => readFileSync(new URL("../src/components/auth/AuthPanel.tsx", import.meta.url), "utf8");
const loginPage = () => readFileSync(new URL("../src/app/login/page.tsx", import.meta.url), "utf8");
const homePage = () => readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
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

test("auth panel disables login controls when a session exists", () => {
  const source = authPanel();
  assert.match(source, /getSession/);
  assert.match(source, /onAuthStateChange/);
  assert.match(source, /isSignedIn/);
  assert.match(source, /disabled={isAuthLoading \|\| isSignedIn}/);
  assert.match(source, /로그인된 상태입니다/);
  assert.match(source, /signOut/);
});

test("login page uses Figma-style dedicated auth layout", () => {
  const loginSource = loginPage();
  const homeSource = homePage();
  const panelSource = authPanel();
  assert.match(homeSource, /href="\/login"/);
  assert.match(loginSource, /login-page-shell/);
  assert.match(loginSource, /login-copy-card/);
  assert.match(loginSource, /<AuthPanel variant="page"/);
  assert.match(panelSource, /auth-card--\$\{variant\}/);
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

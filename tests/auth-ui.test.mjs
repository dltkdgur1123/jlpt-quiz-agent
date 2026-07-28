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
const naverStartRoute = () => readFileSync(new URL("../src/app/api/auth/naver/start/route.ts", import.meta.url), "utf8");
const naverCallbackRoute = () => readFileSync(new URL("../src/app/api/auth/naver/callback/route.ts", import.meta.url), "utf8");
const naverAuthLib = () => readFileSync(new URL("../src/lib/auth/naver.ts", import.meta.url), "utf8");
const serverSupabase = () => readFileSync(new URL("../src/lib/supabase/server.ts", import.meta.url), "utf8");
const setupDoc = () => readFileSync(new URL("../docs/architecture/auth-provider-dashboard-setup.md", import.meta.url), "utf8");
const envExample = () => readFileSync(new URL("../.env.example", import.meta.url), "utf8");
const globalCss = () => readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
const kakaoLoginPng = () => readFileSync(new URL("../public/auth/kakao_login_large_wide.png", import.meta.url));

test("auth panel exposes Google Kakao Naver and email login", () => {
  const source = authPanel();
  for (const label of ["Google", "Kakao", "Naver", "Email"]) {
    assert.match(source, new RegExp(label));
  }
  assert.match(source, /signInWithOAuth/);
  assert.match(source, /signInWithOtp/);
});

test("login provider buttons use platform-branded official-style button anatomy", () => {
  const source = authPanel();
  const css = globalCss();
  for (const phrase of [
    "auth-provider-mark",
    "auth-provider-copy",
    "auth-provider-title",
    "auth-provider-subtitle",
    "Google 계정으로 계속",
    "iconSrc",
    "/auth/google-g-logo.svg",
    "auth-provider-icon-mark",
    "auth-provider-primary",
    "data-provider={provider}",
    "data-primary={primary ? \"true\" : \"false\"}",
    "카카오 로그인",
    "네이버 로그인",
    "Custom OAuth 로그인",
    "/auth/naver-n-logo.svg",
    "공식 OAuth 로그인",
    "officialImageSrc",
    "/auth/kakao_login_large_wide.png",
    "auth-provider-official-image",
  ]) {
    assert.ok(source.includes(phrase), phrase);
  }
  for (const phrase of [
    "Login provider official-style buttons",
    ".login-simple-stage .auth-provider-button",
    ".login-simple-stage .auth-provider-primary[data-provider=\"google\"]",
    "Google Identity branding guideline",
    ".auth-provider-google .auth-provider-mark",
    ".auth-provider-kakao .auth-provider-mark",
    ".auth-provider-naver .auth-provider-mark",
    ".login-simple-stage .auth-provider-naver",
    "auth-provider-official-image",
    "#03c75a",
    "grid-template-columns: 40px minmax(0, 1fr)",
    "place-items: start",
    "width: auto",
    "background: transparent",
    "width: min(420px, 100%)",
    "max-height: 56px",
    "#747775",
    "#1f1f1f",
    "font-family: Roboto, Arial, sans-serif",
    "grid-template-columns: 40px minmax(0, 1fr) 40px",
    "width: 18px",
    "#02b350",
  ]) {
    assert.ok(css.includes(phrase), phrase);
  }
  assert.equal(kakaoLoginPng().subarray(1, 4).toString("ascii"), "PNG");
  assert.match(readFileSync(new URL("../public/auth/google-g-logo.svg", import.meta.url), "utf8"), /#4285F4/);
  assert.match(readFileSync(new URL("../public/auth/naver-n-logo.svg", import.meta.url), "utf8"), /#FFFFFF/);
});

test("login page uses a compact auth form instead of oversized controls", () => {
  const css = globalCss();
  assert.match(css, /\.login-simple-stage \.auth-card--page \{[\s\S]*?width: min\(420px, 100%\)/);
  assert.match(css, /\.login-simple-stage \.auth-provider-button,[\s\S]*?height: 52px/);
  assert.match(css, /\.login-simple-stage \.auth-provider-title \{[\s\S]*?font-size: 14px/);
  assert.match(css, /\.login-simple-stage \.auth-email-field \{[\s\S]*?font-size: 14px/);
  assert.match(css, /\.login-simple-stage \.auth-email-field input \{[\s\S]*?height: 52px/);
  assert.match(css, /\.login-simple-stage \.auth-email-submit,[\s\S]*?height: 52px/);
  assert.match(css, /\.login-page-main \{[\s\S]*?min-height: auto/);
  assert.match(css, /\.login-page-shell \{[\s\S]*?min-height: auto/);
  assert.match(css, /\.login-simple-stage \{[\s\S]*?min-height: auto/);
  assert.match(css, /\.login-simple-stage \{[\s\S]*?place-items: start center/);
});

test("mobile layout uses four bottom tabs and keeps original shorts thumbnail sizing", () => {
  const css = globalCss();
  const headerSource = siteHeader();
  assert.match(css, /\.mobile-bottom-nav \{/);
  assert.match(css, /@media \(max-width: 760px\) \{[\s\S]*?\.mobile-bottom-nav \{[\s\S]*?display: grid/);
  assert.match(css, /grid-template-columns: repeat\(4, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.mobile-bottom-nav-item\[data-active="true"\] \{[\s\S]*?color: var\(--jlpt-primary/);
  assert.match(css, /@media \(max-width: 760px\) \{[\s\S]*?\.home-shorts-grid \{[\s\S]*?grid-template-columns: 1fr/);
  assert.match(css, /@media \(max-width: 760px\) \{[\s\S]*?\.home-shorts-grid-link \{[\s\S]*?aspect-ratio: 16 \/ 9/);
  assert.doesNotMatch(css, /max-height: 220px/);
  assert.match(css, /padding-bottom: calc\(88px \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(css, /\.mobile-bottom-nav-space-fix \/\* contract marker \*\//);
  assert.match(css, /@media \(max-width: 760px\) \{[\s\S]*?\.home-shorts-grid-section \{[\s\S]*?padding-bottom: 24px !important/);
  assert.match(css, /@media \(max-width: 760px\) \{[\s\S]*?\.home-page-frame \.home-redesign-shell \{[\s\S]*?padding-bottom: 0 !important/);
  assert.match(headerSource, /모바일 하단 메뉴/);
  assert.doesNotMatch(headerSource, /mobileAccountHref/);
  assert.doesNotMatch(headerSource, />\{headerUser \? "계정" : "로그인"\}<\/Link>/);
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

test("auth panel guards duplicate login actions and preserves a safe next path", () => {
  const source = authPanel();
  assert.match(source, /useSearchParams/);
  assert.match(source, /safeNextPath/);
  assert.match(source, /pendingAction/);
  assert.match(source, /setPendingAction/);
  assert.match(source, /isLoginBusy/);
  assert.match(source, /trimmedEmail/);
  assert.match(source, /emailRedirectTo: redirectTo/);
  assert.match(source, /searchParams\.set\("next", nextPath\)/);
  assert.match(source, /queryParams: providerQueryParams\(provider\)/);
  assert.match(source, /provider === "custom:naver"/);
  assert.match(source, /\/api\/auth\/naver\/start/);
  assert.match(source, /window\.location\.assign\(startUrl\.toString\(\)\)/);
  assert.match(source, /providerQueryParams/);
  assert.match(source, /provider === "google"\) return \{ prompt: "select_account" \}/);
  assert.match(source, /provider === "custom:naver"\) return \{ auth_type: "reauthenticate" \}/);
  assert.match(source, /provider === "custom:naver"\) return "네이버 로그인 화면으로 이동합니다/);
  assert.match(source, /Google 로그인 화면으로 이동합니다/);
  assert.match(source, /로그인 설정을 확인할 수 없습니다/);
  assert.match(source, /로그인 요청을 처리하고 있습니다/);
  assert.match(source, /올바른 이메일 주소를 입력해주세요/);
  assert.doesNotMatch(source, /window\.location\.href\.includes/);
});

test("auth callback skips the success screen and auto-redirects after session handling", () => {
  const source = callbackPage();
  const css = globalCss();
  assert.match(source, /safeNextPath/);
  assert.match(source, /URLSearchParams\(window\.location\.search\)/);
  assert.match(source, /oauthError/);
  assert.match(source, /oauthErrorDescription/);
  assert.match(source, /세션 교환 실패/);
  assert.match(source, /OAuth code 수신/);
  assert.match(source, /세션 토큰 수신/);
  assert.match(source, /auth-callback-diagnostics/);
  assert.match(css, /\.auth-callback-diagnostics/);
  assert.match(source, /replaceState/);
  assert.match(source, /window\.location\.replace\(next\)/);
  assert.match(source, /로그인 처리 중/);
  assert.doesNotMatch(source, /로그인 완료/);
  assert.doesNotMatch(source, /href=\{nextPath\}/);
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
  assert.match(headerButtonSource, /로그인\/가입/);
  assert.match(globalCss(), /\.site-header \.home-login-button \{[\s\S]*?background: var\(--jlpt-primary, #d32f2f\) !important/);
  assert.match(globalCss(), /\.site-header \.home-login-button:hover \{[\s\S]*?#b71c1c/);
  assert.match(panelSource, /처음이신가요\?/);
  assert.match(panelSource, /소셜 계정으로 바로 시작할 수 있습니다/);
  assert.match(headerSource, /학습 기록/);
  assert.match(headerSource, /수험안내/);
  assert.match(
    headerSource,
    /href="\/">홈<\/Link>[\s\S]*?href="\/guide">수험안내<\/Link>[\s\S]*?href="\/mock-exams\/n5-realistic-001">모의고사<\/Link>[\s\S]*?href="\/dashboard">학습 기록<\/Link>/,
  );
  assert.match(
    headerSource,
    /href="\/">홈<\/Link>[\s\S]*?href="\/guide">수험안내<\/Link>[\s\S]*?href="\/mock-exams\/n5-realistic-001">모의고사<\/Link>[\s\S]*?href="\/dashboard">기록<\/Link>/,
  );
  assert.match(headerSource, /mobile-bottom-nav/);
  assert.match(headerSource, /모바일 하단 메뉴/);
  assert.match(headerSource, /active === "guide"/);
  assert.doesNotMatch(headerSource, /mobileAccountHref/);
  assert.doesNotMatch(headerSource, /headerUser \? "계정" : "로그인"/);
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

test("settings page provides account learning defaults without extra service notice", () => {
  const pageSource = settingsPage();
  const clientSource = settingsClient();
  assert.match(pageSource, /<SiteHeader \/>/);
  assert.match(pageSource, /<SettingsClient \/>/);
  assert.match(clientSource, /SETTINGS_STORAGE_KEY/);
  assert.match(clientSource, /jlpt-quiz-user-settings/);
  assert.match(clientSource, /<span>01<\/span>/);
  assert.match(clientSource, /<span>04<\/span>/);
  assert.match(clientSource, /기본 JLPT 레벨/);
  assert.match(clientSource, /N5/);
  assert.match(clientSource, /settings-level-and-wrongnote-card/);
  assert.match(clientSource, /settings-wrongnote-embedded/);
  assert.match(clientSource, /오답노트/);
  assert.match(clientSource, /미응답 문제 포함/);
  assert.match(clientSource, /취약 영역 기준/);
  assert.doesNotMatch(clientSource, /<article className="dashboard-panel settings-card">\n          <div className="settings-card-head">\n            <span>03<\/span>/);
  assert.match(clientSource, /getSession/);
  assert.match(clientSource, /닉네임/);
  assert.match(clientSource, /nicknameInput/);
  assert.match(clientSource, /updateUser\(\{ data: \{ nickname/);
  assert.match(clientSource, /프로필 이름이 저장되었습니다/);
  assert.match(clientSource, /signOut/);
  assert.doesNotMatch(clientSource, /서비스 안내/);
  assert.doesNotMatch(clientSource, /출제 체감 score는 학습자 응답 기반 참고 지표입니다/);
  assert.doesNotMatch(clientSource, /공식 JLPT 출제 이력이나 합격 가능성을 의미하지 않습니다/);
  assert.doesNotMatch(clientSource, /결제|구독|합격 보장|출제 예상/);
});

test("settings and guide avoid bordered containers nested inside cards", () => {
  const css = globalCss();
  const settingsToggleRule = css.match(/\.settings-toggle-row \{[\s\S]*?\n\}/)?.[0] ?? "";
  const guideListRule = css.match(/\.guide-level-list \{[\s\S]*?\n\}/)?.[0] ?? "";

  assert.match(settingsToggleRule, /border:\s*0/);
  assert.match(settingsToggleRule, /border-radius:\s*0/);
  assert.match(settingsToggleRule, /padding:\s*0/);
  assert.match(css, /\.settings-wrongnote-embedded \.settings-toggle-row \{[\s\S]*?padding-left:\s*30px/);
  assert.doesNotMatch(guideListRule, /border:\s*1px/);
  assert.match(guideListRule, /border:\s*0/);
  assert.match(guideListRule, /border-radius:\s*0/);
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
  const env = envExample();
  for (const label of ["Google", "Kakao", "Naver", "Email"]) {
    assert.match(source, new RegExp(label));
  }
  assert.match(source, /secret 값은 문서나 채팅에 기록하지 않는다/);
  assert.match(source, /Kakao 로그인 실제 연결 절차/);
  assert.match(source, /Naver 로그인 실제 연결 절차/);
  assert.match(source, /Unsupported provider: provider is not enabled/);
  assert.match(source, /provider=kakao/);
  assert.match(source, /\/api\/auth\/naver\/start/);
  assert.match(source, /\/api\/auth\/naver\/callback/);
  assert.match(source, /Authorization URL:\nhttps:\/\/nid\.naver\.com\/oauth2\.0\/authorize/);
  assert.match(source, /Token URL:\nhttps:\/\/nid\.naver\.com\/oauth2\.0\/token/);
  assert.match(source, /User Info URL:\nhttps:\/\/openapi\.naver\.com\/v1\/nid\/me/);
  assert.match(source, /response\.id/);
  assert.match(source, /response\.email/);
  assert.match(source, /Supabase Dashboard → Authentication → Providers → Kakao 활성화/);
  assert.match(source, /https:\/\/<supabase-project-ref>\.supabase\.co\/auth\/v1\/callback/);
  assert.match(source, /http:\/\/127\.0\.0\.1:3010\/auth\/callback/);
  assert.match(env, /NAVER_CLIENT_ID/);
  assert.match(env, /NAVER_CLIENT_SECRET/);
  assert.match(env, /SUPABASE_SERVICE_ROLE_KEY/);
});

test("naver login uses app-owned callback and Supabase magic-link bridge", () => {
  const panel = authPanel();
  const start = naverStartRoute();
  const callback = naverCallbackRoute();
  const lib = naverAuthLib();
  const supabaseServer = serverSupabase();

  assert.match(panel, /\/api\/auth\/naver\/start/);
  assert.match(panel, /provider === "custom:naver"\)[\s\S]*?window\.location\.assign\(startUrl\.toString\(\)\);[\s\S]*?return;[\s\S]*?const \{ error \} = await supabase\.auth\.signInWithOAuth/);
  assert.match(start, /NAVER_CLIENT_ID/);
  assert.match(start, /configuredUrl/);
  assert.match(start, /request\.nextUrl\.origin/);
  assert.match(start, /buildNaverAuthorizeUrl/);
  assert.match(lib, /https:\/\/nid\.naver\.com\/oauth2\.0\/authorize/);
  assert.match(start, /jlpt_naver_oauth_state/);
  assert.match(start, /authType: "reauthenticate"/);
  assert.match(callback, /NAVER_CLIENT_SECRET/);
  assert.match(callback, /configuredUrl/);
  assert.match(callback, /request\.nextUrl\.origin/);
  assert.match(callback, /readableSupabaseAdminError/);
  assert.match(callback, /SUPABASE_SERVICE_ROLE_KEY가 유효하지 않습니다/);
  assert.match(callback, /https:\/\/nid\.naver\.com\/oauth2\.0\/token/);
  assert.match(callback, /https:\/\/openapi\.naver\.com\/v1\/nid\/me/);
  assert.match(callback, /parseNaverUserInfo/);
  assert.match(callback, /createUser/);
  assert.match(callback, /email_confirm: true/);
  assert.match(callback, /generateLink/);
  assert.match(callback, /type: "magiclink"/);
  assert.match(callback, /action_link/);
  assert.match(lib, /fields\.id/);
  assert.match(lib, /fields\.email/);
  assert.match(supabaseServer, /getSupabaseServiceRoleClient/);
  assert.match(supabaseServer, /normalizeSupabaseKey/);
  assert.match(supabaseServer, /replace\(\/\^Bearer/);
});

# Auth Provider Dashboard Setup

## 선택된 로그인 방식

```text
Google
Kakao
Naver
Email
```

## 공통 원칙

- secret 값은 문서나 채팅에 기록하지 않는다.
- OAuth client secret은 Supabase dashboard에만 입력한다.
- browser에는 publishable/anon key만 사용한다.
- 자체 아이디/비밀번호 회원가입은 1차 MVP에서 제외한다.

## Supabase에서 설정할 것

1. Authentication 메뉴로 이동
2. Providers 메뉴에서 Google, Kakao, Email 활성화
3. Naver는 Supabase 기본 provider 목록에 없으므로 Custom OAuth/OIDC provider로 `custom:naver` 설정
4. 각 provider의 callback URL을 외부 개발자 콘솔에 등록
5. Site URL과 Redirect URL을 배포 URL에 맞게 설정

## Google 로그인 실제 연결 절차

현재 프론트엔드는 Google 버튼 클릭 시 Supabase OAuth authorize endpoint로 이동한다.

```text
Supabase authorize endpoint:
/auth/v1/authorize?provider=google&redirect_to=<site>/auth/callback&prompt=select_account
```

로컬 smoke에서 Supabase authorize URL 생성이 성공해야 한다. 현재 프로젝트에서는 authorize URL 생성과 버튼 클릭 후 Supabase authorize endpoint 이동까지 확인됐으며, Supabase provider가 비활성 상태이면 다음 응답이 나온다.

```text
Unsupported provider: provider is not enabled
```

이 메시지가 나오면 프론트 코드 문제가 아니라 Supabase Dashboard의 Google provider 활성화가 아직 안 된 상태다.

```bash
set -a; . ./.env.local; set +a
node - <<'NODE'
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
;(async()=>{
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'http://localhost:3010/auth/callback?next=%2Fdashboard',
      skipBrowserRedirect: true,
      queryParams: { prompt: 'select_account' },
    },
  })
  console.log({ ok: !error, hasUrl: Boolean(data?.url), error: error?.message })
})()
NODE
```

실제 Google consent 화면까지 동작하려면 외부 대시보드 설정이 필요하다.

1. Google Cloud Console에서 OAuth client 생성
2. Authorized redirect URI에 Supabase Auth callback URL 등록

```text
https://<supabase-project-ref>.supabase.co/auth/v1/callback
```

3. Supabase Dashboard → Authentication → Providers → Google 활성화
4. Google client id/secret 입력
5. Supabase Authentication URL Configuration에 사이트 URL과 허용 redirect URL 등록

```text
Local redirect:
http://127.0.0.1:3010/auth/callback
http://localhost:3010/auth/callback

Production redirect:
https://<vercel-domain>/auth/callback
```

6. `/login`에서 Google 버튼 클릭 → Google consent 화면 → `/auth/callback` → 로그인 상태 반영까지 확인

주의: Google client secret 값은 코드, 문서, 채팅, Notion에 기록하지 않는다.

## Kakao 로그인 실제 연결 절차

현재 프론트엔드는 카카오 버튼 클릭 시 Supabase OAuth endpoint로 정상 이동한다.

```text
Supabase authorize endpoint:
/auth/v1/authorize?provider=kakao&redirect_to=<site>/auth/callback
```

로컬 클릭 검증에서 확인된 현재 blocker:

```text
Unsupported provider: provider is not enabled
```

따라서 실제 카카오 로그인 작동을 위해 필요한 외부 설정은 아래 순서다.

1. Kakao Developers에서 앱 생성 또는 기존 앱 선택
2. 앱 설정에서 카카오 로그인 활성화
3. Redirect URI에 Supabase Auth callback URL 등록

```text
https://<supabase-project-ref>.supabase.co/auth/v1/callback
```

4. Kakao Developers 앱의 REST API 키 또는 OAuth client 정보를 확인
5. Supabase Dashboard → Authentication → Providers → Kakao 활성화
6. Supabase Kakao provider에 Kakao client id/secret 입력
7. Supabase Authentication URL Configuration에 사이트 URL과 허용 redirect URL 등록

```text
Local redirect:
http://127.0.0.1:3010/auth/callback

Production redirect:
https://<vercel-domain>/auth/callback
```

8. `/login`에서 카카오 공식 로그인 버튼 클릭 → Kakao consent 화면 → `/auth/callback` → 로그인 상태 반영까지 확인

주의: Kakao secret/client secret 값은 코드, 문서, 채팅, Notion에 기록하지 않는다.

## Naver 로그인 실제 연결 절차

Supabase 기본 Social Provider 목록에는 Naver가 없으므로 Custom OAuth/OIDC provider로 연결한다. 현재 프론트엔드는 네이버 버튼 클릭 시 다음 Supabase authorize endpoint를 사용한다.

```text
Supabase authorize endpoint:
/auth/v1/authorize?provider=custom%3Anaver&redirect_to=<site>/auth/callback&auth_type=reauthenticate
```

로컬 smoke에서 `custom:naver` authorize URL 생성은 성공해야 한다. 현재 프론트 클릭은 Supabase authorize endpoint까지 이동하며, Supabase Custom provider가 아직 생성되지 않았으면 다음 응답이 나온다.

```text
Unsupported provider: custom provider custom:naver not found
```

이 메시지가 나오면 프론트 코드 문제가 아니라 Supabase Dashboard에서 Custom OAuth/OIDC provider id `naver`가 아직 생성되지 않은 상태다.

```bash
set -a; . ./.env.local; set +a
node - <<'NODE'
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
;(async()=>{
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'custom:naver',
    options: {
      redirectTo: 'http://localhost:3010/auth/callback?next=%2Fdashboard',
      skipBrowserRedirect: true,
      queryParams: { auth_type: 'reauthenticate' },
    },
  })
  console.log({ ok: !error, hasUrl: Boolean(data?.url), error: error?.message })
})()
NODE
```

실제 Naver consent 화면까지 동작하려면 외부 대시보드 설정이 필요하다.

1. Naver Developers에서 애플리케이션 생성
2. 로그인 오픈 API 사용 설정
3. Callback URL에 Supabase Auth callback URL 등록

```text
https://<supabase-project-ref>.supabase.co/auth/v1/callback
```

4. Naver Developers의 Client ID / Client Secret 확인
5. Supabase Dashboard → Authentication → Providers → Custom OAuth/OIDC provider 추가
6. provider id를 `naver`로 설정하여 프론트 provider 값 `custom:naver`와 맞춘다
7. Custom OAuth endpoint 입력

```text
Authorization URL:
https://nid.naver.com/oauth2.0/authorize

Token URL:
https://nid.naver.com/oauth2.0/token

User Info URL:
https://openapi.naver.com/v1/nid/me

Scopes:
name email
```

8. Supabase Authentication URL Configuration에 사이트 URL과 허용 redirect URL 등록

```text
Local redirect:
http://127.0.0.1:3010/auth/callback
http://localhost:3010/auth/callback

Production redirect:
https://<vercel-domain>/auth/callback
```

주의: Naver 사용자 정보는 `response.id`, `response.email`, `response.name`처럼 감싸져 반환될 수 있으므로 Supabase Custom OAuth 매핑/응답 파싱이 지원되는지 실제 consent 후 반드시 확인한다. Client Secret 값은 코드, 문서, 채팅, Notion에 기록하지 않는다.

승인/2단계 인증까지 성공했는데 앱의 `/auth/callback`에서 실패하면 callback 진단 정보를 본다.

```text
OAuth code 수신 = 예, 세션 교환 실패
```

이면 네이버 인증은 성공했지만 Supabase가 네이버 token/userinfo 응답을 Supabase 세션으로 변환하지 못한 것이다. 이 경우 Supabase Custom OAuth/OIDC provider가 네이버의 `response.*` userinfo 또는 ID token/JWKS 요구조건과 맞지 않는지 확인해야 한다.

```text
OAuth code 수신 = 아니요, 세션 토큰 수신 = 아니요
```

이면 redirect URL 또는 OAuth error 파라미터 문제다. 화면의 OAuth error 내용을 우선 확인한다.

다른 네이버 계정으로 테스트해야 할 때는 프론트에서 `auth_type=reauthenticate`를 함께 보낸다. 그래도 네이버가 기존 세션을 유지하면 브라우저에서 `naver.com` 로그아웃 또는 시크릿 창으로 다시 테스트한다.

## Email 방식

MVP에서는 비밀번호 직접 관리 대신 이메일 링크 로그인을 우선 사용한다.

## 다음 확인

- 로컬 callback URL
- Vercel 배포 URL
- Google/Kakao/Naver 개발자 콘솔의 redirect URI

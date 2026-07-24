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

## Email 방식

MVP에서는 비밀번호 직접 관리 대신 이메일 링크 로그인을 우선 사용한다.

## 다음 확인

- 로컬 callback URL
- Vercel 배포 URL
- Google/Kakao/Naver 개발자 콘솔의 redirect URI

# NS-TICKET-003: Supabase Auth 정책 연결

## 목적

로그인 사용자를 `users` 테이블과 연결하고, 출제 경험 feedback 권한 기준을 명확히 한다.

## 정책 요약

- 비로그인 사용자는 퀴즈 조회와 답안 제출 가능.
- 로그인 사용자만 출제 경험 feedback 제출 가능.
- anonymous_id는 MVP score 반영용으로 사용하지 않는다.
- Supabase Auth user는 MVP `users` row와 연결한다.
- 개인정보는 표시 이름, provider, provider user id 수준으로 최소화한다.

## 생성 파일

```text
src/lib/auth/policy.ts
src/lib/auth/user-sync.ts
supabase/policies/0002_auth_policy_draft.sql
tests/auth-policy.test.mjs
docs/architecture/ns-ticket-003.md
```

## Design Agent 관점

비로그인 사용자는 퀴즈를 막지 않는다. 정답 확인 후 feedback 영역에서는 로그인 안내를 보여주는 흐름이 적합하다.

## Coding Agent 관점

권한 판단은 `getAuthPolicy()`에서 작게 시작한다. API 구현 단계에서는 `requireFeedbackUserId()`를 사용해 feedback 저장 전에 로그인 여부를 강제한다.

## QA/Trust 관점

- 비로그인 feedback 차단 테스트가 필요하다.
- `unknown`은 계속 별도 값으로 유지한다.
- score는 공식 JLPT 출제 기록이 아니라 사용자 출제 경험 제보 기반 신호로 설명한다.

## 로그인 provider 결정

MVP 로그인 방식은 Google, Kakao, Naver, Email을 지원하는 방향으로 간다. 자체 아이디/비밀번호 회원가입은 1차 MVP에서 제외한다.

## 아직 제외

- 실제 로그인 UI
- Supabase OAuth callback route
- provider별 dashboard 설정
- RLS migration 실제 적용
- feedback API 구현

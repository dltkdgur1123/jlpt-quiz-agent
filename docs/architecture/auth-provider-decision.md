# 로그인 방식 결정

## 결정

JLPT Quiz Data Platform의 로그인 방식은 아래 4가지를 지원하는 방향으로 간다.

```text
Google
Kakao
Naver
Email
```

## 왜 이렇게 선택했는가

- Google은 Supabase/Auth 기반 MVP 구현이 가장 빠르다.
- Kakao와 Naver는 한국 사용자에게 익숙한 SNS 로그인이다.
- Email은 SNS 계정을 쓰기 싫어하는 사용자를 위한 기본 대안이다.

## 구현 원칙

- 자체 아이디/비밀번호 회원가입은 MVP 1차에서는 제외한다.
- 비밀번호를 직접 관리하지 않는 방향을 우선한다.
- score 반영 feedback은 로그인 사용자만 가능하게 유지한다.
- provider별 설정값과 secret은 코드나 Notion에 기록하지 않는다.

## AI 에이전트 역할

Hermes Chief Agent는 인증 provider 선택을 임의로 확정하지 않고, 사용자의 제품 방향 결정을 받은 뒤 구현 범위를 정리했다.

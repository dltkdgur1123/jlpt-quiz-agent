# POST-MVP: 실제 서비스 연결 준비

## 역할

13단계 로컬 MVP를 실제 서비스로 연결하기 전, 외부 서비스 설정 범위와 순서를 정리한다.

## 왜 이 단계가 필요한가

지금까지는 로컬 코드 기준으로 핵심 루프를 검증했다. 다음부터는 Supabase, Auth provider, Vercel 같은 외부 서비스가 들어가기 때문에 secret, callback URL, 배포 환경변수처럼 민감한 설정을 안전하게 나눠서 처리해야 한다.

## 결정된 로그인 방식

```text
Google
Kakao
Naver
Email
```

자체 아이디/비밀번호 회원가입은 1차 MVP에서 제외한다.

## 추천 진행 순서

1. Supabase 프로젝트 생성
2. Supabase URL / anon key 확보
3. Supabase schema 적용 여부 결정
4. Auth provider 설정
   - Google
   - Kakao
   - Naver
   - Email
5. 로컬 `.env.local` 연결
6. 실제 Supabase 연동 smoke test
7. Vercel 프로젝트 생성
8. Vercel 환경변수 등록
9. 배포 smoke test
10. Notion 포트폴리오에 서비스 연결 작업일지 기록

## 민감 결정 지점

아래 단계는 진행 전에 효쿠님 확인을 받는다.

- Supabase 실제 프로젝트에 migration 적용
- OAuth client secret 등록
- Vercel 배포 공개 URL 생성
- service role key 사용
- 실제 사용자 데이터 삭제/초기화

## AI 에이전트 역할

Hermes Chief Agent는 연결 순서와 위험 지점을 관리한다. Coding Agent 관점에서는 환경변수와 연동 테스트를 처리하고, Trust Agent 관점에서는 secret 노출과 권한 범위를 확인한다.

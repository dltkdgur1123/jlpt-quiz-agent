# MVP 통합 QA 체크리스트

## 핵심 루프

- [x] 퀴즈 조회 가능
- [x] 답안 제출 가능
- [x] 정답 확인 가능
- [x] 로그인 feedback 제출 가능
- [x] 중복 feedback update 동작
- [x] perceived_exam_score 계산 가능
- [x] 비로그인 feedback 차단
- [x] 금지 표현 없음

## 현재 검증 방식

- unit/smoke test 전체 실행
- Next.js build 확인
- 금지 표현 문자열 검사
- 모바일 우선 UI 구조 확인

## 다음 실제 연결 전 확인

- 실제 Supabase 프로젝트 연결
- 실제 로그인 provider 선택
- 실제 브라우저 e2e 테스트

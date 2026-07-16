# NS-TICKET-001: Next.js + Supabase 프로젝트 초기화

## 범위

실제 JLPT Quiz Data Platform 웹앱을 만들기 위한 최소 프로젝트 골격을 준비한다.

## 포함

- Next.js App Router scaffold
- TypeScript
- ESLint
- Supabase browser client 준비
- `.env.example`
- 기본 smoke test
- MVP 도메인 상수 파일

## 제외

- Supabase SQL migration 생성
- 실제 DB table 생성
- API route 구현
- 퀴즈 UI 구현
- 로그인 구현
- Telegram Bot 구현

## 고정 원칙

- 공식 score 필드명: `perceived_exam_score`
- 사용자 표시명: “출제 체감 score”
- feedback 값: `yes / no / unknown`
- `unknown`은 `no`로 합치지 않는다.
- score는 공식 JLPT 출제 기록이 아니라 사용자 출제 경험 제보 기반 신호다.

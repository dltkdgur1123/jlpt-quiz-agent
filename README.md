# JLPT Quiz Agent

AI 에이전트 협업 방식으로 구축한 **JLPT Quiz Data Platform MVP**입니다. Next.js App Router와 Supabase를 사용해 JLPT 어휘/문법 퀴즈, 풀이 기록, 사용자 출제 경험 feedback, `perceived_exam_score` 기반 랭킹 흐름을 검증합니다.

> 이 프로젝트는 공식 JLPT 출제 기록을 제공하지 않습니다. `출제 체감 score`는 사용자 제보 기반 신호이며 학습 우선순위 판단을 돕기 위한 값입니다.

## Portfolio Focus

- **Hermes Chief Agent**: 제품 범위, 티켓 순서, QA 기준 조율
- **Design Agent 관점**: 모바일 우선 퀴즈 UX, 로그인/feedback 흐름 설계
- **Coding Agent 관점**: Next.js API routes, Supabase repository, import pipeline 구현
- **QA Agent 관점**: lint/typecheck/test/build 및 실제 Supabase smoke test
- **Trust Agent 관점**: 공식 출제/확정 표현 금지, 민감정보 비공개, score 의미 제한

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Supabase Auth / Postgres
- Node.js built-in test runner

## MVP Features

- `GET /api/quiz/next` — vocab/grammar 문제 조회, 정답/해설 사전 미노출
- `POST /api/quiz/attempts` — 풀이 기록 저장
- `POST /api/items/{item_type}/{item_id}/exam-seen-feedback` — 로그인 사용자 출제 경험 제보
- `GET /api/items/{item_type}/{item_id}/score` — 문항별 출제 체감 score 조회
- `GET /api/items/ranking` — 출제 체감 score 랭킹 조회
- Email magic link / Google / Kakao / Naver auth UI 준비
- Supabase sample data import script

## Project Structure

```text
src/app/                 Next.js routes and API handlers
src/components/          Quiz, score, auth UI components
src/lib/                 Domain logic, Supabase repositories, auth policy
supabase/migrations/     MVP database schema
supabase/policies/       RLS/auth policy draft
data/import/             Small sample import data
scripts/                 Import utility scripts
docs/architecture/       Ticket-level architecture notes
docs/qa/                 QA checklists and smoke test notes
tests/                   Node test runner test suite
```

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Required environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Optional for CLI-assisted Supabase operations only:

```text
SUPABASE_ACCESS_TOKEN=
```

Do not commit `.env.local`, Supabase access tokens, provider secrets, Notion tokens, or OAuth client secrets.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Current local verification before GitHub handoff:

```text
lint      passed
typecheck passed
test      48 passed
build     passed
```

## Auth Notes

Selected MVP providers:

- Email magic link
- Google
- Kakao
- Naver via custom OAuth/OIDC provider setup

The callback page supports both OAuth code callbacks and email magic link hash callbacks.

## Data / Trust Principles

- Canonical field: `perceived_exam_score`
- User-facing label: `출제 체감 score`
- Feedback values: `yes / no / unknown`
- `unknown` is preserved and never merged into `no`
- The app must not claim official JLPT prediction, official exam history, or guaranteed appearance.

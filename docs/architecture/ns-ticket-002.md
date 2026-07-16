# NS-TICKET-002: Supabase DB schema 초안

## 목적

JLPT Quiz Data Platform MVP의 공식 6개 테이블을 Supabase/Postgres 기준으로 정의한다.

## 생성 파일

```text
supabase/migrations/0001_initial_mvp_schema.sql
src/lib/db/types.ts
tests/schema.test.mjs
docs/architecture/ns-ticket-002.md
```

## 공식 테이블

- `users`
- `vocab_items`
- `grammar_items`
- `quiz_attempts`
- `exam_seen_feedback`
- `item_score_stats`

## 핵심 정책

- `quiz_attempts`와 `exam_seen_feedback`은 분리한다.
- `exam_seen_feedback`은 `user_id + item_type + item_id` unique 제약으로 중복 row 누적을 막는다.
- feedback 값은 `yes / no / unknown`만 허용한다.
- `unknown`은 `no`로 합치지 않는다.
- `perceived_exam_score`는 사용자 출제 경험 제보 기반의 출제 체감 score다.
- 공식 JLPT 출제 기록, 회차, 연도, 월, `taken_level`, `confidence`는 MVP DB에 저장하지 않는다.

## 범위 제외

- RLS 정책 상세 구현
- Supabase Auth 사용자 sync 구현
- score 계산 함수 구현
- seed/import script 구현
- API route 구현

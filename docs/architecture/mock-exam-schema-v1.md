# Mock Exam Schema v1

## 목적

기존 `vocab_items`, `grammar_items`, `quiz_attempts`는 단일 문항 풀이에 적합하다. 모의고사 플랫폼에는 “세트”, “응시”, “답안”, “결과” 개념이 추가로 필요하다.

## 기존 테이블 유지

```text
vocab_items
- 어휘/문자 문항 pool
- vocab_reading, vocab_context_blank 포함 가능

grammar_items
- 문법 문항 pool
- grammar_sentence_blank 포함

item_score_stats
- 개별 문항의 출제 체감 score 유지
```

## 신규 테이블 초안

### mock_exam_sets

모의고사 세트 메타데이터.

```text
id uuid pk
jlpt_level text
set_code text unique
set_title text
mode text -- lite | full
status text -- draft | published | archived
time_limit_minutes int
listening_included boolean default false
question_count int
created_at timestamptz
published_at timestamptz null
```

### mock_exam_sections

세트 안의 영역 구성.

```text
id uuid pk
mock_exam_set_id uuid fk
section_key text -- vocab | grammar | reading | listening
section_title text -- 문자·어휘 | 문법 | 독해 | 청해
sort_order int
question_count int
time_limit_minutes int null
```

### mock_exam_questions

세트에 들어간 문항 순서.

```text
id uuid pk
mock_exam_set_id uuid fk
section_id uuid fk
item_type text -- vocab | grammar | reading
item_id uuid
sort_order int
points int default 1
```

주의:

```text
item_type + item_id로 vocab_items/grammar_items를 참조한다.
reading은 후속 schema가 생긴 뒤 연결한다.
listening은 현재 금지한다.
```

### mock_exam_attempts

사용자 응시 단위.

```text
id uuid pk
mock_exam_set_id uuid fk
user_id uuid null
status text -- in_progress | submitted | abandoned
started_at timestamptz
submitted_at timestamptz null
elapsed_seconds int null
score_total int null
score_max int null
correct_count int null
question_count int
```

### mock_exam_answers

응시 중/제출 후 각 문항 답안.

```text
id uuid pk
mock_exam_attempt_id uuid fk
mock_exam_question_id uuid fk
selected_choice text null -- A/B/C/D
is_correct boolean null
answered_at timestamptz null
```

### mock_exam_section_results

영역별 결과 집계.

```text
id uuid pk
mock_exam_attempt_id uuid fk
section_key text
score int
score_max int
correct_count int
question_count int
correct_rate numeric
weakness_label text null
```

## RLS / Auth 원칙

- 비로그인 사용자는 trial 모의고사 응시 가능.
- score-impacting feedback은 로그인 사용자만 가능.
- 로그인 사용자는 본인 attempt/result만 읽는다.
- published set은 공개 read 가능.
- draft set은 관리자/서비스 권한에서만 read.

## API 초안

```text
GET  /api/mock-exams?level=N5
POST /api/mock-exams/:set_id/attempts
GET  /api/mock-exam-attempts/:attempt_id
POST /api/mock-exam-attempts/:attempt_id/answers
POST /api/mock-exam-attempts/:attempt_id/submit
GET  /api/mock-exam-attempts/:attempt_id/result
```

## Scoring 정책

초기 Lite는 단순 채점으로 시작한다.

```text
문항당 1점
총점 = 정답 수
영역별 정답률 표시
공식 JLPT 점수 환산 없음
합격/불합격 판정 없음
```

`perceived_exam_score`는 개별 문항/세트 개선 지표로 사용한다.

```text
문항별 yes/no/unknown feedback
→ item_score_stats 갱신
→ high perceived score 문항은 세트 구성 후보로 우선 고려
→ low confidence 문항은 더 많은 노출 또는 검수 대상으로 분류
```

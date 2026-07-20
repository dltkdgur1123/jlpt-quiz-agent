# Mock Exam Platform Pivot v1

## 제품 방향

JLPT Quiz는 단일 랜덤 퀴즈 사이트가 아니라 **JLPT 시험 준비자를 위한 모의고사 플랫폼**으로 확장한다.

핵심 경험은 다음이다.

```text
레벨 선택
→ 모의고사 세트 시작
→ 문자·어휘 / 문법 / 독해 순서로 응시
→ 전체 제출
→ 영역별 결과와 오답 확인
→ 출제 체감 score 피드백
→ 약점 기반 복습/다음 세트 추천
```

## 기존 자산의 역할

기존 `vocab_items`, `grammar_items`, preview batch, 품질 게이트는 폐기하지 않는다. 역할을 바꾼다.

```text
기존 문항 생성/검수 파이프라인 = 모의고사 문항 공장
기존 단일 quiz API = 빠른 연습/문항 샘플링 보조 기능
신규 mock exam flow = 사용자 핵심 제품 경험
```

## MVP 포지션

초기 제품명/문구는 아래처럼 잡는다.

```text
JLPT Mock Exam Platform
JLPT 모의고사 Lite
공식 문제를 복제하지 않은 JLPT형 자체 제작 모의고사
사용자 풀이/피드백 기반 출제 체감 score
```

금지 문구:

```text
공식 기출
실제 출제 확정
출제 예상 보장
기출 변형
합격 보장
```

## 청해 범위

청해는 지금 만들지 않는다.

이유:

```text
audio player
script timing
모바일 재생 UX
청해 전용 schema
저작권/음성 source 정책
```

이 필요하므로 별도 후속 phase로 분리한다.

## 1차 MVP: N5 Mock Exam Lite

| 영역 | 문항 수 | source | 상태 |
|---|---:|---|---|
| 문자·어휘 | 15 | `vocab_items` | 우선 구현 |
| 문법 | 15 | `grammar_items` | 우선 구현 |
| 독해 | 5 | 신규 `reading_passages` 필요 | 후속 |
| 청해 | 0 | 제외 | 후속 |

처음부터 공식 JLPT와 동일한 문항 수/시간을 복제하려 하지 않는다. 사용자가 모바일에서 끝까지 완료할 수 있는 **짧은 모의고사 Lite**를 먼저 운영한다.

## 운영 루프

```text
Shorts 최종 검수 source
→ sample09 비청해 형식 참고
→ Hermes 문항 생성
→ 품질 게이트
→ 효쿠님 검수
→ active 문항 pool
→ mock exam set 구성
→ 응시/채점
→ 영역별 약점과 출제 체감 score
→ 다음 batch 생성 기준 반영
```

## Agent 역할

| 역할 | 책임 |
|---|---|
| Product Planner | 모의고사 Lite 범위와 phase 결정 |
| Quiz UX Designer | 응시 흐름, 타이머, 결과/오답 UX |
| Data Model Architect | exam set / attempt / answer schema 설계 |
| Scoring Analyst | 영역별 점수, confidence, perceived score 해석 |
| Backend Builder | set 생성, 시작, 제출, 결과 API |
| Trust Reviewer | 공식성 오해 방지, sample09 형식 참고만 유지 |
| QA Tester | 시험 시작~제출~결과 E2E 검증 |
| Content Loop Strategist | 약점/체감 score 기반 다음 문항 batch 기획 |

## 다음 구현 티켓

```text
NS-TICKET-019A mock exam docs/schema/UX lock
NS-TICKET-020 mock_exam_sets schema
NS-TICKET-021 mock exam set builder
NS-TICKET-022 mock exam taking UI
NS-TICKET-023 submit/result/weakness report
NS-TICKET-024 approved batch import into mock exam pool
```

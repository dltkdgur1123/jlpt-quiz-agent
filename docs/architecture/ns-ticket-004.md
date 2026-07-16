# NS-TICKET-004: CSV/JSON import 연결

## 역할

기존 샘플 데이터 검증 흐름을 실제 `vocab_items`, `grammar_items` 저장 흐름에 연결하기 위한 준비 단계다.

## 왜 이렇게 구축했는가

퀴즈 데이터는 score가 아니라 원천 콘텐츠다. 따라서 import 단계에서는 단어/문법 문제와 선택지만 검증하고, `perceived_exam_score` 같은 score 값은 가져오지 않는다.

## AI 에이전트 역할

Coding Agent 관점에서는 import row를 Supabase insert row로 바꾸는 최소 함수를 만들었다. QA Agent 관점에서는 누락 필드, 중복 선택지, 잘못된 정답 선택지를 테스트로 고정했다.

## 결과

vocab/grammar import row를 검증하고 DB insert 형태로 변환하는 기반이 생겼다. 실제 Supabase insert 실행은 다음 단계의 admin/import script에서 확장한다.

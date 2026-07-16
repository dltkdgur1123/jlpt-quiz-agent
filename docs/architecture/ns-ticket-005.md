# NS-TICKET-005: 퀴즈 조회 API

## 역할

사용자가 선택한 JLPT 레벨과 문제 유형에 맞춰 다음 퀴즈를 가져오는 API 기반을 만든 단계다.

## 왜 이렇게 구축했는가

퀴즈 조회는 사용자가 처음 만나는 핵심 경험이다. 하지만 정답과 해설은 답안 제출 전에는 노출되면 안 되므로, API는 문제와 선택지만 반환하도록 분리했다.

## AI 에이전트 역할

Hermes Chief Agent가 Coding Agent와 QA Agent 관점으로 진행했다. 먼저 정답 미노출 테스트를 만들고, 그 기준에 맞춰 service와 API route를 구현했다.

## 결과

`GET /api/quiz/next` 기반이 생겼고, vocab/grammar 조회와 잘못된 입력 처리 기준이 테스트로 고정되었다.

# NS-TICKET-009: score 조회/랭킹 API

## 역할

계산된 출제 체감 score를 item별로 조회하고 기본 목록으로 볼 수 있게 하는 단계다.

## 왜 이렇게 구축했는가

score는 사용자에게 가치가 있지만, 낮은 표본은 오해를 줄 수 있다. 그래서 조회 결과에 데이터 충분 여부를 함께 포함했다.

## AI 에이전트 역할

Hermes Chief Agent가 Scoring/Trust 관점으로 데이터 부족 표시와 안전한 표현 기준을 먼저 테스트에 반영하고, Coding Agent 관점으로 조회 API를 구현했다.

## 결과

item별 score 조회와 기본 ranking 조회 기반이 생겼다.

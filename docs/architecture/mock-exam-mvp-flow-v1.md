# Mock Exam MVP Flow v1

## 목적

단일 퀴즈 풀이가 아니라 “시험을 본다”는 사용자 경험을 만든다. 첫 MVP는 청해 없이 `N5 Mock Exam Lite`로 시작한다.

## 사용자 플로우

```text
1. 랜딩: JLPT 모의고사 Lite 소개
2. 레벨 선택: N5 우선, N4/N3는 disabled 또는 준비중
3. 세트 선택: 오늘의 N5 Lite / 최신 세트 / 약점 복습 세트
4. 안내 화면: 영역, 문항 수, 예상 시간, 청해 제외 안내
5. 시험 시작: mock_exam_attempt 생성
6. 응시 화면: 영역별 문제 진행, 답안 저장
7. 제출 확인: 미응답 문항 표시
8. 채점 결과: 총점, 영역별 정답률, 오답 목록
9. 오답 해설: 답안 제출 후 한국어 해설 노출
10. 피드백: “실제 시험에서 본 것 같나요?” yes/no/unknown
11. 추천: 약점 영역 기반 다음 세트 또는 복습 문항
```

## 시험 화면 원칙

- 문제와 보기에는 한국어를 노출하지 않는다.
- 정답/해설은 제출 후에만 노출한다.
- 전체 제출 전까지 정답 여부를 보여주지 않는다.
- 영역 이동은 허용하되, 제출 전 미응답 수를 보여준다.
- 청해는 `준비중`으로 표시하거나 아예 메뉴에서 숨긴다.

## N5 Mock Exam Lite v1 구성

```text
문자·어휘: 15문항
- vocab_reading
- vocab_context_blank

문법: 15문항
- grammar_sentence_blank

독해: 0~5문항, schema 준비 후 별도 적용
청해: 제외
```

## 결과 화면

필수 표시:

```text
총 문항 수
정답 수
정답률
영역별 정답률
오답 목록
문항별 해설
출제 체감 score 피드백 CTA
```

표현 주의:

```text
공식 점수 ❌
합격 예측 ❌
실제 출제 확정 ❌
모의고사 Lite 결과 ✅
학습 참고용 결과 ✅
사용자 체감 데이터 기반 ✅
```

## 관리자/검수 플로우

```text
1. source snapshot sync
2. preview batch 생성
3. review page에서 효쿠님 검수
4. approved만 active pool로 import
5. mock exam set builder가 문항 pool에서 세트 구성
6. 세트 preview
7. publish
```

## Human Gate

아래는 자동 진행하지 않는다.

```text
신규 generated batch를 active import
mock exam set publish
청해 기능 추가
공식 JLPT 문구와 혼동될 수 있는 랜딩 문구 변경
```

효쿠님 승인 문구:

```text
batch-003 승인
N5 mock set 001 publish 승인
```

# Mock Exam MVP Flow v1

## 목적

단일 퀴즈 풀이가 아니라 “시험을 본다”는 사용자 경험을 만든다. 운영 MVP는 청해 없이 `Realistic Mock Exam` 세트로 시작한다.

## 사용자 플로우

```text
1. 랜딩: JLPT 실전형 모의고사 소개
2. 레벨 선택: N5/N4/N3/N2/N1 realistic 세트 선택
3. 세트 선택: 레벨별 최신 realistic 세트 / 약점 복습 세트
4. 안내 화면: 영역, 문항 수, 제한 시간, 청해 제외 안내
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
- 청해는 준비 전까지 세트에서 제외한다.

## Realistic Mock Exam v1 구성

```text
문자·어휘: 20문항
- vocab_reading
- vocab_orthography
- vocab_context_blank
- vocab_paraphrase

문법: 20문항
- grammar_sentence_blank
- grammar_sentence_build
- grammar_text_blank

독해: 10문항
- reading_short
- reading_medium
- reading_info

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
실전형 모의고사 결과 ✅
학습 참고용 결과 ✅
사용자 체감 데이터 기반 ✅
```

## 관리자/검수 플로우

```text
1. source snapshot sync
2. generated realistic set 생성
3. review_status=draft 기준 검수
4. approved만 active pool 또는 published set으로 전환
5. 세트 preview
6. publish
```

## Human Gate

아래는 자동 진행하지 않는다.

```text
신규 generated batch를 active import
mock exam set publish
청해 기능 추가
공식 JLPT 문구와 혼동될 수 있는 랜딩 문구 변경
```

효쿠님 승인 문구 예시:

```text
realistic set publish 승인
```

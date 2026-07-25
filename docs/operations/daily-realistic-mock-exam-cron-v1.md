# Daily Realistic Mock Exam Draft Cron v1

## 목적

JLPT Quiz 모의고사 데이터를 한 번에 대량 생성하지 않고, 매일 1세트씩 안정적으로 축적한다.

## 운영 원칙

- 매일 정확히 1개 realistic non-listening mock exam draft만 생성한다.
- 레벨 순환은 `N5 → N4 → N3 → N2 → N1`이다.
- 생성물은 `data/generated/<level>-realistic-mock-exam-<nnn>.json`에 저장한다.
- cron은 push/deploy/public 노출을 하지 않는다.
- draft 생성 후 품질 게이트만 실행하고, 결과를 총괄비서 방에 보고한다.
- 공식 JLPT 샘플은 구조 참고만 가능하며, 지문/문항/보기의 변형·패러프레이즈·파생 생성은 금지한다.

## 생성 대상 계산

```bash
npm run select:next-realistic-mock-exam
```

예상 출력:

```json
{
  "rotation": ["N5", "N4", "N3", "N2", "N1"],
  "existing_counts": { "N5": 3, "N4": 1, "N3": 1, "N2": 1, "N1": 1 },
  "next_level": "N4",
  "next_set_no": 2,
  "set_code": "n4-realistic-mock-exam-002",
  "output_path": "data/generated/n4-realistic-mock-exam-002.json"
}
```

## 생성 요구사항

- 총 50문항
- 문자·어휘 20문항
- 문법 20문항
- 독해 10문항
- 청해 제외
- `set.mode = "realistic"`
- `set.status = "draft"`
- 문제/보기는 제출 전 일본어만 노출
- 한국어는 explanation 등 제출 후 영역에만 허용
- 각 섹션은 복수 question_type을 포함

### 독해 길이 기준

```text
N5: question_text 최소 120자
N4: 최소 140자
N3: 최소 190자
N2: 최소 240자
N1: 최소 300자
```

N2/N1 독해는 단순 공지 확인이 아니라 논지, 대조, 조건, 함의 중 하나 이상을 포함해야 한다.

## 품질 검증

```bash
npm run validate:realistic-mock-exam -- data/generated/<set-code>.json
node --test tests/mock-exam-build-set.test.mjs tests/mock-exam-ui.test.mjs
npm run typecheck
```

`validate-realistic-mock-exam-draft.mjs`는 다음을 검사한다.

- 파일명과 `set_code` 일치
- 50문항 구성
- vocab/grammar/reading 문항 수
- 유형 다양성
- 청해 제외
- pre-answer 한국어 금지
- 독해 길이 기준
- 기존 realistic 세트와 `question_text` 완전 중복 금지

## cron 보고 형식

```text
상태: generated | qa_failed | blocked
대상: N4 002
파일: data/generated/n4-realistic-mock-exam-002.json
검증: pass/fail
독해 최소/평균: ...
차단/주의: ...
다음 액션: human review / fix needed
```

## 금지

- 자동 git push 금지
- 자동 deploy 금지
- 공식 JLPT 문제·지문·보기 복제/변형 금지
- 실패한 검증을 무시하고 성공 보고 금지
- 하루 2세트 이상 생성 금지

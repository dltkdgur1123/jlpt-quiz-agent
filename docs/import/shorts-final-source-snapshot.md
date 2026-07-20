# Shorts Final Source Snapshot

JLPT Quiz 문항 생성 source는 원본 CSV가 아니라 **쇼츠 영상 제작 시 번역/검수/필터링을 통과해 실제 영상에 반영된 최종 데이터**여야 한다.

## Source 우선순위

```text
1. 최종 영상 생성 script/metadata JSON
2. 최종 자막 또는 렌더링에 사용된 script 파일
3. upload log와 연결되는 final item metadata
4. 영상 생성 후 `used=true`와 `day`가 기록된 최종 CSV
5. 원본 raw CSV는 대조용으로만 사용
```

## 금지

- 원본 `jlpt_n5_vocab.csv`, `jlpt_n5_grammar.csv`만 보고 quiz 문항을 생성하지 않는다.
- 쇼츠 제작 중 수정된 번역/표현을 무시하지 않는다.
- `used=true`만으로 최종 검수 완료라고 판단하지 않는다. 단, 쇼츠 생성 파이프라인이 최종 검수된 값을 CSV에 저장하고 영상 생성 후 `used=true/day`를 기록한 파일은 `final_used_csv` snapshot source로 사용할 수 있다.

## Snapshot 필수 필드

```text
item_type: vocab | grammar
jlpt_level: N1 | N2 | N3 | N4 | N5
source_item: 최종 영상에 사용된 일본어 항목
source_reading: 최종 영상에 사용된 읽기/표현
source_meaning: 최종 검수된 한국어 의미
source_day: DAY 001 형식
source_stage: final_video | final_script | final_subtitle | final_used_csv
review_status: approved
```

## 목적

이 snapshot만 JLPT Quiz 문항 생성 입력으로 사용한다. 이렇게 해야 포트폴리오에서 다음 설명이 가능하다.

```text
이 문항은 원본 CSV가 아니라, 쇼츠 영상 제작 검수 단계를 통과해 실제 영상에 반영된 최종 source를 기반으로 자체 작성한 JLPT형 연습문항입니다.
```

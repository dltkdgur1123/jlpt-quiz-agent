import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const platformDoc = () =>
  readFileSync(new URL("../docs/architecture/mock-exam-platform-v1.md", import.meta.url), "utf8");
const flowDoc = () =>
  readFileSync(new URL("../docs/architecture/mock-exam-mvp-flow-v1.md", import.meta.url), "utf8");
const schemaDoc = () =>
  readFileSync(new URL("../docs/architecture/mock-exam-schema-v1.md", import.meta.url), "utf8");

test("mock exam platform pivot defines product direction and keeps safe wording", () => {
  const source = platformDoc();
  assert.match(source, /모의고사 플랫폼/);
  assert.match(source, /문항 생성\/검수 파이프라인 = 모의고사 문항 공장/);
  assert.match(source, /출제 체감 score/);
  assert.match(source, /공식 기출/);
  assert.match(source, /청해는 지금 만들지 않는다/);
});

test("mock exam MVP flow starts with non-listening N5 Lite", () => {
  const source = flowDoc();
  assert.match(source, /N5 Mock Exam Lite/);
  assert.match(source, /문자·어휘: 15문항/);
  assert.match(source, /문법: 15문항/);
  assert.match(source, /청해: 제외/);
  assert.match(source, /전체 제출 전까지 정답 여부를 보여주지 않는다/);
});

test("mock exam schema separates sets attempts answers and results", () => {
  const source = schemaDoc();
  for (const table of [
    "mock_exam_sets",
    "mock_exam_sections",
    "mock_exam_questions",
    "mock_exam_attempts",
    "mock_exam_answers",
    "mock_exam_section_results",
  ]) {
    assert.match(source, new RegExp(table));
  }
  assert.match(source, /공식 JLPT 점수 환산 없음/);
  assert.match(source, /합격\/불합격 판정 없음/);
  assert.match(source, /perceived_exam_score/);
});

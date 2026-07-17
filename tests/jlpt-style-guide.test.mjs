import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const styleGuide = () =>
  readFileSync(
    new URL("../docs/architecture/ns-ticket-016a-jlpt-style-guide.md", import.meta.url),
    "utf8",
  );
const promptTemplate = () =>
  readFileSync(
    new URL("../docs/import/jlpt-question-generation-prompt-template.md", import.meta.url),
    "utf8",
  );

test("JLPT style guide defines structural patterns without treating samples as reusable content", () => {
  const source = styleGuide();
  for (const phrase of [
    "공식 문제 문장/선택지/지문은 복제하지 않는다",
    "V1. 한자 읽기 선택형",
    "V2. 문맥 빈칸 어휘 선택형",
    "V3. 의미 유사/바꿔 말하기 선택형",
    "G1. 문장 빈칸 문법 선택형",
    "G2. 별표 어순 배열형",
    "G3. 연결 지문 문법 클로즈형",
    "Reading 문항 유형",
  ]) {
    assert.match(source, new RegExp(phrase));
  }
});

test("JLPT question generation template requires safe JSON output and trust guardrails", () => {
  const source = promptTemplate();
  assert.match(source, /반드시 JSON만 출력/);
  assert.match(source, /vocab_context_blank/);
  assert.match(source, /grammar_sentence_blank/);
  assert.match(source, /공식 문제를 복제하지 않고/);
  assert.match(source, /정답은 하나만 가능/);
});

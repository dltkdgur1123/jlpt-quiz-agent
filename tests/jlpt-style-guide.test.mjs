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
  assert.match(source, /공식 문제를 복제하거나 변형하지 않고/);
  assert.match(source, /정답은 하나만 가능/);
});

test("JLPT style guide prioritizes natural Japanese, JLPT-like format, and post-answer Korean explanations", () => {
  const guide = styleGuide();
  const template = promptTemplate();
  assert.match(guide, /일본어 문장이 자연스러운가/);
  assert.match(guide, /JLPT 문항 형식에 가까운가/);
  assert.match(guide, /답안 제출 후에만 노출/);
  assert.match(template, /일본어 문장이 자연스럽고 JLPT 문항 형식에 가까운지/);
  assert.match(template, /앱에서는 답안 제출 후에만 보여준다/);
});

test("question text and choices are Japanese-only before answer submission", () => {
  const guide = styleGuide();
  const template = promptTemplate();
  assert.match(guide, /문제 본문은 일본어로 작성한다/);
  assert.match(guide, /보기 4개는 일본어로 작성한다/);
  assert.match(guide, /한국어로 의미를 묻는 문항은 JLPT형 문항으로 보지 않고 폐기한다/);
  assert.match(template, /`question_text`와 `choice_a~d`는 일본어만 사용한다/);
  assert.match(template, /한국어 문제문은 폐기한다/);
});

test("official JLPT PDFs are format references, not sources for transformed questions", () => {
  const guide = styleGuide();
  const template = promptTemplate();
  assert.match(guide, /형식 참고 자료/);
  assert.match(guide, /변형, 패러프레이즈, 일부 치환/);
  assert.match(guide, /공식 PDF에 나온 문법 문제를 변형하지 않는다/);
  assert.match(template, /공식 문제를 복제하거나 변형하지 않고/);
  assert.match(template, /PDF는 형식 참고에만 사용한다/);
});

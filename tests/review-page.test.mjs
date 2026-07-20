import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const reviewPage = () =>
  readFileSync(
    new URL("../src/app/review/n5-preview/page.tsx", import.meta.url),
    "utf8",
  );
const reviewBatch002Page = () =>
  readFileSync(
    new URL("../src/app/review/n5-preview-batch-002/page.tsx", import.meta.url),
    "utf8",
  );
const reviewBatch003Page = () =>
  readFileSync(
    new URL("../src/app/review/n5-preview-batch-003/page.tsx", import.meta.url),
    "utf8",
  );
const homePage = () => readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");

test("N5 preview review page reads generated questions and shows human review criteria", () => {
  const source = reviewPage();
  assert.match(source, /n5-jlpt-style-preview\.json/);
  assert.match(source, /N5 JLPT형 preview 문항 검수/);
  assert.match(source, /일본어 문장이 자연스러운지/);
  assert.match(source, /JLPT 문항 형식에 가까운지/);
  assert.match(source, /정답·해설 보기/);
  assert.match(source, /검수 포인트/);
});

test("home page does not show draft preview review entry after import", () => {
  const source = homePage();
  assert.equal(source.includes("/review/n5-preview"), false);
  assert.equal(source.includes("문항 검수 페이지 열기"), false);
  assert.equal(source.includes("실제 DB import 전"), false);
});

test("N5 batch 002 review page reads final Shorts source preview", () => {
  const source = reviewBatch002Page();
  assert.match(source, /n5-jlpt-style-preview-batch-002\.json/);
  assert.match(source, /N5 JLPT형 preview batch-002 문항 검수/);
  assert.match(source, /최종 쇼츠 source/);
  assert.match(source, /source_stage/);
  assert.match(source, /문제와 보기에는 한국어가 없는가/);
});

test("N5 batch 003 review page shows sample09 non-listening format review", () => {
  const source = reviewBatch003Page();
  assert.match(source, /n5-jlpt-style-preview-batch-003\.json/);
  assert.match(source, /N5 JLPT형 preview batch-003 문항 검수/);
  assert.match(source, /sample09의 비청해 출제 형식/);
  assert.match(source, /어휘 한자 읽기 선택형/);
  assert.match(source, /청해 요소가 섞이지 않았는가/);
});

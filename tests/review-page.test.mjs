import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const reviewPage = () =>
  readFileSync(
    new URL("../src/app/review/n5-preview/page.tsx", import.meta.url),
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

test("home page links to the N5 preview review route", () => {
  const source = homePage();
  assert.match(source, /\/review\/n5-preview/);
  assert.match(source, /문항 검수 페이지 열기/);
});

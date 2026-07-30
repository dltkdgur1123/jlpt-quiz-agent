import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const layout = () => readFileSync(new URL("../src/app/layout.tsx", import.meta.url), "utf8");
const homePage = () => readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
const sitemap = () => readFileSync(new URL("../src/app/sitemap.ts", import.meta.url), "utf8");
const robots = () => readFileSync(new URL("../src/app/robots.ts", import.meta.url), "utf8");
const levelPage = () => readFileSync(new URL("../src/app/mock-exams/[level]/page.tsx", import.meta.url), "utf8");
const wrongNotePage = () => readFileSync(new URL("../src/app/wrong-note/page.tsx", import.meta.url), "utf8");
const guidePage = () => readFileSync(new URL("../src/app/guide/page.tsx", import.meta.url), "utf8");

test("site metadata targets JLPT D-Day mock exam and wrong-note entry intent", () => {
  const source = layout();

  for (const phrase of [
    "metadataBase",
    "https://jlpt-quiz-agent.vercel.app",
    "JLPT D-Day",
    "JLPT 모의고사",
    "오답노트",
    "N5 N4 N3 N2 N1",
    "openGraph",
    "twitter",
    "alternates",
    "canonical",
  ]) {
    assert.match(source, new RegExp(phrase));
  }

  assert.doesNotMatch(source, /MVP scaffold|합격 보장|출제 예상|공식 문제/);
});

test("sitemap and robots expose stable public SEO entry routes", () => {
  const sitemapSource = sitemap();
  const robotsSource = robots();

  for (const route of [
    "/",
    "/guide",
    "/mock-exams/n5",
    "/mock-exams/n4",
    "/mock-exams/n3",
    "/mock-exams/n2",
    "/mock-exams/n1",
    "/wrong-note",
  ]) {
    assert.match(sitemapSource, new RegExp(route.replace("/", "\\/")));
  }

  assert.match(sitemapSource, /MetadataRoute\.Sitemap/);
  assert.match(sitemapSource, /changeFrequency/);
  assert.match(sitemapSource, /priority/);
  assert.match(robotsSource, /MetadataRoute\.Robots/);
  assert.match(robotsSource, /sitemap/);
  assert.match(robotsSource, /allow: "\/"/);
  assert.match(robotsSource, /disallow: \["\/api\/", "\/auth\/callback", "\/admin"\]/);
  assert.doesNotMatch(sitemapSource, /admin|auth\/callback|api\//);
});

test("public entry pages contain searchable task-focused headings and links", () => {
  const combined = `${homePage()}\n${levelPage()}\n${wrongNotePage()}\n${guidePage()}`;

  for (const phrase of [
    "JLPT D-DAY",
    "레벨별 JLPT 모의고사",
    "N5 모의고사",
    "N4 모의고사",
    "N3 모의고사",
    "N2 모의고사",
    "N1 모의고사",
    "JLPT 오답노트",
    "저장한 문제",
    "JLPT 수험안내",
    "공식 기출문제를 복제하거나 변형하지 않습니다",
  ]) {
    assert.match(combined, new RegExp(phrase));
  }
});

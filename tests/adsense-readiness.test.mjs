import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const sitemap = () => read("src/app/sitemap.ts");
const footer = () => read("src/components/layout/SiteFooter.tsx");
const homePage = () => read("src/app/page.tsx");
const privacyPage = () => read("src/app/privacy/page.tsx");
const termsPage = () => read("src/app/terms/page.tsx");
const contactPage = () => read("src/app/contact/page.tsx");
const aboutPage = () => read("src/app/about/page.tsx");

test("AdSense readiness pages exist with user trust and policy basics", () => {
  const pages = `${privacyPage()}\n${termsPage()}\n${contactPage()}\n${aboutPage()}`;

  for (const phrase of [
    "개인정보처리방침",
    "이용약관",
    "문의",
    "서비스 소개",
    "HYOKU JLPT",
    "jlpt-quiz-agent.vercel.app",
    "Google AdSense",
    "쿠키",
    "학습 서비스",
    "공식 JLPT 주관기관과 무관",
    "공식 기출문제를 복제하거나 변형하지 않습니다",
  ]) {
    assert.match(pages, new RegExp(phrase));
  }

  assert.doesNotMatch(pages, /합격 보장|출제 예상|공식 문제 제공|공식 성적/);
});

test("public footer links policy contact and service pages from the homepage", () => {
  const combined = `${footer()}\n${homePage()}`;

  for (const phrase of [
    "SiteFooter",
    "개인정보처리방침",
    "이용약관",
    "문의",
    "서비스 소개",
    "href: \"/privacy\"",
    "href: \"/terms\"",
    "href: \"/contact\"",
    "href: \"/about\"",
  ]) {
    assert.match(combined, new RegExp(phrase));
  }
});

test("sitemap includes AdSense review support pages", () => {
  const source = sitemap();

  for (const route of ["/privacy", "/terms", "/contact", "/about"]) {
    assert.match(source, new RegExp(route.replace("/", "\\/")));
  }
});

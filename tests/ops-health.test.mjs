import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const packageJson = () => JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const opsScript = () => readFileSync(new URL("../scripts/ops-health-check.mjs", import.meta.url), "utf8");
const opsDoc = () => readFileSync(new URL("../docs/operations/post-deploy-health-check.md", import.meta.url), "utf8");

test("ops health check is exposed as a package script", () => {
  const pkg = packageJson();
  assert.equal(pkg.scripts["ops:health"], "node scripts/ops-health-check.mjs");
});

test("ops health check covers public pages seo files api guards and recent logs", () => {
  const source = opsScript();

  for (const phrase of [
    "https://jlpt-quiz-agent.vercel.app",
    "PUBLIC_PAGE_CHECKS",
    "/mock-exams/n5",
    "/mock-exams/n4",
    "/mock-exams/n3",
    "/mock-exams/n2",
    "/mock-exams/n1",
    "/wrong-note",
    "/sitemap.xml",
    "/robots.txt",
    "/api/quiz/next?item_type=vocab&jlpt_level=N5",
    "/api/items/ranking",
    "vercel logs",
    "--since 10m",
    "TypeError|ReferenceError|Unhandled|error",
    "OPS HEALTH SUMMARY",
  ]) {
    assert.ok(source.includes(phrase), phrase);
  }

  assert.doesNotMatch(source, /SUPABASE_SERVICE_ROLE|service_role|password|secret/i);
});

test("post deploy health check doc gives one command and clear pass criteria", () => {
  const doc = opsDoc();

  for (const phrase of [
    "npm run ops:health",
    "배포 직후 운영 확인",
    "공개 페이지 200",
    "sitemap.xml",
    "robots.txt",
    "API guard",
    "최근 Vercel 로그",
    "에러 0건",
    "실패 시 배포 완료 보고 금지",
  ]) {
    assert.match(doc, new RegExp(phrase));
  }
});

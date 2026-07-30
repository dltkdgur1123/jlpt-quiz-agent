#!/usr/bin/env node
import { execFileSync } from "node:child_process";

const DEFAULT_BASE_URL = "https://jlpt-quiz-agent.vercel.app";
const baseUrl = (process.env.JLPT_OPS_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, "");
const skipLogs = process.argv.includes("--skip-logs");
const timeoutMs = Number(process.env.JLPT_OPS_TIMEOUT_MS ?? 20_000);

const PUBLIC_PAGE_CHECKS = [
  { path: "/", expect: ["JLPT D-Day", "레벨별 JLPT 모의고사", "JLPT 오답노트"] },
  { path: "/guide", expect: ["JLPT 수험안내", "공식 안내 원문 보기"] },
  { path: "/mock-exams/n5", expect: ["N5 모의고사", "시험 시작", "공식 기출문제를 복제하거나 변형하지 않습니다"] },
  { path: "/mock-exams/n4", expect: ["N4 모의고사", "시험 시작"] },
  { path: "/mock-exams/n3", expect: ["N3 모의고사", "시험 시작"] },
  { path: "/mock-exams/n2", expect: ["N2 모의고사", "시험 시작"] },
  { path: "/mock-exams/n1", expect: ["N1 모의고사", "시험 시작"] },
  { path: "/wrong-note", expect: ["JLPT 오답노트", "wrong-note-shell"] },
  { path: "/about", expect: ["서비스 소개", "HYOKU JLPT", "공식 JLPT 주관기관과 무관"] },
  { path: "/privacy", expect: ["개인정보처리방침", "Google AdSense", "쿠키"] },
  { path: "/terms", expect: ["이용약관", "학습 참고용", "Google AdSense"] },
  { path: "/contact", expect: ["문의", "GitHub Issues", "개인정보처리방침"] },
];

const SEO_FILE_CHECKS = [
  { path: "/sitemap.xml", expect: ["/mock-exams/n5", "/mock-exams/n1", "/wrong-note"] },
  { path: "/robots.txt", expect: ["Sitemap: https://jlpt-quiz-agent.vercel.app/sitemap.xml", "Disallow: /api/"] },
];

const API_GUARD_CHECKS = [
  { path: "/api/quiz/next?item_type=vocab&jlpt_level=N5", expectAnyStatus: [200, 500], expectAnyText: ["item", "Supabase", "NEXT_PUBLIC_SUPABASE"] },
  { path: "/api/items/ranking", expectAnyStatus: [200, 500], expectAnyText: ["items", "Supabase", "NEXT_PUBLIC_SUPABASE"] },
  { path: "/api/mock-exams/attempts", method: "POST", body: "{}", expectAnyStatus: [401, 400], expectAnyText: ["로그인", "authorization", "set_code", "Unauthorized", "invalid mock exam set"] },
];

const RECENT_LOG_COMMAND = "vercel logs <deployment-url> --since 10m";
const ERROR_PATTERN = /TypeError|ReferenceError|Unhandled|error/i;

function toUrl(path) {
  return `${baseUrl}${path}`;
}

async function fetchText(check) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(toUrl(check.path), {
      method: check.method ?? "GET",
      body: check.body,
      headers: check.body ? { "content-type": "application/json", "user-agent": "jlpt-ops-health" } : { "user-agent": "jlpt-ops-health" },
      signal: controller.signal,
    });
    const text = await response.text();
    return { response, text };
  } finally {
    clearTimeout(timeout);
  }
}

function assertIncludes(text, phrase, path) {
  if (!text.includes(phrase)) throw new Error(`${path} missing expected phrase: ${phrase}`);
}

function assertAnyStatus(status, expected, path) {
  if (!expected.includes(status)) throw new Error(`${path} returned ${status}, expected one of ${expected.join(", ")}`);
}

function assertAnyText(text, expected, path) {
  if (!expected.some((phrase) => text.includes(phrase))) {
    throw new Error(`${path} missing one of expected phrases: ${expected.join(" | ")}`);
  }
}

async function runHttpChecks() {
  const rows = [];
  for (const check of [...PUBLIC_PAGE_CHECKS, ...SEO_FILE_CHECKS]) {
    const { response, text } = await fetchText(check);
    if (!response.ok) throw new Error(`${check.path} returned ${response.status}`);
    for (const phrase of check.expect) assertIncludes(text, phrase, check.path);
    rows.push({ group: "public", path: check.path, status: response.status });
  }

  for (const check of API_GUARD_CHECKS) {
    const { response, text } = await fetchText(check);
    assertAnyStatus(response.status, check.expectAnyStatus, check.path);
    assertAnyText(text, check.expectAnyText, check.path);
    rows.push({ group: "api", path: check.path, status: response.status });
  }
  return rows;
}

function runRecentLogCheck() {
  if (skipLogs) return { skipped: true, lines: [] };
  const output = execFileSync("npx", ["vercel", "logs", baseUrl, "--since", "10m"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 180_000,
  });
  const lines = output.split(/\r?\n/).filter(Boolean);
  const badLines = lines.filter((line) => ERROR_PATTERN.test(line));
  if (badLines.length) {
    throw new Error(`recent Vercel logs contain errors:\n${badLines.slice(0, 20).join("\n")}`);
  }
  return { skipped: false, lines };
}

try {
  const rows = await runHttpChecks();
  const logResult = runRecentLogCheck();
  console.log("OPS HEALTH SUMMARY");
  console.log(`baseUrl=${baseUrl}`);
  console.log(`logCommand=${RECENT_LOG_COMMAND}`);
  for (const row of rows) console.log(`PASS ${row.group} ${row.status} ${row.path}`);
  console.log(logResult.skipped ? "SKIP logs --skip-logs" : `PASS logs checked lines=${logResult.lines.length}`);
  console.log("PASS ops health check complete");
} catch (error) {
  console.error("OPS HEALTH SUMMARY");
  console.error(`baseUrl=${baseUrl}`);
  console.error(`FAIL ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const script = new URL("../scripts/generate-content-quality-report.mjs", import.meta.url);
const repoRoot = new URL("..", import.meta.url).pathname;

function runReport(args = []) {
  const result = spawnSync(process.execPath, [script.pathname, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    output: `${result.stdout}\n${result.stderr}`,
  };
}

test("content quality report generates markdown and JSON artifacts", () => {
  const dir = mkdtempSync(join(tmpdir(), "jlpt-content-quality-report-"));
  const markdownPath = join(dir, "report.md");
  const jsonPath = join(dir, "report.json");

  const result = runReport(["--markdown", markdownPath, "--json", jsonPath]);

  assert.equal(result.status, 0, result.output);
  assert.match(result.stdout, /"files_checked"/);

  const markdown = readFileSync(markdownPath, "utf8");
  const report = JSON.parse(readFileSync(jsonPath, "utf8"));

  assert.match(markdown, /# JLPT Content Quality Report/);
  assert.match(markdown, /## Level Coverage/);
  assert.match(markdown, /n5-realistic-mock-exam-001/);
  assert.equal(report.summary.files_checked >= 1, true);
  assert.equal(report.summary.error_count, 0);
});

test("content quality report check mode detects stale artifacts", () => {
  const dir = mkdtempSync(join(tmpdir(), "jlpt-content-quality-report-stale-"));
  const markdownPath = join(dir, "report.md");
  const jsonPath = join(dir, "report.json");
  writeFileSync(markdownPath, "stale\n");
  writeFileSync(jsonPath, "{}\n");

  const result = runReport(["--check", "--markdown", markdownPath, "--json", jsonPath]);

  assert.notEqual(result.status, 0);
  assert.match(result.output, /stale/i);
});

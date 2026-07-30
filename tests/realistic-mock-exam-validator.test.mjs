import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const validator = new URL("../scripts/validate-realistic-mock-exam-draft.mjs", import.meta.url);
const fixture = new URL("../data/generated/n4-realistic-mock-exam-002.json", import.meta.url);

function writeMutatedArtifact(mutator) {
  const artifact = JSON.parse(readFileSync(fixture, "utf8"));
  mutator(artifact);
  const dir = mkdtempSync(join(tmpdir(), "jlpt-validator-"));
  const path = join(dir, `${artifact.set.set_code}.json`);
  writeFileSync(path, JSON.stringify(artifact, null, 2));
  return path;
}

function runValidator(path) {
  const result = spawnSync(process.execPath, [validator.pathname, path], {
    cwd: new URL("..", import.meta.url).pathname,
    encoding: "utf8",
  });
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    output: `${result.stdout}\n${result.stderr}`,
  };
}

test("realistic mock exam validator can validate every generated realistic set as one deploy gate", () => {
  const result = spawnSync(process.execPath, [validator.pathname, "--all"], {
    cwd: new URL("..", import.meta.url).pathname,
    encoding: "utf8",
  });

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /checked_files/);
  assert.match(result.stdout, /n5-realistic-mock-exam-003\.json/);
});

test("realistic mock exam validator blocks duplicate choices before publication", () => {
  const path = writeMutatedArtifact((artifact) => {
    artifact.questions[0].choice_b = artifact.questions[0].choice_a;
  });

  const result = runValidator(path);

  assert.notEqual(result.status, 0);
  assert.match(result.output, /duplicate choices/i);
});

test("realistic mock exam validator blocks sentence-build questions without a star target", () => {
  const path = writeMutatedArtifact((artifact) => {
    const question = artifact.questions.find((candidate) => candidate.question_type === "grammar_sentence_build");
    question.question_text = question.question_text.replace("★", "＿");
    for (const field of ["choice_a", "choice_b", "choice_c", "choice_d"]) {
      question[field] = question[field].replace("★", "＿");
    }
  });

  const result = runValidator(path);

  assert.notEqual(result.status, 0);
  assert.match(result.output, /star target/i);
});

test("realistic mock exam validator blocks officiality and guarantee wording", () => {
  const path = writeMutatedArtifact((artifact) => {
    artifact.questions[0].explanation = "公式問題と同じなので合格保証です。";
  });

  const result = runValidator(path);

  assert.notEqual(result.status, 0);
  assert.match(result.output, /unsafe trust wording/i);
});

test("realistic mock exam validator blocks severely skewed correct-choice distribution", () => {
  const path = writeMutatedArtifact((artifact) => {
    for (const question of artifact.questions) question.correct_choice = "A";
  });

  const result = runValidator(path);

  assert.notEqual(result.status, 0);
  assert.match(result.output, /correct choice distribution/i);
});

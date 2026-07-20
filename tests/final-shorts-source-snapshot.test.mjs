import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { validateFinalShortsSourceSnapshot } from "../scripts/validate-final-shorts-source-snapshot.mjs";

const validSnapshot = {
  rows: [
    {
      item_type: "vocab",
      jlpt_level: "N5",
      source_item: "会う",
      source_reading: "あう",
      source_meaning: "만나다, 보다",
      source_day: "DAY 004",
      source_stage: "final_used_csv",
      review_status: "approved",
    },
  ],
};

test("final Shorts source snapshot accepts only approved final-stage rows", () => {
  const result = validateFinalShortsSourceSnapshot(validSnapshot);
  assert.equal(result.valid, true);
  assert.equal(result.count, 1);
});

test("raw CSV rows are rejected as quiz generation source", () => {
  const result = validateFinalShortsSourceSnapshot({
    rows: [{ ...validSnapshot.rows[0], source_stage: "raw_csv" }],
  });

  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /invalid source_stage|raw_csv/);
});

test("unapproved or duplicate final source rows are rejected", () => {
  const result = validateFinalShortsSourceSnapshot({
    rows: [
      { ...validSnapshot.rows[0], review_status: "draft" },
      { ...validSnapshot.rows[0], review_status: "draft" },
    ],
  });

  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /review_status must be approved/);
  assert.match(result.errors.join("\n"), /duplicate source row/);
});

test("source snapshot policy documents final video source priority", () => {
  const source = readFileSync(
    new URL("../docs/import/shorts-final-source-snapshot.md", import.meta.url),
    "utf8",
  );
  assert.match(source, /원본 CSV가 아니라/);
  assert.match(source, /실제 영상에 반영된 최종 데이터/);
  assert.match(source, /원본 raw CSV는 대조용/);
  assert.match(source, /final_used_csv/);
});

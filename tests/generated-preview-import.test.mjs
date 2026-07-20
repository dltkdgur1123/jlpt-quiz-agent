import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const script = () => readFileSync(new URL("../scripts/import-generated-preview.mjs", import.meta.url), "utf8");

test("generated preview import script maps draft questions to active Supabase rows", () => {
  const source = script();
  assert.match(source, /n5-jlpt-style-preview\.json/);
  assert.match(source, /vocab_items/);
  assert.match(source, /grammar_items/);
  assert.match(source, /status: "active"/);
  assert.match(source, /source_type: "shorts"/);
  assert.match(source, /source_day: row\.source_day/);
  assert.match(source, /source_item: row\.source_item/);
  assert.match(source, /source_reading: row\.source_reading/);
  assert.match(source, /generation_batch: GENERATION_BATCH/);
  assert.match(source, /review_status: "approved"/);
  assert.match(source, /word: row\.source_item/);
  assert.match(source, /grammar_point: row\.source_item/);
});

test("generated preview import script skips already imported question_text rows", () => {
  const source = script();
  assert.match(source, /select\("question_text"\)/);
  assert.match(source, /existingTexts/);
  assert.match(source, /missingRows/);
});

test("source traceability backfill script updates existing imported preview rows", () => {
  const source = readFileSync(
    new URL("../scripts/backfill-source-traceability.mjs", import.meta.url),
    "utf8",
  );
  assert.match(source, /n5-jlpt-style-preview\.json/);
  assert.match(source, /source_type: "shorts"/);
  assert.match(source, /generation_batch: GENERATION_BATCH/);
  assert.match(source, /review_status: "approved"/);
  assert.match(source, /\.eq\("question_text", row\.question_text\)/);
});

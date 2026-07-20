#!/usr/bin/env node
import { readFileSync } from "node:fs";

const LEVELS = new Set(["N1", "N2", "N3", "N4", "N5"]);
const ITEM_TYPES = new Set(["vocab", "grammar"]);
const SOURCE_STAGES = new Set(["final_video", "final_script", "final_subtitle", "final_used_csv"]);

const REQUIRED_FIELDS = [
  "item_type",
  "jlpt_level",
  "source_item",
  "source_reading",
  "source_meaning",
  "source_day",
  "source_stage",
  "review_status",
];

function rowsFromJson(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value.rows)) return value.rows;
  throw new Error("snapshot must be a JSON array or an object with rows[]");
}

export function validateFinalShortsSourceSnapshot(value) {
  const rows = rowsFromJson(value);
  const errors = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 1;
    for (const field of REQUIRED_FIELDS) {
      if (!String(row[field] ?? "").trim()) {
        errors.push(`row ${rowNumber}: missing ${field}`);
      }
    }

    if (!ITEM_TYPES.has(row.item_type)) errors.push(`row ${rowNumber}: invalid item_type`);
    if (!LEVELS.has(row.jlpt_level)) errors.push(`row ${rowNumber}: invalid jlpt_level`);
    if (!SOURCE_STAGES.has(row.source_stage)) errors.push(`row ${rowNumber}: invalid source_stage`);
    if (row.review_status !== "approved") errors.push(`row ${rowNumber}: review_status must be approved`);
    if (row.source_stage === "raw_csv") errors.push(`row ${rowNumber}: raw_csv is not a final source stage`);
  });

  const keyCounts = new Map();
  for (const row of rows) {
    const key = `${row.item_type}:${row.jlpt_level}:${row.source_day}:${row.source_item}`;
    keyCounts.set(key, (keyCounts.get(key) ?? 0) + 1);
  }

  for (const [key, count] of keyCounts) {
    if (count > 1) errors.push(`duplicate source row: ${key}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    count: rows.length,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , inputPath] = process.argv;
  if (!inputPath) throw new Error("usage: node scripts/validate-final-shorts-source-snapshot.mjs <snapshot.json>");

  const snapshot = JSON.parse(readFileSync(inputPath, "utf8"));
  const result = validateFinalShortsSourceSnapshot(snapshot);
  console.log(JSON.stringify(result, null, 2));
  if (!result.valid) process.exit(1);
}

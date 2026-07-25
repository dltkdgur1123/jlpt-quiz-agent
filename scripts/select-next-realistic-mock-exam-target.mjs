#!/usr/bin/env node
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const rotation = ["N5", "N4", "N3", "N2", "N1"];
const generatedDir = "data/generated";

function parseRealisticSet(fileName) {
  const match = fileName.match(/^(n[1-5])-realistic-mock-exam-(\d{3})\.json$/);
  if (!match) return null;
  return { level: match[1].toUpperCase(), setNo: Number(match[2]), fileName };
}

const sets = existsSync(generatedDir)
  ? readdirSync(generatedDir).map(parseRealisticSet).filter(Boolean)
  : [];

const maxByLevel = Object.fromEntries(rotation.map((level) => [level, 0]));
for (const set of sets) {
  maxByLevel[set.level] = Math.max(maxByLevel[set.level] ?? 0, set.setNo);
}

const minCount = Math.min(...rotation.map((level) => maxByLevel[level]));
const nextLevel = rotation.find((level) => maxByLevel[level] === minCount) ?? "N5";
const nextSetNo = maxByLevel[nextLevel] + 1;
const paddedSetNo = String(nextSetNo).padStart(3, "0");
const setCode = `${nextLevel.toLowerCase()}-realistic-mock-exam-${paddedSetNo}`;

const result = {
  rotation,
  existing_counts: maxByLevel,
  next_level: nextLevel,
  next_set_no: nextSetNo,
  next_set_no_padded: paddedSetNo,
  set_code: setCode,
  output_path: join(generatedDir, `${setCode}.json`),
};

console.log(JSON.stringify(result, null, 2));

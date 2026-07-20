#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import { validateFinalShortsSourceSnapshot } from "./validate-final-shorts-source-snapshot.mjs";

const DEFAULT_HOST = process.env.JLPT_SHORTS_SSH_HOST;
const DEFAULT_PORT = process.env.JLPT_SHORTS_SSH_PORT ?? "22";
const DEFAULT_USER = process.env.JLPT_SHORTS_SSH_USER ?? "root";
const DEFAULT_KEY = process.env.JLPT_SHORTS_SSH_KEY;
const DEFAULT_LEVEL = process.env.JLPT_SHORTS_LEVEL ?? "N5";
const DEFAULT_OUTPUT = "data/source/final-shorts-source-snapshot-n5.json";

const REMOTE_PYTHON = String.raw`
import csv, json
from pathlib import Path

level = "__LEVEL__"
root = Path("/opt/jlpt_word/data")
files = [
    ("vocab", root / f"jlpt_{level.lower()}_vocab.csv"),
    ("grammar", root / f"jlpt_{level.lower()}_grammar.csv"),
]
rows = []
for item_type, path in files:
    with path.open("r", encoding="utf-8-sig", newline="") as file:
        for row in csv.DictReader(file):
            used = (row.get("used") or "").strip().lower()
            day = (row.get("day") or "").strip()
            word = (row.get("word") or "").strip()
            reading = (row.get("hiragana") or "").strip()
            meaning = (row.get("meaning") or "").strip()
            if used != "true" or not day or not word or not reading or not meaning:
                continue
            rows.append({
                "item_type": item_type,
                "jlpt_level": level.upper(),
                "source_item": word,
                "source_reading": reading,
                "source_meaning": meaning,
                "source_day": day,
                "source_stage": "final_used_csv",
                "review_status": "approved",
                "source_score": int(row.get("score") or 0) if str(row.get("score") or "").isdigit() else 0,
                "source_romaji": (row.get("romaji") or "").strip(),
            })
print(json.dumps({
    "snapshot_id": f"{level.lower()}-final-shorts-source-snapshot-001",
    "source_host": "__HOST__",
    "source_root": "/opt/jlpt_word/data",
    "selection_rule": "used=true rows with assigned day from final Shorts CSV after generation/review pipeline",
    "rows": rows,
}, ensure_ascii=False, indent=2))
`;

export function syncFinalShortsSourceSnapshot({
  host = DEFAULT_HOST,
  port = DEFAULT_PORT,
  user = DEFAULT_USER,
  keyPath = DEFAULT_KEY,
  level = DEFAULT_LEVEL,
  outputPath = DEFAULT_OUTPUT,
} = {}) {
  if (!host || !keyPath) {
    throw new Error("Missing JLPT Shorts SSH config: set JLPT_SHORTS_SSH_HOST and JLPT_SHORTS_SSH_KEY");
  }

  const remoteScript = REMOTE_PYTHON.replaceAll("__LEVEL__", level).replaceAll("__HOST__", "configured-remote");
  const stdout = execFileSync(
    "ssh",
    [
      "-i",
      keyPath,
      "-o",
      "BatchMode=yes",
      "-p",
      String(port),
      `${user}@${host}`,
      "python3 -",
    ],
    {
      input: remoteScript,
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024,
    },
  );

  const snapshot = JSON.parse(stdout);
  const result = validateFinalShortsSourceSnapshot(snapshot);
  if (!result.valid) {
    throw new Error(`final source snapshot validation failed: ${result.errors.join("; ")}`);
  }

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);

  return { ok: true, outputPath, count: result.count };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , level = DEFAULT_LEVEL, outputPath = DEFAULT_OUTPUT] = process.argv;
  const result = syncFinalShortsSourceSnapshot({ level, outputPath });
  console.log(JSON.stringify(result, null, 2));
}

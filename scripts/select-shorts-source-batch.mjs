#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const DEFAULT_SOURCE_DIR = process.env.JLPT_SHORTS_DATA_DIR ?? "/opt/jlpt_word/data";
const DEFAULT_OUTPUT = "data/source/n5-shorts-source-batch-002.json";
const LEVEL = "N5";
const BATCH_SIZE_PER_TYPE = 20;

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current);
  return cells.map((cell) => cell.trim());
}

export function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
  });
}

function normalizeUsed(value) {
  return ["true", "1", "yes", "y"].includes(String(value ?? "").trim().toLowerCase());
}

function toSourceRow(itemType, row) {
  return {
    item_type: itemType,
    jlpt_level: LEVEL,
    source_item: row.word,
    source_reading: row.hiragana,
    source_meaning: row.meaning,
    source_day: row.day,
    source_score: Number(row.score || 0),
    source_used: normalizeUsed(row.used),
  };
}

export function selectRows(rows, itemType, limit = BATCH_SIZE_PER_TYPE) {
  return rows
    .filter((row) => row.word && row.meaning && row.day && normalizeUsed(row.used))
    .map((row) => toSourceRow(itemType, row))
    .sort((a, b) => {
      if (b.source_score !== a.source_score) return b.source_score - a.source_score;
      return a.source_day.localeCompare(b.source_day) || a.source_item.localeCompare(b.source_item);
    })
    .slice(0, limit);
}

export function buildSourceBatch(sourceDir = DEFAULT_SOURCE_DIR) {
  const vocabPath = join(sourceDir, "jlpt_n5_vocab.csv");
  const grammarPath = join(sourceDir, "jlpt_n5_grammar.csv");

  if (!existsSync(vocabPath) || !existsSync(grammarPath)) {
    throw new Error(`missing JLPT Shorts source files under ${sourceDir}`);
  }

  const vocabRows = selectRows(parseCsv(readFileSync(vocabPath, "utf8")), "vocab");
  const grammarRows = selectRows(parseCsv(readFileSync(grammarPath, "utf8")), "grammar");

  return {
    batch_id: "n5-shorts-source-batch-002",
    source_dir: sourceDir,
    level: LEVEL,
    selection_rule: "used=true rows sorted by score desc, then day/item",
    rows: [...vocabRows, ...grammarRows],
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , sourceDir = DEFAULT_SOURCE_DIR, outputPath = DEFAULT_OUTPUT] = process.argv;
  const batch = buildSourceBatch(sourceDir);
  mkdirSync(outputPath.split("/").slice(0, -1).join("/"), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(batch, null, 2)}\n`);
  console.log(JSON.stringify({ ok: true, outputPath, rows: batch.rows.length }, null, 2));
}

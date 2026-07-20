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

function createSeededRandom(seedText = "") {
  let seed = 2166136261;
  for (const char of seedText) {
    seed ^= char.charCodeAt(0);
    seed = Math.imul(seed, 16777619);
  }

  return () => {
    seed += 0x6D2B79F5;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleRows(rows, random) {
  const shuffled = [...rows];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function selectRows(rows, itemType, limit = BATCH_SIZE_PER_TYPE, random = Math.random) {
  const eligibleRows = rows
    .filter((row) => row.word && row.meaning && row.day && normalizeUsed(row.used))
    .map((row) => toSourceRow(itemType, row));

  return shuffleRows(eligibleRows, random).slice(0, limit);
}

export function buildSourceBatch(sourceDir = DEFAULT_SOURCE_DIR) {
  const vocabPath = join(sourceDir, "jlpt_n5_vocab.csv");
  const grammarPath = join(sourceDir, "jlpt_n5_grammar.csv");

  if (!existsSync(vocabPath) || !existsSync(grammarPath)) {
    throw new Error(`missing JLPT Shorts source files under ${sourceDir}`);
  }

  const seed = process.env.JLPT_SOURCE_RANDOM_SEED;
  const vocabRandom = seed ? createSeededRandom(`${seed}:vocab`) : Math.random;
  const grammarRandom = seed ? createSeededRandom(`${seed}:grammar`) : Math.random;
  const vocabRows = selectRows(parseCsv(readFileSync(vocabPath, "utf8")), "vocab", BATCH_SIZE_PER_TYPE, vocabRandom);
  const grammarRows = selectRows(parseCsv(readFileSync(grammarPath, "utf8")), "grammar", BATCH_SIZE_PER_TYPE, grammarRandom);

  return {
    batch_id: "n5-shorts-source-batch-002",
    source_dir: sourceDir,
    level: LEVEL,
    selection_rule: "random used=true rows with assigned day from final Shorts source",
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

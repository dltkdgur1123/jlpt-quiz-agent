#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const [, , inputPath = "data/generated/n5-jlpt-style-preview.json"] = process.argv;

function loadEnv() {
  const text = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const [key, ...rest] = line.split("=");
    process.env[key] = rest.join("=");
  }
}

function assertChoice(value) {
  if (!["A", "B", "C", "D"].includes(value)) {
    throw new Error(`invalid correct_choice: ${value}`);
  }
  return value;
}

function assertChoices(row) {
  const choices = [row.choice_a, row.choice_b, row.choice_c, row.choice_d].map((choice) => String(choice ?? "").trim());
  if (choices.some((choice) => !choice)) {
    throw new Error(`missing choice: ${row.source_item}`);
  }
  if (new Set(choices).size !== choices.length) {
    throw new Error(`duplicate choices: ${row.source_item}`);
  }
}

function toInsertRow(row) {
  assertChoices(row);
  const base = {
    jlpt_level: row.jlpt_level,
    meaning: row.source_meaning,
    question_text: row.question_text,
    choice_a: row.choice_a,
    choice_b: row.choice_b,
    choice_c: row.choice_c,
    choice_d: row.choice_d,
    correct_choice: assertChoice(row.correct_choice),
    explanation: row.explanation,
    status: "active",
  };

  if (row.item_type === "vocab") {
    return {
      table: "vocab_items",
      row: {
        ...base,
        word: row.source_item,
        reading: row.source_reading,
      },
    };
  }

  if (row.item_type === "grammar") {
    return {
      table: "grammar_items",
      row: {
        ...base,
        grammar_point: row.source_item,
      },
    };
  }

  throw new Error(`invalid item_type: ${row.item_type}`);
}

async function insertMissing(supabase, table, rows) {
  if (rows.length === 0) return { inserted: 0, skipped: 0 };

  const questionTexts = rows.map((row) => row.question_text);
  const { data: existing, error: existingError } = await supabase
    .from(table)
    .select("question_text")
    .in("question_text", questionTexts);

  if (existingError) throw existingError;

  const existingTexts = new Set((existing ?? []).map((row) => row.question_text));
  const missingRows = rows.filter((row) => !existingTexts.has(row.question_text));

  if (missingRows.length === 0) {
    return { inserted: 0, skipped: rows.length };
  }

  const { data, error } = await supabase.from(table).insert(missingRows).select("id");
  if (error) throw error;

  return { inserted: data.length, skipped: rows.length - missingRows.length };
}

loadEnv();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) throw new Error("Missing Supabase env");

const previewRows = JSON.parse(readFileSync(inputPath, "utf8"));
const grouped = { vocab_items: [], grammar_items: [] };

for (const previewRow of previewRows) {
  const mapped = toInsertRow(previewRow);
  grouped[mapped.table].push(mapped.row);
}

const supabase = createClient(url, key);
const vocab = await insertMissing(supabase, "vocab_items", grouped.vocab_items);
const grammar = await insertMissing(supabase, "grammar_items", grouped.grammar_items);

console.log(JSON.stringify({ ok: true, vocab_items: vocab, grammar_items: grammar }, null, 2));

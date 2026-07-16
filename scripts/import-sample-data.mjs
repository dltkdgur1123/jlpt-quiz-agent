#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
const [,, itemType, inputPath] = process.argv;

if (!itemType || !inputPath || !["vocab", "grammar"].includes(itemType)) {
  console.error("Usage: node scripts/import-sample-data.mjs <vocab|grammar> <csv-path>");
  process.exit(1);
}

function loadEnv() {
  const envPath = new URL("../.env.local", import.meta.url);
  const text = readFileSync(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const [key, ...rest] = line.split("=");
    process.env[key] = rest.join("=");
  }
}

function parseCsv(text) {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(",");
  return lines.filter(Boolean).map((line) => {
    const values = line.split(",");
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function validateRows(rows) {
  const fields = itemType === "vocab"
    ? ["word", "reading", "meaning", "jlpt_level", "question_text", "choice_a", "choice_b", "choice_c", "choice_d", "correct_choice", "explanation", "status"]
    : ["grammar_point", "meaning", "jlpt_level", "question_text", "choice_a", "choice_b", "choice_c", "choice_d", "correct_choice", "explanation", "status"];
  return rows.map((row, index) => {
    const missing = fields.filter((field) => !String(row[field] ?? "").trim());
    if (missing.length) throw new Error(`row ${index + 2}: missing ${missing.join(",")}`);
    const choices = [row.choice_a, row.choice_b, row.choice_c, row.choice_d];
    if (new Set(choices).size !== choices.length) throw new Error(`row ${index + 2}: duplicate choices`);
    if (!["A", "B", "C", "D"].includes(row.correct_choice)) throw new Error(`row ${index + 2}: invalid correct_choice`);
    return Object.fromEntries(fields.map((field) => [field, row[field]]));
  });
}

loadEnv();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) throw new Error("Missing Supabase env");

const rows = validateRows(parseCsv(readFileSync(inputPath, "utf8")));
const table = itemType === "vocab" ? "vocab_items" : "grammar_items";
const supabase = createClient(url, key);

const { data, error } = await supabase.from(table).insert(rows).select("id");
if (error) throw error;
console.log(JSON.stringify({ ok: true, table, inserted: data.length }, null, 2));

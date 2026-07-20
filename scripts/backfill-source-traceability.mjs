#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const [, , inputPath = "data/generated/n5-jlpt-style-preview.json"] = process.argv;
const GENERATION_BATCH = "n5-jlpt-style-preview-001";

function loadEnv() {
  const text = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const [key, ...rest] = line.split("=");
    process.env[key] = rest.join("=");
  }
}

function toTraceFields(row) {
  return {
    source_type: "shorts",
    source_day: row.source_day,
    source_item: row.source_item,
    source_reading: row.source_reading,
    generation_batch: GENERATION_BATCH,
    review_status: "approved",
  };
}

loadEnv();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) throw new Error("Missing Supabase env");

const rows = JSON.parse(readFileSync(inputPath, "utf8"));
const supabase = createClient(url, key);
const summary = { vocab_items: { updated: 0 }, grammar_items: { updated: 0 } };

for (const row of rows) {
  const table = row.item_type === "vocab" ? "vocab_items" : "grammar_items";
  const { error, count } = await supabase
    .from(table)
    .update(toTraceFields(row), { count: "exact" })
    .eq("question_text", row.question_text);

  if (error) throw error;
  summary[table].updated += count ?? 0;
}

console.log(JSON.stringify({ ok: true, generation_batch: GENERATION_BATCH, ...summary }, null, 2));

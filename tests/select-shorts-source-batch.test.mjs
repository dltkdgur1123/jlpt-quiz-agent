import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";

import {
  buildSourceBatch,
  parseCsv,
  selectRows,
} from "../scripts/select-shorts-source-batch.mjs";

test("parseCsv handles quoted meanings", () => {
  const rows = parseCsv('word,hiragana,meaning,score,used,day\n会う,あう,"만나다, 보다",60,true,DAY 004\n');
  assert.equal(rows[0].meaning, "만나다, 보다");
});

test("selectRows keeps used shorts rows with source trace fields", () => {
  const rows = selectRows(
    [
      { word: "古い", hiragana: "ふるい", meaning: "오래되다", score: "20", used: "false", day: "DAY 003" },
      { word: "会う", hiragana: "あう", meaning: "만나다", score: "60", used: "true", day: "DAY 004" },
      { word: "青い", hiragana: "あおい", meaning: "파랗다", score: "70", used: "true", day: "DAY 005" },
    ],
    "vocab",
    2,
    () => 0,
  );

  assert.deepEqual(rows.map((row) => row.source_item), ["青い", "会う"]);
  assert.equal(rows[0].item_type, "vocab");
  assert.equal(rows[0].source_used, true);
  assert.equal(rows[0].source_day, "DAY 005");
});

test("buildSourceBatch reads N5 vocab and grammar Shorts CSVs", () => {
  const dir = mkdtempSync(join(tmpdir(), "jlpt-source-"));
  writeFileSync(
    join(dir, "jlpt_n5_vocab.csv"),
    'word,hiragana,meaning,romaji,score,used,day\n会う,あう,"만나다, 보다",au,60,true,DAY 004\n',
  );
  writeFileSync(
    join(dir, "jlpt_n5_grammar.csv"),
    'word,hiragana,meaning,romaji,score,used,day\n～ながら,～ながら,～하면서,nagara,60,true,DAY 010\n',
  );

  const batch = buildSourceBatch(dir);
  assert.equal(batch.batch_id, "n5-shorts-source-batch-002");
  assert.match(batch.selection_rule, /random used=true/);
  assert.equal(batch.rows.length, 2);
  assert.deepEqual(batch.rows.map((row) => row.item_type), ["vocab", "grammar"]);
});

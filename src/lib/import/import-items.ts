import type { GrammarItem, VocabItem } from "@/lib/db/types";

export type ImportItemType = "vocab" | "grammar";
export type ImportRow = Record<string, unknown>;

type VocabInsertRow = Omit<VocabItem, "id" | "created_at" | "updated_at">;
type GrammarInsertRow = Omit<GrammarItem, "id" | "created_at" | "updated_at">;

const LEVELS = new Set(["N1", "N2", "N3", "N4", "N5"]);
const CHOICES = ["A", "B", "C", "D"] as const;
const STATUSES = new Set(["draft", "active", "archived"]);

const FIELDS = {
  vocab: [
    "word",
    "reading",
    "meaning",
    "jlpt_level",
    "question_text",
    "choice_a",
    "choice_b",
    "choice_c",
    "choice_d",
    "correct_choice",
    "explanation",
    "status",
  ],
  grammar: [
    "grammar_point",
    "meaning",
    "jlpt_level",
    "question_text",
    "choice_a",
    "choice_b",
    "choice_c",
    "choice_d",
    "correct_choice",
    "explanation",
    "status",
  ],
} as const;

function value(row: ImportRow, field: string): string {
  return String(row[field] ?? "").trim();
}

export function validateImportRows(itemType: ImportItemType, rows: ImportRow[]): ImportRow[] {
  if (rows.length === 0) {
    throw new Error("no rows to import");
  }

  const fields = FIELDS[itemType];

  return rows.map((row, index) => {
    const rowNumber = index + 2;
    const missing = fields.filter((field) => value(row, field).length === 0);
    if (missing.length > 0) {
      throw new Error(`row ${rowNumber}: missing required fields: ${missing.join(", ")}`);
    }

    if (!LEVELS.has(value(row, "jlpt_level"))) {
      throw new Error(`row ${rowNumber}: invalid jlpt_level`);
    }

    if (!CHOICES.includes(value(row, "correct_choice") as (typeof CHOICES)[number])) {
      throw new Error(`row ${rowNumber}: invalid correct_choice`);
    }

    if (!STATUSES.has(value(row, "status"))) {
      throw new Error(`row ${rowNumber}: invalid status`);
    }

    const choices = CHOICES.map((choice) => value(row, `choice_${choice.toLowerCase()}`));
    if (new Set(choices).size !== choices.length) {
      throw new Error(`row ${rowNumber}: duplicate choices`);
    }

    return row;
  });
}

export function buildInsertRows(
  itemType: "vocab",
  rows: ImportRow[],
): VocabInsertRow[];
export function buildInsertRows(
  itemType: "grammar",
  rows: ImportRow[],
): GrammarInsertRow[];
export function buildInsertRows(
  itemType: ImportItemType,
  rows: ImportRow[],
): VocabInsertRow[] | GrammarInsertRow[] {
  validateImportRows(itemType, rows);

  if (itemType === "vocab") {
    return rows.map((row) => ({
      word: value(row, "word"),
      reading: value(row, "reading"),
      meaning: value(row, "meaning"),
      jlpt_level: value(row, "jlpt_level") as VocabInsertRow["jlpt_level"],
      question_text: value(row, "question_text"),
      choice_a: value(row, "choice_a"),
      choice_b: value(row, "choice_b"),
      choice_c: value(row, "choice_c"),
      choice_d: value(row, "choice_d"),
      correct_choice: value(row, "correct_choice") as VocabInsertRow["correct_choice"],
      explanation: value(row, "explanation"),
      status: value(row, "status") as VocabInsertRow["status"],
    }));
  }

  return rows.map((row) => ({
    grammar_point: value(row, "grammar_point"),
    meaning: value(row, "meaning"),
    jlpt_level: value(row, "jlpt_level") as GrammarInsertRow["jlpt_level"],
    question_text: value(row, "question_text"),
    choice_a: value(row, "choice_a"),
    choice_b: value(row, "choice_b"),
    choice_c: value(row, "choice_c"),
    choice_d: value(row, "choice_d"),
    correct_choice: value(row, "correct_choice") as GrammarInsertRow["correct_choice"],
    explanation: value(row, "explanation"),
    status: value(row, "status") as GrammarInsertRow["status"],
  }));
}

#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";

const generatedDir = "data/generated";
const defaultMarkdownOutput = "docs/operations/jlpt-content-quality-report.md";
const defaultJsonOutput = "docs/operations/jlpt-content-quality-report.json";
const artifactFilePattern = /^n[1-5]-realistic-mock-exam-\d{3}\.json$/;
const levels = ["N1", "N2", "N3", "N4", "N5"];
const sections = ["vocab", "grammar", "reading"];
const choiceLetters = ["A", "B", "C", "D"];
const hangul = /[ㄱ-ㅎㅏ-ㅣ가-힣]/u;
const unsafeTrustWording = /公式|公式問題|本試験そのまま|実際の試験|予想問題|的中|合格保証|합격 ?보장|공식|기출 ?그대로|출제 ?예상/iu;
const readingMinimums = { N1: 300, N2: 240, N3: 190, N4: 140, N5: 120 };
const expectedSectionCounts = { vocab: 20, grammar: 20, reading: 10 };
const expectedQuestionTypes = {
  vocab: ["vocab_reading", "vocab_orthography", "vocab_context_blank", "vocab_paraphrase"],
  grammar: ["grammar_sentence_blank", "grammar_sentence_build", "grammar_text_blank"],
  reading: ["reading_short", "reading_medium", "reading_info"],
};

function parseArgs(argv) {
  const args = {
    markdown: defaultMarkdownOutput,
    json: defaultJsonOutput,
    check: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--check") args.check = true;
    else if (arg === "--markdown") args.markdown = argv[++index];
    else if (arg === "--json") args.json = argv[++index];
    else if (arg === "--help") {
      console.log("Usage: node scripts/generate-content-quality-report.mjs [--check] [--markdown path] [--json path]");
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function ensureParentDir(path) {
  const parent = dirname(path);
  if (parent && parent !== ".") mkdirSync(parent, { recursive: true });
}

function listArtifactPaths() {
  if (!existsSync(generatedDir)) return [];
  return readdirSync(generatedDir)
    .filter((fileName) => artifactFilePattern.test(fileName))
    .sort()
    .map((fileName) => join(generatedDir, fileName));
}

function emptyLevelCounts() {
  return Object.fromEntries(
    levels.map((level) => [
      level,
      {
        sets: 0,
        questions: 0,
        vocab: 0,
        grammar: 0,
        reading: 0,
        draft_questions: 0,
        approved_questions: 0,
        unknown_review_status_questions: 0,
      },
    ]),
  );
}

function emptyQuestionTypeCounts() {
  return Object.fromEntries(levels.map((level) => [level, {}]));
}

function addFinding(findings, severity, file, message, questionId = null) {
  findings.push({ severity, file, question_id: questionId, message });
}

function analyzeArtifact(path, questionTextOwners) {
  const artifact = readJson(path);
  const file = relative(process.cwd(), path);
  const set = artifact.set ?? {};
  const questions = Array.isArray(artifact.questions) ? artifact.questions : [];
  const artifactSections = Array.isArray(artifact.sections) ? artifact.sections : [];
  const level = set.jlpt_level ?? "UNKNOWN";
  const setCode = set.set_code ?? basename(path, ".json");
  const findings = [];
  const sectionCounts = Object.fromEntries(sections.map((section) => [section, 0]));
  const questionTypeCounts = {};
  const correctChoiceCounts = Object.fromEntries(choiceLetters.map((choice) => [choice, 0]));
  const reviewStatusCounts = { draft: 0, approved: 0, rejected: 0, missing_or_unknown: 0 };
  const readingLengths = [];

  if (set.set_code !== basename(path, ".json")) addFinding(findings, "error", file, "set.set_code does not match filename");
  if (!levels.includes(level)) addFinding(findings, "error", file, "set.jlpt_level must be N1-N5");
  if (set.mode !== "realistic") addFinding(findings, "error", file, "set.mode must be realistic");
  if (set.status !== "draft") addFinding(findings, "warning", file, "set.status is not draft before human publication review");
  if (set.listening_included !== false) addFinding(findings, "error", file, "listening must be excluded from generated realistic sets");
  if (set.question_count !== 50) addFinding(findings, "error", file, "set.question_count should be 50");
  if (questions.length !== 50) addFinding(findings, "error", file, `questions length should be 50, got ${questions.length}`);
  if (artifactSections.length !== 3) addFinding(findings, "error", file, `sections length should be 3, got ${artifactSections.length}`);

  const ids = new Set();
  const textsInsideSet = new Set();

  for (const question of questions) {
    const questionId = question.id ?? `sort_order:${question.sort_order ?? "unknown"}`;
    const sectionKey = question.section_key;
    const questionType = question.question_type ?? "missing";
    const reviewStatus = question.review_status;

    if (sections.includes(sectionKey)) sectionCounts[sectionKey] += 1;
    else addFinding(findings, "error", file, `invalid section_key: ${sectionKey}`, questionId);

    questionTypeCounts[questionType] = (questionTypeCounts[questionType] ?? 0) + 1;

    if (reviewStatus === "draft") reviewStatusCounts.draft += 1;
    else if (reviewStatus === "approved") reviewStatusCounts.approved += 1;
    else if (reviewStatus === "rejected") reviewStatusCounts.rejected += 1;
    else reviewStatusCounts.missing_or_unknown += 1;

    if (typeof question.id !== "string" || question.id.length <= 3) addFinding(findings, "error", file, "question has invalid id", questionId);
    if (ids.has(question.id)) addFinding(findings, "error", file, `duplicate id: ${question.id}`, questionId);
    ids.add(question.id);

    if (question.mock_exam_set_code !== setCode) addFinding(findings, "error", file, "wrong mock_exam_set_code", questionId);
    if (!choiceLetters.includes(question.correct_choice)) addFinding(findings, "error", file, `invalid correct_choice: ${question.correct_choice}`, questionId);
    else correctChoiceCounts[question.correct_choice] += 1;

    const choices = choiceLetters.map((choice) => String(question[`choice_${choice.toLowerCase()}`] ?? "").trim());
    if (new Set(choices).size !== choices.length) addFinding(findings, "error", file, "duplicate choices", questionId);

    for (const field of ["question_text", "choice_a", "choice_b", "choice_c", "choice_d"]) {
      const value = String(question[field] ?? "");
      if (value.trim().length === 0) addFinding(findings, "error", file, `missing ${field}`, questionId);
      if (hangul.test(value)) addFinding(findings, "error", file, `${field} contains Korean`, questionId);
      if (unsafeTrustWording.test(value)) addFinding(findings, "error", file, `${field} has unsafe trust wording`, questionId);
    }

    if (unsafeTrustWording.test(String(question.explanation ?? ""))) {
      addFinding(findings, "error", file, "explanation has unsafe trust wording", questionId);
    }

    if (question.question_type === "grammar_sentence_build" && ![question.question_text, ...choices].some((value) => value.includes("★"))) {
      addFinding(findings, "error", file, "sentence-build question must mark star target", questionId);
    }

    const questionText = String(question.question_text ?? "");
    if (textsInsideSet.has(questionText)) addFinding(findings, "error", file, "duplicate question_text inside set", questionId);
    textsInsideSet.add(questionText);

    const owner = questionTextOwners.get(questionText);
    if (owner && owner.file !== file) addFinding(findings, "error", file, `question_text duplicated from ${owner.file}`, questionId);
    else if (questionText) questionTextOwners.set(questionText, { file, questionId });

    if (sectionKey === "reading") readingLengths.push(questionText.length);
  }

  for (const [section, expectedCount] of Object.entries(expectedSectionCounts)) {
    if (sectionCounts[section] !== expectedCount) {
      addFinding(findings, "error", file, `${section} should have ${expectedCount} questions, got ${sectionCounts[section]}`);
    }
  }

  for (const [section, expectedTypes] of Object.entries(expectedQuestionTypes)) {
    for (const expectedType of expectedTypes) {
      if (!questions.some((question) => question.section_key === section && question.question_type === expectedType)) {
        addFinding(findings, "warning", file, `${section} is missing question_type ${expectedType}`);
      }
    }
  }

  const usedCorrectChoiceCount = Object.values(correctChoiceCounts).filter((count) => count > 0).length;
  const maxCorrectChoiceCount = Math.max(...Object.values(correctChoiceCounts));
  if (usedCorrectChoiceCount < 2 || maxCorrectChoiceCount >= questions.length) {
    addFinding(findings, "error", file, `correct choice distribution is too skewed: ${JSON.stringify(correctChoiceCounts)}`);
  }

  const readingMin = readingLengths.length > 0 ? Math.min(...readingLengths) : null;
  const readingAverage = readingLengths.length > 0 ? Math.round(readingLengths.reduce((sum, length) => sum + length, 0) / readingLengths.length) : null;
  const readingMinimum = readingMinimums[level];
  if (readingMinimum && readingMin !== null && readingMin < readingMinimum) {
    addFinding(findings, "error", file, `reading minimum length is too short: ${readingMin} < ${readingMinimum}`);
  }

  return {
    file,
    set_code: setCode,
    level,
    status: set.status ?? null,
    questions: questions.length,
    section_counts: sectionCounts,
    question_type_counts: questionTypeCounts,
    correct_choice_counts: correctChoiceCounts,
    review_status_counts: reviewStatusCounts,
    reading_min: readingMin,
    reading_average: readingAverage,
    findings,
  };
}

function levelCountRows(levelCounts) {
  return levels.map((level) => ({ level, ...levelCounts[level] }));
}

function makeMarkdown(report) {
  const errorCount = report.findings.filter((finding) => finding.severity === "error").length;
  const warningCount = report.findings.filter((finding) => finding.severity === "warning").length;
  const lines = [];

  lines.push("# JLPT Content Quality Report");
  lines.push("");
  lines.push("- Generated by: `npm run report:content-quality`");
  lines.push(`- Source: \`${generatedDir}\` realistic mock exam JSON artifacts`);
  lines.push("- Scope: internal operations report only; no public UI changes");
  lines.push("");
  lines.push("## Executive Summary");
  lines.push("");
  lines.push(`- Files checked: ${report.summary.files_checked}`);
  lines.push(`- Total questions: ${report.summary.total_questions}`);
  lines.push(`- Errors: ${errorCount}`);
  lines.push(`- Warnings: ${warningCount}`);
  lines.push(`- Overall status: ${errorCount === 0 ? "PASS" : "NEEDS ATTENTION"}`);
  lines.push("");

  lines.push("## Level Coverage");
  lines.push("");
  lines.push("| Level | Sets | Questions | Vocab | Grammar | Reading | Draft | Approved | Unknown review |",
    "|---|---:|---:|---:|---:|---:|---:|---:|---:|");
  for (const row of levelCountRows(report.level_counts)) {
    lines.push(`| ${row.level} | ${row.sets} | ${row.questions} | ${row.vocab} | ${row.grammar} | ${row.reading} | ${row.draft_questions} | ${row.approved_questions} | ${row.unknown_review_status_questions} |`);
  }
  lines.push("");

  lines.push("## Set Detail");
  lines.push("");
  lines.push("| Set | Level | Questions | Vocab | Grammar | Reading | Reading min/avg | Correct A/B/C/D | Findings |",
    "|---|---|---:|---:|---:|---:|---:|---|---:|");
  for (const set of report.sets) {
    const counts = set.section_counts;
    const choices = choiceLetters.map((choice) => set.correct_choice_counts[choice]).join("/");
    lines.push(`| ${set.set_code} | ${set.level} | ${set.questions} | ${counts.vocab} | ${counts.grammar} | ${counts.reading} | ${set.reading_min ?? "-"}/${set.reading_average ?? "-"} | ${choices} | ${set.findings.length} |`);
  }
  lines.push("");

  lines.push("## Question Type Coverage by Level");
  lines.push("");
  for (const level of levels) {
    lines.push(`### ${level}`);
    lines.push("");
    const entries = Object.entries(report.question_type_counts[level] ?? {}).sort(([a], [b]) => a.localeCompare(b));
    if (entries.length === 0) {
      lines.push("- No generated realistic mock questions found.");
      lines.push("");
      continue;
    }
    lines.push("| Question type | Count |", "|---|---:|");
    for (const [type, count] of entries) lines.push(`| ${type} | ${count} |`);
    lines.push("");
  }

  lines.push("## Findings");
  lines.push("");
  if (report.findings.length === 0) {
    lines.push("- No errors or warnings found by the local report checks.");
  } else {
    lines.push("| Severity | File | Question | Message |", "|---|---|---|---|");
    for (const finding of report.findings.slice(0, 200)) {
      lines.push(`| ${finding.severity} | \`${finding.file}\` | ${finding.question_id ?? "-"} | ${finding.message.replaceAll("|", "\\|")} |`);
    }
    if (report.findings.length > 200) lines.push(`| info | - | - | ${report.findings.length - 200} additional findings omitted from markdown; see JSON report. |`);
  }
  lines.push("");

  lines.push("## Next Operations");
  lines.push("");
  lines.push("- Keep this report internal; do not add visible homepage/footer/menu links without approval.");
  lines.push("- If errors appear, fix generated JSON or source generation script before import/publish.");
  lines.push("- Use the JSON output for future dashboard/admin views after approval.");
  lines.push("");

  return `${lines.join("\n")}\n`;
}

function buildReport() {
  const paths = listArtifactPaths();
  const questionTextOwners = new Map();
  const sets = paths.map((path) => analyzeArtifact(path, questionTextOwners));
  const levelCounts = emptyLevelCounts();
  const questionTypeCounts = emptyQuestionTypeCounts();
  const findings = sets.flatMap((set) => set.findings);

  for (const set of sets) {
    if (!levelCounts[set.level]) continue;
    levelCounts[set.level].sets += 1;
    levelCounts[set.level].questions += set.questions;
    for (const section of sections) levelCounts[set.level][section] += set.section_counts[section] ?? 0;
    levelCounts[set.level].draft_questions += set.review_status_counts.draft;
    levelCounts[set.level].approved_questions += set.review_status_counts.approved;
    levelCounts[set.level].unknown_review_status_questions += set.review_status_counts.missing_or_unknown;
    for (const [type, count] of Object.entries(set.question_type_counts)) {
      questionTypeCounts[set.level][type] = (questionTypeCounts[set.level][type] ?? 0) + count;
    }
  }

  return {
    summary: {
      files_checked: sets.length,
      total_questions: sets.reduce((sum, set) => sum + set.questions, 0),
      error_count: findings.filter((finding) => finding.severity === "error").length,
      warning_count: findings.filter((finding) => finding.severity === "warning").length,
    },
    level_counts: levelCounts,
    question_type_counts: questionTypeCounts,
    sets,
    findings,
  };
}

const args = parseArgs(process.argv.slice(2));
const report = buildReport();
const markdown = makeMarkdown(report);
const json = `${JSON.stringify(report, null, 2)}\n`;

if (args.check) {
  if (!existsSync(args.markdown)) throw new Error(`Missing markdown report: ${args.markdown}`);
  if (!existsSync(args.json)) throw new Error(`Missing JSON report: ${args.json}`);
  const currentMarkdown = readFileSync(args.markdown, "utf8");
  const currentJson = readFileSync(args.json, "utf8");
  if (currentMarkdown !== markdown || currentJson !== json) {
    throw new Error("JLPT content quality report is stale. Run `npm run report:content-quality`.");
  }
} else {
  ensureParentDir(args.markdown);
  ensureParentDir(args.json);
  writeFileSync(args.markdown, markdown);
  writeFileSync(args.json, json);
}

console.log(JSON.stringify(report.summary, null, 2));
if (report.summary.error_count > 0) process.exitCode = 1;

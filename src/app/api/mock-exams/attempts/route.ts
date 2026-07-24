import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

import { buildUserProfileUpsert } from "@/lib/auth/user-sync";
import type { ActiveMockExamSectionKey, ChoiceKey } from "@/lib/db/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AttemptAnswerInput = {
  question_id: string;
  section_key: ActiveMockExamSectionKey;
  selected_choice: ChoiceKey | null;
  is_correct: boolean;
};

type SectionResultInput = {
  section_key: ActiveMockExamSectionKey;
  correct: number;
  question_count: number;
  rate: number;
};

type MockExamAttemptInput = {
  set_code: string;
  set_title: string;
  jlpt_level: string;
  time_limit_minutes: number;
  question_count: number;
  score_total: number;
  score_max: number;
  correct_count: number;
  elapsed_seconds?: number | null;
  answers: AttemptAnswerInput[];
  section_results: SectionResultInput[];
};

const SECTION_TITLES: Record<ActiveMockExamSectionKey, string> = {
  vocab: "文字・語彙",
  grammar: "文法",
  reading: "読解",
};

const SECTION_TITLES_KO: Record<ActiveMockExamSectionKey, string> = {
  vocab: "문자·어휘",
  grammar: "문법",
  reading: "읽기",
};

function deterministicUuid(namespace: string, value: string) {
  const hash = createHash("sha256").update(`${namespace}:${value}`).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

function assertValidBody(body: MockExamAttemptInput) {
  if (!body || typeof body !== "object") throw new Error("invalid request body");
  if (!body.set_code || !body.set_title) throw new Error("invalid mock exam set");
  if (!/^N[1-5]$/.test(body.jlpt_level)) throw new Error("invalid jlpt level");
  if (!Number.isInteger(body.question_count) || body.question_count <= 0) throw new Error("invalid question count");
  if (!Array.isArray(body.answers) || body.answers.length !== body.question_count) throw new Error("invalid answers");
  if (!Array.isArray(body.section_results) || body.section_results.length === 0) throw new Error("invalid section results");
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const maybeError = error as { message?: unknown; error_description?: unknown; details?: unknown; hint?: unknown };
    for (const value of [maybeError.message, maybeError.error_description, maybeError.details, maybeError.hint]) {
      if (typeof value === "string" && value.trim()) return value;
    }
  }
  return fallback;
}

function sectionTitleKo(sectionKey: unknown) {
  if (sectionKey === "vocab" || sectionKey === "grammar" || sectionKey === "reading") {
    return SECTION_TITLES_KO[sectionKey];
  }
  return "모의고사";
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as MockExamAttemptInput;
    assertValidBody(body);

    const accessToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!accessToken) throw new Error("login required");

    const client = getSupabaseBrowserClient();
    const { data: authData, error: authError } = await client.auth.getUser(accessToken);
    if (authError || !authData.user) throw new Error("login required");

    const profile = buildUserProfileUpsert(authData.user);
    const { data: userProfile, error: userError } = await client
      .from("users")
      .upsert(profile, { onConflict: "auth_provider,provider_user_id" })
      .select("id")
      .single();
    if (userError) throw userError;

    const setId = deterministicUuid("mock_exam_set", body.set_code);
    const { error: setError } = await client.from("mock_exam_sets").upsert(
      {
        id: setId,
        jlpt_level: body.jlpt_level,
        set_code: body.set_code,
        set_title: body.set_title,
        mode: "lite",
        status: "published",
        time_limit_minutes: body.time_limit_minutes,
        listening_included: false,
        question_count: body.question_count,
        published_at: new Date().toISOString(),
      },
      { onConflict: "set_code" },
    );
    if (setError) throw setError;

    const sections = body.section_results.map((section, index) => ({
      id: deterministicUuid("mock_exam_section", `${body.set_code}:${section.section_key}`),
      mock_exam_set_id: setId,
      section_key: section.section_key,
      section_title: SECTION_TITLES[section.section_key] ?? section.section_key,
      sort_order: index + 1,
      question_count: section.question_count,
      time_limit_minutes: Math.round(body.time_limit_minutes / body.section_results.length),
    }));
    const { error: sectionError } = await client.from("mock_exam_sections").upsert(sections, {
      onConflict: "mock_exam_set_id,sort_order",
    });
    if (sectionError) throw sectionError;

    const sectionIdMap = Object.fromEntries(sections.map((section) => [section.section_key, section.id]));
    const questions = body.answers.map((answer, index) => ({
      id: deterministicUuid("mock_exam_question", `${body.set_code}:${answer.question_id}`),
      mock_exam_set_id: setId,
      section_id: sectionIdMap[answer.section_key],
      item_type: answer.section_key,
      item_id: deterministicUuid("mock_exam_item", answer.question_id),
      sort_order: index + 1,
      points: 1,
    }));
    const { error: questionError } = await client.from("mock_exam_questions").upsert(questions, {
      onConflict: "mock_exam_set_id,sort_order",
    });
    if (questionError) throw questionError;

    const { data: attempt, error: attemptError } = await client
      .from("mock_exam_attempts")
      .insert({
        mock_exam_set_id: setId,
        user_id: userProfile.id,
        status: "submitted",
        submitted_at: new Date().toISOString(),
        elapsed_seconds: body.elapsed_seconds ?? null,
        score_total: body.score_total,
        score_max: body.score_max,
        correct_count: body.correct_count,
        question_count: body.question_count,
      })
      .select("id, submitted_at")
      .single();
    if (attemptError) throw attemptError;

    const questionIdMap = Object.fromEntries(body.answers.map((answer, index) => [answer.question_id, questions[index].id]));
    const answerRows = body.answers.map((answer) => ({
      mock_exam_attempt_id: attempt.id,
      mock_exam_question_id: questionIdMap[answer.question_id],
      selected_choice: answer.selected_choice,
      is_correct: answer.is_correct,
      answered_at: answer.selected_choice ? new Date().toISOString() : null,
    }));
    const { error: answerError } = await client.from("mock_exam_answers").insert(answerRows);
    if (answerError) throw answerError;

    const sectionRows = body.section_results.map((section) => ({
      mock_exam_attempt_id: attempt.id,
      section_key: section.section_key,
      score: section.correct,
      score_max: section.question_count,
      correct_count: section.correct,
      question_count: section.question_count,
      correct_rate: section.question_count === 0 ? null : section.correct / section.question_count,
      weakness_label: section.rate < 60 ? "복습 필요" : null,
    }));
    const { error: resultError } = await client.from("mock_exam_section_results").insert(sectionRows);
    if (resultError) throw resultError;

    return NextResponse.json({
      saved: true,
      attempt_id: attempt.id,
      submitted_at: attempt.submitted_at,
    });
  } catch (error) {
    const message = errorMessage(error, "failed to save mock exam attempt");
    const status = message.includes("login required") ? 401 : message.includes("invalid") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!accessToken) throw new Error("login required");

    const client = getSupabaseBrowserClient();
    const { data: authData, error: authError } = await client.auth.getUser(accessToken);
    if (authError || !authData.user) throw new Error("login required");

    const profile = buildUserProfileUpsert(authData.user);
    const { data: userProfile, error: userError } = await client
      .from("users")
      .upsert(profile, { onConflict: "auth_provider,provider_user_id" })
      .select("id")
      .single();
    if (userError) throw userError;

    const { data: attempts, error } = await client
      .from("mock_exam_attempts")
      .select("id, submitted_at, score_total, score_max, correct_count, question_count, mock_exam_sets(set_title, jlpt_level)")
      .eq("user_id", userProfile.id)
      .eq("status", "submitted")
      .order("submitted_at", { ascending: false })
      .limit(5);
    if (error) throw error;

    const totalQuestions = (attempts ?? []).reduce((sum, attempt) => sum + Number(attempt.question_count ?? 0), 0);
    const averageRate = attempts?.length
      ? Math.round(
          (attempts.reduce((sum, attempt) => sum + Number(attempt.correct_count ?? 0) / Number(attempt.question_count || 1), 0) /
            attempts.length) *
            100,
        )
      : 0;

    const attemptIds = (attempts ?? []).map((attempt) => attempt.id);
    let wrongNote = {
      total_count: 0,
      wrong_count: 0,
      unanswered_count: 0,
      recent_items: [] as Array<{
        id: string;
        attempt_id: string;
        question_no: number | null;
        section_label: string;
        status: "wrong" | "unanswered";
      }>,
    };

    if (attemptIds.length > 0) {
      const { data: wrongAnswers, error: wrongAnswerError } = await client
        .from("mock_exam_answers")
        .select("id, mock_exam_attempt_id, selected_choice, is_correct, mock_exam_questions(sort_order, mock_exam_sections(section_key))")
        .in("mock_exam_attempt_id", attemptIds)
        .eq("is_correct", false)
        .order("created_at", { ascending: false })
        .limit(200);

      if (wrongAnswerError) throw wrongAnswerError;

      const rows = wrongAnswers ?? [];
      const wrongCount = rows.filter((row) => Boolean(row.selected_choice)).length;
      const unansweredCount = rows.length - wrongCount;

      wrongNote = {
        total_count: rows.length,
        wrong_count: wrongCount,
        unanswered_count: unansweredCount,
        recent_items: rows.slice(0, 6).map((row) => {
          const question = Array.isArray(row.mock_exam_questions) ? row.mock_exam_questions[0] : row.mock_exam_questions;
          const section = Array.isArray(question?.mock_exam_sections) ? question?.mock_exam_sections[0] : question?.mock_exam_sections;
          return {
            id: row.id,
            attempt_id: row.mock_exam_attempt_id,
            question_no: typeof question?.sort_order === "number" ? question.sort_order : null,
            section_label: sectionTitleKo(section?.section_key),
            status: row.selected_choice ? "wrong" : "unanswered",
          };
        }),
      };
    }

    return NextResponse.json({ attempts: attempts ?? [], total_questions: totalQuestions, average_rate: averageRate, wrong_note: wrongNote });
  } catch (error) {
    const message = errorMessage(error, "failed to load mock exam attempts");
    const status = message.includes("login required") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

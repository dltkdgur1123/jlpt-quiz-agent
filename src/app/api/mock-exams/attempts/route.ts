import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse, type NextRequest } from "next/server";

import { buildUserProfileUpsert } from "@/lib/auth/user-sync";
import type { ActiveMockExamSectionKey, ChoiceKey } from "@/lib/db/types";
import { getSupabasePrivilegedClient, getSupabaseServerClient } from "@/lib/supabase/server";

type AttemptAnswerInput = {
  question_id: string;
  section_key: ActiveMockExamSectionKey;
  source_sort_order?: number;
  selected_choice: ChoiceKey | null;
  is_correct: boolean;
};

type SectionResultInput = {
  section_key: ActiveMockExamSectionKey;
  correct: number;
  question_count: number;
  full_question_count?: number;
  rate: number;
};

type GeneratedMockExamQuestion = {
  id: string;
  question_text: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  correct_choice: ChoiceKey;
  explanation: string;
};

type GeneratedMockExamArtifact = {
  questions?: GeneratedMockExamQuestion[];
};

type MockExamAttemptInput = {
  set_code: string;
  set_title: string;
  jlpt_level: string;
  time_limit_minutes: number;
  question_count: number;
  answered_count?: number;
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

type WeaknessBasis = "wrong-rate" | "unanswered" | "recent-miss";

type SectionAggregate = {
  section_key: ActiveMockExamSectionKey;
  section_label: string;
  correct_count: number;
  question_count: number;
  weakness_score: number;
  latest_miss_order: number;
};

const WEAKNESS_BASIS_LABELS: Record<WeaknessBasis, string> = {
  "wrong-rate": "오답률 우선",
  unanswered: "미응답 포함",
  "recent-miss": "최근 실수 우선",
};

function normalizeWeaknessBasis(value: unknown): WeaknessBasis {
  return value === "unanswered" || value === "recent-miss" || value === "wrong-rate" ? value : "wrong-rate";
}

function baseSectionAggregates(): SectionAggregate[] {
  return (["vocab", "grammar", "reading"] as ActiveMockExamSectionKey[]).map((sectionKey) => ({
    section_key: sectionKey,
    section_label: SECTION_TITLES_KO[sectionKey],
    correct_count: 0,
    question_count: 0,
    weakness_score: 0,
    latest_miss_order: Number.MAX_SAFE_INTEGER,
  }));
}

function summarizeWeaknessSections(sections: SectionAggregate[], basis: WeaknessBasis) {
  return [...sections]
    .map((section) => {
      const correctRate = section.question_count ? Math.round((section.correct_count / section.question_count) * 100) : 0;
      const weaknessLabel = section.question_count === 0
        ? "기록 없음"
        : basis === "recent-miss" && section.weakness_score > 0
          ? "최근 실수"
          : basis === "unanswered" && section.weakness_score > 0
            ? "오답·미응답"
            : correctRate < 60
              ? "복습 필요"
              : "유지 권장";
      return {
        section_key: section.section_key,
        section_label: section.section_label,
        correct_count: section.correct_count,
        question_count: section.question_count,
        correct_rate: correctRate,
        weakness_label: weaknessLabel,
        weakness_score: section.weakness_score,
        latest_miss_order: section.latest_miss_order,
      };
    })
    .sort((left, right) => {
      if (basis === "recent-miss") {
        return right.weakness_score - left.weakness_score || left.latest_miss_order - right.latest_miss_order || left.correct_rate - right.correct_rate;
      }
      return right.weakness_score - left.weakness_score || left.correct_rate - right.correct_rate;
    })
    .map((section) => ({
      section_key: section.section_key,
      section_label: section.section_label,
      correct_count: section.correct_count,
      question_count: section.question_count,
      correct_rate: section.correct_rate,
      weakness_label: section.weakness_label,
    }));
}

function deterministicUuid(namespace: string, value: string) {
  const hash = createHash("sha256").update(`${namespace}:${value}`).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

const generatedQuestionCache = new Map<string, Map<string, GeneratedMockExamQuestion>>();

function generatedQuestionMap(setCode: string) {
  const cached = generatedQuestionCache.get(setCode);
  if (cached) return cached;

  const path = join(process.cwd(), "data/generated", `${setCode}.json`);
  const questionMap = new Map<string, GeneratedMockExamQuestion>();
  if (!existsSync(path)) {
    generatedQuestionCache.set(setCode, questionMap);
    return questionMap;
  }

  try {
    const artifact = JSON.parse(readFileSync(path, "utf8")) as GeneratedMockExamArtifact;
    for (const question of artifact.questions ?? []) {
      questionMap.set(deterministicUuid("mock_exam_item", question.id), question);
    }
  } catch {
    // Keep the wrong-note API resilient: missing snapshots should not break dashboard summaries.
  }

  generatedQuestionCache.set(setCode, questionMap);
  return questionMap;
}

function generatedQuestionSnapshot(setCode: unknown, itemId: unknown) {
  if (typeof setCode !== "string" || typeof itemId !== "string") return undefined;
  return generatedQuestionMap(setCode).get(itemId);
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

function normalizeSectionKey(sectionKey: unknown): ActiveMockExamSectionKey | null {
  return sectionKey === "vocab" || sectionKey === "grammar" || sectionKey === "reading" ? sectionKey : null;
}

async function syncUserProfileForMockExam(
  client: ReturnType<typeof getSupabasePrivilegedClient>,
  authUser: Parameters<typeof buildUserProfileUpsert>[0],
) {
  const profile = buildUserProfileUpsert(authUser);
  const { data: existingProfile, error: selectError } = await client
    .from("users")
    .select("id")
    .eq("auth_provider", profile.auth_provider)
    .eq("provider_user_id", profile.provider_user_id)
    .maybeSingle();
  if (selectError) throw selectError;

  if (existingProfile?.id) {
    const { error: updateError } = await client
      .from("users")
      .update({
        display_name: profile.display_name,
        last_seen_at: profile.last_seen_at,
      })
      .eq("id", existingProfile.id);
    if (updateError) throw updateError;
    return existingProfile;
  }

  const { data: insertedProfile, error: insertError } = await client
    .from("users")
    .insert(profile)
    .select("id")
    .single();
  if (insertError) throw insertError;
  return insertedProfile;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as MockExamAttemptInput;
    assertValidBody(body);
    const answeredAttemptCount = Math.min(
      body.question_count,
      Math.max(0, Number(body.answered_count ?? body.answers.filter((answer) => answer.selected_choice).length)),
    );

    const accessToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!accessToken) throw new Error("login required");

    const authClient = getSupabaseServerClient();
    const { data: authData, error: authError } = await authClient.auth.getUser(accessToken);
    if (authError || !authData.user) throw new Error("login required");

    const client = getSupabasePrivilegedClient(accessToken);

    const userProfile = await syncUserProfileForMockExam(client, authData.user);

    const setId = deterministicUuid("mock_exam_set", body.set_code);
    const { error: setError } = await client.from("mock_exam_sets").upsert(
      {
        id: setId,
        jlpt_level: body.jlpt_level,
        set_code: body.set_code,
        set_title: body.set_title,
        mode: "realistic",
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
      question_count: section.full_question_count ?? section.question_count,
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
      sort_order: answer.source_sort_order ?? index + 1,
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
        question_count: answeredAttemptCount,
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
    const maybeSupabaseError = error as { code?: unknown; details?: unknown; hint?: unknown; message?: unknown };
    console.error("mock exam attempt save failed", {
      status,
      message,
      code: typeof maybeSupabaseError?.code === "string" ? maybeSupabaseError.code : null,
      details: typeof maybeSupabaseError?.details === "string" ? maybeSupabaseError.details : null,
      hint: typeof maybeSupabaseError?.hint === "string" ? maybeSupabaseError.hint : null,
    });
    return NextResponse.json({
      error: message,
      code: typeof maybeSupabaseError?.code === "string" ? maybeSupabaseError.code : null,
    }, { status });
  }
}

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!accessToken) throw new Error("login required");

    const authClient = getSupabaseServerClient();
    const { data: authData, error: authError } = await authClient.auth.getUser(accessToken);
    if (authError || !authData.user) throw new Error("login required");

    const client = getSupabasePrivilegedClient(accessToken);

    const userProfile = await syncUserProfileForMockExam(client, authData.user);
    const weaknessBasis = normalizeWeaknessBasis(request.nextUrl.searchParams.get("weakness_basis"));
    const wrongNoteSection = normalizeSectionKey(request.nextUrl.searchParams.get("wrong_note_section"));

    const { data: attempts, error } = await client
      .from("mock_exam_attempts")
      .select("id, submitted_at, score_total, score_max, correct_count, question_count, mock_exam_sets(set_title, jlpt_level)")
      .eq("user_id", userProfile.id)
      .eq("status", "submitted")
      .order("submitted_at", { ascending: false })
      .limit(30);
    if (error) throw error;

    const attemptRows = attempts ?? [];
    const attemptIds = attemptRows.map((attempt) => attempt.id);
    const answeredCountMap = new Map<string, number>();
    if (attemptIds.length > 0) {
      const { data: answeredRows, error: answeredRowsError } = await client
        .from("mock_exam_answers")
        .select("mock_exam_attempt_id, selected_choice")
        .in("mock_exam_attempt_id", attemptIds)
        .not("selected_choice", "is", null);
      if (answeredRowsError) throw answeredRowsError;
      for (const row of answeredRows ?? []) {
        answeredCountMap.set(row.mock_exam_attempt_id, (answeredCountMap.get(row.mock_exam_attempt_id) ?? 0) + 1);
      }
    }
    const normalizedAttemptRows = attemptRows.map((attempt) => ({
      ...attempt,
      question_count: answeredCountMap.get(attempt.id) ?? Number(attempt.question_count ?? 0),
    }));
    const totalQuestions = normalizedAttemptRows.reduce((sum, attempt) => sum + Number(attempt.question_count ?? 0), 0);
    const averageRate = normalizedAttemptRows.length
      ? Math.round(
          (normalizedAttemptRows.reduce((sum, attempt) => sum + Number(attempt.correct_count ?? 0) / Number(attempt.question_count || 1), 0) /
            attemptRows.length) *
            100,
        )
      : 0;

    const weeklyMap = new Map<string, number>();
    for (let index = 6; index >= 0; index -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - index);
      weeklyMap.set(date.toISOString().slice(0, 10), 0);
    }
    for (const attempt of normalizedAttemptRows) {
      const submittedDay = attempt.submitted_at ? new Date(attempt.submitted_at).toISOString().slice(0, 10) : null;
      if (submittedDay && weeklyMap.has(submittedDay)) {
        weeklyMap.set(submittedDay, (weeklyMap.get(submittedDay) ?? 0) + Number(attempt.question_count ?? 0));
      }
    }
    const weeklyActivity = Array.from(weeklyMap.entries()).map(([date, question_count]) => ({ date, question_count }));

    let sectionSummary = summarizeWeaknessSections(baseSectionAggregates(), weaknessBasis);
    if (attemptIds.length > 0) {
      const sectionMap = new Map<ActiveMockExamSectionKey, SectionAggregate>(
        baseSectionAggregates().map((section) => [section.section_key, section]),
      );

      if (weaknessBasis === "wrong-rate") {
        const { data: sectionRows, error: sectionSummaryError } = await client
          .from("mock_exam_section_results")
          .select("section_key, correct_count, question_count")
          .in("mock_exam_attempt_id", attemptIds);
        if (sectionSummaryError) throw sectionSummaryError;

        for (const row of sectionRows ?? []) {
          const sectionKey = normalizeSectionKey(row.section_key);
          if (!sectionKey) continue;
          const current = sectionMap.get(sectionKey);
          if (!current) continue;
          current.correct_count += Number(row.correct_count ?? 0);
          current.question_count += Number(row.question_count ?? 0);
        }
        for (const current of sectionMap.values()) {
          current.weakness_score = current.question_count ? 1 - current.correct_count / current.question_count : 0;
        }
      } else {
        const attemptOrder = new Map(attemptRows.map((attempt, index) => [attempt.id, index]));
        const { data: answerRows, error: answerSummaryError } = await client
          .from("mock_exam_answers")
          .select("mock_exam_attempt_id, selected_choice, is_correct, mock_exam_questions(mock_exam_sections(section_key))")
          .in("mock_exam_attempt_id", attemptIds);
        if (answerSummaryError) throw answerSummaryError;

        for (const row of answerRows ?? []) {
          const question = Array.isArray(row.mock_exam_questions) ? row.mock_exam_questions[0] : row.mock_exam_questions;
          const section = Array.isArray(question?.mock_exam_sections) ? question?.mock_exam_sections[0] : question?.mock_exam_sections;
          const sectionKey = normalizeSectionKey(section?.section_key);
          if (!sectionKey) continue;
          const current = sectionMap.get(sectionKey);
          if (!current) continue;
          const isAnswered = row.selected_choice !== null;
          const countsForBasis = weaknessBasis === "unanswered" || isAnswered;
          if (!countsForBasis) continue;
          current.question_count += 1;
          if (row.is_correct) current.correct_count += 1;
          const isWeak = weaknessBasis === "unanswered" ? !row.is_correct || !isAnswered : isAnswered && !row.is_correct;
          if (isWeak) {
            const order = attemptOrder.get(row.mock_exam_attempt_id) ?? 0;
            current.latest_miss_order = Math.min(current.latest_miss_order, order);
            current.weakness_score += weaknessBasis === "recent-miss" ? Math.max(1, 6 - order) : 1;
          }
        }
      }

      sectionSummary = summarizeWeaknessSections(Array.from(sectionMap.values()), weaknessBasis);
    }

    let wrongNote = {
      total_count: 0,
      wrong_count: 0,
      unanswered_count: 0,
      recent_items: [] as Array<{
        id: string;
        attempt_id: string;
        question_no: number | null;
        section_label: string;
        section_key: ActiveMockExamSectionKey | null;
        status: "wrong" | "unanswered";
        question?: {
          id: string;
          question_text: string;
          choice_a: string;
          choice_b: string;
          choice_c: string;
          choice_d: string;
          correct_choice: ChoiceKey;
          explanation: string;
        };
      }>,
    };

    if (attemptIds.length > 0) {
      const { data: wrongAnswers, error: wrongAnswerError } = await client
        .from("mock_exam_answers")
        .select("id, mock_exam_attempt_id, selected_choice, is_correct, mock_exam_questions(sort_order, item_id, mock_exam_sections(section_key), mock_exam_sets(set_code))")
        .in("mock_exam_attempt_id", attemptIds)
        .eq("is_correct", false)
        .not("selected_choice", "is", null)
        .order("created_at", { ascending: false })
        .limit(200);

      if (wrongAnswerError) throw wrongAnswerError;

      const rows = (wrongAnswers ?? [])
        .map((row) => {
          const question = Array.isArray(row.mock_exam_questions) ? row.mock_exam_questions[0] : row.mock_exam_questions;
          const section = Array.isArray(question?.mock_exam_sections) ? question?.mock_exam_sections[0] : question?.mock_exam_sections;
          const set = Array.isArray(question?.mock_exam_sets) ? question?.mock_exam_sets[0] : question?.mock_exam_sets;
          const sectionKey = normalizeSectionKey(section?.section_key);
          const snapshot = generatedQuestionSnapshot(set?.set_code, question?.item_id);
          return {
            id: row.id,
            attempt_id: row.mock_exam_attempt_id,
            question_no: typeof question?.sort_order === "number" ? question.sort_order : null,
            section_label: sectionTitleKo(section?.section_key),
            section_key: sectionKey,
            status: "wrong" as const,
            question: snapshot ? {
              id: snapshot.id,
              question_text: snapshot.question_text,
              choice_a: snapshot.choice_a,
              choice_b: snapshot.choice_b,
              choice_c: snapshot.choice_c,
              choice_d: snapshot.choice_d,
              correct_choice: snapshot.correct_choice,
              explanation: snapshot.explanation,
            } : undefined,
          };
        })
        .filter((row) => !wrongNoteSection || row.section_key === wrongNoteSection);

      wrongNote = {
        total_count: rows.length,
        wrong_count: rows.length,
        unanswered_count: 0,
        recent_items: rows.slice(0, 20),
      };
    }

    return NextResponse.json({
      attempts: normalizedAttemptRows.slice(0, 5),
      attempt_count: normalizedAttemptRows.length,
      total_questions: totalQuestions,
      average_rate: averageRate,
      weekly_activity: weeklyActivity,
      section_summary: sectionSummary,
      weakness_basis: weaknessBasis,
      weakness_basis_label: WEAKNESS_BASIS_LABELS[weaknessBasis],
      wrong_note: wrongNote,
    });
  } catch (error) {
    const message = errorMessage(error, "failed to load mock exam attempts");
    const status = message.includes("login required") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

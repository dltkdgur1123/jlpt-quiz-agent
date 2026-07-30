import { NextResponse, type NextRequest } from "next/server";

import { buildUserProfileUpsert } from "@/lib/auth/user-sync";
import type { ChoiceKey, MockExamWrongReviewResult } from "@/lib/db/types";
import { getSupabasePrivilegedClient, getSupabaseServerClient } from "@/lib/supabase/server";

type WrongReviewInput = {
  mock_exam_answer_id: string;
  reviewed_choice: ChoiceKey;
  review_result: MockExamWrongReviewResult;
};

function isChoiceKey(value: unknown): value is ChoiceKey {
  return value === "A" || value === "B" || value === "C" || value === "D";
}

function isReviewResult(value: unknown): value is MockExamWrongReviewResult {
  return value === "resolved" || value === "repeat_wrong";
}

function assertValidBody(body: WrongReviewInput) {
  if (!body || typeof body !== "object") throw new Error("invalid request body");
  if (typeof body.mock_exam_answer_id !== "string" || !body.mock_exam_answer_id) throw new Error("invalid mock exam answer");
  if (!isChoiceKey(body.reviewed_choice)) throw new Error("invalid reviewed choice");
  if (!isReviewResult(body.review_result)) throw new Error("invalid review result");
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

async function syncUserProfileForWrongReview(
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
    const body = (await request.json()) as WrongReviewInput;
    assertValidBody(body);

    const accessToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!accessToken) throw new Error("login required");

    const authClient = getSupabaseServerClient();
    const { data: authData, error: authError } = await authClient.auth.getUser(accessToken);
    if (authError || !authData.user) throw new Error("login required");

    const client = getSupabasePrivilegedClient(accessToken);
    const userProfile = await syncUserProfileForWrongReview(client, authData.user);

    const { data: answer, error: answerError } = await client
      .from("mock_exam_answers")
      .select("id, selected_choice, is_correct, mock_exam_attempts(user_id)")
      .eq("id", body.mock_exam_answer_id)
      .maybeSingle();
    if (answerError) throw answerError;
    if (!answer?.id) throw new Error("wrong answer not found");

    const attempt = Array.isArray(answer.mock_exam_attempts) ? answer.mock_exam_attempts[0] : answer.mock_exam_attempts;
    if (attempt?.user_id !== userProfile.id) throw new Error("wrong answer not found");
    if (answer.selected_choice === null || answer.is_correct !== false) throw new Error("invalid wrong answer review target");

    const { data: existingReview, error: existingError } = await client
      .from("mock_exam_wrong_reviews")
      .select("id, review_count, repeat_wrong_count")
      .eq("user_id", userProfile.id)
      .eq("mock_exam_answer_id", body.mock_exam_answer_id)
      .maybeSingle();
    if (existingError) throw existingError;

    const reviewCount = Number(existingReview?.review_count ?? 0) + 1;
    const repeatWrongCount = Number(existingReview?.repeat_wrong_count ?? 0) + (body.review_result === "repeat_wrong" ? 1 : 0);
    const now = new Date().toISOString();

    const row = {
      id: existingReview?.id,
      user_id: userProfile.id,
      mock_exam_answer_id: body.mock_exam_answer_id,
      reviewed_choice: body.reviewed_choice,
      review_result: body.review_result,
      review_count: reviewCount,
      repeat_wrong_count: repeatWrongCount,
      last_reviewed_at: now,
      updated_at: now,
    };

    const { data: savedReview, error: saveError } = await client
      .from("mock_exam_wrong_reviews")
      .upsert(row, { onConflict: "user_id,mock_exam_answer_id" })
      .select("id, review_result, review_count, repeat_wrong_count, last_reviewed_at")
      .single();
    if (saveError) throw saveError;

    return NextResponse.json({ saved: true, review: savedReview });
  } catch (error) {
    const message = errorMessage(error, "failed to save wrong note review");
    const status = message.includes("login required") ? 401 : message.includes("invalid") ? 400 : message.includes("not found") ? 404 : 500;
    const maybeSupabaseError = error as { code?: unknown; details?: unknown; hint?: unknown; message?: unknown };
    console.error("mock exam wrong review save failed", {
      status,
      message,
      code: typeof maybeSupabaseError?.code === "string" ? maybeSupabaseError.code : null,
      details: typeof maybeSupabaseError?.details === "string" ? maybeSupabaseError.details : null,
      hint: typeof maybeSupabaseError?.hint === "string" ? maybeSupabaseError.hint : null,
    });
    return NextResponse.json({ error: message }, { status });
  }
}

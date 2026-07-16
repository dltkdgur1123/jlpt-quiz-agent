import { NextResponse, type NextRequest } from "next/server";

import { submitExamSeenFeedback } from "@/lib/feedback/exam-seen";
import { createSupabaseFeedbackRepository } from "@/lib/feedback/supabase-repository";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { buildUserProfileUpsert } from "@/lib/auth/user-sync";

interface RouteParams {
  params: Promise<{
    item_type: string;
    item_id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { item_type, item_id } = await params;

  try {
    const body = await request.json();
    const client = getSupabaseBrowserClient();
    const accessToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (!accessToken) {
      throw new Error("login required");
    }

    const { data: authData, error: authError } = await client.auth.getUser(accessToken);

    if (authError || !authData.user) {
      throw new Error("login required");
    }

    const profile = buildUserProfileUpsert(authData.user);
    const { data: userProfile, error: userError } = await client
      .from("users")
      .upsert(profile, { onConflict: "auth_provider,provider_user_id" })
      .select("id")
      .single();

    if (userError) {
      throw userError;
    }

    const repository = createSupabaseFeedbackRepository(client);
    const feedback = await submitExamSeenFeedback(repository, {
      session_user_id: userProfile.id,
      item_type,
      item_id,
      feedback: body.feedback,
    });

    return NextResponse.json(feedback);
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed to submit feedback";
    const status = message.includes("login required") ? 401 : message.includes("invalid") ? 400 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

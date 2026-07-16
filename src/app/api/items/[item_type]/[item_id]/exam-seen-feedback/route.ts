import { NextResponse, type NextRequest } from "next/server";

import { submitExamSeenFeedback } from "@/lib/feedback/exam-seen";
import { createSupabaseFeedbackRepository } from "@/lib/feedback/supabase-repository";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

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
    const repository = createSupabaseFeedbackRepository(client);
    const feedback = await submitExamSeenFeedback(repository, {
      session_user_id: body.session_user_id ?? null,
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

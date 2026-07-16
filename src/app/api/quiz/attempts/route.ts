import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { submitQuizAttempt } from "@/lib/quiz/attempt";
import { createSupabaseAttemptRepository } from "@/lib/quiz/attempt-repository";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const client = getSupabaseBrowserClient();
    const repository = createSupabaseAttemptRepository(client);
    const result = await submitQuizAttempt(repository, body);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed to submit attempt";
    const status = message.includes("invalid") ? 400 : message.includes("not found") ? 404 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

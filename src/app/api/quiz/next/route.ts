import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getNextQuiz } from "@/lib/quiz/next";
import { createSupabaseQuizRepository } from "@/lib/quiz/supabase-repository";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;

  try {
    const client = getSupabaseBrowserClient();
    const repository = createSupabaseQuizRepository(client);
    const quiz = await getNextQuiz(repository, {
      item_type: search.get("item_type"),
      jlpt_level: search.get("jlpt_level"),
    });

    return NextResponse.json(quiz);
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed to load quiz";
    const status = message.includes("invalid") ? 400 : message.includes("not found") ? 404 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

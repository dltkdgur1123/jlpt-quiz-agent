import { NextResponse, type NextRequest } from "next/server";

import { getItemRanking } from "@/lib/score/query";
import { createSupabaseScoreRepository } from "@/lib/score/supabase-repository";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export async function GET(request: NextRequest) {
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? 20);

  try {
    const repository = createSupabaseScoreRepository(getSupabaseBrowserClient());
    const ranking = await getItemRanking(repository, { limit });

    return NextResponse.json(ranking);
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed to load ranking";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

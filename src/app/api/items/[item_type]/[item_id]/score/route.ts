import { NextResponse, type NextRequest } from "next/server";

import { getItemScore } from "@/lib/score/query";
import { createSupabaseScoreRepository } from "@/lib/score/supabase-repository";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface RouteParams {
  params: Promise<{
    item_type: string;
    item_id: string;
  }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { item_type, item_id } = await params;

  try {
    const repository = createSupabaseScoreRepository(getSupabaseBrowserClient());
    const score = await getItemScore(repository, { item_type, item_id });

    return NextResponse.json(score);
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed to load score";
    const status = message.includes("invalid") ? 400 : message.includes("not found") ? 404 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

import { createClient } from "@supabase/supabase-js";

function normalizeSupabaseKey(value: string) {
  return value.trim().replace(/^Bearer\s+/i, "");
}

function createServerSupabaseClient(key: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  if (!supabaseUrl) {
    throw new Error("Missing Supabase URL environment variable");
  }

  return createClient(supabaseUrl, normalizeSupabaseKey(key), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function getSupabaseServerClient() {
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseAnonKey) {
    throw new Error("Missing Supabase anon environment variable");
  }

  return createServerSupabaseClient(supabaseAnonKey);
}

export function getSupabaseServiceRoleClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!serviceRoleKey) {
    throw new Error("Missing Supabase service role environment variable");
  }

  return createServerSupabaseClient(serviceRoleKey);
}

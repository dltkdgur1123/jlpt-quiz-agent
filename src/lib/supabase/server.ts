import { createClient } from "@supabase/supabase-js";

function normalizeSupabaseKey(value: string) {
  return value.trim().replace(/^Bearer\s+/i, "");
}

function supabaseUrl() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  if (!value) {
    throw new Error("Missing Supabase URL environment variable");
  }

  return value;
}

function supabaseAnonKey() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!value) {
    throw new Error("Missing Supabase anon environment variable");
  }

  return value;
}

function createServerSupabaseClient(key: string, accessToken?: string) {
  return createClient(supabaseUrl(), normalizeSupabaseKey(key), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${normalizeSupabaseKey(accessToken)}`,
          },
        }
      : undefined,
  });
}

export function getSupabaseServerClient() {
  return createServerSupabaseClient(supabaseAnonKey());
}

export function getSupabaseUserAccessClient(accessToken: string) {
  return createServerSupabaseClient(supabaseAnonKey(), accessToken);
}

export function getSupabaseServiceRoleClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!serviceRoleKey) {
    throw new Error("Missing Supabase service role environment variable");
  }

  return createServerSupabaseClient(serviceRoleKey);
}

export function getSupabasePrivilegedClient(accessToken: string) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (serviceRoleKey) {
    return createServerSupabaseClient(serviceRoleKey);
  }

  return getSupabaseUserAccessClient(accessToken);
}

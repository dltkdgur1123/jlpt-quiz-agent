import type { UserProfile } from "@/lib/db/types";

export interface SupabaseAuthUser {
  id: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    display_name?: string;
  };
}

export type UserProfileUpsert = Pick<
  UserProfile,
  "auth_provider" | "provider_user_id" | "display_name" | "last_seen_at"
>;

export function buildUserProfileUpsert(authUser: SupabaseAuthUser): UserProfileUpsert {
  const displayName =
    authUser.user_metadata?.display_name ??
    authUser.user_metadata?.full_name ??
    authUser.user_metadata?.name ??
    null;

  return {
    auth_provider: "supabase",
    provider_user_id: authUser.id,
    display_name: displayName,
    last_seen_at: new Date().toISOString(),
  };
}

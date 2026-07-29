"use client";

import { useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type DashboardGreetingSession = {
  user?: {
    email?: string | null;
    user_metadata?: Record<string, unknown>;
  };
} | null;

function displayNameFromSession(session: DashboardGreetingSession): string {
  const metadata = session?.user?.user_metadata ?? {};
  const rawName = metadata.nickname ?? metadata.display_name ?? metadata.full_name ?? metadata.name ?? metadata.user_name;
  const email = session?.user?.email ?? null;

  return typeof rawName === "string" && rawName.trim()
    ? rawName.trim()
    : email?.split("@")[0] || "";
}

export function DashboardGreeting() {
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    try {
      const supabase = getSupabaseBrowserClient();

      supabase.auth.getSession().then(({ data }) => {
        setDisplayName(data.session ? displayNameFromSession(data.session) : "");
      });

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setDisplayName(session ? displayNameFromSession(session) : "");
      });

      return () => data.subscription.unsubscribe();
    } catch {
      queueMicrotask(() => setDisplayName(""));
    }
  }, []);

  return <h1>{displayName ? `안녕하세요, ${displayName}님` : "안녕하세요"}</h1>;
}

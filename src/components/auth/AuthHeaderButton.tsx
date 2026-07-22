"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthHeaderButtonVariant = "home" | "figma";

export function AuthHeaderButton({ variant = "home" }: { variant?: AuthHeaderButtonVariant }) {
  const [isLoading, setIsLoading] = useState(true);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data }) => {
      setSessionEmail(data.session?.user.email ?? null);
      setIsLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user.email ?? null);
      setIsLoading(false);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const className = variant === "figma" ? "figma-auth-button" : "home-login-button";

  if (isLoading) {
    return (
      <span className={`${className} auth-header-button auth-header-loading`} aria-live="polite">
        확인 중
      </span>
    );
  }

  if (sessionEmail) {
    return (
      <Link className={`${className} auth-header-button auth-header-account`} href="/dashboard" title={sessionEmail}>
        대시보드
      </Link>
    );
  }

  return (
    <Link className={`${className} auth-header-button`} href="/login">
      로그인
    </Link>
  );
}

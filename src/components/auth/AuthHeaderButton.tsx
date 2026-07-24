"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthHeaderButtonVariant = "home" | "figma";
type HeaderUser = {
  email: string | null;
  nickname: string;
};

function nicknameFromSession(session: { user?: { email?: string | null; user_metadata?: Record<string, unknown> } } | null): HeaderUser | null {
  const user = session?.user;
  if (!user) return null;

  const metadata = user.user_metadata ?? {};
  const rawName = metadata.full_name ?? metadata.name ?? metadata.user_name ?? metadata.nickname;
  const email = user.email ?? null;
  const nickname = typeof rawName === "string" && rawName.trim()
    ? rawName.trim()
    : email?.split("@")[0] || "내 계정";

  return { email, nickname };
}

export function AuthHeaderButton({ variant = "home" }: { variant?: AuthHeaderButtonVariant }) {
  const [isLoading, setIsLoading] = useState(true);
  const [headerUser, setHeaderUser] = useState<HeaderUser | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data }) => {
      setHeaderUser(nicknameFromSession(data.session));
      setIsLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setHeaderUser(nicknameFromSession(session));
      setIsLoading(false);
      if (!session) setIsMenuOpen(false);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [isMenuOpen]);

  const className = variant === "figma" ? "figma-auth-button" : "home-login-button";
  const initial = useMemo(() => headerUser?.nickname.trim().charAt(0).toUpperCase() || "U", [headerUser]);

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    setHeaderUser(null);
    setIsMenuOpen(false);
  }

  if (isLoading) {
    return (
      <span className={`${className} auth-header-button auth-header-loading`} aria-live="polite">
        확인 중
      </span>
    );
  }

  if (headerUser) {
    return (
      <div className="auth-profile-menu" ref={menuRef}>
        <button
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
          className="auth-profile-trigger"
          title={headerUser.email ?? headerUser.nickname}
          type="button"
          onClick={() => setIsMenuOpen((value) => !value)}
        >
          <span className="auth-profile-avatar" aria-hidden="true">{initial}</span>
          <span className="auth-profile-name">{headerUser.nickname}</span>
        </button>
        {isMenuOpen ? (
          <div className="auth-profile-dropdown" role="menu">
            {headerUser.email ? <p>{headerUser.email}</p> : null}
            <Link href="/settings" role="menuitem" onClick={() => setIsMenuOpen(false)}>설정</Link>
            <button type="button" role="menuitem" onClick={signOut}>로그아웃</button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <Link className={`${className} auth-header-button`} href="/login">
      로그인
    </Link>
  );
}

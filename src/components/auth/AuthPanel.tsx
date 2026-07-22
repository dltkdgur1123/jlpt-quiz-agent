"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type OAuthProvider = "google" | "kakao" | `custom:${string}`;
type AuthPanelVariant = "compact" | "page";

const providers: Array<{ provider: OAuthProvider; label: string; tone: string; mark: string }> = [
  { provider: "google", label: "Google", tone: "google", mark: "G" },
  { provider: "kakao", label: "Kakao", tone: "kakao", mark: "K" },
  { provider: "custom:naver", label: "Naver", tone: "naver", mark: "N" },
];

export function AuthPanel({ variant = "compact" }: { variant?: AuthPanelVariant }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setMessage(error.message);
      }
      setSessionEmail(data.session?.user.email ?? null);
      setIsAuthLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user.email ?? null);
      setIsAuthLoading(false);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const isSignedIn = Boolean(sessionEmail);

  async function signInWithProvider(provider: OAuthProvider) {
    if (isSignedIn) return;

    const supabase = getSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });

    if (error) {
      setMessage(error.message);
    }
  }

  async function signInWithEmailLink() {
    if (isSignedIn) return;

    if (!email) {
      setMessage("Email을 입력해주세요.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    setMessage(error ? error.message : "이메일 링크를 보냈습니다.");
  }

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      setMessage(error.message);
      return;
    }

    setSessionEmail(null);
    setMessage("로그아웃되었습니다.");
  }

  if (isSignedIn) {
    return (
      <section className={`auth-card auth-card--${variant} auth-card--signed-in`} aria-label="로그인된 계정">
        <p className="auth-status">{sessionEmail} 계정으로 로그인되어 있습니다.</p>
        <Link className="auth-dashboard-link" href="/dashboard">대시보드로 이동</Link>
        <button className="auth-signout-button" type="button" onClick={signOut}>
          로그아웃
        </button>
        {message ? <p className="auth-message">{message}</p> : null}
      </section>
    );
  }

  return (
    <section className={`auth-card auth-card--${variant}`} aria-label="로그인">
      {isAuthLoading ? <p className="auth-helper">확인 중</p> : null}

      <div className="auth-provider-grid">
        {providers.map(({ provider, label, tone, mark }) => (
          <button
            className={`auth-provider-button auth-provider-${tone}`}
            key={provider}
            type="button"
            disabled={isAuthLoading}
            onClick={() => signInWithProvider(provider)}
          >
            <span aria-hidden="true">{mark}</span>
            {label} 로그인
          </button>
        ))}
      </div>

      <div className="auth-divider"><span>또는 이메일 링크</span></div>

      <label className="auth-email-field">
        Email
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          disabled={isAuthLoading}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <button className="auth-email-submit" type="button" disabled={isAuthLoading} onClick={signInWithEmailLink}>
        이메일 링크로 로그인
      </button>
      {message ? <p className="auth-message">{message}</p> : null}
    </section>
  );
}

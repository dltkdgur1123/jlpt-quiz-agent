"use client";

import { useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type OAuthProvider = "google" | "kakao" | `custom:${string}`;

const providers: Array<{ provider: OAuthProvider; label: string }> = [
  { provider: "google", label: "Google" },
  { provider: "kakao", label: "Kakao" },
  { provider: "custom:naver", label: "Naver" },
];

export function AuthPanel() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function signInWithProvider(provider: OAuthProvider) {
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

  return (
    <section className="auth-card" aria-label="로그인">
      <p className="section-eyebrow">로그인</p>
      <h2>출제 경험 제보를 남기려면 로그인하세요</h2>
      <div className="auth-provider-grid">
        {providers.map(({ provider, label }) => (
          <button key={provider} type="button" onClick={() => signInWithProvider(provider)}>
            {label} 로그인
          </button>
        ))}
      </div>
      <label>
        Email
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <button type="button" onClick={signInWithEmailLink}>
        이메일 링크로 로그인
      </button>
      {message ? <p>{message}</p> : null}
    </section>
  );
}

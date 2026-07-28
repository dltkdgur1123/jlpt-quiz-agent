"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type CallbackStatus = "loading" | "error";
type CallbackDiagnostics = {
  hasCode: boolean;
  hasHashSession: boolean;
  oauthError: string | null;
  oauthErrorDescription: string | null;
};

function cleanCallbackUrl() {
  window.history.replaceState({}, document.title, "/auth/callback");
}

function safeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  if (value.startsWith("/auth/callback") || value.startsWith("/login")) return "/";
  return value;
}

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<CallbackStatus>("loading");
  const [message, setMessage] = useState("로그인 정보를 확인하고 있습니다.");
  const [diagnostics, setDiagnostics] = useState<CallbackDiagnostics | null>(null);

  useEffect(() => {
    async function completeSignIn() {
      const supabase = getSupabaseBrowserClient();
      const url = new URL(window.location.href);
      const next = safeNextPath(new URLSearchParams(window.location.search).get("next"));
      const code = url.searchParams.get("code");
      const oauthError = url.searchParams.get("error") ?? url.searchParams.get("error_code");
      const oauthErrorDescription = url.searchParams.get("error_description") ?? url.searchParams.get("error_message");
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      setDiagnostics({
        hasCode: Boolean(code),
        hasHashSession: Boolean(accessToken && refreshToken),
        oauthError,
        oauthErrorDescription,
      });

      try {
        if (oauthError) {
          throw new Error(oauthErrorDescription ? `${oauthError}: ${oauthErrorDescription}` : oauthError);
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw new Error(`세션 교환 실패: ${error.message}`);
        } else if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
        } else {
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (!data.session) {
            throw new Error("로그인 세션을 찾을 수 없습니다. OAuth code 또는 세션 토큰이 callback URL에 포함되지 않았습니다.");
          }
        }

        cleanCallbackUrl();
        window.location.replace(next);
      } catch (error) {
        cleanCallbackUrl();
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "로그인 처리에 실패했습니다.");
      }
    }

    void completeSignIn();
  }, []);

  return (
    <main className="auth-callback-page">
      <section className={`auth-callback-card auth-callback-card--${status}`}>
        <p className="section-eyebrow">Auth callback</p>
        <h1>{status === "error" ? "로그인 처리 실패" : "로그인 처리 중"}</h1>
        <p>{message}</p>
        {status === "error" && diagnostics ? (
          <dl className="auth-callback-diagnostics" aria-label="로그인 진단 정보">
            <div>
              <dt>OAuth code 수신</dt>
              <dd>{diagnostics.hasCode ? "예" : "아니요"}</dd>
            </div>
            <div>
              <dt>세션 토큰 수신</dt>
              <dd>{diagnostics.hasHashSession ? "예" : "아니요"}</dd>
            </div>
            {diagnostics.oauthError ? (
              <div>
                <dt>OAuth error</dt>
                <dd>{diagnostics.oauthErrorDescription ?? diagnostics.oauthError}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
        {status === "error" ? <Link href="/login">다시 로그인하기</Link> : null}
      </section>
    </main>
  );
}

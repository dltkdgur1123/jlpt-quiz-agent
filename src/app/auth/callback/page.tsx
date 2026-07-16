"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type CallbackStatus = "loading" | "success" | "error";

function cleanCallbackUrl() {
  window.history.replaceState({}, document.title, "/auth/callback");
}

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<CallbackStatus>("loading");
  const [message, setMessage] = useState("로그인 정보를 확인하고 있습니다.");

  useEffect(() => {
    async function completeSignIn() {
      const supabase = getSupabaseBrowserClient();
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
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
            throw new Error("로그인 세션을 찾을 수 없습니다.");
          }
        }

        cleanCallbackUrl();
        setStatus("success");
        setMessage("로그인이 완료되었습니다. 홈으로 이동해도 됩니다.");
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
        <h1>{status === "success" ? "로그인 완료" : "로그인 처리 중"}</h1>
        <p>{message}</p>
        <Link href="/">홈으로 이동</Link>
      </section>
    </main>
  );
}

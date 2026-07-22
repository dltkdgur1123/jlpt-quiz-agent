"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthState = "loading" | "signed-out" | "signed-in";

function useHomeAuthState() {
  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data }) => {
      setAuthState(data.session ? "signed-in" : "signed-out");
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState(session ? "signed-in" : "signed-out");
    });

    return () => data.subscription.unsubscribe();
  }, []);

  return authState;
}

export function HomeRecentMockExamLine() {
  const authState = useHomeAuthState();
  const isSignedIn = authState === "signed-in";
  const isLoading = authState === "loading";

  return (
    <Link className="home-recent-line" href={isSignedIn ? "/dashboard" : "/login"} aria-busy={isLoading}>
      <span aria-hidden="true">◷</span>
      <strong>최근 모의고사 기록</strong>
      <em>{isSignedIn ? "대시보드에서 이어서 보기" : isLoading ? "기록 확인 중" : "로그인 후 이어서 풀기"}</em>
      <b aria-hidden="true">›</b>
    </Link>
  );
}

export function HomeRecentMockExamGrid() {
  const authState = useHomeAuthState();
  const isSignedIn = authState === "signed-in";

  return (
    <section className="home-progress-grid" id="continue-learning" aria-label="최근 모의고사와 최근 결과">
      <article className="home-progress-grid-item">
        <span>최근 모의고사</span>
        <strong>{isSignedIn ? "저장된 풀이 기록을 확인하세요" : "로그인하면 풀이 기록이 저장됩니다"}</strong>
        <p>
          {isSignedIn
            ? "중단한 모의고사와 제출한 결과를 대시보드에서 이어서 볼 수 있습니다."
            : "중단한 모의고사와 오답 복습을 이어서 볼 수 있습니다."}
        </p>
        <Link href={isSignedIn ? "/dashboard" : "/login"}>
          {isSignedIn ? "최근 기록 보기 →" : "로그인하고 기록 저장 →"}
        </Link>
      </article>
      <article className="home-progress-grid-item">
        <span>최근 결과</span>
        <strong>제출한 모의고사 리포트</strong>
        <p>정답률, 미응답, 취약 유형을 학습 기록에서 확인합니다.</p>
        <Link href="/dashboard">학습 기록 보기 →</Link>
      </article>
    </section>
  );
}

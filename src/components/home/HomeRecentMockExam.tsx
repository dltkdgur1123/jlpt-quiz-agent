"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthState = "loading" | "signed-out" | "signed-in";
type MockExamDraft = {
  set_code: string;
  set_title: string;
  jlpt_level: string;
  question_count: number;
  href: string;
  selected_answers: Record<string, string>;
  current_question_index: number;
  updated_at: string;
};

const IN_PROGRESS_STORAGE_KEY = "jlpt-mock-exam-in-progress";

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

function readDraft() {
  if (typeof window === "undefined") return null;

  try {
    const rawDraft = window.localStorage.getItem(IN_PROGRESS_STORAGE_KEY);
    if (!rawDraft) return null;
    const draft = JSON.parse(rawDraft) as Partial<MockExamDraft>;
    if (!draft.href || !draft.set_code || !draft.set_title) return null;
    return draft as MockExamDraft;
  } catch {
    return null;
  }
}

export function HomeRecentMockExamLine() {
  return (
    <div className="home-recent-actions" aria-label="최근 모의고사 빠른 이동">
      <Link className="home-recent-line" href="/dashboard">
        <span aria-hidden="true">▦</span>
        <strong>최근 모의고사 기록</strong>
        <em>대시보드에서 보기</em>
        <b aria-hidden="true">›</b>
      </Link>
      <ResumeMockExamLine />
    </div>
  );
}

function ResumeMockExamLine() {
  const [draft, setDraft] = useState<MockExamDraft | null>(null);

  useEffect(() => {
    queueMicrotask(() => setDraft(readDraft()));
  }, []);

  const answeredCount = draft ? Object.keys(draft.selected_answers ?? {}).length : 0;

  return (
    <Link className="home-recent-line" href={draft?.href ?? "/mock-exams/n5-realistic-001"}>
      <span aria-hidden="true">◷</span>
      <strong>지난 문제 이어서 풀기</strong>
      <em>{draft ? `${draft.jlpt_level} · ${answeredCount}/${draft.question_count} 진행 중` : "이어갈 문제가 없으면 새로 시작"}</em>
      <b aria-hidden="true">›</b>
    </Link>
  );
}

export function HomeRecentMockExamGrid() {
  const authState = useHomeAuthState();
  const [draft, setDraft] = useState<MockExamDraft | null>(null);
  const isSignedIn = authState === "signed-in";

  useEffect(() => {
    queueMicrotask(() => setDraft(readDraft()));
  }, []);

  const answeredCount = draft ? Object.keys(draft.selected_answers ?? {}).length : 0;

  return (
    <section className="home-progress-grid" id="continue-learning" aria-label="최근 모의고사 기록과 지난 문제 이어풀기">
      <article className="home-progress-grid-item">
        <span>최근 모의고사 기록</span>
        <strong>{isSignedIn ? "제출한 모의고사 리포트" : "로그인하면 풀이 기록이 저장됩니다"}</strong>
        <p>
          {isSignedIn
            ? "제출한 결과, 정답률, 미응답, 취약 유형을 대시보드에서 확인합니다."
            : "로그인 후 모의고사를 제출하면 기록과 결과 리포트가 저장됩니다."}
        </p>
        <Link href={isSignedIn ? "/dashboard" : "/login"}>
          {isSignedIn ? "대시보드로 이동 →" : "로그인하고 기록 저장 →"}
        </Link>
      </article>
      <article className="home-progress-grid-item">
        <span>지난 문제 이어서 풀기</span>
        <strong>{draft ? `${draft.set_title}` : "아직 이어서 풀 문제가 없습니다"}</strong>
        <p>
          {draft
            ? `${draft.jlpt_level} · ${answeredCount}/${draft.question_count}문항 진행 중인 모의고사를 이어서 풉니다.`
            : "모의고사를 시작하면 답변 상태와 현재 문항이 이 브라우저에 임시 저장됩니다."}
        </p>
        <Link href={draft?.href ?? "/mock-exams/n5-realistic-001"}>
          {draft ? "지난 문제 이어서 풀기 →" : "새 모의고사 시작 →"}
        </Link>
      </article>
    </section>
  );
}

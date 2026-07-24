"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type DashboardAttempt = {
  id: string;
  submitted_at: string | null;
  score_total: number | null;
  score_max: number | null;
  correct_count: number | null;
  question_count: number;
  mock_exam_sets?: { set_title?: string | null; jlpt_level?: string | null } | null;
};

type WrongNoteItem = {
  id: string;
  attempt_id: string;
  question_no: number | null;
  section_label: string;
  status: "wrong" | "unanswered";
};

type DashboardResponse = {
  attempts: DashboardAttempt[];
  total_questions: number;
  average_rate: number;
  wrong_note?: {
    total_count: number;
    wrong_count: number;
    unanswered_count: number;
    recent_items: WrongNoteItem[];
  };
};

export function DashboardAttemptData() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "login_required" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    async function loadAttempts() {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token;

        if (!accessToken) {
          if (!cancelled) setStatus("login_required");
          return;
        }

        const response = await fetch("/api/mock-exams/attempts", {
          headers: { authorization: `Bearer ${accessToken}` },
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "failed to load dashboard attempts");

        if (!cancelled) {
          setData(result);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    loadAttempts();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return <p className="dashboard-live-note">학습 기록을 불러오는 중입니다.</p>;
  }

  if (status === "login_required") {
    return <p className="dashboard-live-note">로그인 후 모의고사를 제출하면 이 영역이 실제 기록으로 바뀝니다.</p>;
  }

  if (status === "error") {
    return <p className="dashboard-live-note">학습 기록을 불러오지 못했습니다. 잠시 후 다시 확인해주세요.</p>;
  }

  const latest = data?.attempts?.[0];

  if (!latest) {
    return <p className="dashboard-live-note">아직 저장된 모의고사 기록이 없습니다.</p>;
  }

  const wrongNote = data?.wrong_note;
  const recentItems = wrongNote?.recent_items ?? [];

  return (
    <div className="dashboard-live-stack">
      <div className="dashboard-live-data">
        <p>저장된 최근 기록</p>
        <strong>{latest.score_total ?? latest.correct_count} / {latest.score_max ?? latest.question_count}</strong>
        <span>평균 정답률 {data?.average_rate ?? 0}% · 누적 풀이 {data?.total_questions ?? 0}문항</span>
      </div>

      <section className="dashboard-wrong-note" id="wrong-note" aria-label="오답노트">
        <div>
          <p>오답노트</p>
          <h3>{wrongNote?.total_count ? `복습할 문제 ${wrongNote.total_count}문항` : "복습할 문제가 없습니다"}</h3>
          <span>
            {wrongNote?.total_count
              ? `오답 ${wrongNote.wrong_count} · 미응답 ${wrongNote.unanswered_count}`
              : "최근 모의고사에서 틀렸거나 풀지 않은 문제가 여기에 기록됩니다."}
          </span>
        </div>

        {recentItems.length > 0 ? (
          <ul>
            {recentItems.map((item) => (
              <li key={item.id}>
                <strong>{item.question_no ? `${item.question_no}번` : "문항"}</strong>
                <span>{item.section_label}</span>
                <em data-status={item.status}>{item.status === "wrong" ? "오답" : "미응답"}</em>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
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
  question?: {
    id: string;
    question_text: string;
    choice_a: string;
    choice_b: string;
    choice_c: string;
    choice_d: string;
    correct_choice: "A" | "B" | "C" | "D";
    explanation: string;
  };
};

type WeeklyActivity = {
  date: string;
  question_count: number;
};

type SectionSummary = {
  section_key: "vocab" | "grammar" | "reading";
  section_label: string;
  correct_count: number;
  question_count: number;
  correct_rate: number;
  weakness_label: string;
};

type DashboardResponse = {
  attempts: DashboardAttempt[];
  attempt_count: number;
  total_questions: number;
  average_rate: number;
  weekly_activity: WeeklyActivity[];
  section_summary: SectionSummary[];
  wrong_note?: {
    total_count: number;
    wrong_count: number;
    unanswered_count: number;
    recent_items: WrongNoteItem[];
  };
};

type DashboardDataState = {
  data: DashboardResponse | null;
  status: "loading" | "ready" | "login_required" | "error";
};

const LOCAL_ATTEMPTS_STORAGE_KEY = "jlpt-mock-exam-local-attempts";

const SECTION_NOTES: Record<SectionSummary["section_key"], string> = {
  vocab: "한자읽기·표기·문맥 어휘를 우선 점검합니다.",
  grammar: "문법형식 판단과 문장 만들기를 복습합니다.",
  reading: "단문·중문·정보검색 흐름을 다시 확인합니다.",
};

type LocalMockExamSavedAttempt = {
  id: string;
  submitted_at: string;
  set_title: string;
  jlpt_level: string;
  score_total: number;
  score_max: number;
  correct_count: number;
  question_count: number;
  section_results?: SectionSummary[];
  wrong_note_items?: WrongNoteItem[];
};

function readLocalDashboardAttempts() {
  if (typeof window === "undefined") return [] as LocalMockExamSavedAttempt[];

  try {
    const rawAttempts = window.localStorage.getItem(LOCAL_ATTEMPTS_STORAGE_KEY);
    if (!rawAttempts) return [];
    const attempts = JSON.parse(rawAttempts) as LocalMockExamSavedAttempt[];
    return Array.isArray(attempts) ? attempts : [];
  } catch {
    return [];
  }
}

function emptySectionSummary(): SectionSummary[] {
  return [
    { section_key: "vocab", section_label: "문자·어휘", correct_count: 0, question_count: 0, correct_rate: 0, weakness_label: "기록 없음" },
    { section_key: "grammar", section_label: "문법", correct_count: 0, question_count: 0, correct_rate: 0, weakness_label: "기록 없음" },
    { section_key: "reading", section_label: "읽기", correct_count: 0, question_count: 0, correct_rate: 0, weakness_label: "기록 없음" },
  ];
}

function localAnsweredQuestionCount(attempt: LocalMockExamSavedAttempt) {
  const selectedWrongCount = (attempt.wrong_note_items ?? []).filter((item) => item.status === "wrong").length;
  const inferredCount = Number(attempt.correct_count ?? 0) + selectedWrongCount;
  if (inferredCount > 0) return Math.min(Number(attempt.question_count || inferredCount), inferredCount);
  return Number(attempt.question_count ?? 0);
}

function buildLocalDashboardResponse(): DashboardResponse | null {
  const localAttempts = readLocalDashboardAttempts();
  if (!localAttempts.length) return null;

  const attempts = localAttempts.map((attempt) => ({
    id: attempt.id,
    submitted_at: attempt.submitted_at,
    score_total: attempt.score_total,
    score_max: attempt.score_max,
    correct_count: attempt.correct_count,
    question_count: localAnsweredQuestionCount(attempt),
    mock_exam_sets: { set_title: `${attempt.set_title} · 임시 저장`, jlpt_level: attempt.jlpt_level },
  }));
  const totalQuestions = localAttempts.reduce((sum, attempt) => sum + localAnsweredQuestionCount(attempt), 0);
  const averageRate = localAttempts.length
    ? Math.round(
        (localAttempts.reduce((sum, attempt) => sum + Number(attempt.correct_count ?? 0) / Math.max(localAnsweredQuestionCount(attempt), 1), 0) /
          localAttempts.length) *
          100,
      )
    : 0;
  const weeklyMap = new Map<string, number>();
  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    weeklyMap.set(date.toISOString().slice(0, 10), 0);
  }
  for (const attempt of localAttempts) {
    const day = new Date(attempt.submitted_at).toISOString().slice(0, 10);
    if (weeklyMap.has(day)) weeklyMap.set(day, (weeklyMap.get(day) ?? 0) + localAnsweredQuestionCount(attempt));
  }
  const sectionMap = new Map<string, SectionSummary>();
  for (const section of emptySectionSummary()) sectionMap.set(section.section_key, { ...section });
  for (const attempt of localAttempts) {
    for (const section of attempt.section_results ?? []) {
      const current = sectionMap.get(section.section_key) ?? { ...section, correct_count: 0, question_count: 0 };
      current.correct_count += Number(section.correct_count ?? 0);
      current.question_count += Number(section.question_count ?? 0);
      current.correct_rate = current.question_count ? Math.round((current.correct_count / current.question_count) * 100) : 0;
      current.weakness_label = current.question_count === 0 ? "기록 없음" : current.correct_rate < 60 ? "복습 필요" : "유지 권장";
      sectionMap.set(section.section_key, current);
    }
  }
  const wrongItems = localAttempts.flatMap((attempt) => attempt.wrong_note_items ?? []).filter((item) => item.status === "wrong");

  return {
    attempts,
    attempt_count: localAttempts.length,
    total_questions: totalQuestions,
    average_rate: averageRate,
    weekly_activity: Array.from(weeklyMap.entries()).map(([date, question_count]) => ({ date, question_count })),
    section_summary: Array.from(sectionMap.values()),
    wrong_note: {
      total_count: wrongItems.length,
      wrong_count: wrongItems.length,
      unanswered_count: 0,
      recent_items: wrongItems.slice(0, 6),
    },
  };
}

function useDashboardAttemptData(): DashboardDataState {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [status, setStatus] = useState<DashboardDataState["status"]>("loading");

  useEffect(() => {
    let cancelled = false;

    async function loadAttempts() {
      const localDashboardData = buildLocalDashboardResponse();

      try {
        const supabase = getSupabaseBrowserClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token;

        if (!accessToken) {
          if (!cancelled) {
            if (localDashboardData) {
              setData(localDashboardData);
              setStatus("ready");
            } else {
              setStatus("login_required");
            }
          }
          return;
        }

        const response = await fetch("/api/mock-exams/attempts", {
          headers: { authorization: `Bearer ${accessToken}` },
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "failed to load dashboard attempts");

        if (!cancelled) {
          setData(localDashboardData && localDashboardData.attempt_count > 0 && result.attempt_count === 0 ? localDashboardData : result);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) {
          if (localDashboardData) {
            setData(localDashboardData);
            setStatus("ready");
          } else {
            setStatus("error");
          }
        }
      }
    }

    loadAttempts();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, status };
}

function formatDate(value: string | null) {
  if (!value) return "날짜 없음";
  return new Intl.DateTimeFormat("ko-KR", { month: "numeric", day: "numeric" }).format(new Date(value));
}

function formatWeekday(value: string) {
  return new Intl.DateTimeFormat("ko-KR", { month: "numeric", day: "numeric", weekday: "short" }).format(new Date(value));
}

function latestLevel(data: DashboardResponse | null) {
  const set = data?.attempts?.[0]?.mock_exam_sets;
  return set?.jlpt_level ?? "-";
}

function sectionTone(index: number) {
  return ["orange", "purple", "blue"][index % 3];
}

function DashboardStatGrid({ data, status }: DashboardDataState) {
  const stats = [
    {
      label: "최근 기록",
      value: status === "ready" ? `${data?.attempt_count ?? 0}회` : "-",
      note: "저장된 모의고사 제출 기준",
      tone: "blue",
    },
    {
      label: "누적 풀이",
      value: status === "ready" ? `${data?.total_questions ?? 0}문항` : "-",
      note: "저장된 답안 기준",
      tone: "mint",
    },
    {
      label: "평균 정답률",
      value: status === "ready" ? `${data?.average_rate ?? 0}%` : "-",
      note: "학습 참고 지표",
      tone: "orange",
    },
    {
      label: "최근 선택 레벨",
      value: status === "ready" ? latestLevel(data) : "-",
      note: "최근 제출 세트 기준",
      tone: "blue",
    },
  ];

  return (
    <section className="dashboard-stat-grid" aria-label="학습 요약">
      {stats.map((stat) => (
        <article className="dashboard-stat-card" key={stat.label}>
          <i className={`tone-${stat.tone}`} />
          <span>{stat.label}</span>
          <strong>{stat.value}</strong>
          <small>{stat.note}</small>
        </article>
      ))}
    </section>
  );
}

function DashboardAttemptSummary({ data, status }: DashboardDataState) {
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

  return (
    <div className="dashboard-live-data">
      <p>저장된 최근 기록</p>
      <strong>{latest.score_total ?? latest.correct_count} / {latest.score_max ?? latest.question_count}</strong>
      <span>평균 정답률 {data?.average_rate ?? 0}% · 누적 풀이 {data?.total_questions ?? 0}문항</span>
    </div>
  );
}

function DashboardActivityAndGoal({ data, status }: DashboardDataState) {
  const weeklyRows = data?.weekly_activity ?? [];
  const bars = weeklyRows.length ? weeklyRows.map((row) => row.question_count) : [0, 0, 0, 0, 0, 0, 0];
  const weekLabels = weeklyRows.length ? weeklyRows.map((row) => formatWeekday(row.date)) : ["-", "-", "-", "-", "-", "-", "-"];
  const weeklyGoal = 70;
  const weeklyMax = Math.max(...bars, weeklyGoal, 1);
  const weeklyTotal = bars.reduce((sum, value) => sum + value, 0);
  const weeklyAverage = Math.round(weeklyTotal / Math.max(bars.length, 1));
  const weeklyPeakIndex = bars.indexOf(Math.max(...bars));
  const monthlyGoal = 3;
  const monthlySubmitted = data?.attempt_count ?? 0;
  const monthlyProgress = Math.min(100, Math.round((monthlySubmitted / monthlyGoal) * 100));
  const nextGoalCount = Math.max(0, monthlyGoal - monthlySubmitted);
  const goalLevel = latestLevel(data) === "-" ? "JLPT" : latestLevel(data);

  return (
    <section className="dashboard-grid-top">
      <article className="dashboard-panel dashboard-activity">
        <div className="dashboard-activity-head">
          <div>
            <h2>주간 학습 활동</h2>
            <p>최근 7일 문제 풀이 수</p>
          </div>
          <strong>{status === "ready" ? `${weeklyTotal}문항` : "-"}</strong>
        </div>
        <div className="dashboard-activity-summary" aria-label="주간 학습 활동 요약">
          <span><b>{weeklyAverage}문항</b><em>일평균</em></span>
          <span><b>{weekLabels[weeklyPeakIndex] ?? "-"}</b><em>최고 활동일</em></span>
          <span><b>{weeklyGoal}문항</b><em>일 목표</em></span>
        </div>
        <div className="dashboard-bars" aria-label="최근 7일 요일별 문제 풀이 수">
          <div className="dashboard-bars-goal" aria-hidden="true"><span>목표 {weeklyGoal}</span></div>
          {bars.map((bar, index) => (
            <div className={index === weeklyPeakIndex && bar > 0 ? "hot" : ""} key={`${weekLabels[index]}-${index}`}>
              <i style={{ height: `${Math.max(56, Math.round((bar / weeklyMax) * 168))}px` }}>
                <b>{bar}<small>문항</small></b>
              </i>
              <span>{weekLabels[index]}</span>
            </div>
          ))}
        </div>
      </article>
      <article className="dashboard-goal-card">
        <span>이번 달 목표</span>
        <h2>{goalLevel} 모의고사<br />3회 제출하기</h2>
        <strong>{monthlySubmitted} / {monthlyGoal}회</strong>
        <div className="figma-progress"><i style={{ width: `${monthlyProgress}%` }} /></div>
        <p>{nextGoalCount ? `다음 목표까지 ${nextGoalCount}회 남음` : "이번 달 목표를 달성했습니다"}</p>
        <Link className="figma-primary" href="/mock-exams/n5-realistic-001">계속 학습하기</Link>
      </article>
    </section>
  );
}

function DashboardRecentExamList({ data, status }: DashboardDataState) {
  const attempts = data?.attempts ?? [];

  return (
    <article className="dashboard-panel dashboard-recent">
      <div className="panel-title-row dashboard-action-head"><h2>최근 모의고사</h2><a href="#history">전체 보기 →</a></div>
      {status === "loading" ? (
        <p>최근 모의고사 기록을 불러오는 중입니다.</p>
      ) : status === "login_required" ? (
        <p>로그인하면 제출한 모의고사 기록이 여기에 저장됩니다.</p>
      ) : status === "error" ? (
        <p>최근 모의고사 기록을 불러오지 못했습니다.</p>
      ) : attempts.length ? (
        attempts.map((exam) => {
          const set = exam.mock_exam_sets;
          const rate = Math.round((Number(exam.correct_count ?? 0) / Number(exam.question_count || 1)) * 100);
          return (
            <div className="recent-exam-row" key={exam.id}>
              <span>{set?.jlpt_level ?? "JLPT"}</span>
              <div><strong>{set?.set_title ?? "실전 모의고사"}</strong><small>{formatDate(exam.submitted_at)}</small></div>
              <b>{exam.score_total ?? exam.correct_count} / {exam.score_max ?? exam.question_count}</b>
              <em data-good={rate >= 60}>{rate >= 60 ? "유지 권장" : "보완 필요"}</em>
            </div>
          );
        })
      ) : (
        <p>아직 저장된 모의고사 기록이 없습니다.</p>
      )}
    </article>
  );
}

function DashboardWrongNoteCard({ data, status }: DashboardDataState) {
  const wrongNote = data?.wrong_note;
  const recentItems = (wrongNote?.recent_items ?? []).filter((item) => item.status === "wrong");
  const wrongCount = wrongNote?.wrong_count ?? 0;

  return (
    <section className="dashboard-panel dashboard-wrong-note dashboard-wrong-note-card" id="wrong-note" aria-label="오답노트">
      <div className="dashboard-wrong-note-head dashboard-action-head">
        <div>
          <p>오답노트</p>
          <h2>{wrongCount ? `틀린 문제 ${wrongCount}개` : "틀린 문제가 없습니다"}</h2>
        </div>
        <Link href="/wrong-note">다시 풀기 →</Link>
      </div>

      {status === "loading" ? (
        <span>오답노트 기록을 불러오는 중입니다.</span>
      ) : status === "login_required" ? (
        <span>로그인하면 틀린 문제가 여기에 저장됩니다.</span>
      ) : status === "error" ? (
        <span>오답노트 기록을 불러오지 못했습니다.</span>
      ) : wrongCount ? (
        <>
          <div className="dashboard-wrong-note-summary" aria-label="오답노트 요약">
            <em>오답 <b>{wrongCount}</b></em>
          </div>
          <div className="dashboard-wrong-note-recent">
            <p>최근 오답</p>
            <ul>
              {recentItems.slice(0, 3).map((item) => (
                <li key={item.id}>
                  <strong>{item.question_no ? `${item.question_no}번` : "문항"}</strong>
                  <span>{item.section_label}</span>
                  <em data-status="wrong">오답</em>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <span>최근 모의고사에서 틀린 문제가 여기에 기록됩니다.</span>
      )}
    </section>
  );
}

function DashboardWeakAreaPanel({ data, status }: DashboardDataState) {
  const weakAreas = data?.section_summary ?? [
    { section_key: "vocab", section_label: "문자·어휘", correct_count: 0, question_count: 0, correct_rate: 0, weakness_label: "기록 없음" },
    { section_key: "grammar", section_label: "문법", correct_count: 0, question_count: 0, correct_rate: 0, weakness_label: "기록 없음" },
    { section_key: "reading", section_label: "읽기", correct_count: 0, question_count: 0, correct_rate: 0, weakness_label: "기록 없음" },
  ] satisfies SectionSummary[];

  return (
    <section className="dashboard-panel dashboard-weak dashboard-weak-full" aria-label="취약 영역 분석">
      <div className="dashboard-weak-head dashboard-action-head">
        <div>
          <h2>취약 영역 분석</h2>
          <p>오답노트와 최근 모의고사 기준으로 보완이 필요한 영역을 정리합니다.</p>
        </div>
        <Link href="/mock-exams/n5-realistic-001">약한 영역 다시 풀기 →</Link>
      </div>
      <div className="dashboard-weak-grid">
        {weakAreas.map((area, index) => (
          <div className={`weak-row weak-${sectionTone(index)}`} key={area.section_key}>
            <p><strong>{area.section_label}</strong><b>{status === "ready" ? `${area.correct_rate}%` : "-"}</b></p>
            <div><i style={{ width: `${status === "ready" ? area.correct_rate : 0}%` }} /></div>
            <span>{area.question_count ? `${area.weakness_label} · ${area.correct_count}/${area.question_count}문항 · ${SECTION_NOTES[area.section_key]}` : "저장된 기록이 쌓이면 취약 영역을 계산합니다."}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DashboardLiveData() {
  const state = useDashboardAttemptData();

  return (
    <>
      <DashboardStatGrid {...state} />
      <DashboardAttemptSummary {...state} />
      <DashboardActivityAndGoal {...state} />
      <section className="dashboard-grid-bottom" id="history">
        <DashboardRecentExamList {...state} />
        <DashboardWrongNoteCard {...state} />
      </section>
      <DashboardWeakAreaPanel {...state} />
    </>
  );
}

export function DashboardAttemptData() {
  return <DashboardAttemptSummary {...useDashboardAttemptData()} />;
}

export function DashboardWrongNoteCardStandalone() {
  return <DashboardWrongNoteCard {...useDashboardAttemptData()} />;
}

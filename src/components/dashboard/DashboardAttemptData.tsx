"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getNextJlptExam } from "@/lib/jlpt/exam-schedule";
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
  section_key?: "vocab" | "grammar" | "reading" | null;
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
  review?: {
    result: "resolved" | "repeat_wrong";
    review_count: number;
    repeat_wrong_count: number;
    last_reviewed_at: string | null;
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

type WeaknessBasis = "wrong-rate" | "unanswered" | "recent-miss";

type DashboardResponse = {
  attempts: DashboardAttempt[];
  attempt_count: number;
  total_questions: number;
  average_rate: number;
  weekly_activity: WeeklyActivity[];
  section_summary: SectionSummary[];
  weakness_basis: WeaknessBasis;
  weakness_basis_label: string;
  wrong_note?: {
    total_count: number;
    wrong_count: number;
    unanswered_count: number;
    unresolved_count: number;
    resolved_count: number;
    repeat_wrong_count: number;
    recent_items: WrongNoteItem[];
  };
};

type DashboardDataState = {
  data: DashboardResponse | null;
  status: "loading" | "ready" | "login_required" | "error";
  localFallbackCount: number;
};

const LOCAL_ATTEMPTS_STORAGE_KEY = "jlpt-mock-exam-local-attempts";
const SETTINGS_STORAGE_KEY = "jlpt-quiz-user-settings";
const DEFAULT_WEAKNESS_BASIS: WeaknessBasis = "wrong-rate";

const WEAKNESS_BASIS_LABELS: Record<WeaknessBasis, string> = {
  "wrong-rate": "오답률 우선",
  unanswered: "미응답 포함",
  "recent-miss": "최근 실수 우선",
};

function normalizeWeaknessBasis(value: unknown): WeaknessBasis {
  return value === "unanswered" || value === "recent-miss" || value === "wrong-rate" ? value : DEFAULT_WEAKNESS_BASIS;
}

function readLocalWeaknessBasis() {
  if (typeof window === "undefined") return DEFAULT_WEAKNESS_BASIS;

  try {
    const rawSettings = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!rawSettings) return DEFAULT_WEAKNESS_BASIS;
    const settings = JSON.parse(rawSettings) as { weaknessBasis?: unknown };
    return normalizeWeaknessBasis(settings.weaknessBasis);
  } catch {
    return DEFAULT_WEAKNESS_BASIS;
  }
}

function weaknessBasisFromSession(session: Awaited<ReturnType<ReturnType<typeof getSupabaseBrowserClient>["auth"]["getSession"]>>["data"]["session"]) {
  const metadata = session?.user?.user_metadata ?? {};
  const saved = typeof metadata.jlpt_quiz_settings === "object" && metadata.jlpt_quiz_settings !== null
    ? metadata.jlpt_quiz_settings as { weaknessBasis?: unknown }
    : {};
  return normalizeWeaknessBasis(metadata.weakness_basis ?? saved.weaknessBasis ?? readLocalWeaknessBasis());
}

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

function useDashboardAttemptData(): DashboardDataState {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [status, setStatus] = useState<DashboardDataState["status"]>("loading");
  const [localFallbackCount, setLocalFallbackCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadAttempts() {
      const localAttemptCount = readLocalDashboardAttempts().length;
      if (!cancelled) setLocalFallbackCount(localAttemptCount);

      try {
        const supabase = getSupabaseBrowserClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token;

        if (!accessToken) {
          if (!cancelled) {
            setData(null);
            setStatus("login_required");
          }
          return;
        }

        const weaknessBasis = weaknessBasisFromSession(sessionData.session);
        const response = await fetch(`/api/mock-exams/attempts?weakness_basis=${encodeURIComponent(weaknessBasis)}`, {
          headers: { authorization: `Bearer ${accessToken}` },
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "failed to load dashboard attempts");

        if (!cancelled) {
          setData(result);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) {
          setData(null);
          setStatus("error");
        }
      }
    }

    loadAttempts();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, status, localFallbackCount };
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

function weakestSectionLabel(data: DashboardResponse | null) {
  const sections = data?.section_summary?.filter((section) => section.question_count > 0) ?? [];
  return sections[0]?.section_label ?? "-";
}

function DashboardStatGrid({ data, status }: DashboardDataState) {
  const stats = [
    {
      label: "모의고사",
      value: status === "ready" ? `${data?.attempt_count ?? 0}회` : "-",
      note: "저장된 모의고사 제출 기준",
      tone: "blue",
    },
    {
      label: "평균 정답률",
      value: status === "ready" ? `${data?.average_rate ?? 0}%` : "-",
      note: "학습 참고 지표",
      tone: "orange",
    },
    {
      label: "남은 오답",
      value: status === "ready" ? `${data?.wrong_note?.unresolved_count ?? data?.wrong_note?.wrong_count ?? 0}문제` : "-",
      note: status === "ready" ? `반복 오답 ${data?.wrong_note?.repeat_wrong_count ?? 0}문제` : "오답노트 기준",
      tone: "mint",
    },
    {
      label: "취약 영역",
      value: status === "ready" ? weakestSectionLabel(data) : "-",
      note: status === "ready" ? `${data?.weakness_basis_label ?? WEAKNESS_BASIS_LABELS[DEFAULT_WEAKNESS_BASIS]} 기준` : "설정 기준 반영",
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

function DashboardBrowserOnlyNotice({ localFallbackCount }: DashboardDataState) {
  if (!localFallbackCount) return null;

  return (
    <p className="dashboard-local-fallback-note">
      이 브라우저에만 남은 제출 기록 {localFallbackCount}건이 있습니다. 대시보드 통계에는 서버에 저장된 기록만 반영됩니다.
    </p>
  );
}

function DashboardTrustNote() {
  return (
    <p className="dashboard-trust-note">
      취약 영역 분석과 점수 흐름은 저장된 모의고사 기록 기준의 학습 참고용입니다. 실제 시험 합격 여부나 출제 가능성을 예측하거나 보장하지 않습니다.
    </p>
  );
}

function DashboardDailyRoutine({ data, status }: DashboardDataState) {
  const nextExam = getNextJlptExam();
  const routineLevel = latestLevel(data) === "-" ? "N5" : latestLevel(data);
  const weakSection = data?.section_summary?.find((section) => section.question_count > 0);
  const repeatWrongCount = data?.wrong_note?.repeat_wrong_count ?? 0;
  const unresolvedWrongCount = data?.wrong_note?.unresolved_count ?? data?.wrong_note?.wrong_count ?? 0;
  const reviewCount = repeatWrongCount || Math.min(unresolvedWrongCount, nextExam.dday <= 30 ? 15 : 10);
  const routineMockHref = `/mock-exams/${routineLevel.toLowerCase()}`;
  const routineWrongHref = weakSection
    ? `/wrong-note?section=${weakSection.section_key}&basis=${data?.weakness_basis ?? DEFAULT_WEAKNESS_BASIS}`
    : "/wrong-note";
  const urgencyLabel = nextExam.dday <= 30 ? "마무리 루틴" : nextExam.dday <= 90 ? "실전 감각 유지" : "가볍게 누적";

  return (
    <section className="dashboard-panel dashboard-daily-routine" aria-label="D-Day 기반 오늘의 학습 루틴">
      <div className="dashboard-routine-head dashboard-action-head">
        <div>
          <p>JLPT D-DAY {nextExam.dday >= 0 ? `D-${nextExam.dday}` : "일정 확인"}</p>
          <h2>오늘의 가벼운 루틴</h2>
        </div>
        <span>{urgencyLabel}</span>
      </div>
      <div className="dashboard-routine-steps">
        <Link href={routineMockHref}>
          <small>오늘 풀 세트</small>
          <strong>{routineLevel} 실전형 1세트</strong>
          <em>{status === "ready" && data?.attempt_count ? "최근 기록 기준 레벨 유지" : "첫 기록은 N5부터 가볍게"}</em>
        </Link>
        <Link href={routineWrongHref}>
          <small>복습할 오답</small>
          <strong>{reviewCount ? `${reviewCount}문제` : "오답노트 확인"}</strong>
          <em>{repeatWrongCount ? "반복 오답 우선" : unresolvedWrongCount ? "남은 오답 이어풀기" : "틀린 문제가 생기면 자동 추천"}</em>
        </Link>
        <Link href={routineWrongHref}>
          <small>약한 영역</small>
          <strong>{weakSection?.section_label ?? "기록 쌓기"}</strong>
          <em>{weakSection ? `${weakSection.weakness_label} · ${weakSection.correct_rate}%` : "모의고사 제출 후 분석"}</em>
        </Link>
      </div>
      <Link className="dashboard-saved-items-link" href="/wrong-note?saved=1">저장한 문제 보기</Link>
    </section>
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
        <Link className="figma-primary" href="/mock-exams/n5">계속 학습하기</Link>
      </article>
    </section>
  );
}

function DashboardRecentExamList({ data, status }: DashboardDataState) {
  const attempts = data?.attempts ?? [];
  const visibleAttempts = attempts.slice(0, 5);

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
        <>
          <div className="dashboard-recent-list" aria-label="최근 모의고사 최근 5개">
            {visibleAttempts.map((exam) => {
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
            })}
          </div>
        </>
      ) : (
        <p>아직 저장된 모의고사 기록이 없습니다.</p>
      )}
    </article>
  );
}

function reviewStatusLabel(item: WrongNoteItem) {
  if (item.review?.result === "resolved") return "복습 완료";
  if (item.review?.result === "repeat_wrong") return "반복 오답";
  return "남은 오답";
}

function DashboardWrongNoteCard({ data, status }: DashboardDataState) {
  const wrongNote = data?.wrong_note;
  const recentItems = (wrongNote?.recent_items ?? []).filter((item) => item.status === "wrong");
  const wrongCount = wrongNote?.wrong_count ?? 0;
  const unresolvedCount = wrongNote?.unresolved_count ?? wrongCount;
  const resolvedCount = wrongNote?.resolved_count ?? 0;
  const repeatWrongCount = wrongNote?.repeat_wrong_count ?? 0;
  const nextReviewItem = recentItems.find((item) => item.review?.result === "repeat_wrong") ?? recentItems.find((item) => item.review?.result !== "resolved") ?? recentItems[0];
  const nextReviewSection = nextReviewItem?.section_key;
  const nextReviewHref = nextReviewSection
    ? `/wrong-note?section=${nextReviewSection}&basis=${data?.weakness_basis ?? DEFAULT_WEAKNESS_BASIS}`
    : "/wrong-note";

  return (
    <section className="dashboard-panel dashboard-wrong-note dashboard-wrong-note-card" id="wrong-note" aria-label="오답노트">
      <div className="dashboard-wrong-note-head dashboard-action-head">
        <div>
          <p>오답노트</p>
          <h2>{unresolvedCount ? `남은 오답 ${unresolvedCount}개` : resolvedCount ? "복습할 오답이 없습니다" : "틀린 문제가 없습니다"}</h2>
        </div>
        <Link href={nextReviewHref}>다음 복습 →</Link>
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
            <em>남은 오답 <b>{unresolvedCount}</b></em>
            <em data-kind="repeat">반복 오답 <b>{repeatWrongCount}</b></em>
            <em data-kind="resolved">복습 완료 <b>{resolvedCount}</b></em>
          </div>
          <div className="dashboard-next-review-card" aria-label="다음 복습 제안">
            <strong>{repeatWrongCount ? "반복 오답부터 다시 확인하세요" : unresolvedCount ? "남은 오답을 이어서 풀어보세요" : "오늘 오답 복습은 정리되었습니다"}</strong>
            <p>{nextReviewItem?.section_label ? `${nextReviewItem.section_label} 영역부터 이어갑니다.` : "새 모의고사를 풀면 복습할 문제가 자동으로 모입니다."}</p>
            <Link href={nextReviewHref}>{unresolvedCount ? "오답노트로 이동" : "오답노트 보기"}</Link>
          </div>
          <div className="dashboard-wrong-note-recent">
            <p>최근 오답</p>
            <ul>
              {recentItems.slice(0, 3).map((item) => (
                <li key={item.id}>
                  <strong>{item.question_no ? `${item.question_no}번` : "문항"}</strong>
                  <span>{item.section_label}</span>
                  <em data-status={item.review?.result ?? "wrong"}>{reviewStatusLabel(item)}</em>
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
  const recommendedSection = weakAreas.find((area) => area.question_count > 0)?.section_key;
  const weakReviewHref = recommendedSection
    ? `/wrong-note?section=${recommendedSection}&basis=${data?.weakness_basis ?? DEFAULT_WEAKNESS_BASIS}`
    : "/wrong-note";

  return (
    <section className="dashboard-panel dashboard-weak dashboard-weak-full" aria-label="취약 영역 분석">
      <div className="dashboard-weak-head dashboard-action-head">
        <div>
          <h2>최근 취약영역</h2>
          <p>{status === "ready" ? `${data?.weakness_basis_label ?? WEAKNESS_BASIS_LABELS[DEFAULT_WEAKNESS_BASIS]} 기준으로 보완이 필요한 영역을 정리합니다.` : "오답노트와 최근 모의고사 기준으로 보완이 필요한 영역을 정리합니다."}</p>
        </div>
        <Link href={weakReviewHref}>약한 영역 다시 풀기 →</Link>
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
  const isLocked = state.status === "login_required";

  return (
    <div className={`dashboard-live-sections${isLocked ? " dashboard-live-sections-locked" : ""}`}>
      <div className="dashboard-locked-content" aria-hidden={isLocked ? "true" : undefined}>
        <DashboardStatGrid {...state} />
        <DashboardAttemptSummary {...state} />
        <DashboardBrowserOnlyNotice {...state} />
        <DashboardTrustNote />
        <DashboardDailyRoutine {...state} />
        <div className="dashboard-desktop-flow">
          <DashboardActivityAndGoal {...state} />
          <section className="dashboard-grid-bottom" id="history">
            <DashboardRecentExamList {...state} />
            <DashboardWrongNoteCard {...state} />
          </section>
          <DashboardWeakAreaPanel {...state} />
        </div>
        <div className="dashboard-mobile-record-flow" aria-label="모바일 학습 기록">
          <section className="dashboard-grid-bottom" id="history-mobile">
            <DashboardRecentExamList {...state} />
            <DashboardWrongNoteCard {...state} />
          </section>
          <DashboardWeakAreaPanel {...state} />
          <DashboardActivityAndGoal {...state} />
        </div>
      </div>
      {isLocked ? (
        <section className="dashboard-login-lock" aria-label="학습 기록 로그인 안내">
          <span>LOGIN REQUIRED</span>
          <h2>로그인하면 학습 기록을 볼 수 있습니다</h2>
          <p>모의고사 제출 기록, 오답노트, 취약 영역 분석은 로그인 후 저장됩니다.</p>
          <div>
            <Link className="figma-primary" href="/login?next=/dashboard">로그인하기</Link>
            <Link className="dashboard-lock-secondary" href="/mock-exams/n5">모의고사 체험하기</Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}

export function DashboardAttemptData() {
  return <DashboardAttemptSummary {...useDashboardAttemptData()} />;
}

export function DashboardWrongNoteCardStandalone() {
  return <DashboardWrongNoteCard {...useDashboardAttemptData()} />;
}

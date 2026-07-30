"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type ChoiceKey = "A" | "B" | "C" | "D";

type WrongNoteQuestion = {
  id: string;
  question_text: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  correct_choice: ChoiceKey;
  explanation: string;
};

type WrongNoteReview = {
  result: "resolved" | "repeat_wrong";
  review_count: number;
  repeat_wrong_count: number;
  last_reviewed_at: string | null;
};

type WrongNoteItem = {
  id: string;
  attempt_id: string;
  question_no: number | null;
  section_label: string;
  section_key?: "vocab" | "grammar" | "reading" | null;
  status: "wrong" | "unanswered";
  question?: WrongNoteQuestion;
  review?: WrongNoteReview;
};

type LocalAttempt = {
  id: string;
  submitted_at: string;
  set_title: string;
  jlpt_level: string;
  wrong_note_items?: WrongNoteItem[];
};

const LOCAL_ATTEMPTS_STORAGE_KEY = "jlpt-mock-exam-local-attempts";
const SAVED_QUESTIONS_STORAGE_KEY = "jlpt-mock-exam-saved-questions";
const SAVED_MODE_QUERY = "saved=1";
const CHOICE_KEYS: ChoiceKey[] = ["A", "B", "C", "D"];
const CHOICE_NUMBERS: Record<ChoiceKey, string> = { A: "1", B: "2", C: "3", D: "4" };

type SectionKey = "vocab" | "grammar" | "reading";

const SECTION_FILTERS: Array<{ key: SectionKey | null; label: string }> = [
  { key: null, label: "전체" },
  { key: "vocab", label: "문자·어휘" },
  { key: "grammar", label: "문법" },
  { key: "reading", label: "읽기" },
];

function normalizeSectionFilter(value: string | null): SectionKey | null {
  return value === "vocab" || value === "grammar" || value === "reading" ? value : null;
}

function sectionFilterLabel(sectionFilter: SectionKey | null) {
  return SECTION_FILTERS.find((section) => section.key === sectionFilter)?.label ?? "전체";
}

function wrongNoteFilterHref(sectionKey: SectionKey | null, basis: string | null, savedMode = false) {
  const params = new URLSearchParams();
  if (sectionKey) params.set("section", sectionKey);
  if (basis) params.set("basis", basis);
  if (savedMode) {
    const [savedKey, savedValue] = SAVED_MODE_QUERY.split("=");
    params.set(savedKey, savedValue);
  }
  const query = params.toString();
  return query ? `/wrong-note?${query}` : "/wrong-note";
}

function filterWrongNoteItems(items: WrongNoteItem[], sectionFilter: SectionKey | null) {
  return items
    .filter((item) => item.status === "wrong" && item.question)
    .filter((item) => !sectionFilter || item.section_key === sectionFilter || item.section_label.includes(sectionFilter === "vocab" ? "어휘" : sectionFilter === "grammar" ? "문법" : "읽기"));
}

function choiceText(question: WrongNoteQuestion, key: ChoiceKey) {
  return question[`choice_${key.toLowerCase()}` as keyof WrongNoteQuestion] as string;
}

function readWrongNoteItems(sectionFilter: SectionKey | null) {
  if (typeof window === "undefined") return [] as WrongNoteItem[];

  try {
    const raw = window.localStorage.getItem(LOCAL_ATTEMPTS_STORAGE_KEY);
    if (!raw) return [];
    const attempts = JSON.parse(raw) as LocalAttempt[];
    if (!Array.isArray(attempts)) return [];

    return filterWrongNoteItems(attempts.flatMap((attempt) => attempt.wrong_note_items ?? []), sectionFilter)
      .filter((item, index, items) => items.findIndex((candidate) => candidate.question?.id === item.question?.id) === index);
  } catch {
    return [];
  }
}

function readSavedQuestionItems(sectionFilter: SectionKey | null) {
  if (typeof window === "undefined") return [] as WrongNoteItem[];

  try {
    const raw = window.localStorage.getItem(SAVED_QUESTIONS_STORAGE_KEY);
    if (!raw) return [];
    const savedQuestions = JSON.parse(raw) as Array<{
      id?: string;
      question_no?: number;
      section_key?: SectionKey;
      section_label?: string;
      question?: WrongNoteQuestion;
    }>;
    if (!Array.isArray(savedQuestions)) return [];

    return savedQuestions
      .filter((item) => item.id && item.question)
      .filter((item) => !sectionFilter || item.section_key === sectionFilter || item.section_label?.includes(sectionFilter === "vocab" ? "어휘" : sectionFilter === "grammar" ? "문법" : "읽기"))
      .map((item) => ({
        id: `saved:${item.id}`,
        attempt_id: "saved_questions",
        question_no: item.question_no ?? null,
        section_label: item.section_label ?? "저장한 문제",
        section_key: item.section_key ?? null,
        status: "wrong" as const,
        question: item.question,
      }))
      .filter((item, index, items) => items.findIndex((candidate) => candidate.question?.id === item.question?.id) === index);
  } catch {
    return [];
  }
}

async function fetchServerWrongNoteItems(sectionFilter: SectionKey | null, basis: string | null) {
  const supabase = getSupabaseBrowserClient();
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;
  if (!accessToken) return [] as WrongNoteItem[];

  const params = new URLSearchParams();
  if (basis) params.set("weakness_basis", basis);
  if (sectionFilter) params.set("wrong_note_section", sectionFilter);
  const response = await fetch(`/api/mock-exams/attempts?${params.toString()}`, {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? "failed to load wrong note items");
  return filterWrongNoteItems(result.wrong_note?.recent_items ?? [], sectionFilter)
    .filter((item, index, items) => items.findIndex((candidate) => candidate.question?.id === item.question?.id) === index);
}

async function persistServerWrongReview(item: WrongNoteItem, reviewedChoice: ChoiceKey, reviewResult: WrongNoteReview["result"]) {
  const supabase = getSupabaseBrowserClient();
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;
  if (!accessToken) return null;

  const response = await fetch("/api/mock-exams/wrong-reviews", {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      mock_exam_answer_id: item.id,
      reviewed_choice: reviewedChoice,
      review_result: reviewResult,
    }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? "failed to save wrong note review");
  return result.review as {
    review_result: WrongNoteReview["result"];
    review_count: number;
    repeat_wrong_count: number;
    last_reviewed_at: string | null;
  };
}

export function WrongNoteClient() {
  const searchParams = useSearchParams();
  const sectionFilter = normalizeSectionFilter(searchParams.get("section"));
  const savedMode = searchParams.get("saved") === "1";
  const basis = searchParams.get("basis");
  const [items, setItems] = useState<WrongNoteItem[]>([]);
  const [source, setSource] = useState<"loading" | "server" | "local">("loading");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, ChoiceKey>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [reviewSaving, setReviewSaving] = useState<Record<string, boolean>>({});
  const [reviewSaveError, setReviewSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadItems() {
      setSource("loading");
      if (savedMode) {
        if (!cancelled) {
          setItems(readSavedQuestionItems(sectionFilter));
          setSource("local");
          setCurrentIndex(0);
        }
        return;
      }
      try {
        const serverItems = await fetchServerWrongNoteItems(sectionFilter, basis);
        if (!cancelled && serverItems.length) {
          setItems(serverItems);
          setSource("server");
          setCurrentIndex(0);
          return;
        }
      } catch {
        // Fall through to browser-only fallback below.
      }

      if (!cancelled) {
        setItems(readWrongNoteItems(sectionFilter));
        setSource("local");
        setCurrentIndex(0);
      }
    }
    void loadItems();
    return () => {
      cancelled = true;
    };
  }, [basis, savedMode, sectionFilter]);

  const currentItem = items[currentIndex];
  const currentQuestion = currentItem?.question;
  const selectedAnswer = currentItem ? selectedAnswers[currentItem.id] : undefined;
  const isRevealed = currentItem ? Boolean(revealed[currentItem.id]) : false;
  const reviewedCount = useMemo(() => items.filter((item) => revealed[item.id]).length, [items, revealed]);
  const solvedCount = useMemo(() => items.filter((item) => revealed[item.id] && selectedAnswers[item.id] === item.question?.correct_choice).length, [items, revealed, selectedAnswers]);
  const resolvedCount = useMemo(() => items.filter((item) => item.review?.result === "resolved" || (revealed[item.id] && selectedAnswers[item.id] === item.question?.correct_choice)).length, [items, revealed, selectedAnswers]);
  const repeatWrongCount = useMemo(() => items.filter((item) => item.review?.result === "repeat_wrong" || (revealed[item.id] && selectedAnswers[item.id] && selectedAnswers[item.id] !== item.question?.correct_choice)).length, [items, revealed, selectedAnswers]);
  const reviewProgress = items.length ? Math.round((reviewedCount / items.length) * 100) : 0;
  const isLastItem = currentIndex >= items.length - 1;
  const isCurrentCorrect = Boolean(currentQuestion && selectedAnswer === currentQuestion.correct_choice);
  const sourceLabel = savedMode ? "저장 문제 보기" : source === "server" ? "서버 저장 기록" : source === "loading" ? "기록 확인 중" : "브라우저 임시 기록";
  const activeFilterLabel = savedMode ? "저장한 문제" : sectionFilterLabel(sectionFilter);
  const currentReviewLabel = savedMode ? "저장한 문제" : currentItem?.review?.result === "resolved" ? "복습 완료" : currentItem?.review?.result === "repeat_wrong" ? "반복 오답" : "오답";
  const isSavingCurrentReview = currentItem ? Boolean(reviewSaving[currentItem.id]) : false;

  function selectAnswer(choice: ChoiceKey) {
    if (!currentItem || isRevealed) return;
    setSelectedAnswers((answers) => ({ ...answers, [currentItem.id]: choice }));
  }

  async function revealAnswer() {
    if (!currentItem || !selectedAnswer || !currentQuestion) return;
    const reviewResult: WrongNoteReview["result"] = selectedAnswer === currentQuestion.correct_choice ? "resolved" : "repeat_wrong";
    setRevealed((next) => ({ ...next, [currentItem.id]: true }));
    setReviewSaveError(null);

    if (source !== "server") return;

    setReviewSaving((next) => ({ ...next, [currentItem.id]: true }));
    try {
      const savedReview = await persistServerWrongReview(currentItem, selectedAnswer, reviewResult);
      if (savedReview) {
        setItems((currentItems) => currentItems.map((item) => item.id === currentItem.id ? {
          ...item,
          review: {
            result: savedReview.review_result,
            review_count: Number(savedReview.review_count ?? 1),
            repeat_wrong_count: Number(savedReview.repeat_wrong_count ?? 0),
            last_reviewed_at: savedReview.last_reviewed_at,
          },
        } : item));
      }
    } catch {
      setReviewSaveError("복습 결과 저장에 실패했습니다. 화면 복습은 계속할 수 있습니다.");
    } finally {
      setReviewSaving((next) => ({ ...next, [currentItem.id]: false }));
    }
  }

  function move(step: number) {
    setCurrentIndex((index) => Math.min(Math.max(index + step, 0), Math.max(items.length - 1, 0)));
  }

  function restartReview() {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setRevealed({});
    setReviewSaving({});
    setReviewSaveError(null);
  }

  return (
    <section className="wrong-note-page" aria-label="오답노트 다시 풀기">
      <div className="wrong-note-hero">
        <p className="section-eyebrow">Wrong Note</p>
        <h1>{savedMode ? "저장한 문제" : "오답 다시 풀기"}</h1>
        <p>{savedMode ? "헷갈려서 저장한 문제만 다시 풀고 해설까지 확인합니다." : "틀렸던 문제만 다시 풀고, 마지막 문제를 확인하면 바로 다음 학습으로 이어갑니다."}</p>
        <div className="wrong-note-summary-row">
          <strong>{activeFilterLabel} {items.length}개</strong>
          <span>확인 {reviewedCount}개 · 복습 완료 {resolvedCount}개 · 반복 오답 {repeatWrongCount}개 · {sourceLabel}</span>
        </div>
        <nav className="wrong-note-filter-tabs" aria-label="오답노트 섹션 필터">
          {SECTION_FILTERS.map((section) => (
            <Link
              aria-current={section.key === sectionFilter ? "page" : undefined}
              data-active={section.key === sectionFilter || undefined}
              href={wrongNoteFilterHref(section.key, basis, savedMode)}
              key={section.label}
            >
              {section.label}
            </Link>
          ))}
        </nav>
        <div className="wrong-note-progress" aria-label="오답 재풀이 진행률">
          <i style={{ width: `${reviewProgress}%` }} />
        </div>
        <div className="wrong-note-mobile-status" aria-label="모바일 오답 복습 상태">
          <strong>{currentItem ? `${currentIndex + 1}/${items.length}` : `0/${items.length}`}</strong>
          <span>확인 {reviewedCount} · 반복 {repeatWrongCount}</span>
        </div>
      </div>

      {items.length === 0 || !currentItem || !currentQuestion ? (
        <div className="wrong-note-empty">
          <span className="wrong-note-empty-badge">{sourceLabel}</span>
          <h2>{source === "loading" ? "오답 기록을 확인하고 있습니다" : savedMode ? "저장한 문제가 없습니다" : sectionFilter ? `${activeFilterLabel} 오답이 없습니다` : "아직 다시 풀 오답이 없습니다"}</h2>
          <p>{source === "loading" ? "저장된 모의고사 기록에서 다시 풀 문제를 불러오는 중입니다." : savedMode ? "모의고사 풀이 중 북마크를 누르면 이 화면에서 다시 볼 수 있습니다." : sectionFilter ? "다른 영역의 오답을 보거나, 새 모의고사를 제출하면 이 영역의 오답이 자동으로 모입니다." : "모의고사를 제출한 뒤 틀린 문제가 생기면 이 화면에서 다시 풀 수 있습니다."}</p>
          <div className="wrong-note-empty-actions">
            {sectionFilter ? <Link href={wrongNoteFilterHref(null, basis, savedMode)}>{savedMode ? "전체 저장 문제 보기" : "전체 오답 보기"}</Link> : null}
            <Link className="primary-link" href="/mock-exams/n5">모의고사 풀기</Link>
          </div>
        </div>
      ) : (
        <div className="wrong-note-review-card">
          <div className="wrong-note-review-head">
            <span>{currentIndex + 1} / {items.length}</span>
            <em data-review={currentItem.review?.result ?? "wrong"}>{currentItem.section_label} · {currentItem.question_no ? `${currentItem.question_no}번` : "오답 문항"} · {currentReviewLabel}</em>
          </div>
          <h2>{currentItem.question_no ? `${currentItem.question_no}번 다시 풀기` : "오답 문항 다시 풀기"}</h2>
          <p className="wrong-note-question-text">{currentQuestion.question_text}</p>

          <div className="wrong-note-choice-list" role="radiogroup" aria-label="오답 재풀이 보기">
            {CHOICE_KEYS.map((choice) => {
              const selected = selectedAnswer === choice;
              const correct = isRevealed && currentQuestion.correct_choice === choice;
              const wrong = isRevealed && selected && currentQuestion.correct_choice !== choice;
              return (
                <button
                  aria-checked={selected}
                  className="wrong-note-choice"
                  data-correct={correct || undefined}
                  data-selected={selected || undefined}
                  data-wrong={wrong || undefined}
                  key={choice}
                  role="radio"
                  type="button"
                  onClick={() => selectAnswer(choice)}
                >
                  <span>{CHOICE_NUMBERS[choice]}</span>
                  {choiceText(currentQuestion, choice)}
                </button>
              );
            })}
          </div>

          {isRevealed ? (
            <div className="wrong-note-explanation">
              <strong>{selectedAnswer === currentQuestion.correct_choice ? "정답입니다" : `정답은 ${CHOICE_NUMBERS[currentQuestion.correct_choice]}번입니다`}</strong>
              <p>{currentQuestion.explanation}</p>
            </div>
          ) : null}

          {isSavingCurrentReview ? <p className="wrong-note-save-state">복습 결과 저장 중입니다.</p> : null}
          {reviewSaveError ? <p className="wrong-note-save-state" data-error="true">{reviewSaveError}</p> : null}

          {isLastItem && isRevealed ? (
            <div className="wrong-note-inline-complete" aria-label="마지막 오답 확인 완료">
              <strong>{isCurrentCorrect ? "마지막 문제까지 다시 맞혔습니다" : "마지막 문제까지 확인했습니다"}</strong>
              <p>{items.length}개 중 {solvedCount}개를 다시 맞혔습니다. 복습 완료 {resolvedCount}개, 반복 오답 {repeatWrongCount}개입니다. 반복 오답은 한 번 더 풀어보세요.</p>
              <div className="wrong-note-complete-actions">
                <button type="button" onClick={restartReview}>다시 한 번 풀기</button>
                <Link href="/dashboard">학습 기록 보기</Link>
                <Link className="wrong-note-primary-cta" href="/mock-exams/n5">새 모의고사 풀기</Link>
              </div>
            </div>
          ) : (
            <div className="wrong-note-actions wrong-note-actions-sticky">
              <button type="button" onClick={() => move(-1)} disabled={currentIndex === 0}>이전</button>
              <button type="button" onClick={revealAnswer} disabled={!selectedAnswer || isRevealed}>정답 확인</button>
              <button type="button" onClick={() => move(1)} disabled={!isRevealed || isLastItem}>다음 문제</button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

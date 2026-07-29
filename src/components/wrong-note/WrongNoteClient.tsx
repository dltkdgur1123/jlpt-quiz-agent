"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

type WrongNoteItem = {
  id: string;
  attempt_id: string;
  question_no: number | null;
  section_label: string;
  status: "wrong" | "unanswered";
  question?: WrongNoteQuestion;
};

type LocalAttempt = {
  id: string;
  submitted_at: string;
  set_title: string;
  jlpt_level: string;
  wrong_note_items?: WrongNoteItem[];
};

const LOCAL_ATTEMPTS_STORAGE_KEY = "jlpt-mock-exam-local-attempts";
const CHOICE_KEYS: ChoiceKey[] = ["A", "B", "C", "D"];
const CHOICE_NUMBERS: Record<ChoiceKey, string> = { A: "1", B: "2", C: "3", D: "4" };

function choiceText(question: WrongNoteQuestion, key: ChoiceKey) {
  return question[`choice_${key.toLowerCase()}` as keyof WrongNoteQuestion] as string;
}

function readWrongNoteItems() {
  if (typeof window === "undefined") return [] as WrongNoteItem[];

  try {
    const raw = window.localStorage.getItem(LOCAL_ATTEMPTS_STORAGE_KEY);
    if (!raw) return [];
    const attempts = JSON.parse(raw) as LocalAttempt[];
    if (!Array.isArray(attempts)) return [];

    return attempts
      .flatMap((attempt) => attempt.wrong_note_items ?? [])
      .filter((item) => item.status === "wrong" && item.question)
      .filter((item, index, items) => items.findIndex((candidate) => candidate.question?.id === item.question?.id) === index);
  } catch {
    return [];
  }
}

export function WrongNoteClient() {
  const [items, setItems] = useState<WrongNoteItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, ChoiceKey>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    queueMicrotask(() => setItems(readWrongNoteItems()));
  }, []);

  const currentItem = items[currentIndex];
  const currentQuestion = currentItem?.question;
  const selectedAnswer = currentItem ? selectedAnswers[currentItem.id] : undefined;
  const isRevealed = currentItem ? Boolean(revealed[currentItem.id]) : false;
  const reviewedCount = useMemo(() => items.filter((item) => revealed[item.id]).length, [items, revealed]);
  const solvedCount = useMemo(() => items.filter((item) => revealed[item.id] && selectedAnswers[item.id] === item.question?.correct_choice).length, [items, revealed, selectedAnswers]);
  const reviewProgress = items.length ? Math.round((reviewedCount / items.length) * 100) : 0;
  const isLastItem = currentIndex >= items.length - 1;
  const isCurrentCorrect = Boolean(currentQuestion && selectedAnswer === currentQuestion.correct_choice);

  function selectAnswer(choice: ChoiceKey) {
    if (!currentItem || isRevealed) return;
    setSelectedAnswers((answers) => ({ ...answers, [currentItem.id]: choice }));
  }

  function revealAnswer() {
    if (!currentItem || !selectedAnswer) return;
    setRevealed((next) => ({ ...next, [currentItem.id]: true }));
  }

  function move(step: number) {
    setCurrentIndex((index) => Math.min(Math.max(index + step, 0), Math.max(items.length - 1, 0)));
  }

  function restartReview() {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setRevealed({});
  }

  return (
    <section className="wrong-note-page" aria-label="오답노트 다시 풀기">
      <div className="wrong-note-hero">
        <p className="section-eyebrow">Wrong Note</p>
        <h1>오답 다시 풀기</h1>
        <p>틀렸던 문제만 다시 풀고, 마지막 문제를 확인하면 바로 다음 학습으로 이어갑니다.</p>
        <div className="wrong-note-summary-row">
          <strong>오답 {items.length}개</strong>
          <span>확인 {reviewedCount}개 · 다시 맞힌 문제 {solvedCount}개</span>
        </div>
        <div className="wrong-note-progress" aria-label="오답 재풀이 진행률">
          <i style={{ width: `${reviewProgress}%` }} />
        </div>
      </div>

      {items.length === 0 || !currentItem || !currentQuestion ? (
        <div className="wrong-note-empty">
          <h2>아직 다시 풀 오답이 없습니다</h2>
          <p>모의고사를 제출한 뒤 틀린 문제가 생기면 이 화면에서 다시 풀 수 있습니다.</p>
          <Link className="primary-link" href="/mock-exams/n5">모의고사 풀기</Link>
        </div>
      ) : (
        <div className="wrong-note-review-card">
          <div className="wrong-note-review-head">
            <span>{currentIndex + 1} / {items.length}</span>
            <em>{currentItem.section_label}</em>
          </div>
          <h2>{currentItem.question_no ? `${currentItem.question_no}번` : "오답 문항"}</h2>
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

          {isLastItem && isRevealed ? (
            <div className="wrong-note-inline-complete" aria-label="마지막 오답 확인 완료">
              <strong>{isCurrentCorrect ? "마지막 문제까지 다시 맞혔습니다" : "마지막 문제까지 확인했습니다"}</strong>
              <p>{items.length}개 중 {solvedCount}개를 다시 맞혔습니다. 여기서 복습을 한 번 더 돌리거나, 학습 기록을 확인한 뒤 새 모의고사로 넘어가세요.</p>
              <div className="wrong-note-complete-actions">
                <button type="button" onClick={restartReview}>다시 한 번 풀기</button>
                <Link href="/dashboard">학습 기록 보기</Link>
                <Link className="wrong-note-primary-cta" href="/mock-exams/n5">새 모의고사 풀기</Link>
              </div>
            </div>
          ) : (
            <div className="wrong-note-actions">
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

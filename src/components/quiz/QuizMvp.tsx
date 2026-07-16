"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { ScoreCard } from "@/components/score/ScoreCard";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type ItemType = "vocab" | "grammar";
type ChoiceKey = "A" | "B" | "C" | "D";
type FeedbackValue = "yes" | "no" | "unknown";

interface QuizChoice {
  key: ChoiceKey;
  text: string;
}

interface QuizState {
  item_type: ItemType;
  item_id: string;
  question_text: string;
  choices: QuizChoice[];
}

interface AttemptResult {
  is_correct: boolean;
  correct_choice: ChoiceKey;
  explanation: string | null;
}

interface ScoreState {
  perceived_exam_score: number | null;
  feedback_total_count: number;
  correct_rate: number | null;
  has_enough_data: boolean;
}

const fallbackScore: ScoreState = {
  perceived_exam_score: null,
  feedback_total_count: 0,
  correct_rate: null,
  has_enough_data: false,
};

export function QuizMvp() {
  const [level, setLevel] = useState("N5");
  const [itemType, setItemType] = useState<ItemType>("vocab");
  const [quiz, setQuiz] = useState<QuizState | null>(null);
  const [score, setScore] = useState<ScoreState>(fallbackScore);
  const [selectedChoice, setSelectedChoice] = useState<ChoiceKey | null>(null);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  async function loadScore(nextQuiz: QuizState) {
    const response = await fetch(
      `/api/items/${nextQuiz.item_type}/${nextQuiz.item_id}/score`,
    );

    if (!response.ok) {
      setScore(fallbackScore);
      return;
    }

    const nextScore = (await response.json()) as ScoreState;
    setScore(nextScore);
  }

  async function loadQuiz() {
    setIsLoadingQuiz(true);
    setMessage(null);
    setResult(null);
    setSelectedChoice(null);

    try {
      const response = await fetch(
        `/api/quiz/next?item_type=${itemType}&jlpt_level=${level}`,
      );

      if (!response.ok) {
        throw new Error("문제를 불러오지 못했습니다.");
      }

      const nextQuiz = (await response.json()) as QuizState;
      setQuiz(nextQuiz);
      await loadScore(nextQuiz);
    } catch (error) {
      setQuiz(null);
      setScore(fallbackScore);
      setMessage(error instanceof Error ? error.message : "문제를 불러오지 못했습니다.");
    } finally {
      setIsLoadingQuiz(false);
    }
  }

  async function submitAnswer() {
    if (!quiz || !selectedChoice) return;

    setIsSubmittingAnswer(true);
    setMessage(null);

    try {
      const response = await fetch("/api/quiz/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_type: quiz.item_type,
          item_id: quiz.item_id,
          selected_choice: selectedChoice,
        }),
      });

      if (!response.ok) {
        throw new Error("답안을 제출하지 못했습니다.");
      }

      const attemptResult = (await response.json()) as AttemptResult;
      setResult(attemptResult);
      await loadScore(quiz);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "답안을 제출하지 못했습니다.");
    } finally {
      setIsSubmittingAnswer(false);
    }
  }

  async function submitFeedback(feedback: FeedbackValue) {
    if (!quiz) return;

    if (!session?.access_token) {
      setMessage("로그인하면 출제 경험 제보를 제출할 수 있습니다.");
      return;
    }

    setIsSubmittingFeedback(true);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/items/${quiz.item_type}/${quiz.item_id}/exam-seen-feedback`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ feedback }),
        },
      );

      if (!response.ok) {
        throw new Error("출제 경험 제보를 저장하지 못했습니다.");
      }

      setMessage("출제 경험 제보를 저장했습니다.");
      await loadScore(quiz);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "출제 경험 제보를 저장하지 못했습니다.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  }

  return (
    <section className="quiz-shell">
      <div className="hero-copy">
        <p className="section-eyebrow">AI Agent-built JLPT MVP</p>
        <h1>JLPT 단어·문법 퀴즈</h1>
        <p>
          문제를 풀고 정답을 확인한 뒤, 로그인 사용자는 출제 경험 제보를 남길 수 있습니다.
        </p>
      </div>

      <div className="control-grid" aria-label="퀴즈 선택">
        <label>
          JLPT 레벨
          <select value={level} onChange={(event) => setLevel(event.target.value)}>
            {["N5", "N4", "N3", "N2", "N1"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          문제 유형
          <select value={itemType} onChange={(event) => setItemType(event.target.value as ItemType)}>
            <option value="vocab">단어</option>
            <option value="grammar">문법</option>
          </select>
        </label>
        <button type="button" onClick={loadQuiz} disabled={isLoadingQuiz}>
          {isLoadingQuiz ? "불러오는 중" : "문제 불러오기"}
        </button>
      </div>

      {message ? <p className="status-message">{message}</p> : null}

      {quiz ? (
        <article className="quiz-card">
          <p className="section-eyebrow">{level} · {quiz.item_type === "vocab" ? "단어" : "문법"}</p>
          <h2>{quiz.question_text}</h2>
          <div className="choice-list">
            {quiz.choices.map((choice) => (
              <button
                className="choice-button"
                data-selected={selectedChoice === choice.key}
                key={choice.key}
                type="button"
                onClick={() => setSelectedChoice(choice.key)}
              >
                <span>{choice.key}</span>
                {choice.text}
              </button>
            ))}
          </div>
          <button
            className="primary-action"
            type="button"
            onClick={submitAnswer}
            disabled={!selectedChoice || isSubmittingAnswer}
          >
            {isSubmittingAnswer ? "제출 중" : "답안 제출"}
          </button>
        </article>
      ) : (
        <article className="quiz-card">
          <p>문제 불러오기를 눌러 실제 Supabase 문제를 가져오세요.</p>
        </article>
      )}

      {result ? (
        <article className="result-card">
          <p className="section-eyebrow">정답 확인</p>
          <h2>{result.is_correct ? "정답입니다" : "오답입니다"}</h2>
          <p>정답 선택지: {result.correct_choice}</p>
          <p>해설: {result.explanation}</p>

          <div className="feedback-card">
            <h3>이 표현을 JLPT 시험에서 본 기억이 있나요?</h3>
            {session ? (
              <div className="feedback-buttons">
                <button type="button" disabled={isSubmittingFeedback} onClick={() => submitFeedback("yes")}>
                  예
                </button>
                <button type="button" disabled={isSubmittingFeedback} onClick={() => submitFeedback("no")}>
                  아니오
                </button>
                <button type="button" disabled={isSubmittingFeedback} onClick={() => submitFeedback("unknown")}>
                  모르겠다
                </button>
              </div>
            ) : (
              <p>로그인하면 출제 경험 제보를 제출할 수 있습니다.</p>
            )}
          </div>
        </article>
      ) : null}

      <ScoreCard
        perceived_exam_score={score.perceived_exam_score}
        feedback_total_count={score.feedback_total_count}
        correct_rate={score.correct_rate}
        has_enough_data={score.has_enough_data}
      />
    </section>
  );
}

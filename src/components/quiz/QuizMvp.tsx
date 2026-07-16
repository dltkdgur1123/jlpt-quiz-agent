"use client";

import { useState } from "react";

import { ScoreCard } from "@/components/score/ScoreCard";

type ItemType = "vocab" | "grammar";
type ChoiceKey = "A" | "B" | "C" | "D";

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

const sampleQuiz: QuizState = {
  item_type: "vocab",
  item_id: "preview-vocab-1",
  question_text: "다음 단어의 뜻으로 가장 알맞은 것은? 食べる",
  choices: [
    { key: "A", text: "먹다" },
    { key: "B", text: "마시다" },
    { key: "C", text: "보다" },
    { key: "D", text: "가다" },
  ],
};

export function QuizMvp() {
  const [level, setLevel] = useState("N5");
  const [itemType, setItemType] = useState<ItemType>("vocab");
  const [quiz, setQuiz] = useState<QuizState>(sampleQuiz);
  const [selectedChoice, setSelectedChoice] = useState<ChoiceKey | null>(null);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [isLoggedInPreview, setIsLoggedInPreview] = useState(false);

  function loadPreviewQuiz() {
    setQuiz({
      ...sampleQuiz,
      item_type: itemType,
      question_text:
        itemType === "vocab"
          ? "다음 단어의 뜻으로 가장 알맞은 것은? 食べる"
          : "다음 문법 표현의 의미로 가장 알맞은 것은? 〜てもいい",
    });
    setResult(null);
    setSelectedChoice(null);
  }

  function submitAnswer() {
    if (!selectedChoice) return;
    setResult({
      is_correct: selectedChoice === "A",
      correct_choice: "A",
      explanation:
        itemType === "vocab"
          ? "食べる는 먹다라는 뜻입니다."
          : "〜てもいい는 허가를 나타내는 표현입니다.",
    });
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
            {['N5', 'N4', 'N3', 'N2', 'N1'].map((value) => (
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
        <button type="button" onClick={loadPreviewQuiz}>문제 불러오기</button>
      </div>

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
        <button className="primary-action" type="button" onClick={submitAnswer} disabled={!selectedChoice}>
          답안 제출
        </button>
      </article>

      {result ? (
        <article className="result-card">
          <p className="section-eyebrow">정답 확인</p>
          <h2>{result.is_correct ? "정답입니다" : "오답입니다"}</h2>
          <p>정답 선택지: {result.correct_choice}</p>
          <p>해설: {result.explanation}</p>

          <div className="feedback-card">
            <h3>이 표현을 JLPT 시험에서 본 기억이 있나요?</h3>
            {isLoggedInPreview ? (
              <div className="feedback-buttons">
                <button type="button">예</button>
                <button type="button">아니오</button>
                <button type="button">모르겠다</button>
              </div>
            ) : (
              <p>로그인하면 출제 경험 제보를 제출할 수 있습니다.</p>
            )}
            <label className="login-preview">
              <input
                type="checkbox"
                checked={isLoggedInPreview}
                onChange={(event) => setIsLoggedInPreview(event.target.checked)}
              />
              로그인 사용자 미리보기
            </label>
          </div>
        </article>
      ) : null}

      <ScoreCard
        perceived_exam_score={0.42}
        feedback_total_count={5}
        correct_rate={0.68}
        has_enough_data={false}
      />
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";

type ChoiceKey = "A" | "B" | "C" | "D";

type MockExamSectionKey = "vocab" | "grammar" | "reading";

type MockExamQuestion = {
  id: string;
  section_key: MockExamSectionKey;
  section_sort_order: number;
  sort_order: number;
  question_text: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  correct_choice: ChoiceKey;
  explanation: string;
  source_item?: string;
};

type MockExamArtifact = {
  set: {
    set_code: string;
    set_title: string;
    jlpt_level: string;
    time_limit_minutes: number;
    question_count: number;
    listening_included: false;
  };
  sections: Array<{
    section_key: MockExamSectionKey;
    section_title: string;
    sort_order: number;
    question_count: number;
    time_limit_minutes: number;
  }>;
  questions: MockExamQuestion[];
};

const CHOICE_KEYS: ChoiceKey[] = ["A", "B", "C", "D"];

function choiceText(question: MockExamQuestion, key: ChoiceKey) {
  return question[`choice_${key.toLowerCase()}` as "choice_a" | "choice_b" | "choice_c" | "choice_d"];
}

export function MockExamLite({ artifact }: { artifact: MockExamArtifact }) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, ChoiceKey>>({});
  const [submitted, setSubmitted] = useState(false);

  const answeredCount = Object.keys(selectedAnswers).length;
  const unansweredCount = artifact.set.question_count - answeredCount;
  const score = useMemo(
    () =>
      artifact.questions.reduce(
        (total, question) => total + (selectedAnswers[question.id] === question.correct_choice ? 1 : 0),
        0,
      ),
    [artifact.questions, selectedAnswers],
  );

  const sectionResults = artifact.sections.map((section) => {
    const questions = artifact.questions.filter((question) => question.section_key === section.section_key);
    const correct = questions.filter((question) => selectedAnswers[question.id] === question.correct_choice).length;
    return {
      ...section,
      correct,
      rate: questions.length === 0 ? 0 : Math.round((correct / questions.length) * 100),
    };
  });

  return (
    <div className="mock-exam-shell">
      <section className="hero-copy">
        <p className="section-eyebrow">JLPT Mock Exam Lite</p>
        <h1>{artifact.set.set_title}</h1>
        <p>
          청해 없이 문자·어휘와 문법만 먼저 보는 N5 모의고사 Lite입니다. 문제와 보기는 제출 전 일본어만
          노출하고, 해설은 전체 제출 후 확인합니다.
        </p>
        <div className="mock-exam-status-grid" aria-label="모의고사 정보">
          <strong>{artifact.set.question_count}문항</strong>
          <strong>제한 시간 {artifact.set.time_limit_minutes}분</strong>
          <strong>청해 제외</strong>
        </div>
      </section>

      <section className="mock-exam-sticky-status" aria-label="응시 현황">
        <span>답변 {answeredCount}/{artifact.set.question_count}</span>
        <span>미응답 {unansweredCount}</span>
        <span>타이머 {artifact.set.time_limit_minutes}:00</span>
      </section>

      {artifact.sections.map((section) => (
        <section className="mock-exam-section" key={section.section_key}>
          <div className="mock-exam-section-header">
            <p className="section-eyebrow">Section {section.sort_order}</p>
            <h2>{section.section_title}</h2>
            <p>
              {section.question_count}문항 · 권장 {section.time_limit_minutes}분
            </p>
          </div>

          {artifact.questions
            .filter((question) => question.section_key === section.section_key)
            .map((question) => (
              <article className="quiz-card" key={question.id}>
                <p className="section-eyebrow">{question.sort_order} / {artifact.set.question_count}</p>
                <h3>{question.question_text}</h3>
                <div className="choice-list">
                  {CHOICE_KEYS.map((key) => {
                    const selected = selectedAnswers[question.id] === key;
                    const correct = submitted && question.correct_choice === key;
                    const wrongSelected = submitted && selected && !correct;
                    return (
                      <button
                        className="choice-button"
                        data-selected={selected}
                        data-correct={correct}
                        data-wrong={wrongSelected}
                        disabled={submitted}
                        key={key}
                        onClick={() => setSelectedAnswers((answers) => ({ ...answers, [question.id]: key }))}
                        type="button"
                      >
                        <span>{key}</span>
                        {choiceText(question, key)}
                      </button>
                    );
                  })}
                </div>
                {submitted ? (
                  <div className="result-card mock-exam-answer-review">
                    <strong>{selectedAnswers[question.id] === question.correct_choice ? "정답" : "오답"}</strong>
                    <p>정답: {question.correct_choice}</p>
                    <p>{question.explanation}</p>
                  </div>
                ) : null}
              </article>
            ))}
        </section>
      ))}

      <section className="result-card">
        {submitted ? (
          <>
            <p className="section-eyebrow">결과</p>
            <h2>
              {score} / {artifact.set.question_count}
            </h2>
            <div className="mock-exam-status-grid">
              {sectionResults.map((result) => (
                <strong key={result.section_key}>
                  {result.section_title}: {result.correct}/{result.question_count} ({result.rate}%)
                </strong>
              ))}
            </div>
            <p>공식 JLPT 점수 환산이나 합격 판정이 아닌 학습 참고용 모의고사 Lite 결과입니다.</p>
          </>
        ) : (
          <>
            <p>전체 제출 전까지 정답 여부와 한국어 해설은 숨겨집니다.</p>
            <button className="primary-action" onClick={() => setSubmitted(true)} type="button">
              전체 제출
            </button>
          </>
        )}
      </section>
    </div>
  );
}

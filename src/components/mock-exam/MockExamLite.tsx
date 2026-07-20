"use client";

import { useEffect, useMemo, useState } from "react";

type ChoiceKey = "A" | "B" | "C" | "D";
type FeedbackValue = "yes" | "no" | "unknown";

type MockExamSectionKey = "vocab" | "grammar" | "reading";
type MockExamQuestionType =
  | "vocab_reading"
  | "vocab_orthography"
  | "vocab_context_blank"
  | "vocab_paraphrase"
  | "grammar_sentence_blank"
  | "grammar_sentence_build"
  | "grammar_text_blank"
  | "reading_short"
  | "reading_medium"
  | "reading_info";

type MockExamQuestion = {
  id: string;
  section_key: MockExamSectionKey;
  section_sort_order: number;
  sort_order: number;
  question_type: MockExamQuestionType;
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

type ProblemDefinition = {
  problemNo: number;
  sectionKey: MockExamSectionKey;
  questionTypes: MockExamQuestionType[];
  title: string;
  instructionJa: string;
  instructionKo: string;
};

type RenderedChoice = {
  renderedKey: ChoiceKey;
  originalKey: ChoiceKey;
  text: string;
};

const CHOICE_KEYS: ChoiceKey[] = ["A", "B", "C", "D"];
const CHOICE_NUMBERS: Record<ChoiceKey, string> = { A: "1", B: "2", C: "3", D: "4" };
const FEEDBACK_LABELS: Record<FeedbackValue, string> = {
  yes: "본 적 있음",
  no: "본 적 없음",
  unknown: "모르겠음",
};

const PROBLEM_DEFINITIONS: ProblemDefinition[] = [
  {
    problemNo: 1,
    sectionKey: "vocab",
    questionTypes: ["vocab_reading"],
    title: "漢字読み",
    instructionJa: "問題１　＿＿のことばはどう読みますか。１・２・３・４から一つ選びなさい。",
    instructionKo: "밑줄 친 단어의 읽는 법을 고르세요.",
  },
  {
    problemNo: 2,
    sectionKey: "vocab",
    questionTypes: ["vocab_orthography"],
    title: "表記",
    instructionJa: "問題２　＿＿のことばを漢字で書くとき、最もよいものを１・２・３・４から一つ選びなさい。",
    instructionKo: "밑줄 친 말을 한자로 바르게 쓴 것을 고르세요.",
  },
  {
    problemNo: 3,
    sectionKey: "vocab",
    questionTypes: ["vocab_context_blank"],
    title: "文脈規定",
    instructionJa: "問題３　（　　　）に入れるのに最もよいものを、１・２・３・４から一つ選びなさい。",
    instructionKo: "빈칸에 들어갈 가장 알맞은 말을 고르세요.",
  },
  {
    problemNo: 4,
    sectionKey: "vocab",
    questionTypes: ["vocab_paraphrase"],
    title: "言い換え類義",
    instructionJa: "問題４　次の文とだいたい同じ意味の文を、１・２・３・４から一つ選びなさい。",
    instructionKo: "뜻이 가장 비슷한 문장을 고르세요.",
  },
  {
    problemNo: 5,
    sectionKey: "grammar",
    questionTypes: ["grammar_sentence_blank"],
    title: "文法形式の判断",
    instructionJa: "問題５　（　　　）に入れるのに最もよいものを、１・２・３・４から一つ選びなさい。",
    instructionKo: "빈칸에 들어갈 가장 알맞은 문법 표현을 고르세요.",
  },
  {
    problemNo: 6,
    sectionKey: "grammar",
    questionTypes: ["grammar_sentence_build"],
    title: "文の組み立て",
    instructionJa: "問題６　次の文の ★ に入る最もよいものを、１・２・３・４から一つ選びなさい。",
    instructionKo: "★ 자리에 들어갈 가장 알맞은 말을 고르세요.",
  },
  {
    problemNo: 7,
    sectionKey: "grammar",
    questionTypes: ["grammar_text_blank"],
    title: "文章の文法",
    instructionJa: "問題７　次の文章を読んで、（　　　）に入る最もよいものを、１・２・３・４から一つ選びなさい。",
    instructionKo: "글을 읽고 빈칸에 들어갈 가장 알맞은 말을 고르세요.",
  },
  {
    problemNo: 8,
    sectionKey: "reading",
    questionTypes: ["reading_short", "reading_medium"],
    title: "内容理解",
    instructionJa: "問題８　次の文章を読んで、質問に答えなさい。答えは１・２・３・４から一つ選びなさい。",
    instructionKo: "글을 읽고 질문에 맞는 답을 고르세요.",
  },
  {
    problemNo: 9,
    sectionKey: "reading",
    questionTypes: ["reading_info"],
    title: "情報検索",
    instructionJa: "問題９　次の案内を見て、質問に答えなさい。答えは１・２・３・４から一つ選びなさい。",
    instructionKo: "안내문을 보고 질문에 맞는 답을 고르세요.",
  },
];

function choiceText(question: MockExamQuestion, key: ChoiceKey) {
  return question[`choice_${key.toLowerCase()}` as "choice_a" | "choice_b" | "choice_c" | "choice_d"];
}

function hashSeed(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function nextSeed(seed: number) {
  return Math.imul(seed ^ (seed >>> 15), 2246822507) >>> 0;
}

function buildRenderedChoices(question: MockExamQuestion, attemptSeed: string): RenderedChoice[] {
  const originalChoices = CHOICE_KEYS.map((originalKey) => ({
    originalKey,
    text: choiceText(question, originalKey),
  }));
  let seed = hashSeed(`${attemptSeed}:${question.id}`);
  const shuffledChoices = [...originalChoices];

  for (let index = shuffledChoices.length - 1; index > 0; index -= 1) {
    seed = nextSeed(seed + index);
    const swapIndex = seed % (index + 1);
    [shuffledChoices[index], shuffledChoices[swapIndex]] = [shuffledChoices[swapIndex], shuffledChoices[index]];
  }

  const originalCorrectIndex = CHOICE_KEYS.indexOf(question.correct_choice);
  const renderedCorrectIndex = shuffledChoices.findIndex((choice) => choice.originalKey === question.correct_choice);
  if (renderedCorrectIndex === originalCorrectIndex) {
    const swapIndex = (renderedCorrectIndex + 1) % shuffledChoices.length;
    [shuffledChoices[renderedCorrectIndex], shuffledChoices[swapIndex]] = [
      shuffledChoices[swapIndex],
      shuffledChoices[renderedCorrectIndex],
    ];
  }

  return shuffledChoices.map((choice, index) => ({ ...choice, renderedKey: CHOICE_KEYS[index] }));
}

function renderedCorrectChoice(question: MockExamQuestion, renderedChoices: RenderedChoice[]) {
  return renderedChoices.find((choice) => choice.originalKey === question.correct_choice)?.renderedKey ?? question.correct_choice;
}

function problemQuestions(artifact: MockExamArtifact, problem: ProblemDefinition) {
  return artifact.questions.filter((question) => problem.questionTypes.includes(question.question_type));
}

function formatQuestionNumber(problem: ProblemDefinition, questionIndex: number) {
  return `${problem.problemNo}-${questionIndex + 1}`;
}

export function MockExamLite({ artifact }: { artifact: MockExamArtifact }) {
  const [attemptSeed, setAttemptSeed] = useState(() => `${artifact.set.set_code}:initial`);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, ChoiceKey>>({});
  const [seenFeedbacks, setSeenFeedbacks] = useState<Record<string, FeedbackValue>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const nextAttemptSeed = `${artifact.set.set_code}:${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36)}`;
    queueMicrotask(() => setAttemptSeed(nextAttemptSeed));
  }, [artifact.set.set_code]);

  const renderedChoiceMap = useMemo(
    () =>
      Object.fromEntries(
        artifact.questions.map((question) => [question.id, buildRenderedChoices(question, attemptSeed)]),
      ) as Record<string, RenderedChoice[]>,
    [artifact.questions, attemptSeed],
  );

  const answeredCount = Object.keys(selectedAnswers).length;
  const unansweredCount = artifact.set.question_count - answeredCount;
  const score = useMemo(
    () =>
      artifact.questions.reduce((total, question) => {
        const renderedChoices = renderedChoiceMap[question.id] ?? buildRenderedChoices(question, attemptSeed);
        return total + (selectedAnswers[question.id] === renderedCorrectChoice(question, renderedChoices) ? 1 : 0);
      }, 0),
    [artifact.questions, attemptSeed, renderedChoiceMap, selectedAnswers],
  );

  const sectionResults = artifact.sections.map((section) => {
    const questions = artifact.questions.filter((question) => question.section_key === section.section_key);
    const correct = questions.filter((question) => {
      const renderedChoices = renderedChoiceMap[question.id] ?? buildRenderedChoices(question, attemptSeed);
      return selectedAnswers[question.id] === renderedCorrectChoice(question, renderedChoices);
    }).length;
    return {
      ...section,
      correct,
      rate: questions.length === 0 ? 0 : Math.round((correct / questions.length) * 100),
    };
  });

  const feedbackSummary = {
    yes: Object.values(seenFeedbacks).filter((feedback) => feedback === "yes").length,
    no: Object.values(seenFeedbacks).filter((feedback) => feedback === "no").length,
    unknown: Object.values(seenFeedbacks).filter((feedback) => feedback === "unknown").length,
  };

  return (
    <div className="mock-exam-shell">
      <section className="hero-copy">
        <p className="section-eyebrow">JLPT Mock Exam Lite</p>
        <h1>{artifact.set.set_title}</h1>
        <p>
          청해 없이 문자·어휘·문법·독해를 먼저 보는 N5 모의고사 Lite입니다. 문제와 보기는 제출 전 일본어만
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

      {artifact.sections.map((section) => {
        const problems = PROBLEM_DEFINITIONS.filter((problem) => problem.sectionKey === section.section_key);
        return (
          <section className="mock-exam-section" key={section.section_key}>
            <div className="mock-exam-section-header">
              <p className="section-eyebrow">Section {section.sort_order}</p>
              <h2>{section.section_title}</h2>
              <p>
                {section.question_count}문항 · 권장 {section.time_limit_minutes}분
              </p>
            </div>

            {problems.map((problem) => {
              const questions = problemQuestions(artifact, problem);
              if (questions.length === 0) return null;

              return (
                <section className="mock-exam-problem-group" key={problem.problemNo}>
                  <div className="mock-exam-problem-instruction">
                    <p className="section-eyebrow">{problem.title}</p>
                    <h3>{problem.instructionJa}</h3>
                    <p>풀이 안내: {problem.instructionKo}</p>
                  </div>

                  {questions.map((question, questionIndex) => (
                    <article className="quiz-card" key={question.id}>
                      <p className="section-eyebrow">
                        問題{problem.problemNo} · {formatQuestionNumber(problem, questionIndex)} / {artifact.set.question_count}
                      </p>
                      <h4>{question.question_text}</h4>
                      <div className="choice-list">
                        {(renderedChoiceMap[question.id] ?? buildRenderedChoices(question, attemptSeed)).map((choice) => {
                          const renderedKey = choice.renderedKey;
                          const questionCorrectChoice = renderedCorrectChoice(
                            question,
                            renderedChoiceMap[question.id] ?? buildRenderedChoices(question, attemptSeed),
                          );
                          const selected = selectedAnswers[question.id] === renderedKey;
                          const correct = submitted && questionCorrectChoice === renderedKey;
                          const wrongSelected = submitted && selected && !correct;
                          return (
                            <button
                              className="choice-button"
                              data-selected={selected}
                              data-correct={correct}
                              data-wrong={wrongSelected}
                              disabled={submitted}
                              key={renderedKey}
                              onClick={() => setSelectedAnswers((answers) => ({ ...answers, [question.id]: renderedKey }))}
                              type="button"
                            >
                              <span>{CHOICE_NUMBERS[renderedKey]}</span>
                              {choice.text}
                            </button>
                          );
                        })}
                      </div>
                      {submitted ? (
                        <div className="result-card mock-exam-answer-review">
                          <strong>
                            {selectedAnswers[question.id] ===
                            renderedCorrectChoice(
                              question,
                              renderedChoiceMap[question.id] ?? buildRenderedChoices(question, attemptSeed),
                            )
                              ? "정답"
                              : "오답"}
                          </strong>
                          <p>
                            정답: {CHOICE_NUMBERS[
                              renderedCorrectChoice(
                                question,
                                renderedChoiceMap[question.id] ?? buildRenderedChoices(question, attemptSeed),
                              )
                            ]}
                          </p>
                          <p>{question.explanation}</p>
                          <div className="mock-exam-seen-feedback">
                            <h4>이 문제가 실제 JLPT에서 출제된 적 있는 것처럼 느껴졌나요?</h4>
                            <div className="feedback-buttons">
                              {(Object.keys(FEEDBACK_LABELS) as FeedbackValue[]).map((feedback) => (
                                <button
                                  data-selected={seenFeedbacks[question.id] === feedback}
                                  key={feedback}
                                  onClick={() =>
                                    setSeenFeedbacks((feedbacks) => ({ ...feedbacks, [question.id]: feedback }))
                                  }
                                  type="button"
                                >
                                  {FEEDBACK_LABELS[feedback]}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </article>
                  ))}
                </section>
              );
            })}
          </section>
        );
      })}

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
            <div className="mock-exam-feedback-summary">
              <h3>출제 경험 체크</h3>
              <p>
                본 적 있음 {feedbackSummary.yes} · 본 적 없음 {feedbackSummary.no} · 모르겠음 {feedbackSummary.unknown}
              </p>
              <p>현재 모의고사 화면에서는 세트 내 임시 기록이며, 로그인 기반 저장/API 연결은 다음 티켓에서 반영합니다.</p>
            </div>
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

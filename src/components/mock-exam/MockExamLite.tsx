"use client";

import { useEffect, useMemo, useState } from "react";
import { mergeRecentQuestionHistory, recentQuestionIdSet } from "@/lib/mock-exam/recent-history";

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
const RECENT_HISTORY_STORAGE_KEY = "jlpt-mock-exam-recent-question-history";
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
    instructionJa: "問題１　「　」のことばはどう読みますか。１・２・３・４から一つ選びなさい。",
    instructionKo: "「　」 안 단어의 읽는 법을 고르세요.",
  },
  {
    problemNo: 2,
    sectionKey: "vocab",
    questionTypes: ["vocab_orthography"],
    title: "表記",
    instructionJa: "問題２　「　」のことばを漢字で書くとき、最もよいものを１・２・３・４から一つ選びなさい。",
    instructionKo: "「　」 안 말을 한자로 바르게 쓴 것을 고르세요.",
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

function problemForQuestion(question: MockExamQuestion) {
  return PROBLEM_DEFINITIONS.find((problem) => problem.questionTypes.includes(question.question_type));
}

function formatReviewLabel(question: MockExamQuestion) {
  const problem = problemForQuestion(question);
  if (!problem) return `문항 ${question.sort_order}`;
  const problemQuestionsInSection = question.sort_order;
  return `問題${problem.problemNo} · ${problem.title} · ${problemQuestionsInSection}번`;
}

function readRecentQuestionHistory() {
  if (typeof window === "undefined") return [];

  try {
    const rawHistory = window.localStorage.getItem(RECENT_HISTORY_STORAGE_KEY);
    if (!rawHistory) return [];
    const parsedHistory = JSON.parse(rawHistory) as Array<{ question_id?: unknown; seen_at?: unknown }>;
    return parsedHistory
      .filter((entry) => typeof entry.question_id === "string" && typeof entry.seen_at === "string")
      .map((entry) => ({ question_id: entry.question_id as string, seen_at: entry.seen_at as string }));
  } catch {
    return [];
  }
}

function writeRecentQuestionHistory(questionIds: string[]) {
  if (typeof window === "undefined") return 0;

  const nextHistory = mergeRecentQuestionHistory(readRecentQuestionHistory(), questionIds, new Date().toISOString());
  window.localStorage.setItem(RECENT_HISTORY_STORAGE_KEY, JSON.stringify(nextHistory));
  return nextHistory.length;
}

export function MockExamLite({ artifact }: { artifact: MockExamArtifact }) {
  const [attemptSeed, setAttemptSeed] = useState(() => `${artifact.set.set_code}:initial`);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, ChoiceKey>>({});
  const [seenFeedbacks, setSeenFeedbacks] = useState<Record<string, FeedbackValue>>({});
  const [recentQuestionCount, setRecentQuestionCount] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const nextAttemptSeed = `${artifact.set.set_code}:${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36)}`;
    queueMicrotask(() => setAttemptSeed(nextAttemptSeed));
  }, [artifact.set.set_code]);

  useEffect(() => {
    const recentIds = recentQuestionIdSet(readRecentQuestionHistory(), Date.now());
    const nextRecentQuestionCount = artifact.questions.filter((question) => recentIds.has(question.id)).length;
    queueMicrotask(() => setRecentQuestionCount(nextRecentQuestionCount));
  }, [artifact.questions]);

  const renderedChoiceMap = useMemo(
    () =>
      Object.fromEntries(
        artifact.questions.map((question) => [question.id, buildRenderedChoices(question, attemptSeed)]),
      ) as Record<string, RenderedChoice[]>,
    [artifact.questions, attemptSeed],
  );

  const answeredCount = Object.keys(selectedAnswers).length;
  const unansweredCount = artifact.set.question_count - answeredCount;
  const progressPercent = Math.round((answeredCount / artifact.set.question_count) * 100);
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
      wrongOrBlank: questions.length - correct,
      rate: questions.length === 0 ? 0 : Math.round((correct / questions.length) * 100),
    };
  });

  const reviewTargets = artifact.questions
    .map((question) => {
      const renderedChoices = renderedChoiceMap[question.id] ?? buildRenderedChoices(question, attemptSeed);
      const correctChoice = renderedCorrectChoice(question, renderedChoices);
      const selectedChoice = selectedAnswers[question.id];
      return {
        question,
        correctChoice,
        selectedChoice,
        isCorrect: selectedChoice === correctChoice,
      };
    })
    .filter((target) => !target.isCorrect);

  const weakestSections = [...sectionResults]
    .sort((a, b) => b.wrongOrBlank - a.wrongOrBlank || a.rate - b.rate)
    .filter((section) => section.wrongOrBlank > 0)
    .slice(0, 2);

  const feedbackSummary = {
    yes: Object.values(seenFeedbacks).filter((feedback) => feedback === "yes").length,
    no: Object.values(seenFeedbacks).filter((feedback) => feedback === "no").length,
    unknown: Object.values(seenFeedbacks).filter((feedback) => feedback === "unknown").length,
  };

  function submitMockExam() {
    setSubmitted(true);
    setRecentQuestionCount(writeRecentQuestionHistory(artifact.questions.map((question) => question.id)));
  }

  return (
    <div className="mock-exam-shell">
      <section className="hero-copy mock-exam-hero">
        <p className="section-eyebrow">JLPT Mock Exam Lite</p>
        <h1>{artifact.set.set_title}</h1>
        <p>
          청해 없이 문자·어휘·문법·독해를 먼저 보는 N5 모의고사 Lite입니다. 문제와 보기는 제출 전 일본어만
          노출하고, 해설은 전체 제출 후 확인합니다.
        </p>
        <div className="mock-exam-status-grid" aria-label="모의고사 정보">
          <strong><span>문항</span>{artifact.set.question_count}문항</strong>
          <strong><span>제한 시간</span>{artifact.set.time_limit_minutes}분</strong>
          <strong><span>범위</span>청해 제외</strong>
          <strong><span>최근 풀이 중복</span>{recentQuestionCount}문항</strong>
        </div>
      </section>

      <section className="mock-exam-sticky-status" aria-label="응시 현황">
        <div className="mock-exam-progress-copy">
          <strong>진행률 {progressPercent}%</strong>
          <span>답변 {answeredCount}/{artifact.set.question_count} · 미응답 {unansweredCount}</span>
        </div>
        <div className="mock-exam-progress-bar" aria-hidden="true">
          <span style={{ width: `${progressPercent}%` }} />
        </div>
        <span className="mock-exam-timer">타이머 {artifact.set.time_limit_minutes}:00</span>
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
                    <article className="quiz-card" id={`question-${question.id}`} key={question.id}>
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
            <div className="mock-exam-feedback-summary">
              <h3>복습 우선순위</h3>
              {weakestSections.length > 0 ? (
                <p>
                  먼저 볼 영역: {weakestSections.map((section) => `${section.section_title} ${section.wrongOrBlank}문항`).join(" · ")}
                </p>
              ) : (
                <p>전 문항 정답입니다. 다음 세트로 넘어가도 좋습니다.</p>
              )}
              <p>오답·미응답 {reviewTargets.length}문항을 아래에서 바로 확인하세요.</p>
            </div>
            {reviewTargets.length > 0 ? (
              <div className="mock-exam-feedback-summary">
                <h3>오답·미응답 노트</h3>
                <ol className="mock-exam-review-list">
                  {reviewTargets.slice(0, 12).map(({ question, selectedChoice, correctChoice }) => (
                    <li key={question.id}>
                      <a href={`#question-${question.id}`}>{formatReviewLabel(question)}</a>
                      <span>
                        내 답 {selectedChoice ? CHOICE_NUMBERS[selectedChoice] : "미응답"} · 정답 {CHOICE_NUMBERS[correctChoice]}
                      </span>
                    </li>
                  ))}
                </ol>
                {reviewTargets.length > 12 ? <p>상위 12문항만 먼저 표시합니다.</p> : null}
              </div>
            ) : null}
            <p>공식 JLPT 점수 환산이나 합격 판정이 아닌 학습 참고용 모의고사 Lite 결과입니다.</p>
            <div className="mock-exam-feedback-summary">
              <h3>최근 출제 문항 기록</h3>
              <p>이번 세트의 {artifact.set.question_count}문항을 최근 풀이 기록에 저장했습니다.</p>
              <p>다음 랜덤 세트부터 같은 사용자에게 최근 7일 내 문항을 뒤로 미루는 회피 기준으로 사용합니다.</p>
            </div>
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
            <button className="primary-action" onClick={submitMockExam} type="button">
              전체 제출
            </button>
          </>
        )}
      </section>
    </div>
  );
}

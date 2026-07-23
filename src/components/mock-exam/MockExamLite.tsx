"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { mergeRecentQuestionHistory, recentQuestionIdSet } from "@/lib/mock-exam/recent-history";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

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
const IN_PROGRESS_STORAGE_KEY = "jlpt-mock-exam-in-progress";

type MockExamDraft = {
  set_code: string;
  set_title: string;
  jlpt_level: string;
  question_count: number;
  href: string;
  attempt_seed: string;
  selected_answers: Record<string, ChoiceKey>;
  current_question_index: number;
  updated_at: string;
};

const FEEDBACK_LABELS: Record<FeedbackValue, string> = {
  yes: "본 적 있음",
  no: "본 적 없음",
  unknown: "모르겠음",
};

const MOCK_TOTAL_SCORE = 180;
const MOCK_LANGUAGE_READING_SCORE = 120;
const MOCK_LISTENING_SCORE = 60;
const MOCK_PASS_TOTAL_THRESHOLD = 80;
const MOCK_SECTION_RATE_THRESHOLD = 30;

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

function problemForQuestion(question: MockExamQuestion) {
  return PROBLEM_DEFINITIONS.find((problem) => problem.questionTypes.includes(question.question_type));
}

function formatReviewLabel(question: MockExamQuestion) {
  const problem = problemForQuestion(question);
  if (!problem) return `문항 ${question.sort_order}`;
  const problemQuestionsInSection = question.sort_order;
  return `問題${problem.problemNo} · ${problem.title} · ${problemQuestionsInSection}번`;
}

function formatMockExamDate() {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).format(new Date());
}

function scaledScore(correct: number, total: number, maxScore: number) {
  if (total === 0) return 0;
  return Math.round((correct / total) * maxScore);
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

function readInProgressDraft(setCode: string) {
  if (typeof window === "undefined") return null;

  try {
    const rawDraft = window.localStorage.getItem(IN_PROGRESS_STORAGE_KEY);
    if (!rawDraft) return null;
    const draft = JSON.parse(rawDraft) as Partial<MockExamDraft>;
    if (draft.set_code !== setCode || typeof draft.attempt_seed !== "string") return null;
    if (!draft.selected_answers || typeof draft.selected_answers !== "object") return null;
    return draft as MockExamDraft;
  } catch {
    return null;
  }
}

function writeInProgressDraft(draft: MockExamDraft) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(IN_PROGRESS_STORAGE_KEY, JSON.stringify(draft));
}

function clearInProgressDraft(setCode: string) {
  if (typeof window === "undefined") return;
  const draft = readInProgressDraft(setCode);
  if (draft?.set_code === setCode) window.localStorage.removeItem(IN_PROGRESS_STORAGE_KEY);
}

export function MockExamLite({ artifact }: { artifact: MockExamArtifact }) {
  const [attemptSeed, setAttemptSeed] = useState(() => `${artifact.set.set_code}:initial`);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, ChoiceKey>>({});
  const [seenFeedbacks, setSeenFeedbacks] = useState<Record<string, FeedbackValue>>({});
  const [recentQuestionCount, setRecentQuestionCount] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submitWarning, setSubmitWarning] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "login_required" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const questionNavScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const draft = readInProgressDraft(artifact.set.set_code);
    if (draft) {
      queueMicrotask(() => {
        setAttemptSeed(draft.attempt_seed);
        setSelectedAnswers(draft.selected_answers);
        setCurrentQuestionIndex(Math.min(Math.max(0, draft.current_question_index ?? 0), artifact.questions.length - 1));
        setExamStarted(true);
      });
      return;
    }

    const nextAttemptSeed = `${artifact.set.set_code}:${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36)}`;
    queueMicrotask(() => setAttemptSeed(nextAttemptSeed));
  }, [artifact.questions.length, artifact.set.set_code]);

  useEffect(() => {
    const recentIds = recentQuestionIdSet(readRecentQuestionHistory(), Date.now());
    const nextRecentQuestionCount = artifact.questions.filter((question) => recentIds.has(question.id)).length;
    queueMicrotask(() => setRecentQuestionCount(nextRecentQuestionCount));
  }, [artifact.questions]);

  useEffect(() => {
    if (!examStarted || submitted) return;
    const activeButton = questionNavScrollRef.current?.querySelector<HTMLButtonElement>('[data-current="true"]');
    requestAnimationFrame(() => activeButton?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" }));
  }, [currentQuestionIndex, examStarted, submitted]);

  useEffect(() => {
    if (!examStarted || submitted) return;
    writeInProgressDraft({
      set_code: artifact.set.set_code,
      set_title: artifact.set.set_title,
      jlpt_level: artifact.set.jlpt_level,
      question_count: artifact.set.question_count,
      href: window.location.pathname,
      attempt_seed: attemptSeed,
      selected_answers: selectedAnswers,
      current_question_index: currentQuestionIndex,
      updated_at: new Date().toISOString(),
    });
  }, [artifact.set, attemptSeed, currentQuestionIndex, examStarted, selectedAnswers, submitted]);

  const renderedChoiceMap = useMemo(
    () =>
      Object.fromEntries(
        artifact.questions.map((question) => [question.id, buildRenderedChoices(question, attemptSeed)]),
      ) as Record<string, RenderedChoice[]>,
    [artifact.questions, attemptSeed],
  );

  const flattenedQuestions = useMemo(
    () =>
      PROBLEM_DEFINITIONS.flatMap((problem) =>
        problemQuestions(artifact, problem).map((question, questionIndex) => ({ problem, question, questionIndex })),
      ),
    [artifact],
  );
  const currentQuestion = flattenedQuestions[currentQuestionIndex] ?? flattenedQuestions[0];
  const currentQuestionNumber = currentQuestionIndex + 1;
  const currentRenderedChoices = currentQuestion
    ? renderedChoiceMap[currentQuestion.question.id] ?? buildRenderedChoices(currentQuestion.question, attemptSeed)
    : [];
  const currentCorrectChoice = currentQuestion
    ? renderedCorrectChoice(currentQuestion.question, currentRenderedChoices)
    : "A";

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

  const languageReadingScore = scaledScore(score, artifact.set.question_count, MOCK_LANGUAGE_READING_SCORE);
  const listeningScore = artifact.set.listening_included ? scaledScore(score, artifact.set.question_count, MOCK_LISTENING_SCORE) : 0;
  const totalMockScore = languageReadingScore + listeningScore;
  const answerRate = Math.round((score / artifact.set.question_count) * 100);
  const sectionResultMap = Object.fromEntries(sectionResults.map((section) => [section.section_key, section]));
  const vocabScore = scaledScore(sectionResultMap.vocab?.correct ?? 0, sectionResultMap.vocab?.question_count ?? 0, 60);
  const grammarScore = scaledScore(sectionResultMap.grammar?.correct ?? 0, sectionResultMap.grammar?.question_count ?? 0, 60);
  const readingScore = scaledScore(sectionResultMap.reading?.correct ?? 0, sectionResultMap.reading?.question_count ?? 0, 60);
  const listeningGoal = 30;
  const categoryScores = [
    { label: "문자·어휘", score: vocabScore, goal: 35, detail: `${sectionResultMap.vocab?.correct ?? 0}/${sectionResultMap.vocab?.question_count ?? 0}` },
    { label: "읽기", score: readingScore, goal: 35, detail: `${sectionResultMap.reading?.correct ?? 0}/${sectionResultMap.reading?.question_count ?? 0}` },
    { label: "문법", score: grammarScore, goal: 35, detail: `${sectionResultMap.grammar?.correct ?? 0}/${sectionResultMap.grammar?.question_count ?? 0}` },
    { label: "듣기", score: listeningScore, goal: listeningGoal, detail: "0/60" },
  ];
  const historyBarHeight = Math.max(8, Math.round((totalMockScore / MOCK_TOTAL_SCORE) * 100));
  const lowestSectionRate = Math.min(...sectionResults.map((section) => section.rate));
  const mockPassed = totalMockScore >= MOCK_PASS_TOTAL_THRESHOLD && lowestSectionRate >= MOCK_SECTION_RATE_THRESHOLD;
  const passStatusLabel = mockPassed ? "合格 Passed" : "不合格 Not Passed";
  const passAdvice = mockPassed
    ? "현재 세트 기준으로는 합격권입니다. 오답 노트로 약한 영역만 정리하세요."
    : "약한 영역을 먼저 복습한 뒤 같은 형식으로 다시 풀어보세요.";
  const examDate = formatMockExamDate();

  function requestSubmitMockExam() {
    if (submitted || saveStatus === "saving") return;
    if (unansweredCount > 0 && !submitWarning) {
      setSubmitWarning(`미응답 ${unansweredCount}문항이 있습니다. 그래도 제출하시겠습니까?`);
      return;
    }
    setSubmitWarning(null);
    void submitMockExam();
  }

  function forceSubmitMockExam() {
    if (submitted || saveStatus === "saving") return;
    setSubmitWarning(null);
    void submitMockExam();
  }

  function saveDraft(nextAnswers: Record<string, ChoiceKey>, nextQuestionIndex = currentQuestionIndex) {
    if (submitted) return;
    writeInProgressDraft({
      set_code: artifact.set.set_code,
      set_title: artifact.set.set_title,
      jlpt_level: artifact.set.jlpt_level,
      question_count: artifact.set.question_count,
      href: window.location.pathname,
      attempt_seed: attemptSeed,
      selected_answers: nextAnswers,
      current_question_index: nextQuestionIndex,
      updated_at: new Date().toISOString(),
    });
  }

  function selectAnswer(questionId: string, renderedKey: ChoiceKey) {
    setSelectedAnswers((answers) => {
      const nextAnswers = { ...answers, [questionId]: renderedKey };
      saveDraft(nextAnswers);
      return nextAnswers;
    });
  }

  function moveQuestion(nextQuestionIndex: number) {
    const boundedIndex = Math.min(Math.max(0, nextQuestionIndex), flattenedQuestions.length - 1);
    const draftAnswers = readInProgressDraft(artifact.set.set_code)?.selected_answers;
    setCurrentQuestionIndex(boundedIndex);
    saveDraft(draftAnswers ?? selectedAnswers, boundedIndex);
  }

  async function submitMockExam() {
    setSubmitted(true);
    clearInProgressDraft(artifact.set.set_code);
    setSaveStatus("saving");
    setSaveMessage("로그인 상태를 확인하고 모의고사 기록을 저장하는 중입니다.");
    setRecentQuestionCount(writeRecentQuestionHistory(artifact.questions.map((question) => question.id)));

    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;

      if (!accessToken) {
        setSaveStatus("login_required");
        setSaveMessage("로그인하면 이 모의고사 결과가 대시보드에 저장됩니다.");
        return;
      }

      const answerRows = artifact.questions.map((question) => {
        const renderedChoices = renderedChoiceMap[question.id] ?? buildRenderedChoices(question, attemptSeed);
        const selectedChoice = selectedAnswers[question.id] ?? null;
        return {
          question_id: question.id,
          section_key: question.section_key,
          selected_choice: selectedChoice,
          is_correct: selectedChoice === renderedCorrectChoice(question, renderedChoices),
        };
      });

      const response = await fetch("/api/mock-exams/attempts", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          set_code: artifact.set.set_code,
          set_title: artifact.set.set_title,
          jlpt_level: artifact.set.jlpt_level,
          time_limit_minutes: artifact.set.time_limit_minutes,
          question_count: artifact.set.question_count,
          score_total: totalMockScore,
          score_max: MOCK_TOTAL_SCORE,
          correct_count: score,
          elapsed_seconds: null,
          answers: answerRows,
          section_results: sectionResults.map((section) => ({
            section_key: section.section_key,
            correct: section.correct,
            question_count: section.question_count,
            rate: section.rate,
          })),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error ?? "failed to save mock exam attempt");
      }

      setSaveStatus("saved");
      setSaveMessage("모의고사 기록을 저장했습니다. 대시보드에서 최근 성적을 확인할 수 있습니다.");
    } catch (error) {
      setSaveStatus("error");
      setSaveMessage(error instanceof Error ? error.message : "모의고사 기록 저장에 실패했습니다.");
    }
  }

  return (
    <div className={`mock-exam-shell ${examStarted ? "mock-exam-shell--active" : "mock-exam-shell--start"}`}>
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

      {!examStarted ? (
        <section className="mock-exam-start-card" aria-label="시험 시작 안내">
          <div>
            <p className="section-eyebrow">Before you start</p>
            <h2>준비가 되면 시험을 시작하세요</h2>
            <p>
              시작 후에는 {artifact.set.question_count}문항이 시험 화면에 표시됩니다. 정답과 해설은 전체 제출 후에만 공개되고,
              우측 문제 목록에서 답변 상태를 확인하며 원하는 문제로 이동할 수 있습니다.
            </p>
          </div>
          <ul>
            <li>청해 제외 · 문자·어휘/문법/독해</li>
            <li>제한 시간 {artifact.set.time_limit_minutes}분</li>
            <li>미응답 문항은 제출 전 한 번 더 확인</li>
            <li>
              본 모의고사는 공식 JLPT 기출문제가 아니며, JLPT 시험 형식을 참고해 제작한 학습용 연습 문제입니다.
              결과와 점수는 학습 참고용으로 제공되며, 실제 시험의 합격 여부나 출제 가능성을 보장하지 않습니다.
            </li>
          </ul>
          <button className="primary-action" onClick={() => setExamStarted(true)} type="button">
            시험 시작
          </button>
        </section>
      ) : (
        <>
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

      <div className="mock-exam-workspace">
        <div className="mock-exam-paper-column">
          {currentQuestion ? (
            <section className="mock-exam-section mock-exam-focus-panel" aria-label="현재 문제">
              <div className="mock-exam-question-meta">
                <strong>{artifact.set.jlpt_level}</strong>
                <span>{artifact.set.set_title}</span>
                <em>
                  {currentQuestionNumber} / {artifact.set.question_count}
                </em>
              </div>
              <div className="mock-exam-problem-instruction">
                <p className="section-eyebrow">問題{currentQuestion.problem.problemNo} · {currentQuestion.problem.title}</p>
                <h3>{currentQuestion.problem.instructionJa}</h3>
                <p>풀이 안내: {currentQuestion.problem.instructionKo}</p>
              </div>
              <article className="quiz-card mock-exam-current-card" id={`question-${currentQuestion.question.id}`}>
                <div className="mock-current-question-head">
                  <p className="section-eyebrow">문제 {currentQuestionNumber}</p>
                  <button type="button" aria-label="북마크">북마크 ☆</button>
                </div>
                <h4>{currentQuestion.question.question_text}</h4>
                <div className="choice-list">
                  {currentRenderedChoices.map((choice) => {
                    const renderedKey = choice.renderedKey;
                    const selected = selectedAnswers[currentQuestion.question.id] === renderedKey;
                    const correct = submitted && currentCorrectChoice === renderedKey;
                    const wrongSelected = submitted && selected && !correct;
                    return (
                      <button
                        className="choice-button"
                        data-selected={selected}
                        data-correct={correct}
                        data-wrong={wrongSelected}
                        disabled={submitted}
                        key={renderedKey}
                        onClick={() => selectAnswer(currentQuestion.question.id, renderedKey)}
                        type="button"
                      >
                        <span>{CHOICE_NUMBERS[renderedKey]}.</span>
                        {choice.text}
                      </button>
                    );
                  })}
                </div>
                {submitted ? (
                  <div className="result-card mock-exam-answer-review">
                    <strong>{selectedAnswers[currentQuestion.question.id] === currentCorrectChoice ? "정답" : "오답"}</strong>
                    <p>정답: {CHOICE_NUMBERS[currentCorrectChoice]}</p>
                    <p>{currentQuestion.question.explanation}</p>
                    <div className="mock-exam-seen-feedback">
                      <h4>이 문제가 실제 JLPT에서 출제된 적 있는 것처럼 느껴졌나요?</h4>
                      <div className="feedback-buttons">
                        {(Object.keys(FEEDBACK_LABELS) as FeedbackValue[]).map((feedback) => (
                          <button
                            data-selected={seenFeedbacks[currentQuestion.question.id] === feedback}
                            key={feedback}
                            onClick={() => setSeenFeedbacks((feedbacks) => ({ ...feedbacks, [currentQuestion.question.id]: feedback }))}
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
              <div className="mock-exam-bottom-nav">
                <button
                  className="secondary-action"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => moveQuestion(currentQuestionIndex - 1)}
                  type="button"
                >
                  ← 이전 문제
                </button>
                <button
                  className="primary-action"
                  disabled={currentQuestionIndex >= flattenedQuestions.length - 1}
                  onClick={() => moveQuestion(currentQuestionIndex + 1)}
                  type="button"
                >
                  다음 문제 →
                </button>
              </div>
            </section>
          ) : null}

      <section className={submitted ? "result-card mock-exam-result-panel" : "result-card mock-exam-submit-card"}>
        {submitted ? (
          <>
            <p className="section-eyebrow">결과</p>
            <h2>
              {score} / {artifact.set.question_count}
            </h2>
            {saveMessage ? <p className="mock-save-status" data-status={saveStatus}>{saveMessage}</p> : null}
            <div className="mock-result-certificate" data-passed={mockPassed}>
              <div className="mock-result-certificate-head">
                <div>
                  <p className="section-eyebrow">Mock Test Result</p>
                  <h3>日本語 能力試験 合否 結果通知書</h3>
                  <strong>Japanese-Language Proficiency Test<br />Mock Test Result</strong>
                </div>
                <div className="mock-result-qr" aria-hidden="true">
                  <span />
                </div>
              </div>
              <dl className="mock-result-meta">
                <dt>受験日 Test Date</dt>
                <dd>{examDate}</dd>
                <dt>受験レベル Level</dt>
                <dd>{artifact.set.jlpt_level}</dd>
                <dt>受験者 Name</dt>
                <dd>Guest Learner</dd>
              </dl>
              <div className="mock-result-score-table" aria-label="모의 성적표">
                <strong className="mock-score-table-section-head">得点区分別得点<br /><span>Scores by Scoring Section</span></strong>
                <strong className="mock-score-table-total-head">総合得点<br /><span>Total Score</span></strong>
                <span>言語知識・読解<br />Language Knowledge / Reading</span>
                <span>聴解<br />Listening</span>
                <b>{languageReadingScore}/{MOCK_LANGUAGE_READING_SCORE}</b>
                <b>{listeningScore}/{MOCK_LISTENING_SCORE}</b>
                <b>{totalMockScore}/{MOCK_TOTAL_SCORE}</b>
              </div>
              <div className="mock-result-pass-row">
                <span aria-hidden="true">↓</span>
                <strong>{passStatusLabel}</strong>
                <em>{mockPassed ? "PASS" : "REVIEW"}</em>
              </div>
              <p>{passAdvice}</p>
              <small>
                공식 JLPT 성적표·합격 판정이 아니라, 현재 비청해 모의고사 세트의 학습 참고용 모의 합격 여부입니다.
              </small>
            </div>
            <section className="mock-detail-result" aria-label="상세 결과">
              <h3>상세 결과</h3>
              <div className="mock-detail-summary">
                <div className="mock-detail-scorebox">
                  <span>Test 1 · {examDate}</span>
                  <strong>{totalMockScore}/{MOCK_TOTAL_SCORE}</strong>
                </div>
                <dl>
                  <dt>시간</dt>
                  <dd>{artifact.set.time_limit_minutes}:00</dd>
                  <dt>정답률</dt>
                  <dd>{answerRate}%</dd>
                  <dt>결과</dt>
                  <dd>{mockPassed ? "합격" : "불합격"}</dd>
                </dl>
              </div>
              <div className="mock-detail-legend">
                <span><i />내 점수</span>
                <span><i />목표</span>
              </div>
              <p className="mock-detail-hint">각 영역을 클릭하면 상세 분석을 확인할 수 있도록 확장 예정입니다.</p>
              <div className="mock-radar-panel">
                <div className="mock-radar-card mock-radar-card--top">
                  <strong>{categoryScores[0].label}</strong>
                  <span>{categoryScores[0].detail} · {categoryScores[0].score}</span>
                </div>
                <div className="mock-radar-card mock-radar-card--left">
                  <strong>{categoryScores[1].label}</strong>
                  <span>{categoryScores[1].detail} · {categoryScores[1].score}</span>
                </div>
                <div className="mock-radar-chart" aria-hidden="true">
                  <span className="mock-radar-goal" />
                  <span className="mock-radar-score" />
                </div>
                <div className="mock-radar-card mock-radar-card--right">
                  <strong>{categoryScores[3].label}</strong>
                  <span>{categoryScores[3].detail} · {categoryScores[3].score}</span>
                </div>
                <div className="mock-radar-card mock-radar-card--bottom">
                  <strong>{categoryScores[2].label}</strong>
                  <span>{categoryScores[2].detail} · {categoryScores[2].score}</span>
                </div>
              </div>
            </section>
            <section className="mock-teacher-card" aria-label="선생님의 평가">
              <h3>선생님의 평가</h3>
              <div className="mock-teacher-profile">
                <div aria-hidden="true">忍</div>
                <p><strong>JLPT Coach · {artifact.set.jlpt_level}</strong><span>모의고사 분석 선생님</span></p>
              </div>
              <p>{passAdvice}</p>
            </section>
            <section className="mock-history-card" aria-label="기록">
              <h3>기록</h3>
              <div className="mock-history-tabs" aria-label="기록 필터">
                <button type="button">총</button><button type="button">읽기</button><button type="button">듣기</button><button type="button">어휘</button>
              </div>
              <div className="mock-history-chart" aria-hidden="true">
                <span style={{ height: `${historyBarHeight}%` }}>{totalMockScore}</span>
              </div>
              <div className="mock-result-actions">
                <a className="secondary-link" href="/mock-exams/n5-realistic-001">다른 시험 보기</a>
                <a className="primary-link" href="#question-${reviewTargets[0]?.question.id ?? artifact.questions[0]?.id}">정답 보기</a>
              </div>
            </section>
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
            <p>점수 환산은 모의 세트 기준이며, 실제 JLPT 공식 성적과는 다를 수 있습니다.</p>
            <div className="mock-exam-feedback-summary">
              <h3>최근 출제 문항 기록</h3>
              <p>이번 세트의 {artifact.set.question_count}문항을 최근 풀이 기록에 저장했습니다.</p>
              <p>다음 랜덤 세트부터 같은 사용자에게 최근 7일 내 문항을 뒤로 미루는 회피 기준으로 사용합니다.</p>
            </div>
          </>
        ) : (
          <>
            {submitWarning ? (
              <div className="mock-submit-warning" role="alert">
                <strong>{submitWarning}</strong>
                <div>
                  <button className="secondary-action" onClick={() => setSubmitWarning(null)} type="button">계속 풀기</button>
                  <button className="primary-action" onClick={forceSubmitMockExam} type="button">그래도 제출</button>
                </div>
              </div>
            ) : null}
            <button className="primary-action" onClick={requestSubmitMockExam} type="button">
              전체 제출
            </button>
          </>
        )}
      </section>
        </div>
        <aside className="mock-question-nav" aria-label="문제 목록">
          <div>
            <strong>문제 목록</strong>
            <span>{answeredCount}/{artifact.set.question_count}</span>
          </div>
          <div className="mock-question-nav-scroll" ref={questionNavScrollRef}>
            <nav>
              {flattenedQuestions.map(({ question }, index) => {
                const renderedChoices = renderedChoiceMap[question.id] ?? buildRenderedChoices(question, attemptSeed);
                const correctChoice = renderedCorrectChoice(question, renderedChoices);
                const selectedChoice = selectedAnswers[question.id];
                const resultState = !submitted
                  ? undefined
                  : selectedChoice
                    ? selectedChoice === correctChoice
                      ? "correct"
                      : "wrong"
                    : "blank";
                const resultLabel = resultState === "correct" ? "정답" : resultState === "wrong" ? "오답" : resultState === "blank" ? "미응답" : "미풀이";

                return (
                  <button
                    aria-label={`${index + 1}번 ${resultLabel}`}
                    className="mock-question-nav-item"
                    data-answered={Boolean(selectedChoice)}
                    data-current={index === currentQuestionIndex}
                    data-result={resultState}
                    key={question.id}
                    onClick={() => moveQuestion(index)}
                    type="button"
                  >
                    {index + 1}
                  </button>
                );
              })}
            </nav>
          </div>
          {submitWarning ? (
            <div className="mock-question-nav-confirm" role="alert">
              <strong>미응답 {unansweredCount}문항</strong>
              <button onClick={() => setSubmitWarning(null)} type="button">계속 풀기</button>
              <button onClick={forceSubmitMockExam} type="button">그래도 제출</button>
            </div>
          ) : null}
          <button className="mock-question-nav-submit" onClick={requestSubmitMockExam} type="button" disabled={submitted || saveStatus === "saving"}>
            제출하기
          </button>
          {submitWarning ? <p className="mock-question-nav-warning">미응답 {unansweredCount}문항 확인 필요</p> : null}
        </aside>
      </div>
        </>
      )}
    </div>
  );
}

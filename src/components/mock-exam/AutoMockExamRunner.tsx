"use client";

import { useMemo, useSyncExternalStore } from "react";
import { MockExamRunner } from "@/components/mock-exam/MockExamRunner";

type ChoiceKey = "A" | "B" | "C" | "D";
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
  questions: Array<{
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
  }>;
};

type LocalAttempt = {
  set_code?: string;
  jlpt_level?: string;
  submitted_at?: string;
};

type InProgressDraft = {
  set_code?: string;
  jlpt_level?: string;
  updated_at?: string;
};

const LOCAL_ATTEMPTS_STORAGE_KEY = "jlpt-mock-exam-local-attempts";
const IN_PROGRESS_STORAGE_KEY = "jlpt-mock-exam-in-progress";

function subscribeToMockExamStorage(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;

  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function mockExamStorageSnapshot() {
  if (typeof window === "undefined") return "";
  return JSON.stringify({
    draft: window.localStorage.getItem(IN_PROGRESS_STORAGE_KEY),
    attempts: window.localStorage.getItem(LOCAL_ATTEMPTS_STORAGE_KEY),
  });
}

function readLocalAttempts() {
  if (typeof window === "undefined") return [] as LocalAttempt[];

  try {
    const rawAttempts = window.localStorage.getItem(LOCAL_ATTEMPTS_STORAGE_KEY);
    if (!rawAttempts) return [];
    const attempts = JSON.parse(rawAttempts) as LocalAttempt[];
    return Array.isArray(attempts) ? attempts : [];
  } catch {
    return [];
  }
}

function readInProgressDraft() {
  if (typeof window === "undefined") return null as InProgressDraft | null;

  try {
    const rawDraft = window.localStorage.getItem(IN_PROGRESS_STORAGE_KEY);
    if (!rawDraft) return null;
    const draft = JSON.parse(rawDraft) as InProgressDraft;
    return draft && typeof draft === "object" ? draft : null;
  } catch {
    return null;
  }
}

function attemptTime(attempt: LocalAttempt) {
  const time = Date.parse(attempt.submitted_at ?? "");
  return Number.isFinite(time) ? time : 0;
}

function pickAutoMockExamArtifact(level: string, artifacts: MockExamArtifact[]) {
  const normalizedLevel = level.toUpperCase();
  const sortedArtifacts = [...artifacts].sort((a, b) => a.set.set_code.localeCompare(b.set.set_code));
  const artifactByCode = new Map(sortedArtifacts.map((artifact) => [artifact.set.set_code, artifact]));
  const draft = readInProgressDraft();

  if (draft?.jlpt_level === normalizedLevel && draft.set_code && artifactByCode.has(draft.set_code)) {
    return artifactByCode.get(draft.set_code) ?? sortedArtifacts[0];
  }

  const localAttempts = readLocalAttempts()
    .filter((attempt) => attempt.jlpt_level === normalizedLevel && attempt.set_code && artifactByCode.has(attempt.set_code))
    .sort((a, b) => attemptTime(b) - attemptTime(a));

  if (!localAttempts.length) return sortedArtifacts[0];

  const attemptedCodes = new Set(localAttempts.map((attempt) => attempt.set_code));
  const unattempted = sortedArtifacts.find((artifact) => !attemptedCodes.has(artifact.set.set_code));
  if (unattempted) return unattempted;

  const latestAttemptByCode = new Map<string, LocalAttempt>();
  for (const attempt of localAttempts) {
    if (!attempt.set_code || latestAttemptByCode.has(attempt.set_code)) continue;
    latestAttemptByCode.set(attempt.set_code, attempt);
  }

  return sortedArtifacts.reduce((oldestArtifact, artifact) => {
    const current = latestAttemptByCode.get(artifact.set.set_code);
    const oldest = latestAttemptByCode.get(oldestArtifact.set.set_code);
    return attemptTime(current ?? {}) < attemptTime(oldest ?? {}) ? artifact : oldestArtifact;
  }, sortedArtifacts[0]);
}

export function AutoMockExamRunner({ level, artifacts }: { level: string; artifacts: MockExamArtifact[] }) {
  const storageSnapshot = useSyncExternalStore(subscribeToMockExamStorage, mockExamStorageSnapshot, () => "");
  const artifact = useMemo(() => {
    void storageSnapshot;
    return pickAutoMockExamArtifact(level, artifacts);
  }, [artifacts, level, storageSnapshot]);

  return <MockExamRunner artifact={artifact} />;
}

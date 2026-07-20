export interface RecentQuestionHistoryEntry {
  question_id: string;
  seen_at: string;
}

export interface RecentQuestionLike {
  id: string;
}

export function mergeRecentQuestionHistory(
  previous: RecentQuestionHistoryEntry[],
  nextQuestionIds: string[],
  nowIso: string,
  maxEntries = 200,
): RecentQuestionHistoryEntry[] {
  const nextIds = new Set(nextQuestionIds);
  const merged = [
    ...nextQuestionIds.map((question_id) => ({ question_id, seen_at: nowIso })),
    ...previous.filter((entry) => !nextIds.has(entry.question_id)),
  ];

  return merged.slice(0, maxEntries);
}

export function recentQuestionIdSet(
  history: RecentQuestionHistoryEntry[],
  nowMs: number,
  windowDays = 7,
): Set<string> {
  const windowMs = windowDays * 24 * 60 * 60 * 1000;
  return new Set(
    history
      .filter((entry) => {
        const seenAtMs = Date.parse(entry.seen_at);
        return Number.isFinite(seenAtMs) && nowMs - seenAtMs <= windowMs;
      })
      .map((entry) => entry.question_id),
  );
}

export function orderQuestionsAvoidingRecent<T extends RecentQuestionLike>(
  questions: T[],
  recentQuestionIds: Set<string>,
): T[] {
  const fresh = questions.filter((question) => !recentQuestionIds.has(question.id));
  const recent = questions.filter((question) => recentQuestionIds.has(question.id));
  return [...fresh, ...recent];
}

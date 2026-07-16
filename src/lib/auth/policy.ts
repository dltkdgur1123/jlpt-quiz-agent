export interface AuthPolicyDecision {
  canReadQuiz: boolean;
  canSubmitAttempt: boolean;
  canSubmitExamSeenFeedback: boolean;
}

export function getAuthPolicy(sessionUserId: string | null): AuthPolicyDecision {
  return {
    canReadQuiz: true,
    canSubmitAttempt: true,
    canSubmitExamSeenFeedback: Boolean(sessionUserId),
  };
}

export function requireFeedbackUserId(sessionUserId: string | null): string {
  if (!sessionUserId) {
    throw new Error("Login required to submit exam seen feedback");
  }

  return sessionUserId;
}

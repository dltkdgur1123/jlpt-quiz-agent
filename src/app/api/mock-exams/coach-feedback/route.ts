import { NextResponse, type NextRequest } from "next/server";

export const maxDuration = 30;

type CoachSectionInput = {
  section_key: "vocab" | "grammar" | "reading";
  label: string;
  correct: number;
  question_count: number;
  rate: number;
  wrong_or_blank: number;
};

type CoachFeedbackInput = {
  jlpt_level: string;
  set_code: string;
  score: number;
  question_count: number;
  score_total: number;
  score_max: number;
  mock_passed: boolean;
  goal_rate: number;
  sections: CoachSectionInput[];
};

type CoachFeedback = {
  headline: string;
  summary: string;
  priority_area: string;
  actions: string[];
  caution: string;
};

const ALLOWED_SECTION_LABELS = new Set(["문자·어휘", "문법", "읽기"]);
const DEFAULT_TIMEOUT_MS = 20000;
const MAX_ACTIONS = 3;

function assertValidBody(body: CoachFeedbackInput) {
  if (!body || typeof body !== "object") throw new Error("invalid request body");
  if (!/^N[1-5]$/.test(body.jlpt_level)) throw new Error("invalid jlpt level");
  if (!body.set_code || typeof body.set_code !== "string") throw new Error("invalid set code");
  if (!Number.isFinite(body.score) || !Number.isFinite(body.question_count)) throw new Error("invalid score");
  if (!Array.isArray(body.sections) || body.sections.length !== 3) throw new Error("invalid sections");

  for (const section of body.sections) {
    if (!ALLOWED_SECTION_LABELS.has(section.label)) throw new Error("invalid section label");
    if (!Number.isFinite(section.correct) || !Number.isFinite(section.question_count) || !Number.isFinite(section.rate)) {
      throw new Error("invalid section score");
    }
  }
}

function clampText(value: unknown, fallback: string, maxLength = 120) {
  if (typeof value !== "string") return fallback;
  const text = value.replace(/[\r\n]+/g, " ").trim().slice(0, maxLength);
  if (!text) return fallback;
  if (/80자|핵심 진단|스키마|headline|summary|priority_area|actions/i.test(text)) return fallback;
  return text;
}

function clampActions(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        const maybeAction = item as { action?: unknown; description?: unknown };
        return typeof maybeAction.action === "string" ? maybeAction.action : typeof maybeAction.description === "string" ? maybeAction.description : "";
      }
      return "";
    })
    .filter((item) => item.trim().length > 0 && !/구체적 다음 행동|action|description/i.test(item))
    .map((item) => item.replace(/[\r\n]+/g, " ").trim().slice(0, 80))
    .slice(0, MAX_ACTIONS);
}

function sanitizeCoachFeedback(raw: unknown, body: CoachFeedbackInput): CoachFeedback {
  const payload = raw && typeof raw === "object" ? raw as Partial<CoachFeedback> : {};
  const weakest = [...body.sections].sort((a, b) => a.rate - b.rate || b.wrong_or_blank - a.wrong_or_blank)[0];
  const otherSectionLabels = body.sections.map((section) => section.label).filter((label) => label !== weakest.label);
  const actions = clampActions(payload.actions).filter((action) => !otherSectionLabels.some((label) => action.includes(label)));

  while (actions.length < MAX_ACTIONS) {
    const fallbackActions = [
      `${weakest.label} 오답과 미응답 문제를 먼저 다시 확인하세요.`,
      "해설을 읽고 틀린 이유를 한 줄로 정리하세요.",
      "15분 복습 후 같은 레벨의 다음 모의고사를 진행하세요.",
    ];
    actions.push(fallbackActions[actions.length]);
  }

  return {
    headline: clampText(
      typeof payload.headline === "string" && payload.headline.includes(weakest.label) ? payload.headline : undefined,
      `${weakest.label} 복습을 먼저 하면 다음 점수 상승폭이 큽니다.`,
    ),
    summary: clampText(
      typeof payload.summary === "string" && payload.summary.includes(weakest.label) ? payload.summary : undefined,
      `현재 ${body.jlpt_level} 비청해 모의고사 세트 기준으로 ${weakest.label} 정답률이 가장 낮습니다.`,
      220,
    ),
    priority_area: weakest.label,
    actions,
    caution: "현재 모의고사 세트 기준의 학습 참고용 평가이며, 공식 JLPT 합격 예측이나 보장이 아닙니다.",
  };
}

function buildCoachPrompt(body: CoachFeedbackInput) {
  const sectionLines = body.sections
    .map((section) => `- ${section.label}: ${section.correct}/${section.question_count}, ${section.rate}%, 오답/미응답 ${section.wrong_or_blank}`)
    .join("\n");

  return `당신은 JLPT 한국어 학습자를 돕는 복습 코치입니다.
역할: 점수를 판정하지 말고, 현재 비청해 모의고사 결과를 바탕으로 다음 복습 행동을 짧게 제안합니다.
금지: 합격 보장, 실제 JLPT 예측, 공식 성적 판단, 사용자를 낙담시키는 표현.

입력:
레벨: ${body.jlpt_level}
총점: ${body.score}/${body.question_count}
모의 환산점: ${body.score_total}/${body.score_max}
상태: ${body.mock_passed ? "합격권 유지" : "복습 우선"}
목표 정답률: ${body.goal_rate}%
영역별 결과:
${sectionLines}

출력 규칙:
- 한국어 JSON 객체 1개만 출력합니다.
- 코드블록/마크다운/설명문 금지.
- actions는 반드시 문자열 3개 배열입니다.
- priority_area는 반드시 "문자·어휘", "문법", "읽기" 중 하나입니다.
- headline에는 "80자", "핵심 진단", "스키마" 같은 지시어를 쓰지 않습니다.

좋은 출력 예시:
{"headline":"문자·어휘가 가장 큰 병목입니다.","summary":"현재 세트 기준으로 문자·어휘 정답률이 가장 낮습니다. 새 세트를 바로 풀기보다 오답 어휘를 먼저 정리하는 편이 좋습니다.","priority_area":"문자·어휘","actions":["문자·어휘 오답을 먼저 다시 풀기","헷갈린 한자 읽기와 의미를 한 줄로 정리하기","15분 복습 후 같은 레벨 다음 세트 진행하기"],"caution":"현재 모의고사 세트 기준의 학습 참고용 평가이며, 공식 JLPT 합격 예측이나 보장이 아닙니다."}`;
}

function extractJsonObject(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return JSON.parse(trimmed);
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("local llm returned non-json feedback");
  return JSON.parse(match[0]);
}

async function callLocalLlm(body: CoachFeedbackInput) {
  const baseUrl = process.env.LOCAL_LLM_BASE_URL?.replace(/\/$/, "");
  const model = process.env.LOCAL_LLM_MODEL;
  if (!baseUrl || !model) throw new Error("local llm is not configured");

  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LOCAL_LLM_API_KEY ?? "local"}`,
    },
    signal: AbortSignal.timeout(Number(process.env.LOCAL_LLM_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS)),
    body: JSON.stringify({
      model,
      temperature: 0.25,
      max_tokens: 220,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You produce safe Korean JSON coach feedback for JLPT mock exam results. No official pass prediction. No markdown.",
        },
        { role: "user", content: buildCoachPrompt(body) },
      ],
    }),
  });

  if (!response.ok) throw new Error(`local llm request failed: ${response.status}`);
  const result = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = result.choices?.[0]?.message?.content;
  if (!content) throw new Error("local llm returned empty feedback");
  return extractJsonObject(content);
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "failed to generate coach feedback";
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CoachFeedbackInput;
    assertValidBody(body);
    const feedback = sanitizeCoachFeedback(await callLocalLlm(body), body);
    return NextResponse.json({ generated: true, source: "local_llm", feedback });
  } catch (error) {
    const message = errorMessage(error);
    const status = message.includes("invalid") ? 400 : message.includes("not configured") ? 503 : 502;
    return NextResponse.json({ generated: false, source: "fallback", error: message }, { status });
  }
}

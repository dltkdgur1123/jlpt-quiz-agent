import { NextResponse, type NextRequest } from "next/server";

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
const DEFAULT_TIMEOUT_MS = 4500;
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
  return value.replace(/[\r\n]+/g, " ").trim().slice(0, maxLength) || fallback;
}

function clampActions(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .map((item) => item.replace(/[\r\n]+/g, " ").trim().slice(0, 80))
    .slice(0, MAX_ACTIONS);
}

function sanitizeCoachFeedback(raw: unknown, body: CoachFeedbackInput): CoachFeedback {
  const payload = raw && typeof raw === "object" ? raw as Partial<CoachFeedback> : {};
  const weakest = [...body.sections].sort((a, b) => a.rate - b.rate || b.wrong_or_blank - a.wrong_or_blank)[0];
  const actions = clampActions(payload.actions);

  while (actions.length < MAX_ACTIONS) {
    const fallbackActions = [
      `${weakest.label} 오답과 미응답 문제를 먼저 다시 확인하세요.`,
      "해설을 읽고 틀린 이유를 한 줄로 정리하세요.",
      "15분 복습 후 같은 레벨의 다음 모의고사를 진행하세요.",
    ];
    actions.push(fallbackActions[actions.length]);
  }

  return {
    headline: clampText(payload.headline, `${weakest.label}을 먼저 복습하면 다음 점수 상승폭이 큽니다.`),
    summary: clampText(
      payload.summary,
      `현재 ${body.jlpt_level} 비청해 모의고사 세트 기준으로 ${weakest.label} 정답률이 가장 낮습니다.`,
      220,
    ),
    priority_area: ALLOWED_SECTION_LABELS.has(String(payload.priority_area)) ? String(payload.priority_area) : weakest.label,
    actions,
    caution: "현재 모의고사 세트 기준의 학습 참고용 평가이며, 공식 JLPT 합격 예측이나 보장이 아닙니다.",
  };
}

function buildCoachPrompt(body: CoachFeedbackInput) {
  const sectionLines = body.sections
    .map((section) => `- ${section.label}: ${section.correct}/${section.question_count}, ${section.rate}%, 오답/미응답 ${section.wrong_or_blank}`)
    .join("\n");

  return `당신은 JLPT 한국어 학습자를 돕는 복습 코치입니다.
외부 시험 합격을 예측하거나 보장하지 말고, 현재 비청해 모의고사 세트 기준 학습 참고 평가만 작성하세요.

입력:
레벨: ${body.jlpt_level}
세트: ${body.set_code}
총점: ${body.score}/${body.question_count}
모의 환산점: ${body.score_total}/${body.score_max}
모의 합격권 여부: ${body.mock_passed ? "합격권" : "복습 필요"}
목표 정답률: ${body.goal_rate}%
영역별 결과:
${sectionLines}

반드시 한국어 JSON만 출력하세요. 마크다운 금지.
스키마:
{
  "headline": "80자 이내 핵심 진단",
  "summary": "현재 세트 기준 2문장 이내 설명",
  "priority_area": "문자·어휘 또는 문법 또는 읽기",
  "actions": ["구체적 다음 행동 1", "구체적 다음 행동 2", "구체적 다음 행동 3"],
  "caution": "현재 모의고사 세트 기준의 학습 참고용 평가이며, 공식 JLPT 합격 예측이나 보장이 아닙니다."
}`;
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
      max_tokens: 420,
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

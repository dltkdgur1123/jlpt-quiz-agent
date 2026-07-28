import crypto from "node:crypto";

export type NaverOAuthState = {
  nonce: string;
  next: string;
  createdAt: number;
};

export type NaverUserInfo = {
  id: string;
  email: string | null;
  name: string | null;
};

export function encodeNaverOAuthState(input: NaverOAuthState): string {
  return Buffer.from(JSON.stringify(input), "utf8").toString("base64url");
}

export function decodeNaverOAuthState(value: string | null): NaverOAuthState | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    if (
      typeof parsed?.nonce !== "string" ||
      typeof parsed?.next !== "string" ||
      typeof parsed?.createdAt !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function createNaverNonce() {
  return crypto.randomBytes(16).toString("hex");
}

export function safeAuthNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  if (value.startsWith("/auth/callback") || value.startsWith("/login") || value.startsWith("/api/auth/")) return "/";
  return value;
}

export function buildNaverAuthorizeUrl(input: {
  clientId: string;
  redirectUri: string;
  state: string;
  authType?: "reauthenticate";
}) {
  const url = new URL("https://nid.naver.com/oauth2.0/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", input.clientId);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("state", input.state);
  if (input.authType) url.searchParams.set("auth_type", input.authType);
  return url;
}

export function parseNaverUserInfo(payload: unknown): NaverUserInfo {
  const response =
    payload && typeof payload === "object" && "response" in payload
      ? (payload as { response?: unknown }).response
      : null;

  if (!response || typeof response !== "object") {
    throw new Error("네이버 사용자 응답에 response 필드가 없습니다.");
  }

  const fields = response as { id?: unknown; email?: unknown; name?: unknown; nickname?: unknown };
  const id = typeof fields.id === "string" ? fields.id : null;
  if (!id) {
    throw new Error("네이버 사용자 ID를 찾을 수 없습니다.");
  }

  const email = typeof fields.email === "string" && fields.email.includes("@") ? fields.email : null;
  const name =
    typeof fields.name === "string"
      ? fields.name
      : typeof fields.nickname === "string"
        ? fields.nickname
        : null;

  return { id, email, name };
}

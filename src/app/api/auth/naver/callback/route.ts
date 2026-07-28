import { NextRequest, NextResponse } from "next/server";

import { decodeNaverOAuthState, parseNaverUserInfo, safeAuthNextPath } from "@/lib/auth/naver";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";

const NAVER_STATE_COOKIE = "jlpt_naver_oauth_state";
const STATE_MAX_AGE_MS = 10 * 60 * 1000;

type NaverTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: string;
  error?: string;
  error_description?: string;
};

function siteUrlFromRequest(request: NextRequest) {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configuredUrl) return request.nextUrl.origin;

  try {
    return new URL(configuredUrl).origin;
  } catch {
    return request.nextUrl.origin;
  }
}

function redirectToLogin(request: NextRequest, error: string, description?: string) {
  const loginUrl = new URL("/login", request.nextUrl.origin);
  loginUrl.searchParams.set("error", error);
  if (description) loginUrl.searchParams.set("message", description);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(NAVER_STATE_COOKIE);
  return response;
}

async function exchangeNaverCode(input: {
  code: string;
  state: string;
  clientId: string;
  clientSecret: string;
}): Promise<NaverTokenResponse> {
  const tokenUrl = new URL("https://nid.naver.com/oauth2.0/token");
  tokenUrl.searchParams.set("grant_type", "authorization_code");
  tokenUrl.searchParams.set("client_id", input.clientId);
  tokenUrl.searchParams.set("client_secret", input.clientSecret);
  tokenUrl.searchParams.set("code", input.code);
  tokenUrl.searchParams.set("state", input.state);

  const response = await fetch(tokenUrl, { method: "GET", cache: "no-store" });
  const payload = (await response.json()) as NaverTokenResponse;
  if (!response.ok || payload.error || !payload.access_token) {
    throw new Error(payload.error_description ?? payload.error ?? "네이버 토큰 교환 실패");
  }
  return payload;
}

async function fetchNaverUserInfo(accessToken: string) {
  const response = await fetch("https://openapi.naver.com/v1/nid/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error("네이버 사용자 정보를 가져오지 못했습니다.");
  }
  return parseNaverUserInfo(payload);
}

export async function GET(request: NextRequest) {
  const clientId = process.env.NAVER_CLIENT_ID?.trim();
  const clientSecret = process.env.NAVER_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    return redirectToLogin(request, "naver_config", "네이버 서버 환경변수가 없습니다.");
  }

  const error = request.nextUrl.searchParams.get("error");
  if (error) {
    return redirectToLogin(
      request,
      "naver_oauth_error",
      request.nextUrl.searchParams.get("error_description") ?? error,
    );
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const cookieState = request.cookies.get(NAVER_STATE_COOKIE)?.value ?? null;
  const decodedState = decodeNaverOAuthState(state);

  if (!code || !state || !cookieState || state !== cookieState || !decodedState) {
    return redirectToLogin(request, "naver_state", "네이버 로그인 상태 검증에 실패했습니다.");
  }

  if (Date.now() - decodedState.createdAt > STATE_MAX_AGE_MS) {
    return redirectToLogin(request, "naver_state_expired", "네이버 로그인 요청이 만료되었습니다.");
  }

  const next = safeAuthNextPath(decodedState.next);

  try {
    const token = await exchangeNaverCode({ code, state, clientId, clientSecret });
    const naverUser = await fetchNaverUserInfo(token.access_token!);

    if (!naverUser.email) {
      return redirectToLogin(request, "naver_email", "네이버 계정에서 이메일 제공에 동의해야 합니다.");
    }

    const supabase = getSupabaseServiceRoleClient();
    const userMetadata = {
      provider: "naver",
      provider_user_id: naverUser.id,
      full_name: naverUser.name,
    };
    const { error: createUserError } = await supabase.auth.admin.createUser({
      email: naverUser.email,
      email_confirm: true,
      user_metadata: userMetadata,
    });

    if (createUserError && !/already|registered|exists/i.test(createUserError.message)) {
      throw new Error(createUserError.message);
    }

    const { data, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: naverUser.email,
      options: {
        redirectTo: new URL(`/auth/callback?next=${encodeURIComponent(next)}`, siteUrlFromRequest(request)).toString(),
        data: userMetadata,
      },
    });

    if (linkError || !data.properties?.action_link) {
      throw new Error(linkError?.message ?? "Supabase 로그인 링크 생성 실패");
    }

    const response = NextResponse.redirect(data.properties.action_link);
    response.cookies.delete(NAVER_STATE_COOKIE);
    return response;
  } catch (caught) {
    return redirectToLogin(
      request,
      "naver_callback",
      caught instanceof Error ? caught.message : "네이버 로그인 처리에 실패했습니다.",
    );
  }
}

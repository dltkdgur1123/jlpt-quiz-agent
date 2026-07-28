import { NextRequest, NextResponse } from "next/server";

import { buildNaverAuthorizeUrl, createNaverNonce, encodeNaverOAuthState, safeAuthNextPath } from "@/lib/auth/naver";

const NAVER_STATE_COOKIE = "jlpt_naver_oauth_state";

function siteUrlFromRequest(request: NextRequest) {
  return process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  const clientId = process.env.NAVER_CLIENT_ID;
  if (!clientId) {
    const loginUrl = new URL("/login", request.nextUrl.origin);
    loginUrl.searchParams.set("error", "naver_config");
    loginUrl.searchParams.set("message", "NAVER_CLIENT_ID 서버 환경변수가 없습니다. Vercel Production 환경변수와 재배포 상태를 확인해주세요.");
    return NextResponse.redirect(loginUrl);
  }

  const siteUrl = siteUrlFromRequest(request);
  const redirectUri = new URL("/api/auth/naver/callback", siteUrl).toString();
  const next = safeAuthNextPath(request.nextUrl.searchParams.get("next"));
  const state = encodeNaverOAuthState({
    nonce: createNaverNonce(),
    next,
    createdAt: Date.now(),
  });

  const authorizeUrl = buildNaverAuthorizeUrl({
    clientId,
    redirectUri,
    state,
    authType: "reauthenticate",
  });
  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(NAVER_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: siteUrl.startsWith("https://"),
    maxAge: 60 * 10,
    path: "/",
  });
  return response;
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type OAuthProvider = "google" | "kakao" | `custom:${string}`;
type AuthPanelVariant = "compact" | "page";
type PendingAction = OAuthProvider | "email" | "signout" | null;
type AuthProviderConfig = {
  provider: OAuthProvider;
  label: string;
  tone: string;
  mark: string;
  title: string;
  subtitle: string;
  primary?: boolean;
  iconSrc?: string;
  officialImageSrc?: string;
};

function safeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  if (value.startsWith("/auth/callback") || value.startsWith("/login")) return "/";
  return value;
}

const providers: AuthProviderConfig[] = [
  {
    provider: "google",
    label: "Google",
    tone: "google",
    mark: "G",
    title: "Google 계정으로 계속",
    subtitle: "",
    primary: true,
    iconSrc: "/auth/google-g-logo.svg",
  },
  {
    provider: "kakao",
    label: "Kakao",
    tone: "kakao",
    mark: "K",
    title: "카카오 로그인",
    subtitle: "공식 OAuth 로그인",
    officialImageSrc: "/auth/kakao_login_large_wide.png",
  },
  {
    provider: "custom:naver",
    label: "Naver",
    tone: "naver",
    mark: "N",
    title: "네이버 로그인",
    subtitle: "Custom OAuth 로그인",
    iconSrc: "/auth/naver-n-logo.svg",
  },
];

export function AuthPanel({ variant = "compact" }: { variant?: AuthPanelVariant }) {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setMessage(error.message);
      }
      setSessionEmail(data.session?.user.email ?? null);
      setIsAuthLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user.email ?? null);
      setIsAuthLoading(false);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const isSignedIn = Boolean(sessionEmail);
  const isLoginBusy = isAuthLoading || pendingAction !== null;
  const nextPath = safeNextPath(searchParams.get("next"));

  function buildRedirectTo() {
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    if (nextPath !== "/") {
      callbackUrl.searchParams.set("next", nextPath);
    }
    return callbackUrl.toString();
  }

  function providerQueryParams(provider: OAuthProvider): Record<string, string> | undefined {
    if (provider === "google") return { prompt: "select_account" };
    if (provider === "kakao") return { prompt: "login" };
    if (provider === "custom:naver") return { auth_type: "reauthenticate" };
    return undefined;
  }

  function providerLoadingMessage(provider: OAuthProvider) {
    if (provider === "google") return "Google 로그인 화면으로 이동합니다.";
    if (provider === "kakao") return "카카오 로그인 화면으로 이동합니다.";
    if (provider === "custom:naver") return "네이버 로그인 화면으로 이동합니다.";
    return "로그인 요청을 처리하고 있습니다.";
  }

  async function signInWithProvider(provider: OAuthProvider) {
    if (isSignedIn || isLoginBusy) return;

    setMessage(providerLoadingMessage(provider));
    setPendingAction(provider);

    if (provider === "custom:naver") {
      const startUrl = new URL("/api/auth/naver/start", window.location.origin);
      if (nextPath !== "/") startUrl.searchParams.set("next", nextPath);
      window.location.assign(startUrl.toString());
      return;
    }

    let supabase;
    try {
      supabase = getSupabaseBrowserClient();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "로그인 설정을 확인할 수 없습니다.");
      setPendingAction(null);
      return;
    }

    const redirectTo = buildRedirectTo();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        queryParams: providerQueryParams(provider),
      },
    });

    if (error) {
      setMessage(error.message);
      setPendingAction(null);
    }
  }

  async function signInWithEmailLink() {
    if (isSignedIn || isLoginBusy) return;
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setMessage("올바른 이메일 주소를 입력해주세요.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const redirectTo = buildRedirectTo();
    setMessage("로그인 요청을 처리하고 있습니다.");
    setPendingAction("email");
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: { emailRedirectTo: redirectTo },
    });

    setMessage(error ? error.message : "이메일 링크를 보냈습니다.");
    setPendingAction(null);
  }

  async function signOut() {
    if (pendingAction) return;
    const supabase = getSupabaseBrowserClient();
    setPendingAction("signout");
    const { error } = await supabase.auth.signOut();

    if (error) {
      setMessage(error.message);
      setPendingAction(null);
      return;
    }

    setSessionEmail(null);
    setMessage("로그아웃되었습니다.");
    setPendingAction(null);
  }

  if (isSignedIn) {
    return (
      <section className={`auth-card auth-card--${variant} auth-card--signed-in`} aria-label="로그인된 계정">
        <p className="auth-status">{sessionEmail} 계정으로 로그인되어 있습니다.</p>
        <Link className="auth-dashboard-link" href="/dashboard">대시보드로 이동</Link>
        <button className="auth-signout-button" type="button" onClick={signOut}>
          로그아웃
        </button>
        {message ? <p className="auth-message">{message}</p> : null}
      </section>
    );
  }

  return (
    <section className={`auth-card auth-card--${variant}`} aria-label="로그인">
      {isAuthLoading ? <p className="auth-helper">확인 중</p> : null}
      <div className="auth-start-copy">
        <strong>학습 기록을 이어가세요</strong>
        <span>소셜 계정 또는 이메일 링크로 바로 시작할 수 있습니다.</span>
      </div>

      <div className="auth-provider-grid">
        {providers.map(({ provider, label, tone, mark, title, subtitle, primary, iconSrc, officialImageSrc }) => (
          <button
            className={`auth-provider-button auth-provider-${tone}${primary ? " auth-provider-primary" : ""}`}
            data-provider={provider}
            data-primary={primary ? "true" : "false"}
            key={provider}
            type="button"
            aria-label={`${label} 로그인`}
            disabled={isLoginBusy}
            onClick={() => signInWithProvider(provider)}
          >
            {officialImageSrc ? (
              <Image
                className="auth-provider-official-image"
                src={officialImageSrc}
                alt=""
                width={600}
                height={90}
                aria-hidden="true"
              />
            ) : iconSrc ? (
              <>
                <span className={`auth-provider-mark auth-provider-${tone}-mark auth-provider-icon-mark`} aria-hidden="true">
                  <Image src={iconSrc} alt="" width={18} height={18} aria-hidden="true" />
                </span>
                <span className="auth-provider-copy">
                  <strong className="auth-provider-title">{title}</strong>
                </span>
              </>
            ) : (
              <>
                <span className="auth-provider-mark" aria-hidden="true">{mark}</span>
                <span className="auth-provider-copy">
                  <strong className="auth-provider-title">{title}</strong>
                  <small className="auth-provider-subtitle">{subtitle}</small>
                </span>
              </>
            )}
          </button>
        ))}
      </div>

      <div className="auth-divider"><span>또는 이메일 링크</span></div>

      <label className="auth-email-field">
        Email
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          disabled={isLoginBusy}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <button className="auth-email-submit" type="button" disabled={isLoginBusy} onClick={signInWithEmailLink}>
        이메일 링크로 로그인
      </button>
      {message ? <p className="auth-message">{message}</p> : null}
    </section>
  );
}

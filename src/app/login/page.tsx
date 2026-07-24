import { AuthPanel } from "@/components/auth/AuthPanel";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <main className="login-page-main">
      <div className="home-shell login-page-shell">
        <SiteHeader active="home" />
        <section className="login-simple-stage" aria-label="로그인 선택">
          <Suspense fallback={<p className="auth-helper">확인 중</p>}>
            <AuthPanel variant="page" />
          </Suspense>
        </section>
      </div>
    </main>
  );
}

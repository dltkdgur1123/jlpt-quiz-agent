import { AuthPanel } from "@/components/auth/AuthPanel";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function LoginPage() {
  return (
    <main className="login-page-main">
      <div className="home-shell login-page-shell">
        <SiteHeader active="home" />
        <section className="login-simple-stage" aria-label="로그인 선택">
          <AuthPanel variant="page" />
        </section>
      </div>
    </main>
  );
}

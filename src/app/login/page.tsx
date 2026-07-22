import Link from "next/link";
import { AuthPanel } from "@/components/auth/AuthPanel";

const benefits = [
  "모의고사 제출 결과를 대시보드에 저장",
  "오답·미응답 복습 기록 유지",
  "출제 경험 feedback으로 체감 score 개선",
];

export default function LoginPage() {
  return (
    <main className="figma-main login-page-main">
      <div className="figma-shell login-page-shell">
        <header className="figma-topbar login-topbar">
          <Link className="figma-brand" href="/"><span />HYOKU JLPT</Link>
          <nav className="figma-nav" aria-label="로그인 페이지 메뉴">
            <Link href="/">홈</Link>
            <Link href="/mock-exams/n5-realistic-001">모의고사</Link>
            <Link href="/dashboard">대시보드</Link>
            <b>H</b>
          </nav>
        </header>

        <section className="login-hero" aria-labelledby="login-title">
          <div className="login-copy-card">
            <p className="section-eyebrow">JLPT ACCOUNT</p>
            <h1 id="login-title">로그인하고<br />모의고사 기록을 이어가세요.</h1>
            <p>
              Google, Kakao, Naver 또는 이메일 링크로 로그인하면 풀이 기록과 영역별 약점을
              한 곳에서 이어볼 수 있습니다.
            </p>
            <ul>
              {benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}
            </ul>
          </div>
          <AuthPanel variant="page" />
        </section>
      </div>
    </main>
  );
}

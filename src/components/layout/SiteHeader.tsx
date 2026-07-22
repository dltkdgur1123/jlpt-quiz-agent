import Link from "next/link";

import { AuthHeaderButton } from "@/components/auth/AuthHeaderButton";

type SiteHeaderProps = {
  active?: "home" | "mock" | "history";
};

export function SiteHeader({ active = "home" }: SiteHeaderProps) {
  return (
    <header className="home-topbar site-header">
      <Link className="home-brand" href="/">
        <span aria-hidden="true" />
        <strong>HYOKU JLPT</strong>
      </Link>
      <nav aria-label="메인 메뉴" className="home-nav">
        <Link className={active === "home" ? "active" : undefined} href="/">홈</Link>
        <Link className={active === "mock" ? "active" : undefined} href="/mock-exams/n5-realistic-001">모의고사</Link>
        <Link className={active === "history" ? "active" : undefined} href="/dashboard">학습 기록</Link>
      </nav>
      <AuthHeaderButton />
    </header>
  );
}

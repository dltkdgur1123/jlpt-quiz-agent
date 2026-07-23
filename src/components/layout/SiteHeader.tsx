"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AuthHeaderButton } from "@/components/auth/AuthHeaderButton";

type SiteHeaderProps = {
  active?: "home" | "mock" | "history";
};

export function SiteHeader({ active = "home" }: SiteHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 8);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  return (
    <header className={`home-topbar site-header${isScrolled ? " is-scrolled" : ""}`}>
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

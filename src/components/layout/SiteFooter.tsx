import Link from "next/link";

const footerLinks = [
  { href: "/about", label: "서비스 소개" },
  { href: "/privacy", label: "개인정보처리방침" },
  { href: "/terms", label: "이용약관" },
  { href: "/contact", label: "문의" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer" aria-label="사이트 정보">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <strong>HYOKU JLPT</strong>
          <p>
            JLPT D-Day, 레벨별 모의고사, 오답노트 복습을 제공하는 학습 서비스입니다.
            공식 JLPT 주관기관과 무관하며 공식 기출문제를 복제하거나 변형하지 않습니다.
          </p>
        </div>
        <nav aria-label="정책 및 문의" className="site-footer-links">
          {footerLinks.map((link) => (
            <Link href={link.href} key={link.href}>{link.label}</Link>
          ))}
        </nav>
      </div>
      <p className="site-footer-copy">© HYOKU JLPT. jlpt-quiz-agent.vercel.app</p>
    </footer>
  );
}

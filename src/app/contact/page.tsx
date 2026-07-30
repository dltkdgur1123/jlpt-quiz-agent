import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "문의",
  description: "HYOKU JLPT 문의 페이지: 서비스 오류, 콘텐츠 제보, 개인정보 문의 접수 경로를 안내합니다.",
};

export default function ContactPage() {
  return (
    <main className="policy-page-shell">
      <SiteHeader active="guide" />
      <article className="policy-page-card">
        <p className="policy-eyebrow">Contact</p>
        <h1>문의</h1>
        <p className="policy-lead">
          HYOKU JLPT 이용 중 오류, 문항 제보, 개인정보처리방침 관련 문의가 있으면 아래 경로로 알려주세요.
        </p>

        <section>
          <h2>문의 경로</h2>
          <p>
            공개 문의와 오류 제보는 GitHub Issues에서 접수합니다. 민감한 개인정보, 비밀번호, 인증 토큰은 절대 남기지 마세요.
          </p>
          <p>
            <a href="https://github.com/dltkdgur1123/jlpt-quiz-agent/issues" rel="noreferrer" target="_blank">
              HYOKU JLPT GitHub Issues 열기
            </a>
          </p>
        </section>

        <section>
          <h2>문의 예시</h2>
          <ul>
            <li>로그인 또는 학습 기록 저장 오류</li>
            <li>오답노트, 저장한 문제, 모의고사 결과 표시 문제</li>
            <li>문항 표현 오류 또는 해설 개선 제안</li>
            <li>개인정보처리방침, 쿠키, Google AdSense 광고 관련 문의</li>
          </ul>
        </section>
      </article>
    </main>
  );
}

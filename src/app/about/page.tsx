import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "서비스 소개",
  description: "HYOKU JLPT 서비스 소개: JLPT D-Day, 레벨별 모의고사, 오답노트 중심의 일본어 시험 학습 서비스입니다.",
};

export default function AboutPage() {
  return (
    <main className="policy-page-shell">
      <SiteHeader active="home" />
      <article className="policy-page-card">
        <p className="policy-eyebrow">About</p>
        <h1>서비스 소개</h1>
        <p className="policy-lead">
          HYOKU JLPT는 JLPT 학습자가 매일 짧게 시험 감각을 유지하도록 돕는 학습 서비스입니다.
          JLPT D-Day, N5~N1 레벨별 모의고사, 오답노트, 저장한 문제 복습을 한 곳에서 제공합니다.
        </p>

        <section>
          <h2>무엇을 제공하나요?</h2>
          <ul>
            <li>시험일까지 남은 기간을 확인하는 JLPT D-Day</li>
            <li>N5, N4, N3, N2, N1 레벨별 비청해 모의고사</li>
            <li>틀린 문제와 헷갈리는 문제를 다시 보는 오답노트</li>
            <li>풀이 기록 기반 취약영역과 다음 학습 추천</li>
          </ul>
        </section>

        <section>
          <h2>신뢰 기준</h2>
          <p>
            HYOKU JLPT는 공식 JLPT 주관기관과 무관합니다. 공식 기출문제를 복제하거나 변형하지 않습니다.
            점수와 합격권 표시는 학습 참고용이며 실제 시험 결과를 보장하지 않습니다.
          </p>
        </section>

        <section>
          <h2>운영 방향</h2>
          <p>
            무료 핵심 학습 경험을 먼저 안정화하고, 콘텐츠 품질 검수와 운영 헬스체크를 통해 신뢰할 수 있는 일본어 학습 도구로 개선합니다.
          </p>
        </section>
      </article>
    </main>
  );
}

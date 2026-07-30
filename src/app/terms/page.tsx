import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "이용약관",
  description: "HYOKU JLPT 이용약관: 학습 서비스 이용 범위, 콘텐츠 기준, 계정과 기록, 광고 정책을 안내합니다.",
};

export default function TermsPage() {
  return (
    <main className="policy-page-shell">
      <SiteHeader active="guide" />
      <article className="policy-page-card">
        <p className="policy-eyebrow">Terms of Use</p>
        <h1>이용약관</h1>
        <p className="policy-lead">
          HYOKU JLPT는 JLPT 학습자를 위한 비공식 학습 서비스입니다. 공식 JLPT 주관기관과 무관하며,
          공식 기출문제를 복제하거나 변형하지 않습니다.
        </p>

        <section>
          <h2>서비스 범위</h2>
          <p>
            사용자는 레벨별 모의고사, JLPT D-Day 확인, 오답노트, 저장한 문제, 취약영역 분석 기능을 학습 목적으로 이용할 수 있습니다.
          </p>
        </section>

        <section>
          <h2>학습 결과와 책임</h2>
          <p>
            모의고사 점수, 합격권 표시, 체감 score, 취약영역 분석은 현재 서비스 데이터와 풀이 기록을 바탕으로 한 참고용 정보입니다.
            실제 시험 합격 여부나 출제 가능성을 예측하거나 보장하지 않습니다.
          </p>
        </section>

        <section>
          <h2>콘텐츠 이용</h2>
          <p>
            사이트의 문항, 설명, 화면 구성은 HYOKU JLPT 학습 서비스 제공을 위해 작성된 콘텐츠입니다. 무단 대량 수집,
            재배포, 자동화된 과도한 요청은 제한될 수 있습니다.
          </p>
        </section>

        <section>
          <h2>광고와 변경</h2>
          <p>
            서비스는 향후 Google AdSense 등 광고를 포함할 수 있습니다. 약관과 정책은 운영 상황에 따라 변경될 수 있으며,
            중요한 변경은 사이트 내에 반영합니다.
          </p>
        </section>
      </article>
    </main>
  );
}

import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "HYOKU JLPT 개인정보처리방침: 수집 정보, 쿠키, Google AdSense 광고, 학습 기록 처리 기준을 안내합니다.",
};

export default function PrivacyPage() {
  return (
    <main className="policy-page-shell">
      <SiteHeader active="guide" />
      <article className="policy-page-card">
        <p className="policy-eyebrow">Privacy Policy</p>
        <h1>개인정보처리방침</h1>
        <p className="policy-lead">
          HYOKU JLPT는 JLPT D-Day, 레벨별 모의고사, 오답노트 복습을 제공하는 학습 서비스입니다.
          이 페이지는 jlpt-quiz-agent.vercel.app 이용자의 개인정보와 쿠키 처리 기준을 설명합니다.
        </p>

        <section>
          <h2>수집하는 정보</h2>
          <p>
            비로그인 이용자는 모의고사 풀이와 결과 확인을 브라우저에서 이용할 수 있습니다. 로그인 이용자는 학습 기록,
            오답노트, 저장한 문제, 사용자 출제 경험 제보와 같은 서비스 이용 정보가 계정과 연결되어 저장될 수 있습니다.
          </p>
        </section>

        <section>
          <h2>이용 목적</h2>
          <p>
            수집된 정보는 학습 기록 표시, 오답 복습, 취약 영역 분석, 서비스 오류 점검, 부정 사용 방지, 사용자 문의 응대에 사용됩니다.
            체감 score는 사용자 제보 기반 참고 지표이며 공식 JLPT 성적이 아닙니다.
          </p>
        </section>

        <section>
          <h2>쿠키와 Google AdSense</h2>
          <p>
            향후 Google AdSense 광고가 적용되면 Google 및 제휴사는 쿠키를 사용해 광고 제공, 빈도 제한, 부정 클릭 방지,
            광고 성과 측정을 수행할 수 있습니다. 사용자는 브라우저 설정 또는 Google 광고 설정에서 맞춤 광고와 쿠키 사용을 관리할 수 있습니다.
          </p>
        </section>

        <section>
          <h2>제3자 서비스</h2>
          <p>
            서비스 운영을 위해 Supabase, Vercel, Google AdSense 등 외부 서비스가 사용될 수 있습니다. 각 서비스는 자체 개인정보 처리방침에 따라 정보를 처리합니다.
          </p>
        </section>

        <section>
          <h2>문의</h2>
          <p>
            개인정보 관련 문의는 <a href="/contact">문의 페이지</a>를 통해 접수해주세요.
          </p>
        </section>
      </article>
    </main>
  );
}

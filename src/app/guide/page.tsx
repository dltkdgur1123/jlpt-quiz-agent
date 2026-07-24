import Link from "next/link";

import { SiteHeader } from "@/components/layout/SiteHeader";

const levelRows = [
  { level: "N5", focus: "기본 문자·어휘와 쉬운 문장 이해", time: "45분 연습" },
  { level: "N4", focus: "일상 표현과 기본 문법 판단", time: "55분 연습" },
  { level: "N3", focus: "중급 문법·독해 흐름 파악", time: "70분 연습" },
  { level: "N2", focus: "긴 문장 독해와 세부 의미 판단", time: "105분 연습" },
  { level: "N1", focus: "고급 어휘·논리 구조·긴 지문 대응", time: "110분 연습" },
];

const prepItems = [
  "입실 전 신분증·수험표·필기구 등 필요한 준비물을 다시 확인하세요.",
  "시험 시간과 장소는 접수처/공식 공지를 기준으로 확인하세요.",
  "모의고사는 시간 제한을 켜고 한 번에 제출하는 방식으로 연습하는 것이 좋습니다.",
  "제출 후에는 오답노트에서 틀린 문제와 미응답 문제를 먼저 복습하세요.",
];

export default function GuidePage() {
  return (
    <main className="figma-main">
      <div className="figma-shell dashboard-page guide-page">
        <SiteHeader active="guide" />

        <section className="guide-hero" aria-labelledby="guide-title">
          <p className="section-eyebrow">EXAM GUIDE</p>
          <h1 id="guide-title">JLPT 수험안내</h1>
          <p>
            실제 시험 준비에 필요한 기본 흐름과 HYOKU JLPT 모의고사 활용법을 한곳에서 확인하세요.
            일정·장소·접수 정보는 반드시 공식 접수처 공지를 기준으로 확인해야 합니다.
          </p>
          <div className="guide-hero-actions">
            <Link className="figma-primary" href="/mock-exams/n5-realistic-001">N5 모의고사 시작</Link>
            <Link className="guide-secondary-link" href="/dashboard">학습 기록 보기</Link>
          </div>
        </section>

        <section className="guide-grid" aria-label="수험 안내 요약">
          <article className="dashboard-panel guide-panel">
            <span>01</span>
            <h2>시험 구성 이해</h2>
            <p>문자·어휘, 문법, 독해 중심으로 문제 유형과 시간 압박에 익숙해지는 것이 먼저입니다.</p>
          </article>
          <article className="dashboard-panel guide-panel">
            <span>02</span>
            <h2>시간 제한 연습</h2>
            <p>풀 수 있는 문제부터 빠르게 처리하고, 어려운 문제는 표시 후 돌아오는 루틴을 만드세요.</p>
          </article>
          <article className="dashboard-panel guide-panel">
            <span>03</span>
            <h2>오답 복습 루프</h2>
            <p>제출 후에는 점수보다 오답·미응답을 먼저 확인하고 취약 영역을 다시 푸는 흐름이 중요합니다.</p>
          </article>
        </section>

        <section className="dashboard-panel guide-level-panel" aria-labelledby="guide-level-title">
          <div className="dashboard-action-head">
            <div>
              <h2 id="guide-level-title">레벨별 연습 기준</h2>
              <p>현재 플랫폼의 모의고사 연습 흐름 기준입니다. 공식 시험 시간표와는 다를 수 있습니다.</p>
            </div>
            <Link href="/mock-exams/n5-realistic-001">모의고사로 이동 →</Link>
          </div>
          <div className="guide-level-list">
            {levelRows.map((row) => (
              <div className="guide-level-row" key={row.level}>
                <strong>{row.level}</strong>
                <span>{row.focus}</span>
                <em>{row.time}</em>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-panel guide-check-panel" aria-labelledby="guide-check-title">
          <h2 id="guide-check-title">시험 전 체크리스트</h2>
          <ul>
            {prepItems.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>
      </div>
    </main>
  );
}

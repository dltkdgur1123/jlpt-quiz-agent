import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
const levels = [
  { level: "N5", title: "입문 일본어", time: "예상 소요 45분", href: "/mock-exams/n5-realistic-001", tone: "mint" },
  { level: "N4", title: "초급 일본어", time: "예상 소요 55분", href: "/mock-exams/n5-lite-002", tone: "blue" },
  { level: "N3", title: "중급 일본어", time: "예상 소요 70분", href: "/mock-exams/n5-realistic-001", tone: "orange" },
  { level: "N2", title: "고급 일본어", time: "예상 소요 105분", href: "/mock-exams/n5-realistic-001", tone: "pink" },
  { level: "N1", title: "최상급 일본어", time: "예상 소요 110분", href: "/mock-exams/n5-realistic-001", tone: "purple" },
];

const shorts = [
  { title: "N5 필수 동사 会います 읽기", meta: "Vocab · 1분" },
  { title: "헷갈리는 조사 に / で 구분", meta: "Grammar · N5" },
  { title: "독해에서 시간표 읽는 법", meta: "Reading · N5" },
];

export default function Home() {
  return (
    <main>
      <div className="home-shell">
        <SiteHeader active="home" />

        <section className="home-hero" id="home">
          <div>
            <p className="section-eyebrow">JLPT MOCK TEST PLATFORM</p>
            <h1>실전처럼 풀고,<br />데이터로 합격에 가까워지세요.</h1>
            <p>N5부터 N1까지 실제 시험 흐름에 맞춘 모의고사와 영역별 분석을 제공합니다.</p>
            <div className="home-hero-actions">
              <Link className="primary-link" href="/mock-exams/n5-realistic-001">무료 모의고사 시작</Link>
              <a className="secondary-link" href="#continue-learning">학습 기록 보기</a>
            </div>
          </div>
          <aside className="home-week-card">
            <span>이번 주 학습</span>
            <strong>4일 연속</strong>
            <p>총 126문제 풀이</p>
            <i aria-hidden="true" />
          </aside>
        </section>

        <section className="home-section" aria-labelledby="level-title">
          <div className="home-section-head">
            <h2 id="level-title">레벨별 모의고사</h2>
            <Link href="/mock-exams/n5-realistic-001">전체 보기 →</Link>
          </div>
          <div className="home-level-grid">
            {levels.map((item) => (
              <Link className="home-level-card" href={item.href} key={item.level}>
                <span className={`home-level-badge home-level-${item.tone}`}>{item.level}</span>
                <strong>{item.title}</strong>
                <p>문자·어휘 / 문법 / 독해 / 청해</p>
                <small>{item.time}</small>
              </Link>
            ))}
          </div>
        </section>

        <section className="home-bottom-grid" id="continue-learning">
          <article className="home-continue-panel">
            <h2>이어서 학습하기</h2>
            <strong>N3 실전 모의고사 · 2회차</strong>
            <p>문법·독해 영역 18 / 40문제 완료</p>
            <div className="home-wide-progress" aria-hidden="true"><i /></div>
            <Link className="primary-link" href="/mock-exams/n5-realistic-001">계속 풀기</Link>
          </article>
          <article className="home-score-panel" id="dashboard-preview">
            <h2>최근 성적</h2>
            <p>N4 모의고사 · 7월 20일</p>
            <strong>128 / 180</strong>
            <span>합격 예상 · 상위 24%</span>
            <Link href="/mock-exams/n5-realistic-001">오답 17개 다시 보기 →</Link>
          </article>
        </section>

        <section className="home-shorts-strip" id="recent-shorts" aria-labelledby="shorts-title">
          <div className="home-section-head">
            <h2 id="shorts-title">JLPT 쇼츠로 예열하기</h2>
            <a href="https://www.youtube.com/@JLPThyo_bot" rel="noreferrer" target="_blank">YouTube 보기 →</a>
          </div>
          <div className="home-shorts-row">
            {shorts.map((short) => (
              <article className="home-short-pill" key={short.title}>
                <div aria-hidden="true">JLPT</div>
                <span><strong>{short.title}</strong><small>{short.meta}</small></span>
              </article>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}

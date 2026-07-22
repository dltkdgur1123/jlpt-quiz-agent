import Link from "next/link";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { QuizMvp } from "@/components/quiz/QuizMvp";

const weeklyBars = [42, 88, 68, 110, 74, 128, 168];
const weekdays = ["월", "화", "수", "목", "금", "토", "일"];

const shorts = [
  { title: "N5 필수 동사 会います 읽기", meta: "Vocab · 1분", tone: "mint" },
  { title: "헷갈리는 조사 に / で 구분", meta: "Grammar · N5", tone: "purple" },
  { title: "JLPT에 자주 나오는 あたらしい", meta: "Vocab · N5", tone: "orange" },
  { title: "독해에서 시간표 읽는 법", meta: "Reading · N5", tone: "navy" },
];

const weakAreas = [
  { label: "문법형식 판단", rate: 48 },
  { label: "유의표현", rate: 57 },
  { label: "정보검색 독해", rate: 63 },
];

export default function Home() {
  return (
    <main>
      <div className="home-dashboard-shell">
        <header className="home-dashboard-topbar">
          <Link className="home-brand" href="/">
            <span>日</span>
            <strong>HYOKU JLPT</strong>
          </Link>
          <nav aria-label="메인 메뉴" className="home-nav">
            <a href="#home-dashboard">홈</a>
            <Link href="/mock-exams/n5-realistic-001">모의고사</Link>
            <a href="#recent-shorts">JLPT 쇼츠</a>
            <a href="#learning-record">대시보드</a>
          </nav>
          <details className="home-auth-menu">
            <summary aria-label="로그인 메뉴" className="home-profile">H</summary>
            <div className="home-auth-popover">
              <AuthPanel />
            </div>
          </details>
        </header>

        <section className="home-dashboard-hero" id="home-dashboard">
          <div className="home-welcome-card">
            <div>
              <p className="section-eyebrow">JLPT Mock Exam Platform</p>
              <h1>안녕하세요,<br />효쿠님</h1>
              <p>오늘은 N5 실전형 모의고사와 최근 JLPT 쇼츠를 함께 이어서 학습해보세요.</p>
            </div>
            <Link className="primary-link" href="/mock-exams/n5-realistic-001">새 모의고사 시작 →</Link>
          </div>
          <aside className="home-goal-card">
            <span>7월 목표</span>
            <h2>N5 모의고사 5회 완료하기</h2>
            <div className="home-goal-progress" aria-hidden="true"><i /></div>
            <div><strong>3/5회</strong><Link href="/mock-exams/n5-lite-002">계속 학습하기</Link></div>
          </aside>
        </section>

        <section className="home-stat-grid" aria-label="학습 요약">
          <strong><span>연속 학습</span>12일</strong>
          <strong><span>이번 주 문제</span>286개</strong>
          <strong><span>평균 정답률</span>74%</strong>
          <strong><span>예상 레벨</span>N5 보완</strong>
        </section>

        <section className="home-dashboard-grid" id="learning-record">
          <article className="home-panel home-activity-panel">
            <div className="home-panel-head">
              <h2>주간 학습 활동</h2>
              <a href="#learning-record">자세히</a>
            </div>
            <div className="home-bars" aria-label="요일별 풀이 수">
              {weeklyBars.map((height, index) => (
                <div className={`home-bar ${index === weeklyBars.length - 1 ? "home-bar-hot" : ""}`} key={weekdays[index]}>
                  <i style={{ height }} />
                  <span>{weekdays[index]}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="home-panel">
            <div className="home-panel-head">
              <h2>최근 모의고사</h2>
              <Link href="/mock-exams/n5-realistic-001">전체</Link>
            </div>
            <div className="home-exam-list">
              <div><strong>N5 실전 001</strong><span>96/180 · 문자/문법/독해</span><b data-status="review">보완 필요</b></div>
              <div><strong>N5 Lite 002</strong><span>21/30 · 42분</span><b data-status="pass">합격권</b></div>
              <div><strong>N5 Lite 001</strong><span>18/30 · 37분</span><b data-status="review">복습 추천</b></div>
            </div>
          </article>
        </section>

        <section className="home-dashboard-grid home-dashboard-grid-wide">
          <article className="home-panel" id="recent-shorts">
            <div className="home-panel-head">
              <h2>최근 JLPT 쇼츠</h2>
              <a href="https://www.youtube.com/@JLPThyo_bot" rel="noreferrer" target="_blank">YouTube 보기</a>
            </div>
            <div className="home-shorts-grid">
              {shorts.map((short) => (
                <article className="home-short-card" key={short.title}>
                  <div className={`home-short-thumb home-short-thumb-${short.tone}`}>
                    <span>JLPT</span><b>N5</b>
                  </div>
                  <div>
                    <h3>{short.title}</h3>
                    <p>{short.meta}</p>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="home-panel">
            <div className="home-panel-head">
              <h2>현재 취약 영역</h2>
              <a href="#weak-review">복습</a>
            </div>
            <div className="home-weak-list" id="weak-review">
              {weakAreas.map((area) => (
                <div key={area.label}>
                  <p><span>{area.label}</span><strong>{area.rate}%</strong></p>
                  <meter max="100" min="0" value={area.rate}>{area.rate}%</meter>
                </div>
              ))}
            </div>
            <p className="home-ad-note">데스크톱 모의고사 화면에는 Google Ad 사이드 레일을 유지합니다.</p>
          </article>
        </section>

        <section className="home-legacy-grid">
          <QuizMvp />
        </section>
      </div>
    </main>
  );
}

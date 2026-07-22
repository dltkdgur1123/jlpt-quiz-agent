import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";

const levels = [
  { level: "N5", title: "입문", time: "45분", href: "/mock-exams/n5-realistic-001", description: "문자·어휘 중심 기초 점검" },
  { level: "N4", title: "초급", time: "55분", href: "/mock-exams/n5-lite-002", description: "기초 문법과 독해 확장" },
  { level: "N3", title: "중급", time: "70분", href: "/mock-exams/n5-realistic-001", description: "문법·독해 균형 점검" },
  { level: "N2", title: "고급", time: "105분", href: "/mock-exams/n5-realistic-001", description: "실전 독해 밀도 강화" },
  { level: "N1", title: "최상급", time: "110분", href: "/mock-exams/n5-realistic-001", description: "고난도 문맥 판단 연습" },
];

const shortsByLevel = [
  { level: "N5", title: "조사 に / で 구분", meta: "Grammar · 45초", href: "https://www.youtube.com/@JLPThyo_bot" },
  { level: "N4", title: "자주 나오는 동사 표현", meta: "Vocab · 58초", href: "https://www.youtube.com/@JLPThyo_bot" },
  { level: "N3", title: "독해 시간표 읽기", meta: "Reading · 1분", href: "https://www.youtube.com/@JLPThyo_bot" },
  { level: "N2", title: "문맥상 알맞은 표현", meta: "Grammar · 52초", href: "https://www.youtube.com/@JLPThyo_bot" },
  { level: "N1", title: "고난도 유의어 감각", meta: "Vocab · 1분", href: "https://www.youtube.com/@JLPThyo_bot" },
];

export default function Home() {
  const selectedLevel = levels[0];

  return (
    <main>
      <div className="home-shell home-redesign-shell">
        <SiteHeader active="home" />

        <section className="home-redesign-panel" id="home" aria-labelledby="home-title">
          <div className="home-redesign-hero">
            <p className="home-redesign-kicker">JLPT MOCK EXAM</p>
            <h1 id="home-title">JLPT 모의고사를<br />차분하게 시작하세요</h1>
            <p>실전처럼 연습하고, 결과 리포트로 취약점을 확인하세요.</p>
          </div>

          <div className="home-redesign-divider" aria-hidden="true" />

          <section className="home-start-console" aria-labelledby="level-title">
            <h2 id="level-title">JLPT 레벨 선택</h2>
            <div className="home-level-segment" role="list" aria-label="JLPT 레벨 선택">
              {levels.map((item) => (
                <Link
                  aria-current={item.level === selectedLevel.level ? "page" : undefined}
                  className="home-level-segment-item"
                  href={item.href}
                  key={item.level}
                  role="listitem"
                >
                  <strong>{item.level}</strong>
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>

            <div className="home-exam-summary" aria-label="선택한 모의고사 요약">
              <dl>
                <div>
                  <dt>선택 레벨</dt>
                  <dd>{selectedLevel.level} · {selectedLevel.title}</dd>
                </div>
                <div>
                  <dt>구성</dt>
                  <dd>문자·어휘 / 문법 / 독해</dd>
                </div>
                <div>
                  <dt>예상 소요</dt>
                  <dd>{selectedLevel.time}</dd>
                </div>
              </dl>
              <p>{selectedLevel.description}</p>
            </div>

            <Link className="home-start-button" href={selectedLevel.href}>
              <span>{selectedLevel.level} 모의고사 시작</span>
              <b aria-hidden="true">→</b>
            </Link>
          </section>

          <Link className="home-recent-line" href="/dashboard">
            <span aria-hidden="true">◷</span>
            <strong>최근 학습: N5 문자·어휘</strong>
            <em>12분 전 이어서 보기</em>
            <b aria-hidden="true">›</b>
          </Link>
        </section>

        <section className="home-progress-row" id="continue-learning" aria-label="최근 학습과 최근 성적">
          <article className="home-progress-item">
            <span>최근 학습</span>
            <strong>N5 문자·어휘 · 18 / 50문항</strong>
            <p>다음 문제부터 바로 이어서 풀 수 있습니다.</p>
            <Link href="/mock-exams/n5-realistic-001">계속 풀기 →</Link>
          </article>
          <article className="home-progress-item home-progress-score">
            <span>최근 성적</span>
            <strong>정답률 72%</strong>
            <p>문법 빈칸 문제에서 오답이 가장 많았습니다.</p>
            <Link href="/dashboard">학습 기록 보기 →</Link>
          </article>
        </section>

        <section className="home-shorts-level-section" id="recent-shorts" aria-labelledby="shorts-title">
          <div className="home-redesign-section-head">
            <div>
              <p>JLPT SHORTS</p>
              <h2 id="shorts-title">레벨별 유튜브 숏츠 업데이트</h2>
            </div>
            <a href="https://www.youtube.com/@JLPThyo_bot" rel="noreferrer" target="_blank">YouTube 보기 →</a>
          </div>
          <div className="home-shorts-level-list">
            {shortsByLevel.map((short) => (
              <a className="home-shorts-level-row" href={short.href} key={short.level} rel="noreferrer" target="_blank">
                <span>{short.level}</span>
                <strong>{short.title}</strong>
                <em>{short.meta}</em>
                <b aria-hidden="true">→</b>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

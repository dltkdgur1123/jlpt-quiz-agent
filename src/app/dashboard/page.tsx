import Link from "next/link";
import { DashboardAttemptData } from "@/components/dashboard/DashboardAttemptData";
import { SiteHeader } from "@/components/layout/SiteHeader";

const stats = [
  { label: "연속 학습", value: "12일", note: "지난주보다 +3일", tone: "blue" },
  { label: "이번 주 문제", value: "286개", note: "목표 350개 중 82%", tone: "mint" },
  { label: "평균 정답률", value: "74%", note: "최근 5회 기준", tone: "orange" },
  { label: "예상 레벨", value: "N3 합격", note: "합격 가능성 84%", tone: "blue" },
];

const bars = [42, 56, 35, 68, 74, 31, 63];
const days = ["월", "화", "수", "목", "금", "토", "일"];
const recentExams = [
  { title: "N3 실전 3회", date: "7월 21일", score: "137 / 180", status: "합격 예상", good: true },
  { title: "N3 실전 2회", date: "7월 17일", score: "128 / 180", status: "합격 예상", good: true },
  { title: "N3 실전 1회", date: "7월 12일", score: "112 / 180", status: "보완 필요", good: false },
];
const weakAreas = [
  { label: "접속 표현", rate: 48, color: "orange" },
  { label: "유의어 구분", rate: 57, color: "purple" },
  { label: "장문 독해", rate: 63, color: "blue" },
];

export default function DashboardPage() {
  return (
    <main className="figma-main">
      <div className="figma-shell dashboard-page">
        <SiteHeader active="history" />

        <section className="dashboard-hero">
          <div>
            <h1>안녕하세요, 효쿠님</h1>
            <p>이번 주도 합격 목표에 한 걸음 더 가까워졌습니다.</p>
          </div>
          <Link className="figma-primary" href="/mock-exams/n5-realistic-001">새 모의고사 시작 →</Link>
        </section>

        <section className="dashboard-stat-grid" aria-label="학습 요약">
          {stats.map((stat) => (
            <article className="dashboard-stat-card" key={stat.label}>
              <i className={`tone-${stat.tone}`} />
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <small>{stat.note}</small>
            </article>
          ))}
        </section>

        <DashboardAttemptData />

        <section className="dashboard-grid-top">
          <article className="dashboard-panel dashboard-activity">
            <h2>주간 학습 활동</h2>
            <p>최근 7일 문제 풀이 수</p>
            <div className="dashboard-bars">
              {bars.map((bar, index) => (
                <div className={index === 6 ? "hot" : ""} key={days[index]}>
                  <b>{bar}</b>
                  <i style={{ height: `${bar * 2}px` }} />
                  <span>{days[index]}</span>
                </div>
              ))}
            </div>
          </article>
          <article className="dashboard-goal-card">
            <span>7월 목표</span>
            <h2>N3 모의고사<br />5회 완료하기</h2>
            <strong>3 / 5회</strong>
            <div className="figma-progress"><i style={{ width: "64%" }} /></div>
            <p>이번 달 남은 기간 10일</p>
            <Link className="figma-primary" href="/mock-exams/n5-realistic-001">계속 학습하기</Link>
          </article>
        </section>

        <section className="dashboard-grid-bottom" id="history">
          <article className="dashboard-panel dashboard-recent">
            <div className="panel-title-row"><h2>최근 모의고사</h2><a href="#history">전체 보기 →</a></div>
            {recentExams.map((exam) => (
              <div className="recent-exam-row" key={exam.title}>
                <span>N3</span>
                <div><strong>{exam.title}</strong><small>{exam.date}</small></div>
                <b>{exam.score}</b>
                <em data-good={exam.good}>{exam.status}</em>
              </div>
            ))}
          </article>
          <article className="dashboard-panel dashboard-weak">
            <h2>현재 취약 영역</h2>
            <p>최근 시험 데이터를 기준으로 분석했습니다.</p>
            {weakAreas.map((area) => (
              <div className={`weak-row weak-${area.color}`} key={area.label}>
                <p><strong>{area.label}</strong><b>{area.rate}%</b></p>
                <div><i style={{ width: `${area.rate}%` }} /></div>
              </div>
            ))}
          </article>
        </section>
      </div>
    </main>
  );
}

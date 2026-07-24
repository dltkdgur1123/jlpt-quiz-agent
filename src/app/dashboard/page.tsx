import Link from "next/link";
import { DashboardAttemptData, DashboardWrongNoteCard } from "@/components/dashboard/DashboardAttemptData";
import { SiteHeader } from "@/components/layout/SiteHeader";

const stats = [
  { label: "최근 기록", value: "3회", note: "모의고사 제출 기준", tone: "blue" },
  { label: "누적 풀이", value: "150문항", note: "저장된 기록 기준", tone: "mint" },
  { label: "평균 정답률", value: "41%", note: "학습 참고 지표", tone: "orange" },
  { label: "최근 선택 레벨", value: "N5", note: "비청해 실전 세트", tone: "blue" },
];

const bars = [42, 56, 35, 68, 74, 31, 63];
const days = ["월", "화", "수", "목", "금", "토", "일"];
const weeklyGoal = 70;
const weeklyMax = Math.max(...bars, weeklyGoal);
const weeklyTotal = bars.reduce((sum, value) => sum + value, 0);
const weeklyAverage = Math.round(weeklyTotal / bars.length);
const weeklyPeakIndex = bars.indexOf(Math.max(...bars));
const recentExams = [
  { title: "N5 실전 모의고사", date: "7월 24일", score: "82 / 180", status: "학습 참고", good: true },
  { title: "N5 실전 모의고사", date: "7월 21일", score: "73 / 180", status: "학습 참고", good: true },
  { title: "N5 실전 모의고사", date: "7월 19일", score: "68 / 180", status: "보완 필요", good: false },
];
const weakAreas = [
  { label: "문자·어휘", rate: 42, color: "orange", note: "한자읽기·표기 복습 우선" },
  { label: "문법", rate: 55, color: "purple", note: "문법형식 판단 보완" },
  { label: "읽기", rate: 61, color: "blue", note: "단문 독해부터 재점검" },
];

export default function DashboardPage() {
  return (
    <main className="figma-main">
      <div className="figma-shell dashboard-page">
        <SiteHeader active="history" />

        <section className="dashboard-hero">
          <div>
            <h1>안녕하세요, 효쿠님</h1>
            <p>모의고사 기록과 복습할 문제를 한 곳에서 확인합니다.</p>
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
            <div className="dashboard-activity-head">
              <div>
                <h2>주간 학습 활동</h2>
                <p>최근 7일 문제 풀이 수</p>
              </div>
              <strong>{weeklyTotal}문항</strong>
            </div>
            <div className="dashboard-activity-summary" aria-label="주간 학습 활동 요약">
              <span><b>{weeklyAverage}문항</b><em>일평균</em></span>
              <span><b>{days[weeklyPeakIndex]}요일</b><em>최고 활동일</em></span>
              <span><b>{weeklyGoal}문항</b><em>일 목표</em></span>
            </div>
            <div className="dashboard-bars" aria-label="최근 7일 요일별 문제 풀이 수">
              <div className="dashboard-bars-goal" aria-hidden="true"><span>목표 {weeklyGoal}</span></div>
              {bars.map((bar, index) => (
                <div className={index === weeklyPeakIndex ? "hot" : ""} key={days[index]}>
                  <b>{bar}<small>문항</small></b>
                  <i style={{ height: `${Math.max(18, Math.round((bar / weeklyMax) * 168))}px` }} />
                  <span>{days[index]}</span>
                </div>
              ))}
            </div>
          </article>
          <article className="dashboard-goal-card">
            <span>이번 달 목표</span>
            <h2>N5 모의고사<br />3회 제출하기</h2>
            <strong>1 / 3회</strong>
            <div className="figma-progress"><i style={{ width: "34%" }} /></div>
            <p>다음 목표까지 2회 남음</p>
            <Link className="figma-primary" href="/mock-exams/n5-realistic-001">계속 학습하기</Link>
          </article>
        </section>

        <section className="dashboard-grid-bottom" id="history">
          <article className="dashboard-panel dashboard-recent">
            <div className="panel-title-row dashboard-action-head"><h2>최근 모의고사</h2><a href="#history">전체 보기 →</a></div>
            {recentExams.map((exam) => (
              <div className="recent-exam-row" key={exam.title}>
                <span>N5</span>
                <div><strong>{exam.title}</strong><small>{exam.date}</small></div>
                <b>{exam.score}</b>
                <em data-good={exam.good}>{exam.status}</em>
              </div>
            ))}
          </article>
          <DashboardWrongNoteCard />
        </section>

        <section className="dashboard-panel dashboard-weak dashboard-weak-full" aria-label="취약 영역 분석">
          <div className="dashboard-weak-head dashboard-action-head">
            <div>
              <h2>취약 영역 분석</h2>
              <p>오답노트와 최근 모의고사 기준으로 보완이 필요한 영역을 정리합니다.</p>
            </div>
            <Link href="/mock-exams/n5-realistic-001">약한 영역 다시 풀기 →</Link>
          </div>
          <div className="dashboard-weak-grid">
            {weakAreas.map((area) => (
              <div className={`weak-row weak-${area.color}`} key={area.label}>
                <p><strong>{area.label}</strong><b>{area.rate}%</b></p>
                <div><i style={{ width: `${area.rate}%` }} /></div>
                <span>{area.note}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

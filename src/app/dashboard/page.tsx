import Link from "next/link";
import { DashboardLiveData } from "@/components/dashboard/DashboardAttemptData";
import { SiteHeader } from "@/components/layout/SiteHeader";

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

        <DashboardLiveData />
      </div>
    </main>
  );
}

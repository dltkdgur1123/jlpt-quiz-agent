import { SiteHeader } from "@/components/layout/SiteHeader";

export default function SettingsPage() {
  return (
    <main className="figma-main">
      <div className="figma-shell dashboard-page">
        <SiteHeader active="history" />
        <section className="dashboard-panel settings-panel">
          <h1>설정</h1>
          <p>계정 및 학습 환경 설정은 다음 단계에서 연결됩니다.</p>
        </section>
      </div>
    </main>
  );
}

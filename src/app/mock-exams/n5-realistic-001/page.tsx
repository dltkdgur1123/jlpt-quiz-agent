import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MockExamLite } from "@/components/mock-exam/MockExamLite";

function loadMockExamSet() {
  const path = join(process.cwd(), "data/generated/n5-realistic-mock-exam-001.json");
  return JSON.parse(readFileSync(path, "utf8"));
}

function AdSidebar({ side }: { side: "left" | "right" }) {
  return (
    <aside aria-label={`${side} sidebar ad`} className="exam-ad-sidebar">
      <span>Google Ad</span>
      <p>사이드 광고 영역</p>
    </aside>
  );
}

export default function N5RealisticMockExam001Page() {
  const artifact = loadMockExamSet();

  return (
    <main>
      <div className="mock-page-shell">
        <SiteHeader active="mock" />
        <div className="exam-portal-layout">
          <AdSidebar side="left" />
          <div className="exam-main-column">
            <MockExamLite artifact={artifact} />
          </div>
          <AdSidebar side="right" />
        </div>
      </div>
    </main>
  );
}

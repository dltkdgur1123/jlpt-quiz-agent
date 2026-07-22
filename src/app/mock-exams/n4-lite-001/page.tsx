import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MockExamLite } from "@/components/mock-exam/MockExamLite";

function loadMockExamSet() {
  const path = join(process.cwd(), "data/generated/n4-mock-exam-lite-001.json");
  return JSON.parse(readFileSync(path, "utf8"));
}

export default function N4MockExamLite001Page() {
  const artifact = loadMockExamSet();

  return (
    <main>
      <div className="mock-page-shell">
        <SiteHeader active="mock" />
        <div className="page-stack mock-lite-page-stack">
          <MockExamLite artifact={artifact} />
        </div>
      </div>
    </main>
  );
}

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { AutoMockExamRunner } from "@/components/mock-exam/AutoMockExamRunner";

const LEVELS = ["n5", "n4", "n3", "n2", "n1"];

function AdSidebar({ side }: { side: "left" | "right" }) {
  return (
    <aside aria-label={`${side} sidebar ad`} className="exam-ad-sidebar">
      <span>Google Ad</span>
      <p>사이드 광고 영역</p>
    </aside>
  );
}

function loadLevelArtifacts(level: string) {
  const normalizedLevel = level.toLowerCase();
  if (!LEVELS.includes(normalizedLevel)) return [];

  const generatedDir = join(process.cwd(), "data/generated");
  if (!existsSync(generatedDir)) return [];

  return readdirSync(generatedDir)
    .filter((fileName) => fileName.startsWith(`${normalizedLevel}-realistic-mock-exam-`) && fileName.endsWith(".json"))
    .sort()
    .map((fileName) => JSON.parse(readFileSync(join(generatedDir, fileName), "utf8")));
}

export function generateStaticParams() {
  return LEVELS.map((level) => ({ level }));
}

export default async function LevelAutoMockExamPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  const artifacts = loadLevelArtifacts(level);

  if (!artifacts.length) notFound();

  return (
    <main>
      <div className="mock-page-shell">
        <SiteHeader active="mock" />
        <div className="exam-portal-layout">
          <AdSidebar side="left" />
          <div className="exam-main-column">
            <AutoMockExamRunner level={level.toUpperCase()} artifacts={artifacts} />
          </div>
          <AdSidebar side="right" />
        </div>
      </div>
    </main>
  );
}

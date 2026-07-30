import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
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

export async function generateMetadata({ params }: { params: Promise<{ level: string }> }): Promise<Metadata> {
  const { level } = await params;
  const normalizedLevel = level.toUpperCase();
  return {
    title: `${normalizedLevel} 모의고사`,
    description: `${normalizedLevel} JLPT 모의고사 50문항을 풀고 결과, 오답노트, 저장한 문제 복습으로 이어가세요. 공식 기출문제를 복제하거나 변형하지 않는 학습용 세트입니다.`,
    alternates: { canonical: `/mock-exams/${level.toLowerCase()}` },
    openGraph: {
      title: `${normalizedLevel} JLPT 모의고사`,
      description: `${normalizedLevel} 레벨 비청해 모의고사와 오답노트 복습을 시작하세요.`,
      url: `/mock-exams/${level.toLowerCase()}`,
    },
  };
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

import { readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { MockExamLite } from "@/components/mock-exam/MockExamLite";

function loadMockExamSet() {
  const path = join(process.cwd(), "data/generated/n5-mock-exam-lite-set-001.json");
  return JSON.parse(readFileSync(path, "utf8"));
}

export default function N5MockExamLite001Page() {
  const artifact = loadMockExamSet();

  return (
    <main>
      <div className="page-stack">
        <Link href="/">홈으로 돌아가기</Link>
        <MockExamLite artifact={artifact} />
      </div>
    </main>
  );
}

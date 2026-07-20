import { AuthPanel } from "@/components/auth/AuthPanel";
import { QuizMvp } from "@/components/quiz/QuizMvp";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <div className="page-stack">
        <AuthPanel />
        <section className="review-entry-card">
          <p className="section-eyebrow">Review</p>
          <h2>N5 JLPT형 preview 문항</h2>
          <p>실제 DB import 전, 생성된 draft 문항의 자연스러운 일본어와 JLPT형 느낌을 먼저 확인합니다.</p>
          <Link href="/review/n5-preview">문항 검수 페이지 열기</Link>
        </section>
        <QuizMvp />
      </div>
    </main>
  );
}

import Link from "next/link";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { QuizMvp } from "@/components/quiz/QuizMvp";

export default function Home() {
  return (
    <main>
      <div className="page-stack">
        <section className="hero-copy">
          <p className="section-eyebrow">JLPT Mock Exam Platform</p>
          <h1>JLPT 모의고사 Lite</h1>
          <p>
            단일 퀴즈를 넘어 N5 모의고사 세트 응시, 전체 제출, 영역별 결과 확인 흐름으로 확장 중입니다.
          </p>
          <Link href="/mock-exams/n5-lite-002">N5 모의고사 Lite 002 시작</Link>
        </section>
        <AuthPanel />
        <QuizMvp />
      </div>
    </main>
  );
}

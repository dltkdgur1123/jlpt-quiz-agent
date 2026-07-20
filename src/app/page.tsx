import { AuthPanel } from "@/components/auth/AuthPanel";
import { QuizMvp } from "@/components/quiz/QuizMvp";

export default function Home() {
  return (
    <main>
      <div className="page-stack">
        <AuthPanel />
        <QuizMvp />
      </div>
    </main>
  );
}

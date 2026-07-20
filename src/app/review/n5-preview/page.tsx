import { readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";

type ChoiceKey = "A" | "B" | "C" | "D";

interface PreviewQuestion {
  item_type: "vocab" | "grammar";
  jlpt_level: "N5";
  question_type: "vocab_context_blank" | "grammar_sentence_blank";
  source_item: string;
  source_reading: string;
  source_meaning: string;
  source_day: string;
  question_text: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  correct_choice: ChoiceKey;
  explanation: string;
  review_status: "draft";
}

const choiceLabels: Array<{ key: ChoiceKey; field: keyof Pick<PreviewQuestion, "choice_a" | "choice_b" | "choice_c" | "choice_d"> }> = [
  { key: "A", field: "choice_a" },
  { key: "B", field: "choice_b" },
  { key: "C", field: "choice_c" },
  { key: "D", field: "choice_d" },
];

function loadPreviewQuestions(): PreviewQuestion[] {
  const filePath = join(process.cwd(), "data/generated/n5-jlpt-style-preview.json");
  return JSON.parse(readFileSync(filePath, "utf8")) as PreviewQuestion[];
}

function questionTypeLabel(questionType: PreviewQuestion["question_type"]) {
  return questionType === "vocab_context_blank" ? "어휘 문맥 빈칸형" : "문법 문장 빈칸형";
}

export default function N5PreviewReviewPage() {
  const questions = loadPreviewQuestions();
  const vocabCount = questions.filter((question) => question.item_type === "vocab").length;
  const grammarCount = questions.filter((question) => question.item_type === "grammar").length;

  return (
    <main>
      <div className="page-stack review-page-stack">
        <section className="hero-copy">
          <p className="section-eyebrow">Human Review Loop</p>
          <h1>N5 JLPT형 preview 문항 검수</h1>
          <p>
            공식 샘플의 문항 구조만 참고해 자체 제작한 draft 문항입니다. 가장 중요한 검수 기준은
            일본어 문장이 자연스러운지, JLPT 문항 형식에 가까운지입니다.
          </p>
          <p>
            한국어 해설과 정답은 실제 퀴즈에서는 답안 제출 후에만 노출합니다. 이 페이지에서는 검수 편의를 위해 함께 보여줍니다.
          </p>
          <div className="review-summary-grid">
            <strong>총 {questions.length}개</strong>
            <strong>어휘 {vocabCount}개</strong>
            <strong>문법 {grammarCount}개</strong>
          </div>
          <Link href="/">홈으로 돌아가기</Link>
        </section>

        {questions.map((question, index) => (
          <article className="review-question-card" key={`${question.item_type}-${question.source_item}-${index}`}>
            <div className="review-card-header">
              <p className="section-eyebrow">
                #{index + 1} · {question.jlpt_level} · {questionTypeLabel(question.question_type)} · {question.source_day}
              </p>
              <span>{question.review_status}</span>
            </div>
            <h2>{question.question_text}</h2>
            <ol className="review-choice-list">
              {choiceLabels.map(({ key, field }) => (
                <li data-correct={question.correct_choice === key} key={key}>
                  <span>{key}</span>
                  {question[field]}
                </li>
              ))}
            </ol>
            <details>
              <summary>정답·해설 보기</summary>
              <dl>
                <dt>정답</dt>
                <dd>{question.correct_choice}</dd>
                <dt>원본 항목</dt>
                <dd>
                  {question.source_item} / {question.source_reading} / {question.source_meaning}
                </dd>
                <dt>해설</dt>
                <dd>{question.explanation}</dd>
              </dl>
            </details>
            <div className="review-checklist">
              <p>검수 포인트</p>
              <ul>
                <li>일본어 문장이 자연스러운가?</li>
                <li>JLPT 문항 형식에 가까운가?</li>
                <li>정답이 하나로 수렴하는가?</li>
                <li>오답이 너무 터무니없지 않은가?</li>
              </ul>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

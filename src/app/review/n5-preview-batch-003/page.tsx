import { readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";

type ChoiceKey = "A" | "B" | "C" | "D";
type QuestionType = "vocab_reading" | "vocab_context_blank" | "grammar_sentence_blank";

interface PreviewQuestion {
  item_type: "vocab" | "grammar";
  jlpt_level: "N5";
  question_type: QuestionType;
  source_item: string;
  source_reading: string;
  source_meaning: string;
  source_day: string;
  source_stage: "final_used_csv";
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
  const filePath = join(process.cwd(), "data/generated/n5-jlpt-style-preview-batch-003.json");
  return JSON.parse(readFileSync(filePath, "utf8")) as PreviewQuestion[];
}

function questionTypeLabel(questionType: QuestionType) {
  const labels: Record<QuestionType, string> = {
    vocab_reading: "어휘 한자 읽기 선택형",
    vocab_context_blank: "어휘 문맥 빈칸형",
    grammar_sentence_blank: "문법 문장 빈칸형",
  };
  return labels[questionType];
}

export default function N5PreviewBatch003ReviewPage() {
  const questions = loadPreviewQuestions();
  const vocabCount = questions.filter((question) => question.item_type === "vocab").length;
  const grammarCount = questions.filter((question) => question.item_type === "grammar").length;
  const readingCount = questions.filter((question) => question.question_type === "vocab_reading").length;

  return (
    <main>
      <div className="page-stack review-page-stack">
        <section className="hero-copy">
          <p className="section-eyebrow">Human Review Loop · Batch 003 · sample09 format reference</p>
          <h1>N5 JLPT형 preview batch-003 문항 검수</h1>
          <p>
            공식 JLPT sample09의 비청해 출제 형식만 참고하고, 쇼츠 최종 검수 source로 자체 작성한 draft 문항입니다.
          </p>
          <p>
            청해는 아직 만들지 않습니다. 한국어 해설과 정답은 실제 퀴즈에서는 답안 제출 후에만 노출합니다.
          </p>
          <div className="review-summary-grid">
            <strong>총 {questions.length}개</strong>
            <strong>어휘 {vocabCount}개</strong>
            <strong>읽기형 {readingCount}개</strong>
            <strong>문법 {grammarCount}개</strong>
          </div>
          <Link href="/">홈으로 돌아가기</Link>
        </section>

        {questions.map((question, index) => (
          <article className="review-question-card" key={`${question.item_type}-${question.source_item}-${index}`}>
            <div className="review-card-header">
              <p className="section-eyebrow">
                #{index + 1} · {question.jlpt_level} · {questionTypeLabel(question.question_type)} · {question.source_day} · {question.source_stage}
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
                <dt>최종 쇼츠 source</dt>
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
                <li>sample09처럼 문제/보기만으로 풀 수 있는 형식인가?</li>
                <li>일본어 문장이 자연스러운가?</li>
                <li>정답이 하나로 수렴하는가?</li>
                <li>문제와 보기에는 한국어가 없는가?</li>
                <li>청해 요소가 섞이지 않았는가?</li>
              </ul>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

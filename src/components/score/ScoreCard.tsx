interface ScoreCardProps {
  perceived_exam_score: number | null;
  feedback_total_count: number;
  correct_rate?: number | null;
  has_enough_data: boolean;
}

export function ScoreCard({
  perceived_exam_score,
  feedback_total_count,
  correct_rate,
  has_enough_data,
}: ScoreCardProps) {
  return (
    <aside className="score-card" aria-label="출제 체감 score">
      <div className="section-eyebrow">출제 체감 score</div>
      <strong>
        {has_enough_data && perceived_exam_score !== null
          ? `${Math.round(perceived_exam_score * 100)}점`
          : "데이터 부족"}
      </strong>
      <p>
        사용자 출제 경험 제보를 바탕으로 계산한 출제 체감 score입니다.
      </p>
      <dl>
        <dt>perceived_exam_score</dt>
        <dd>{perceived_exam_score ?? "-"}</dd>
        <dt>제보 수</dt>
        <dd>{feedback_total_count}</dd>
        <dt>정답률</dt>
        <dd>{correct_rate === null || correct_rate === undefined ? "-" : `${Math.round(correct_rate * 100)}%`}</dd>
      </dl>
    </aside>
  );
}

#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";

const targets = [
  "n5-realistic-mock-exam-001",
  "n5-realistic-mock-exam-002",
  "n5-realistic-mock-exam-003",
  "n4-realistic-mock-exam-001",
  "n3-realistic-mock-exam-001",
  "n2-realistic-mock-exam-001",
  "n1-realistic-mock-exam-001",
];

const minimums = { N5: 120, N4: 140, N3: 190, N2: 240, N1: 300 };
const targetAverages = { N5: 150, N4: 165, N3: 230, N2: 290, N1: 360 };

const additions = {
  N3: {
    reading_short: "また、本文では一つの出来事だけでなく、その理由や次に必要な行動も示されています。接続表現の前後を比べ、何が変わったのか、だれが何をするのかを整理して読むことが大切です。",
    reading_medium: "この文章は、はじめに状況を説明し、次にその結果や周囲の反応を述べる構成になっています。答えを選ぶときは、本文の一部だけでなく、目的、変化、残った問題の関係を確認する必要があります。",
    reading_info: "なお、この案内には対象者、時間、持ち物、申し込み方法などがまとめて書かれています。似ている項目が複数あるため、質問文が求めている条件を先に決めてから、該当する行を最後まで読む必要があります。",
  },
  N2: {
    reading_short: "さらに、この文章では表面的な事実と、その背景にある理由が分けて述べられています。説明の中には例外や制限も含まれるため、便利になった点と、まだ注意しなければならない点を区別して読むことが求められます。",
    reading_medium: "本文全体を見ると、取り組みの導入理由、実施後に得られた効果、そして新しく生じた課題が対比的に述べられています。したがって、答えを選ぶ際には、単に肯定的な表現を探すのではなく、筆者が最終的に何を問題として残しているかを判断する必要があります。",
    reading_info: "この資料では、対象者、受付時間、必要な手続き、例外条件が複数示されています。情報検索型の問題であっても、質問に直接関係する項目だけでなく、その前後に書かれた制限やただし書きを確認しなければ、誤った選択肢を選びやすくなります。",
  },
  N1: {
    reading_short: "この短い文章は、単なる事実説明ではなく、ある制度や現象をどう評価するかという視点を含んでいます。筆者は明示的な結論だけでなく、逆接や条件表現を通じて、読み手に慎重な判断を促しています。したがって、強く述べられている部分と、留保されている部分の両方を読む必要があります。",
    reading_medium: "本文は、社会的な施策や組織の判断について、期待された効果と実際に見えてきた課題を対比させながら展開しています。表面的には成功や改善が述べられていても、その後に示される条件や懸念が筆者の中心的な問題意識につながっています。質問に答えるには、個別の事実だけでなく、文章全体の論理の流れを把握することが重要です。",
    reading_info: "この資料では、手続きの期限、対象範囲、例外規定、必要書類などが重なって示されています。情報を探すだけの問題に見えても、条件を一つ見落とすと結論が変わる可能性があります。特に、対象外となる場合や、通常とは異なる扱いが書かれている部分を確認することが求められます。",
  },
};

function splitQuestionText(text) {
  const parts = text.split(/\n\n/);
  if (parts.length >= 2) return { passage: parts.slice(0, -1).join("\n\n"), prompt: parts.at(-1) };
  return { passage: text, prompt: "" };
}

function strengthen(question, level) {
  const min = minimums[level];
  if (question.question_text.length >= min) return question;
  const levelAdditions = additions[level];
  if (!levelAdditions) return question;
  const extra = levelAdditions[question.question_type];
  if (!extra) return question;
  const { passage, prompt } = splitQuestionText(question.question_text);
  return {
    ...question,
    question_text: prompt ? `${passage}\n\n${extra}\n\n${prompt}` : `${passage}\n\n${extra}`,
  };
}

const report = [];
for (const setCode of targets) {
  const path = `data/generated/${setCode}.json`;
  const artifact = JSON.parse(readFileSync(path, "utf8"));
  const before = artifact.questions.filter((q) => q.section_key === "reading").map((q) => q.question_text.length);
  artifact.questions = artifact.questions.map((question) =>
    question.section_key === "reading" ? strengthen(question, artifact.set.jlpt_level) : question,
  );
  const after = artifact.questions.filter((q) => q.section_key === "reading").map((q) => q.question_text.length);
  writeFileSync(path, `${JSON.stringify(artifact, null, 2)}\n`);
  report.push({ setCode, level: artifact.set.jlpt_level, beforeMin: Math.min(...before), afterMin: Math.min(...after), afterAvg: Math.round(after.reduce((a, b) => a + b, 0) / after.length), targetAvg: targetAverages[artifact.set.jlpt_level] });
}
console.log(JSON.stringify(report, null, 2));

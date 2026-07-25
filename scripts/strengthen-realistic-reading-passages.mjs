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

const levelProfiles = {
  N5: {
    short: "この連絡は、予定や持ち物などを相手に知らせるために書かれています。前に聞いた話と違うところがある場合は、本文の中の新しい情報をよく見る必要があります。",
    medium: "この文章には、だれが、いつ、どこで、何をするかが順番に書かれています。最後の一文だけで答えを決めず、時間や場所、雨の場合の予定などを本文全体から確認してください。",
    info: "注意：曜日や時間によって利用できる内容が違います。料金、休みの日、申し込みの条件なども一緒に確認してください。似ている数字があるので、質問されている項目を先に見ると分かりやすいです。",
  },
  N4: {
    short: "この短い文章では、変更点や依頼されたことが一つだけでなく、理由や条件も一緒に示されています。答えを選ぶときは、最初に出てくる言葉だけで判断せず、後ろに続く説明まで読む必要があります。",
    medium: "本文では、予定、理由、結果が順に説明されています。特に、雨の場合、申し込みの期限、持って行く物などの条件があるときは、どの条件について質問されているかを整理してから答えてください。",
    info: "この案内には、複数の時間帯や料金、利用上の注意がまとめられています。表の中で似た数字や曜日が並んでいるため、質問の言葉と同じ項目を探し、その行の情報を最後まで確認することが大切です。",
  },
  N3: {
    short: "この文章は、表面的な事実だけでなく、その理由や次にする行動も読み取る必要があります。前半で状況が示され、後半で判断の手がかりが出ることが多いため、接続表現やただし書きにも注意してください。",
    medium: "本文では、取り組みの目的、実際に起きた変化、残っている課題が順番に述べられています。質問は一つの語句を探すだけでなく、筆者がどの点を重要だと考えているかを本文全体から判断する形式です。",
    info: "この情報は、講座や施設の案内のように、対象者、時間、条件、注意事項が複数並ぶ形式です。似ている項目を取り違えないように、質問が求めている条件と一致する行を確認し、例外や締切も合わせて読む必要があります。",
  },
  N2: {
    short: "この文章では、制度やサービスについて利点だけでなく、制限や前提条件も述べられています。単に目立つ語句を拾うのではなく、何が原因で、どのような判断や行動につながったのかを整理する必要があります。",
    medium: "本文は、ある取り組みの背景、導入後の効果、そして新たに見えてきた課題という流れで構成されています。質問に答えるには、肯定的な評価と問題点を区別し、筆者または説明者が最終的に何を指摘しているのかを読み取ることが求められます。",
    info: "この案内では、対象者、申請期限、必要書類、利用条件などが細かく示されています。情報検索ではありますが、単純な数字確認だけでなく、条件に当てはまる場合と当てはまらない場合を区別して読むことが重要です。",
  },
  N1: {
    short: "この文章では、ある事実に対する評価や問題意識が短くまとめられています。書き手は単に出来事を説明しているだけではなく、その背後にある構造や今後の判断材料を示そうとしています。表現の強弱や逆接の後に置かれた内容に注意する必要があります。",
    medium: "本文は、社会的な取り組みや組織上の制度について、導入の背景、得られた成果、なお残る課題を対比的に述べています。質問に答えるには、部分的な事実確認だけでなく、筆者が最も問題視している点や、本文全体から導かれる含意を把握することが求められます。",
    info: "この資料は、申請や施設利用、調査結果などを想定した情報検索型の文章です。複数の条件が重なっているため、表の数値や項目だけでなく、ただし書き、対象外の条件、手続きの順序まで確認しなければ正しく判断できません。",
  },
};

function passageKind(questionType) {
  if (questionType === "reading_info") return "info";
  if (questionType === "reading_medium") return "medium";
  return "short";
}

function splitQuestionText(text) {
  const parts = text.split(/\n\n/);
  if (parts.length >= 2) {
    return {
      passage: parts.slice(0, -1).join("\n\n"),
      question: parts.at(-1),
    };
  }
  const sentences = text.split(/(?<=。)/);
  return {
    passage: sentences.slice(0, -1).join(""),
    question: sentences.at(-1) ?? text,
  };
}

function strengthen(question, level) {
  const kind = passageKind(question.question_type);
  const profile = levelProfiles[level][kind];
  const { passage, question: prompt } = splitQuestionText(question.question_text);
  const alreadyStrong =
    passage.includes("この連絡は") ||
    passage.includes("この短い文章では") ||
    passage.includes("この文章は") ||
    passage.includes("本文では") ||
    passage.includes("本文全体") ||
    passage.includes("この資料では") ||
    passage.includes("注意：") ||
    passage.length > 180;
  if (alreadyStrong) return question;
  return {
    ...question,
    question_text: `${passage}\n\n${profile}\n\n${prompt}`,
  };
}

const report = [];
for (const setCode of targets) {
  const path = `data/generated/${setCode}.json`;
  const artifact = JSON.parse(readFileSync(path, "utf8"));
  const before = artifact.questions
    .filter((question) => question.section_key === "reading")
    .map((question) => question.question_text.length);
  artifact.questions = artifact.questions.map((question) =>
    question.section_key === "reading" ? strengthen(question, artifact.set.jlpt_level) : question,
  );
  const after = artifact.questions
    .filter((question) => question.section_key === "reading")
    .map((question) => question.question_text.length);
  writeFileSync(path, `${JSON.stringify(artifact, null, 2)}\n`);
  report.push({ setCode, beforeMin: Math.min(...before), beforeAvg: Math.round(before.reduce((a, b) => a + b, 0) / before.length), afterMin: Math.min(...after), afterAvg: Math.round(after.reduce((a, b) => a + b, 0) / after.length) });
}
console.log(JSON.stringify(report, null, 2));

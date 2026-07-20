#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

function id(section, text) {
  return `mq2_${createHash("sha1").update(`${section}:${text}`).digest("hex").slice(0, 8)}`;
}

function question(section, sortOrder, questionType, questionText, choices, correctChoice, explanation, sourceItem) {
  return {
    item_type: section,
    jlpt_level: "N5",
    question_type: questionType,
    source_item: sourceItem,
    source_reading: null,
    source_meaning: null,
    source_day: "mock-improved-002",
    question_text: questionText,
    choice_a: choices[0],
    choice_b: choices[1],
    choice_c: choices[2],
    choice_d: choices[3],
    correct_choice: correctChoice,
    explanation,
    review_status: "draft",
    generation_batch: "n5-mock-exam-lite-002",
    id: id(section, questionText),
    mock_exam_set_code: "n5-mock-exam-lite-002",
    section_key: section,
    section_sort_order: { vocab: 1, grammar: 2, reading: 3 }[section],
    sort_order: sortOrder,
    points: 1,
  };
}

const questions = [
  question("vocab", 1, "vocab_reading", "駅の前で友だちに「会います」。", ["あいます", "かいます", "いいます", "あびます"], "A", "「会います」の読みは「あいます」です。", "会います"),
  question("vocab", 2, "vocab_reading", "この「本」は田中さんのです。", ["ほん", "ばん", "ぼん", "もん"], "A", "「本」は「ほん」と読みます。", "本"),
  question("vocab", 3, "vocab_reading", "毎朝、学校へ「行きます」。", ["いきます", "ききます", "おきます", "あるきます"], "A", "「行きます」は「いきます」と読みます。", "行きます"),
  question("vocab", 4, "vocab_orthography", "「あたらしい」かばんを買いました。", ["新しい", "古い", "明るい", "暑い"], "A", "「あたらしい」は「新しい」と書きます。", "新しい"),
  question("vocab", 5, "vocab_orthography", "きのう、図書館で「ほん」を読みました。", ["本", "木", "休", "体"], "A", "「ほん」は「本」と書きます。", "本"),
  question("vocab", 6, "vocab_orthography", "「みず」を飲みます。", ["水", "火", "木", "金"], "A", "「みず」は「水」と書きます。", "水"),
  question("vocab", 7, "vocab_context_blank", "雨がふっています。かさを（　　　）ください。", ["さして", "読んで", "閉めて", "食べて"], "A", "雨の日は傘を「さす」が自然です。", "かさをさす"),
  question("vocab", 8, "vocab_context_blank", "この部屋は電気がついていないので、（　　　）です。", ["暗い", "甘い", "広い", "新しい"], "A", "電気がついていない部屋は「暗い」です。", "暗い"),
  question("vocab", 9, "vocab_context_blank", "のどがかわきました。水を（　　　）たいです。", ["飲み", "読み", "買い", "書き"], "A", "水は「飲む」ものなので「飲みたい」が自然です。", "飲む"),
  question("vocab", 10, "vocab_context_blank", "電車に乗る前に、駅で切符を（　　　）。", ["買います", "洗います", "起きます", "遊びます"], "A", "切符は駅で「買います」。", "買います"),
  question("vocab", 11, "vocab_context_blank", "今日はとても寒いです。コートを（　　　）。", ["着ます", "聞きます", "書きます", "開けます"], "A", "寒い日はコートを「着ます」。", "着ます"),
  question("vocab", 12, "vocab_paraphrase", "父は毎朝、新聞を読みます。", ["父は朝ごとに新聞を見ます。", "父は夜だけ新聞を読みます。", "父は新聞を書きます。", "父は新聞を買いません。"], "A", "「毎朝」は「朝ごとに」に近い意味です。", "毎朝"),
  question("vocab", 13, "vocab_paraphrase", "この店は駅の近くにあります。", ["駅から遠くありません。", "駅の中にあります。", "駅より新しいです。", "駅で勉強します。"], "A", "「近く」は距離が遠くないことです。", "近く"),
  question("vocab", 14, "vocab_paraphrase", "弟はまだ小さいです。", ["弟は子どもです。", "弟はとても高いです。", "弟は昨日来ました。", "弟は本を持っています。"], "A", "N5 문맥에서 「小さい」는 나이가 어리다는 뜻으로도 쓰입니다。", "小さい"),
  question("vocab", 15, "vocab_context_blank", "テストの前に、名前を（　　　）ください。", ["書いて", "飲んで", "泳いで", "曲がって"], "A", "시험지에는 이름을 「書く」 것이 자연스럽습니다。", "書く"),

  question("grammar", 16, "grammar_sentence_blank", "机の上（　　　）本があります。", ["に", "を", "で", "へ"], "A", "존재 장소에는 조사 「に」를 씁니다。", "に"),
  question("grammar", 17, "grammar_sentence_blank", "きのう、友だち（　　　）映画を見ました。", ["と", "で", "を", "へ"], "A", "함께 한 상대에는 「と」가 자연스럽습니다。", "と"),
  question("grammar", 18, "grammar_sentence_blank", "このりんごは赤く（　　　）甘いです。", ["て", "に", "を", "が"], "A", "형용사를 연결할 때 「赤くて」를 씁니다。", "て"),
  question("grammar", 19, "grammar_sentence_blank", "田中さんは毎日6時に起き（　　　）。", ["ます", "です", "ました", "ませんでした"], "A", "매일 하는 습관은 정중 현재형 「ます」가 자연스럽습니다。", "ます"),
  question("grammar", 20, "grammar_sentence_blank", "ここで写真を撮っ（　　　）か。", ["てもいいです", "てはいけません", "たいです", "ています"], "A", "허가를 물을 때 「てもいいですか」를 씁니다。", "てもいいですか"),
  question("grammar", 21, "grammar_sentence_build", "わたしは ＿＿ ＿＿ ★ ＿＿ 行きます。", ["友だち", "映画を", "と", "見に"], "C", "정답 문장은 「友だちと映画を見に行きます」이므로 ★ 위치는 「と」입니다。", "문장만들기"),
  question("grammar", 22, "grammar_sentence_build", "きのう ＿＿ ＿＿ ★ ＿＿。", ["スーパーで", "を", "パン", "買いました"], "C", "「スーパーでパンを買いました」가 자연스러운 순서입니다. ★는 「パン」입니다。", "문장만들기"),
  question("grammar", 23, "grammar_sentence_build", "この ＿＿ ＿＿ ★ ＿＿ です。", ["かばんは", "軽くて", "とても", "便利"], "C", "「このかばんは軽くてとても便利です」가 자연스럽습니다. ★는 「とても」입니다。", "문장만들기"),
  question("grammar", 24, "grammar_sentence_build", "日曜日に ＿＿ ＿＿ ★ ＿＿。", ["家で", "を", "日本語", "勉強しました"], "C", "「家で日本語を勉強しました」가 자연스럽습니다. ★는 「日本語」입니다。", "문장만들기"),
  question("grammar", 25, "grammar_sentence_build", "駅まで ＿＿ ＿＿ ★ ＿＿ かかります。", ["歩いて", "ぐらい", "15分", "行くと"], "C", "「歩いて行くと15分ぐらいかかります」의 ★ 위치는 「15分」입니다。", "문장만들기"),
  question("grammar", 26, "grammar_text_blank", "朝、パンを食べました。（　　　）、学校へ行きました。", ["それから", "でも", "まだ", "あまり"], "A", "일어난 순서를 이어 말할 때 「それから」가 자연스럽습니다。", "글의 문법"),
  question("grammar", 27, "grammar_text_blank", "この店のケーキはおいしいです。（　　　）、少し高いです。", ["でも", "そして", "それから", "だから"], "A", "좋은 점 뒤에 반대 내용을 말하므로 「でも」가 자연스럽습니다。", "글의 문법"),
  question("grammar", 28, "grammar_text_blank", "明日はテストです。（　　　）、今夜は勉強します。", ["だから", "でも", "それから", "まだ"], "A", "이유와 결과를 잇는 말은 「だから」입니다。", "글의 문법"),
  question("grammar", 29, "grammar_text_blank", "A: もう昼ご飯を食べましたか。\nB: いいえ、（　　　）です。", ["まだ", "よく", "とても", "いちばん"], "A", "아직 하지 않았다는 대답에는 「まだ」가 자연스럽습니다。", "글의 문법"),
  question("grammar", 30, "grammar_text_blank", "この本はやさしいです。（　　　）おもしろいです。", ["そして", "でも", "まだ", "あまり"], "A", "두 가지 성질을 더해 말하므로 「そして」가 자연스럽습니다。", "글의 문법"),

  question("reading", 31, "reading_short", "山田さんのメモ：\n今日は母のたんじょう日です。学校のあとで、花を買ってから家へ帰ります。\n\n山田さんは学校のあとで何をしますか。", ["花を買います", "母に電話します", "学校へ行きます", "家で勉強します"], "A", "메모에 「花を買ってから家へ帰ります」라고 되어 있습니다。", "내용이해 단문"),
  question("reading", 32, "reading_info", "店のお知らせ：\nあしたは休みです。あさっては朝10時から開きます。\n\nこの店はあしたどうなりますか。", ["休みです", "10時に開きます", "夜だけ開きます", "毎日開きます"], "A", "안내문에 「あしたは休みです」라고 되어 있습니다。", "정보검색"),
  question("reading", 33, "reading_short", "メール：\n今日は雨ですから、サッカーはしません。図書館で日本語を勉強しましょう。\n\n今日はどこで勉強しますか。", ["図書館", "公園", "駅", "学校の庭"], "A", "메일에 「図書館で日本語を勉強しましょう」라고 되어 있습니다。", "내용이해 단문"),
  question("reading", 34, "reading_info", "時間表：\nバスA  8:10  駅行き\nバスB  8:25  病院行き\nバスC  8:40  駅行き\n\n8時20分のあとで、駅へ行くバスはどれですか。", ["バスC", "バスA", "バスB", "ありません"], "A", "8:20 이후 역으로 가는 버스는 8:40의 バスC입니다。", "情報検索"),
  question("reading", 35, "reading_medium", "短い文：\nミラーさんは日曜日に友だちと公園へ行きました。公園で昼ご飯を食べて、写真をたくさん撮りました。夕方、駅の近くの店でお茶を飲みました。\n\nミラーさんは公園で何をしましたか。", ["昼ご飯を食べて写真を撮りました", "お茶を飲みました", "買い物をしました", "電車に乗りました"], "A", "본문에 공원에서 점심을 먹고 사진을 찍었다고 되어 있습니다。", "内容理解中문"),
];

const artifact = {
  set: {
    set_code: "n5-mock-exam-lite-002",
    set_title: "N5 모의고사 Lite 002",
    jlpt_level: "N5",
    mode: "lite",
    status: "draft",
    listening_included: false,
    time_limit_minutes: 45,
    question_count: questions.length,
    selection_rule: "jlpt.or.kr non-listening composition: mixed vocab, grammar, reading self-authored items",
  },
  sections: [
    { section_key: "vocab", section_title: "文字・語彙", sort_order: 1, question_count: 15, time_limit_minutes: 18 },
    { section_key: "grammar", section_title: "文法", sort_order: 2, question_count: 15, time_limit_minutes: 17 },
    { section_key: "reading", section_title: "読解", sort_order: 3, question_count: 5, time_limit_minutes: 10 },
  ],
  questions,
};

writeFileSync("data/generated/n5-mock-exam-lite-set-002.json", `${JSON.stringify(artifact, null, 2)}\n`);
console.log(JSON.stringify({ ok: true, questions: questions.length, outputPath: "data/generated/n5-mock-exam-lite-set-002.json" }, null, 2));

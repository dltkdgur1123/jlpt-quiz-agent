#!/usr/bin/env node
import { writeFileSync } from "node:fs";

const setCode = "n5-realistic-mock-exam-002";
const generationBatch = setCode;

function stableId(parts) {
  let hash = 2166136261;
  for (const part of parts.join("|")) {
    hash ^= part.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `mr2_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function q(sectionKey, sectionSortOrder, sortOrder, questionType, sourceItem, questionText, choices, correctChoice, explanation) {
  return {
    item_type: sectionKey,
    jlpt_level: "N5",
    question_type: questionType,
    source_item: sourceItem,
    source_reading: null,
    source_meaning: null,
    source_day: "mock-realistic-002",
    question_text: questionText,
    choice_a: choices.A,
    choice_b: choices.B,
    choice_c: choices.C,
    choice_d: choices.D,
    correct_choice: correctChoice,
    explanation,
    review_status: "draft",
    generation_batch: generationBatch,
    id: stableId([setCode, sectionKey, questionType, questionText]),
    mock_exam_set_code: setCode,
    section_key: sectionKey,
    section_sort_order: sectionSortOrder,
    sort_order: sortOrder,
    points: 1,
    source_stage: "mock_realistic_002",
  };
}

const vocab = [
  q("vocab", 1, 1, "vocab_reading", "外", "ドアの「外」で待っています。", { A: "そと", B: "うえ", C: "なか", D: "まえ" }, "A", "「外」は「そと」と読みます。"),
  q("vocab", 1, 2, "vocab_reading", "雨", "今日は「雨」がふっています。", { A: "あめ", B: "ゆき", C: "くも", D: "かぜ" }, "A", "「雨」は「あめ」と読みます。"),
  q("vocab", 1, 3, "vocab_reading", "母", "「母」は台所にいます。", { A: "はは", B: "ちち", C: "あね", D: "いもうと" }, "A", "「母」は「はは」と読みます。"),
  q("vocab", 1, 4, "vocab_orthography", "やすい", "この店のパンは「やすい」です。", { A: "安い", B: "高い", C: "古い", D: "白い" }, "A", "「やすい」は「安い」と書きます。"),
  q("vocab", 1, 5, "vocab_orthography", "みぎ", "駅を出て「みぎ」にまがってください。", { A: "右", B: "左", C: "前", D: "後" }, "A", "「みぎ」は「右」と書きます。"),
  q("vocab", 1, 6, "vocab_orthography", "ながい", "このえんぴつは「ながい」です。", { A: "長い", B: "短い", C: "新い", D: "広い" }, "A", "「ながい」は「長い」と書きます。"),
  q("vocab", 1, 7, "vocab_context_blank", "飲む", "のどがかわきました。水を（　　　）。", { A: "飲みます", B: "読みます", C: "聞きます", D: "書きます" }, "A", "물은 「飲みます」와 함께 씁니다."),
  q("vocab", 1, 8, "vocab_context_blank", "乗る", "朝、バスに（　　　）会社へ行きます。", { A: "乗って", B: "買って", C: "洗って", D: "切って" }, "A", "교통수단에는 「バスに乗る」를 씁니다."),
  q("vocab", 1, 9, "vocab_context_blank", "静か", "図書館では（　　　）してください。", { A: "静かに", B: "早く", C: "多く", D: "近く" }, "A", "도서관에서는 조용히 해야 하므로 「静かに」가 자연스럽습니다."),
  q("vocab", 1, 10, "vocab_context_blank", "寒い", "冬はとても（　　　）です。", { A: "寒い", B: "暑い", C: "明るい", D: "丸い" }, "A", "겨울의 날씨에는 「寒い」가 맞습니다."),
  q("vocab", 1, 11, "vocab_context_blank", "借りる", "ペンをわすれました。友だちに一本（　　　）。", { A: "借りました", B: "始めました", C: "曲がりました", D: "消しました" }, "A", "물건을 빌릴 때는 「借りました」를 씁니다."),
  q("vocab", 1, 12, "vocab_context_blank", "閉める", "寒いですから、まどを（　　　）ください。", { A: "閉めて", B: "開けて", C: "立って", D: "入って" }, "A", "창문을 닫는 동작은 「閉めて」입니다."),
  q("vocab", 1, 13, "vocab_context_blank", "近い", "学校は家から（　　　）です。歩いて五分です。", { A: "近い", B: "重い", C: "弱い", D: "暗い" }, "A", "걸어서 5분이면 가까우므로 「近い」가 맞습니다."),
  q("vocab", 1, 14, "vocab_context_blank", "食堂", "昼ごはんは学校の（　　　）で食べます。", { A: "食堂", B: "病院", C: "銀行", D: "交番" }, "A", "학교에서 점심을 먹는 장소는 「食堂」가 자연스럽습니다."),
  q("vocab", 1, 15, "vocab_context_blank", "切手", "手紙を出す前に、（　　　）をはります。", { A: "切手", B: "地図", C: "時計", D: "写真" }, "A", "편지를 보내기 전 붙이는 것은 「切手」입니다."),
  q("vocab", 1, 16, "vocab_context_blank", "洗う", "ごはんのあとで、皿を（　　　）。", { A: "洗います", B: "泳ぎます", C: "走ります", D: "歌います" }, "A", "그릇은 「洗います」와 함께 씁니다."),
  q("vocab", 1, 17, "vocab_paraphrase", "すぐ", "田中さんはすぐ来ます。", { A: "もうすぐ来ます", B: "ゆっくり来ます", C: "きのう来ます", D: "来ません" }, "A", "「すぐ」は 곧, 바로의 뜻입니다."),
  q("vocab", 1, 18, "vocab_paraphrase", "とても", "このケーキはとてもおいしいです。", { A: "たいへんおいしいです", B: "少しおいしいです", C: "おいしくないです", D: "古いです" }, "A", "「とても」は 정도가 큰 것을 나타냅니다."),
  q("vocab", 1, 19, "vocab_paraphrase", "いっしょに", "山田さんといっしょに帰りました。", { A: "山田さんと帰りました", B: "山田さんを待ちました", C: "一人で帰りました", D: "山田さんに会いませんでした" }, "A", "「いっしょに」は 함께라는 뜻입니다."),
  q("vocab", 1, 20, "vocab_paraphrase", "だんだん", "日本語がだんだん分かります。", { A: "少しずつ分かります", B: "ぜんぜん分かりません", C: "急に分かります", D: "前から分かります" }, "A", "「だんだん」は 조금씩 변화하는 상태를 나타냅니다."),
];

const grammar = [
  q("grammar", 2, 21, "grammar_sentence_blank", "は", "これはわたし（　　　）本です。", { A: "の", B: "を", C: "へ", D: "で" }, "A", "소유를 나타낼 때는 「わたしの本」이라고 합니다."),
  q("grammar", 2, 22, "grammar_sentence_blank", "に", "日曜日（　　　）映画を見ました。", { A: "に", B: "を", C: "で", D: "と" }, "A", "요일/시간에는 조사 「に」를 쓸 수 있습니다."),
  q("grammar", 2, 23, "grammar_sentence_blank", "で", "駅までバス（　　　）行きます。", { A: "で", B: "を", C: "が", D: "の" }, "A", "교통수단은 조사 「で」로 나타냅니다."),
  q("grammar", 2, 24, "grammar_sentence_blank", "ませんか", "いっしょに昼ごはんを食べ（　　　）。", { A: "ませんか", B: "でした", C: "ながら", D: "より" }, "A", "권유 표현은 「〜ませんか」를 씁니다."),
  q("grammar", 2, 25, "grammar_sentence_blank", "たい", "わたしは新しいくつを買い（　　　）です。", { A: "たい", B: "ながら", C: "ても", D: "から" }, "A", "희망은 동사ます형 + 「たい」로 나타냅니다."),
  q("grammar", 2, 26, "grammar_sentence_blank", "ている", "妹は今、部屋で本を読ん（　　　）。", { A: "でいます", B: "でした", C: "だします", D: "ませんか" }, "A", "진행 중인 동작은 「読んでいます」입니다."),
  q("grammar", 2, 27, "grammar_sentence_blank", "から", "今日は雨です（　　　）、タクシーで行きます。", { A: "から", B: "まで", C: "だけ", D: "より" }, "A", "이유를 나타낼 때는 「〜から」를 씁니다."),
  q("grammar", 2, 28, "grammar_sentence_blank", "てもいい", "ここで写真を撮っ（　　　）ですか。", { A: "てもいい", B: "てはいけない", C: "ながら", D: "たり" }, "A", "허가를 물을 때는 「〜てもいいですか」를 씁니다."),
  q("grammar", 2, 29, "grammar_sentence_blank", "ほうがいい", "熱がありますから、早く寝た（　　　）です。", { A: "ほうがいい", B: "ことがある", C: "つもり", D: "ところ" }, "A", "조언에는 「〜たほうがいい」를 씁니다."),
  q("grammar", 2, 30, "grammar_sentence_blank", "前に", "ごはんを食べる（　　　）、手を洗います。", { A: "前に", B: "あとで", C: "より", D: "だけ" }, "A", "동작 전을 나타낼 때는 「〜前に」입니다."),
  q("grammar", 2, 31, "grammar_sentence_build", "sentence_build_1", "わたしは ＿ ＿ ★ ＿ 行きます。", { A: "友だち", B: "と", C: "学校へ", D: "毎朝" }, "C", "자연스러운 순서는 「毎朝 友だち と 学校へ」이며 ★ 위치는 「学校へ」입니다."),
  q("grammar", 2, 32, "grammar_sentence_build", "sentence_build_2", "この ＿ ＿ ★ ＿ です。", { A: "店", B: "の", C: "ケーキ", D: "おいしい" }, "C", "「この店のケーキはおいしいです」 흐름에서 ★는 「ケーキ」입니다."),
  q("grammar", 2, 33, "grammar_sentence_build", "sentence_build_3", "きのう ＿ ＿ ★ ＿ 。", { A: "図書館で", B: "本を", C: "読みました", D: "二時間" }, "B", "「きのう 図書館で 二時間 本を 読みました」 흐름에서 ★는 「本を」입니다."),
  q("grammar", 2, 34, "grammar_sentence_build", "sentence_build_4", "父は ＿ ＿ ★ ＿ います。", { A: "新聞を", B: "読みながら", C: "お茶を", D: "飲んで" }, "C", "「新聞を読みながらお茶を飲んでいます」에서 ★는 「お茶を」입니다."),
  q("grammar", 2, 35, "grammar_sentence_build", "sentence_build_5", "駅まで ＿ ＿ ★ ＿ かかります。", { A: "歩いて", B: "十分", C: "ぐらい", D: "家から" }, "B", "「家から歩いて十分ぐらいかかります」에서 ★는 「十分」입니다."),
  q("grammar", 2, 36, "grammar_text_blank", "text_blank_1", "きのう、友だちと公園へ行きました。天気がよかったです。（　　　）写真をたくさん撮りました。", { A: "それで", B: "でも", C: "まだ", D: "いつも" }, "A", "앞 문장의 이유/결과로 이어지므로 「それで」가 자연스럽습니다."),
  q("grammar", 2, 37, "grammar_text_blank", "text_blank_2", "朝、時間がありませんでした。（　　　）、朝ごはんを食べませんでした。", { A: "だから", B: "それから", C: "けれども", D: "たとえば" }, "A", "시간이 없어서 아침을 먹지 않았다는 결과에는 「だから」가 맞습니다."),
  q("grammar", 2, 38, "grammar_text_blank", "text_blank_3", "この店のラーメンはおいしいです。（　　　）、少し高いです。", { A: "でも", B: "そして", C: "それで", D: "だから" }, "A", "좋지만 비싸다는 대조에는 「でも」가 자연스럽습니다."),
  q("grammar", 2, 39, "grammar_text_blank", "text_blank_4", "日曜日にそうじをしました。（　　　）、スーパーへ買い物に行きました。", { A: "それから", B: "しかし", C: "だから", D: "まだ" }, "A", "순서상 다음 동작을 말할 때는 「それから」입니다."),
  q("grammar", 2, 40, "grammar_text_blank", "text_blank_5", "山田さんは毎日日本語を勉強しています。（　　　）漢字もよく知っています。", { A: "だから", B: "でも", C: "まだ", D: "あまり" }, "A", "매일 공부하므로 한자도 잘 안다는 결과에는 「だから」가 맞습니다."),
];

const reading = [
  q("reading", 3, 41, "reading_short", "reading_note_1", "田中さんへ\n今日は先に帰ります。つくえの上に本を置きました。明日、持ってきてください。\n山本\n\n田中さんは明日、何を持ってきますか。", { A: "本", B: "かばん", C: "写真", D: "手紙" }, "A", "메모에 「本を置きました。明日、持ってきてください」라고 되어 있습니다."),
  q("reading", 3, 42, "reading_short", "reading_mail_1", "母へ\n駅に着きました。これからバスで家へ帰ります。六時ごろ着きます。\nまい\n\nまいさんは何で家へ帰りますか。", { A: "バス", B: "電車", C: "タクシー", D: "自転車" }, "A", "본문에 「これからバスで家へ帰ります」라고 되어 있습니다."),
  q("reading", 3, 43, "reading_short", "reading_notice_1", "あしたのサッカーは雨のため中止です。来週の月曜日にします。時間は同じです。\n\nサッカーはいつしますか。", { A: "来週の月曜日", B: "あした", C: "今日", D: "来週の金曜日" }, "A", "공지에 「来週の月曜日にします」라고 되어 있습니다."),
  q("reading", 3, 44, "reading_short", "reading_diary_1", "きのう、妹と新しい店へ行きました。ケーキを食べました。小さかったですが、とてもおいしかったです。\n\nケーキはどうでしたか。", { A: "小さくておいしかった", B: "大きくて高かった", C: "古くてまずかった", D: "安くて多かった" }, "A", "본문에 작았지만 매우 맛있었다고 되어 있습니다."),
  q("reading", 3, 45, "reading_medium", "reading_letter_1", "今週の土曜日に、クラスのみんなで山へ行きます。朝八時に学校の前に集まります。昼ごはんと水を持ってきてください。雨のときは、学校で日本語の映画を見ます。\n\n雨のとき、何をしますか。", { A: "学校で映画を見ます", B: "山へ行きます", C: "家で休みます", D: "昼ごはんを買います" }, "A", "비가 올 때는 학교에서 일본어 영화를 본다고 되어 있습니다."),
  q("reading", 3, 46, "reading_medium", "reading_schedule_1", "リーさんは毎朝七時に起きます。七時半に朝ごはんを食べて、八時に家を出ます。学校までは歩いて十五分です。授業は九時に始まります。\n\nリーさんは学校までどうやって行きますか。", { A: "歩いて行きます", B: "バスで行きます", C: "電車で行きます", D: "自転車で行きます" }, "A", "본문에 학교까지 걸어서 15분이라고 되어 있습니다."),
  q("reading", 3, 47, "reading_info", "info_library_1", "図書館のお知らせ\n開いている時間：火曜日〜金曜日 9時〜18時、土曜日 10時〜16時\n休み：日曜日・月曜日\n本は一人五冊まで、二週間借りることができます。\n\n図書館が休みの日はいつですか。", { A: "日曜日と月曜日", B: "火曜日と水曜日", C: "金曜日と土曜日", D: "水曜日と日曜日" }, "A", "안내에 휴관일은 일요일・월요일이라고 되어 있습니다."),
  q("reading", 3, 48, "reading_info", "info_shop_1", "花屋セール\n今週だけ、赤い花は一本100円、白い花は一本80円です。三本買うと、小さいカードを一枚さしあげます。\n\nカードをもらうには、花を何本買いますか。", { A: "三本", B: "一本", C: "二本", D: "五本" }, "A", "안내에 세 송이를 사면 작은 카드를 준다고 되어 있습니다."),
  q("reading", 3, 49, "reading_info", "info_class_1", "日本語クラス\n月・水 18時〜19時30分：初級\n火・木 19時〜20時30分：会話\n土 10時〜12時：漢字\n教室は三階です。\n\n漢字のクラスはいつですか。", { A: "土曜日の午前", B: "月曜日の夜", C: "火曜日の夜", D: "水曜日の午後" }, "A", "표에 한자 수업은 토요일 10시~12시라고 되어 있습니다."),
  q("reading", 3, 50, "reading_info", "info_bus_1", "バス案内\n駅前 → 市役所：7時10分、7時40分、8時10分\n駅前 → 病院：7時20分、7時50分、8時20分\n駅前 → 大学：7時30分、8時00分、8時30分\n\n八時に大学へ行くバスはどこから出ますか。", { A: "駅前", B: "市役所", C: "病院", D: "大学" }, "A", "안내에서 대학행 8시 버스는 역 앞에서 출발합니다."),
];

const questions = [...vocab, ...grammar, ...reading];
const artifact = {
  set: {
    set_code: setCode,
    set_title: "N5 실전형 모의고사 002",
    jlpt_level: "N5",
    mode: "realistic_lite",
    status: "draft",
    listening_included: false,
    time_limit_minutes: 60,
    question_count: questions.length,
    selection_rule: "N5 non-listening realistic composition: 20 vocab, 20 grammar, 10 reading self-authored draft items",
  },
  sections: [
    { section_key: "vocab", section_title: "文字・語彙", sort_order: 1, question_count: 20, time_limit_minutes: 20 },
    { section_key: "grammar", section_title: "文法", sort_order: 2, question_count: 20, time_limit_minutes: 20 },
    { section_key: "reading", section_title: "読解", sort_order: 3, question_count: 10, time_limit_minutes: 20 },
  ],
  questions,
};

const outputPath = "data/generated/n5-realistic-mock-exam-002.json";
writeFileSync(outputPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(JSON.stringify({ ok: true, outputPath, question_count: questions.length }, null, 2));

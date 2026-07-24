#!/usr/bin/env node
import { writeFileSync } from "node:fs";

const setCode = "n5-realistic-mock-exam-003";
const generationBatch = setCode;

function stableId(parts) {
  let hash = 2166136261;
  for (const part of parts.join("|")) {
    hash ^= part.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `mr3_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function q(sectionKey, sectionSortOrder, sortOrder, questionType, sourceItem, questionText, choices, correctChoice, explanation) {
  return {
    item_type: sectionKey,
    jlpt_level: "N5",
    question_type: questionType,
    source_item: sourceItem,
    source_reading: null,
    source_meaning: null,
    source_day: "mock-realistic-003",
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
    source_stage: "mock_realistic_003",
  };
}

const vocab = [
  q("vocab", 1, 1, "vocab_reading", "山", "あした「山」へ行きます。", { A: "やま", B: "かわ", C: "うみ", D: "そら" }, "A", "「山」は「やま」と読みます。"),
  q("vocab", 1, 2, "vocab_reading", "車", "父の「車」は青いです。", { A: "くるま", B: "でんしゃ", C: "じてんしゃ", D: "ひこうき" }, "A", "「車」は「くるま」と読みます。"),
  q("vocab", 1, 3, "vocab_reading", "来ます", "兄は六時に「来ます」。", { A: "きます", B: "します", C: "みます", D: "います" }, "A", "「来ます」は「きます」と読みます。"),
  q("vocab", 1, 4, "vocab_orthography", "あおい", "「あおい」シャツを着ています。", { A: "青い", B: "赤い", C: "白い", D: "黒い" }, "A", "「あおい」は「青い」と書きます。"),
  q("vocab", 1, 5, "vocab_orthography", "ひだり", "つぎの角を「ひだり」にまがります。", { A: "左", B: "右", C: "上", D: "下" }, "A", "「ひだり」は「左」と書きます。"),
  q("vocab", 1, 6, "vocab_orthography", "まいにち", "わたしは「まいにち」日本語を勉強します。", { A: "毎日", B: "毎月", C: "毎年", D: "毎朝" }, "A", "「まいにち」は「毎日」と書きます。"),
  q("vocab", 1, 7, "vocab_context_blank", "開ける", "あついですから、ドアを（　　　）ください。", { A: "開けて", B: "閉めて", C: "消して", D: "止めて" }, "A", "더울 때 문을 여는 동작은 「開けて」입니다."),
  q("vocab", 1, 8, "vocab_context_blank", "急ぐ", "時間がありません。少し（　　　）ください。", { A: "急いで", B: "休んで", C: "遊んで", D: "並んで" }, "A", "시간이 없을 때는 「急いで」가 자연스럽습니다."),
  q("vocab", 1, 9, "vocab_context_blank", "便利", "このアプリはとても（　　　）です。", { A: "便利", B: "元気", C: "有名", D: "大切" }, "A", "사용하기 좋고 편리하다는 뜻은 「便利」입니다."),
  q("vocab", 1, 10, "vocab_context_blank", "薬", "頭がいたいので、（　　　）を飲みました。", { A: "薬", B: "新聞", C: "切符", D: "砂糖" }, "A", "아플 때 먹는 것은 「薬」입니다."),
  q("vocab", 1, 11, "vocab_context_blank", "待つ", "友だちが来ません。駅で十ぷん（　　　）。", { A: "待ちました", B: "作りました", C: "泳ぎました", D: "売りました" }, "A", "사람을 기다릴 때는 「待ちました」를 씁니다."),
  q("vocab", 1, 12, "vocab_context_blank", "降りる", "つぎの駅で電車を（　　　）。", { A: "降ります", B: "借ります", C: "始めます", D: "覚えます" }, "A", "전철에서 내릴 때는 「降ります」입니다."),
  q("vocab", 1, 13, "vocab_context_blank", "甘い", "このジュースは（　　　）です。さとうが多いです。", { A: "甘い", B: "からい", C: "広い", D: "遠い" }, "A", "설탕이 많으면 「甘い」가 맞습니다."),
  q("vocab", 1, 14, "vocab_context_blank", "交差点", "（　　　）で右にまがってください。", { A: "交差点", B: "切手", C: "料理", D: "教科書" }, "A", "길을 꺾는 장소로는 「交差点」이 자연스럽습니다."),
  q("vocab", 1, 15, "vocab_context_blank", "財布", "お金は（　　　）の中にあります。", { A: "財布", B: "帽子", C: "机", D: "花" }, "A", "돈을 넣는 물건은 「財布」입니다."),
  q("vocab", 1, 16, "vocab_context_blank", "曇り", "今日は日が出ていません。（　　　）です。", { A: "曇り", B: "晴れ", C: "雪", D: "春" }, "A", "해가 나지 않고 흐린 날씨는 「曇り」입니다."),
  q("vocab", 1, 17, "vocab_paraphrase", "たくさん", "本をたくさん読みました。", { A: "本を多く読みました", B: "本を少し読みました", C: "本を読みませんでした", D: "本を買いました" }, "A", "「たくさん」は 많이라는 뜻입니다."),
  q("vocab", 1, 18, "vocab_paraphrase", "あとで", "あとで電話します。", { A: "少ししてから電話します", B: "今すぐ電話します", C: "電話しません", D: "毎日電話します" }, "A", "「あとで」は 나중에라는 뜻입니다."),
  q("vocab", 1, 19, "vocab_paraphrase", "ゆっくり", "ゆっくり話してください。", { A: "おそく話してください", B: "大きく話してください", C: "短く話してください", D: "早く話してください" }, "A", "「ゆっくり」は 천천히라는 뜻입니다."),
  q("vocab", 1, 20, "vocab_paraphrase", "ちょうど", "今ちょうど十時です。", { A: "今十時です", B: "今十時ごろです", C: "今九時です", D: "今十一時です" }, "A", "「ちょうど」は 정확히라는 뜻입니다."),
];

const grammar = [
  q("grammar", 2, 21, "grammar_sentence_blank", "が", "つくえの上にりんご（　　　）あります。", { A: "が", B: "を", C: "で", D: "へ" }, "A", "존재하는 대상에는 「が」를 씁니다."),
  q("grammar", 2, 22, "grammar_sentence_blank", "を", "毎朝、コーヒー（　　　）飲みます。", { A: "を", B: "に", C: "へ", D: "と" }, "A", "마시는 대상에는 조사 「を」를 씁니다."),
  q("grammar", 2, 23, "grammar_sentence_blank", "から", "銀行は九時（　　　）開きます。", { A: "から", B: "まで", C: "より", D: "だけ" }, "A", "시작 시점은 「から」입니다."),
  q("grammar", 2, 24, "grammar_sentence_blank", "より", "電車はバス（　　　）速いです。", { A: "より", B: "まで", C: "から", D: "だけ" }, "A", "비교 기준에는 「より」를 씁니다."),
  q("grammar", 2, 25, "grammar_sentence_blank", "ないで", "今日はテレビを見（　　　）寝ました。", { A: "ないで", B: "ながら", C: "ても", D: "たり" }, "A", "하지 않고를 나타낼 때는 「〜ないで」입니다."),
  q("grammar", 2, 26, "grammar_sentence_blank", "ことがある", "京都へ行った（　　　）があります。", { A: "こと", B: "もの", C: "ため", D: "ところ" }, "A", "경험은 「〜たことがあります」로 말합니다."),
  q("grammar", 2, 27, "grammar_sentence_blank", "ながら", "音楽を聞き（　　　）勉強します。", { A: "ながら", B: "から", C: "まで", D: "より" }, "A", "동시 동작은 「〜ながら」입니다."),
  q("grammar", 2, 28, "grammar_sentence_blank", "てから", "宿題をし（　　　）、ゲームをします。", { A: "てから", B: "ながら", C: "たり", D: "ても" }, "A", "한 동작 뒤 다음 동작은 「〜てから」입니다."),
  q("grammar", 2, 29, "grammar_sentence_blank", "なければならない", "あしたテストですから、勉強し（　　　）。", { A: "なければなりません", B: "てもいいです", C: "たことがあります", D: "ながらです" }, "A", "해야 한다는 의미는 「〜なければなりません」입니다."),
  q("grammar", 2, 30, "grammar_sentence_blank", "てはいけない", "ここでたばこを吸っ（　　　）。", { A: "てはいけません", B: "てもいいです", C: "たほうがいいです", D: "たいです" }, "A", "금지는 「〜てはいけません」입니다."),
  q("grammar", 2, 31, "grammar_sentence_build", "sentence_build_1", "きのう ＿ ＿ ★ ＿ 買いました。", { A: "駅の", B: "前で", C: "花を", D: "母に" }, "C", "「きのう 駅の前で 母に 花を 買いました」에서 ★는 「花を」입니다."),
  q("grammar", 2, 32, "grammar_sentence_build", "sentence_build_2", "わたしは ＿ ＿ ★ ＿ 好きです。", { A: "日本の", B: "音楽", C: "が", D: "とても" }, "C", "「日本の音楽がとても好きです」에서 ★는 「が」입니다."),
  q("grammar", 2, 33, "grammar_sentence_build", "sentence_build_3", "弟は ＿ ＿ ★ ＿ います。", { A: "部屋で", B: "宿題を", C: "して", D: "今" }, "B", "「弟は今部屋で宿題をしています」에서 ★는 「宿題を」입니다."),
  q("grammar", 2, 34, "grammar_sentence_build", "sentence_build_4", "この道を ＿ ＿ ★ ＿ ください。", { A: "まっすぐ", B: "行って", C: "左に", D: "まがって" }, "C", "「まっすぐ行って左にまがってください」에서 ★는 「左に」입니다."),
  q("grammar", 2, 35, "grammar_sentence_build", "sentence_build_5", "母は ＿ ＿ ★ ＿ 作っています。", { A: "台所で", B: "晩ごはんを", C: "今", D: "一人で" }, "B", "「母は今台所で一人で晩ごはんを作っています」에서 ★는 「晩ごはんを」입니다."),
  q("grammar", 2, 36, "grammar_text_blank", "text_blank_1", "けさ、電車が止まりました。（　　　）、学校に少し遅れました。", { A: "それで", B: "しかし", C: "ところで", D: "まだ" }, "A", "전철이 멈춘 결과 늦었으므로 「それで」가 맞습니다."),
  q("grammar", 2, 37, "grammar_text_blank", "text_blank_2", "このかばんは軽いです。（　　　）、たくさん入ります。", { A: "それに", B: "でも", C: "だから", D: "まだ" }, "A", "장점을 덧붙일 때는 「それに」가 자연스럽습니다."),
  q("grammar", 2, 38, "grammar_text_blank", "text_blank_3", "あしたは休みです。（　　　）、朝早く起きなくてもいいです。", { A: "だから", B: "でも", C: "それから", D: "まだ" }, "A", "쉬는 날이라 일찍 일어나지 않아도 된다는 결과에는 「だから」가 맞습니다."),
  q("grammar", 2, 39, "grammar_text_blank", "text_blank_4", "この店は安いです。（　　　）、駅から遠いです。", { A: "でも", B: "そして", C: "それで", D: "だから" }, "A", "싸지만 멀다는 대조에는 「でも」입니다."),
  q("grammar", 2, 40, "grammar_text_blank", "text_blank_5", "朝ごはんを食べました。（　　　）、学校へ行きました。", { A: "それから", B: "しかし", C: "だから", D: "あまり" }, "A", "순서상 다음 행동은 「それから」가 자연스럽습니다."),
];

const reading = [
  q("reading", 3, 41, "reading_short", "reading_note_1", "中村さんへ\n会議は二時から三時に変わりました。部屋は二階の202です。\n佐藤\n\n会議は何時からですか。", { A: "三時", B: "二時", C: "一時", D: "四時" }, "A", "메모에 회의가 3시로 바뀌었다고 되어 있습니다."),
  q("reading", 3, 42, "reading_short", "reading_mail_1", "山田さん\nあしたの朝、駅で会いましょう。電車は8時20分ですから、8時10分に来てください。\nミン\n\n山田さんは何時に駅へ行きますか。", { A: "8時10分", B: "8時20分", C: "7時10分", D: "9時20分" }, "A", "메일에 8시 10분에 와 달라고 되어 있습니다."),
  q("reading", 3, 43, "reading_short", "reading_notice_1", "今日の午後、体育館でバスケットボールをします。くつを持ってきてください。飲み物は学校で買えます。\n\n何を持ってきますか。", { A: "くつ", B: "飲み物", C: "ボール", D: "お金" }, "A", "공지에 신발을 가져오라고 되어 있습니다."),
  q("reading", 3, 44, "reading_short", "reading_diary_1", "日曜日、家族で海へ行きました。水は少し冷たかったですが、天気がよくて楽しかったです。\n\n海はどうでしたか。", { A: "水は少し冷たかった", B: "天気が悪かった", C: "人がいませんでした", D: "暑くありませんでした" }, "A", "본문에 물이 조금 차가웠다고 되어 있습니다."),
  q("reading", 3, 45, "reading_medium", "reading_plan_1", "来月、学校で日本語スピーチ大会があります。出たい人は、今週の金曜日までに先生へ紙を出してください。スピーチは三分ぐらいです。テーマは自由です。\n\n出たい人は何をしますか。", { A: "先生へ紙を出します", B: "三分話します", C: "来月申し込みます", D: "テーマを先生に聞きます" }, "A", "참가 희망자는 이번 주 금요일까지 선생님께 종이를 내야 합니다."),
  q("reading", 3, 46, "reading_medium", "reading_trip_1", "マリアさんは土曜日に友だちと動物園へ行きます。朝10時に駅で会って、電車で行きます。昼ごはんは動物園の中で食べるつもりです。\n\nマリアさんは友だちとどこで会いますか。", { A: "駅", B: "動物園", C: "レストラン", D: "学校" }, "A", "본문에 역에서 만난다고 되어 있습니다."),
  q("reading", 3, 47, "reading_info", "info_pool_1", "市民プール\n時間：9時〜17時\n休み：火曜日\n料金：大人500円、子ども200円\n帽子をかぶって入ってください。\n\nプールが休みの日はいつですか。", { A: "火曜日", B: "月曜日", C: "土曜日", D: "日曜日" }, "A", "안내에 휴일은 화요일이라고 되어 있습니다."),
  q("reading", 3, 48, "reading_info", "info_cafe_1", "カフェさくら\nモーニング：7時〜10時\nランチ：11時30分〜14時\nケーキセット：14時〜17時\n水曜日は休みです。\n\nケーキセットは何時からですか。", { A: "14時", B: "7時", C: "10時", D: "11時30分" }, "A", "케이크 세트는 14시부터라고 되어 있습니다."),
  q("reading", 3, 49, "reading_info", "info_museum_1", "小さな美術館\n入館料：学生300円、大人600円\n開館：10時〜16時\n写真を撮ることはできません。\n\n美術館でしてはいけないことは何ですか。", { A: "写真を撮ること", B: "絵を見ること", C: "学生が入ること", D: "10時に入ること" }, "A", "안내에 사진 촬영을 할 수 없다고 되어 있습니다."),
  q("reading", 3, 50, "reading_info", "info_train_1", "電車案内\n北町行き：6時45分、7時15分、7時45分\n南町行き：7時00分、7時30分、8時00分\n西町行き：7時10分、7時40分、8時10分\n\n7時30分の電車はどこへ行きますか。", { A: "南町", B: "北町", C: "西町", D: "東町" }, "A", "표에서 7시 30분 전철은 南町行き입니다."),
];

const questions = [...vocab, ...grammar, ...reading];
const artifact = {
  set: {
    set_code: setCode,
    set_title: "N5 실전형 모의고사 003",
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

const outputPath = "data/generated/n5-realistic-mock-exam-003.json";
writeFileSync(outputPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(JSON.stringify({ ok: true, outputPath, question_count: questions.length }, null, 2));

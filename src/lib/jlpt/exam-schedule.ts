export type JlptExamSchedule = {
  region: "KR";
  label: string;
  examDate: string;
  sourceName: string;
  sourceUrl: string;
};

export type JlptExamDday = JlptExamSchedule & {
  dday: number;
  displayDate: string;
};

export const JLPT_EXAM_SCHEDULES: JlptExamSchedule[] = [
  {
    region: "KR",
    label: "2026년 제2회 JLPT",
    examDate: "2026-12-06",
    sourceName: "JLPT 공식 홈페이지",
    sourceUrl: "https://www.jlpt.or.kr/",
  },
  {
    region: "KR",
    label: "2027년 제1회 JLPT",
    examDate: "2027-07-04",
    sourceName: "JLPT 공식 홈페이지",
    sourceUrl: "https://www.jlpt.or.kr/",
  },
];

const KST_TIME_ZONE = "Asia/Seoul";
const DAY_MS = 24 * 60 * 60 * 1000;

function parseYmd(ymd: string) {
  const [year, month, day] = ymd.split("-").map(Number);
  return { year, month, day };
}

function dateOnlyUtcMs(ymd: string) {
  const { year, month, day } = parseYmd(ymd);
  return Date.UTC(year, month - 1, day);
}

function getKstYmd(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: KST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function calculateDday(examDate: string, today = new Date()) {
  const todayUtcMs = dateOnlyUtcMs(getKstYmd(today));
  const examUtcMs = dateOnlyUtcMs(examDate);
  return Math.ceil((examUtcMs - todayUtcMs) / DAY_MS);
}

export function formatKoreanExamDate(examDate: string) {
  const { year, month, day } = parseYmd(examDate);
  return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")}`;
}

export function getNextJlptExam(today = new Date()): JlptExamDday {
  const schedulesWithDday = JLPT_EXAM_SCHEDULES.map((schedule) => ({
    ...schedule,
    dday: calculateDday(schedule.examDate, today),
    displayDate: formatKoreanExamDate(schedule.examDate),
  }));
  const upcoming = schedulesWithDday
    .filter((schedule) => schedule.dday >= 0)
    .sort((a, b) => a.dday - b.dday)[0] ?? schedulesWithDday[0];

  return upcoming;
}

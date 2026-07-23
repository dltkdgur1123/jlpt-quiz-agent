import { HomeRecentMockExamGrid } from "@/components/home/HomeRecentMockExam";
import { LevelSwitch } from "@/components/home/LevelSwitch";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getNextJlptExam } from "@/lib/jlpt/exam-schedule";

const levels = [
  { level: "N5", time: "45분", href: "/mock-exams/n5-realistic-001" },
  { level: "N4", time: "55분", href: "/mock-exams/n4-lite-001" },
  { level: "N3", time: "70분", href: "/mock-exams/n3-lite-001" },
  { level: "N2", time: "105분", href: "/mock-exams/n2-lite-001" },
  { level: "N1", time: "110분", href: "/mock-exams/n1-lite-001" },
];

const youtubeShortsUrl = "https://www.youtube.com/@hyokujlpt/shorts";
const shortsLevels = ["N1", "N2", "N3", "N4", "N5"];

type YouTubeShort = {
  id: string;
  href: string;
  level: string;
  thumbnail: string;
};

async function getShortLevel(id: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      format: "json",
      url: `https://www.youtube.com/shorts/${id}`,
    });
    const response = await fetch(`https://www.youtube.com/oembed?${params.toString()}`, {
      next: { revalidate: 60 * 60 },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as { title?: string };
    return data.title?.match(/\bN[1-5]\b/i)?.[0].toUpperCase() ?? null;
  } catch {
    return null;
  }
}

async function getLatestHyokuShorts(): Promise<YouTubeShort[]> {
  try {
    const response = await fetch(youtubeShortsUrl, {
      headers: {
        "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
        "user-agent": "Mozilla/5.0 (compatible; JLPTQuizBot/1.0; +https://jlpt-quiz-agent.vercel.app)",
      },
      next: { revalidate: 60 * 60 },
    });

    if (!response.ok) return [];

    const html = await response.text();
    const ids = Array.from(html.matchAll(/"videoId":"([A-Za-z0-9_-]{11})"/g))
      .map((match) => match[1])
      .filter((id, index, all) => all.indexOf(id) === index)
      .slice(0, 80);

    const shortsByLevel = new Map<string, YouTubeShort>();

    for (const id of ids) {
      if (shortsByLevel.size === shortsLevels.length) break;

      const level = await getShortLevel(id);
      if (!level || shortsByLevel.has(level)) continue;

      shortsByLevel.set(level, {
        id,
        href: `https://www.youtube.com/shorts/${id}`,
        level,
        thumbnail: `https://i.ytimg.com/vi/${id}/hq720.jpg`,
      });
    }

    return shortsLevels.flatMap((level) => {
      const short = shortsByLevel.get(level);
      return short ? [short] : [];
    });
  } catch {
    return [];
  }
}

export default async function Home() {
  const latestShorts = await getLatestHyokuShorts();
  const nextJlptExam = getNextJlptExam();

  return (
    <main>
      <div className="home-page-frame">
        <div className="home-shell home-redesign-shell">
          <SiteHeader active="home" />

          <section className="home-redesign-panel" id="home" aria-labelledby="home-title">
            <div className="home-redesign-hero">
              <p className="home-redesign-kicker">JLPT D-DAY</p>
              <h1 className="home-dday-title" id="home-title">
                <span>다음 JLPT까지</span>
                <strong>{nextJlptExam.dday === 0 ? "D-DAY" : `D-${nextJlptExam.dday}`}</strong>
              </h1>
              <p className="home-dday-meta">
                <span>{nextJlptExam.label} · {nextJlptExam.displayDate} 기준</span>
                <a href={nextJlptExam.sourceUrl} rel="noreferrer" target="_blank">공식 일정 확인</a>
              </p>
            </div>

            <div className="home-redesign-divider" aria-hidden="true" />

            <LevelSwitch levels={levels} />
          </section>

          <HomeRecentMockExamGrid />

          <section className="home-shorts-grid-section" id="recent-shorts" aria-labelledby="shorts-title">
            <div className="home-redesign-section-head">
              <div>
                <p>JLPT SHORTS</p>
                <h2 id="shorts-title">레벨별 JLPT Shorts</h2>
              </div>
              <a href={youtubeShortsUrl} rel="noreferrer" target="_blank">Shorts 보기 →</a>
            </div>
            <div className="home-shorts-grid" aria-label="최신 JLPT Shorts 썸네일">
              {(latestShorts.length ? latestShorts : shortsLevels.map(() => null)).map((short, index) => {
                const level = short?.level ?? shortsLevels[index] ?? `N${index + 1}`;
                const href = short?.href ?? youtubeShortsUrl;
                return (
                  <a className="home-shorts-grid-link" href={href} key={short?.id ?? level} rel="noreferrer" target="_blank">
                    {short ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt={`${level} 최신 Shorts 썸네일`} src={short.thumbnail} />
                    ) : null}
                    <span>{level}</span>
                  </a>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

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
const youtubeChannelHandle = "hyokujlpt";
const shortsLevels = ["N1", "N2", "N3", "N4", "N5"];

type YouTubeShort = {
  id: string;
  href: string;
  level: string;
  thumbnail: string;
};

type YouTubeApiThumbnail = {
  url?: string;
};

type YouTubeApiVideo = {
  id: string;
  snippet?: {
    title?: string;
    description?: string;
    thumbnails?: Record<string, YouTubeApiThumbnail | undefined>;
  };
  contentDetails?: {
    duration?: string;
  };
};

function getShortLevelFromText(text: string): string | null {
  return text.match(/\bN[1-5]\b/i)?.[0].toUpperCase() ?? null;
}

function parseIsoDurationSeconds(duration?: string): number | null {
  if (!duration) return null;
  const match = duration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return null;
  const [, hours = "0", minutes = "0", seconds = "0"] = match;
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
}

function getBestThumbnail(thumbnails?: Record<string, YouTubeApiThumbnail | undefined>): string | null {
  return thumbnails?.maxres?.url ?? thumbnails?.standard?.url ?? thumbnails?.high?.url ?? thumbnails?.medium?.url ?? thumbnails?.default?.url ?? null;
}

async function getHyokuUploadsVideoIds(apiKey: string): Promise<string[]> {
  const channelParams = new URLSearchParams({
    key: apiKey,
    part: "contentDetails",
    forHandle: youtubeChannelHandle,
  });
  const channelResponse = await fetch(`https://www.googleapis.com/youtube/v3/channels?${channelParams.toString()}`, {
    next: { revalidate: 15 * 60 },
  });
  if (!channelResponse.ok) return [];

  const channelData = (await channelResponse.json()) as {
    items?: Array<{ contentDetails?: { relatedPlaylists?: { uploads?: string } } }>;
  };
  const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) return [];

  const playlistParams = new URLSearchParams({
    key: apiKey,
    part: "contentDetails",
    playlistId: uploadsPlaylistId,
    maxResults: "50",
  });
  const playlistResponse = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${playlistParams.toString()}`, {
    next: { revalidate: 15 * 60 },
  });
  if (!playlistResponse.ok) return [];

  const playlistData = (await playlistResponse.json()) as {
    items?: Array<{ contentDetails?: { videoId?: string } }>;
  };

  return (playlistData.items ?? [])
    .map((item) => item.contentDetails?.videoId)
    .filter((id): id is string => Boolean(id));
}

async function getLatestHyokuShorts(): Promise<YouTubeShort[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];

  try {
    const ids = await getHyokuUploadsVideoIds(apiKey);
    if (!ids.length) return [];

    const videoParams = new URLSearchParams({
      key: apiKey,
      part: "snippet,contentDetails",
      id: ids.join(","),
      maxResults: "50",
    });
    const videoResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?${videoParams.toString()}`, {
      next: { revalidate: 15 * 60 },
    });
    if (!videoResponse.ok) return [];

    const videoData = (await videoResponse.json()) as { items?: YouTubeApiVideo[] };
    const videosById = new Map((videoData.items ?? []).map((video) => [video.id, video]));

    const shortsByLevel = new Map<string, YouTubeShort>();

    for (const id of ids) {
      if (shortsByLevel.size === shortsLevels.length) break;

      const video = videosById.get(id);
      if (!video) continue;

      const durationSeconds = parseIsoDurationSeconds(video.contentDetails?.duration);
      if (durationSeconds === null || durationSeconds > 180) continue;

      const level = getShortLevelFromText(`${video.snippet?.title ?? ""} ${video.snippet?.description ?? ""}`);
      if (!level || shortsByLevel.has(level)) continue;

      const thumbnail = getBestThumbnail(video.snippet?.thumbnails);
      if (!thumbnail) continue;

      shortsByLevel.set(level, {
        id,
        href: `https://www.youtube.com/shorts/${id}`,
        level,
        thumbnail,
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

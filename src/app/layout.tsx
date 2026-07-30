import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import "./globals.css";

const siteUrl = "https://jlpt-quiz-agent.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "HYOKU JLPT | JLPT D-Day · JLPT 모의고사 · 오답노트",
    template: "%s | HYOKU JLPT",
  },
  description:
    "JLPT D-Day 확인, N5 N4 N3 N2 N1 레벨별 JLPT 모의고사, 오답노트와 저장한 문제 복습을 한 곳에서 이어가는 학습 서비스입니다.",
  keywords: [
    "JLPT D-Day",
    "JLPT 모의고사",
    "JLPT 오답노트",
    "N5 N4 N3 N2 N1",
    "일본어 시험 공부",
    "JLPT 수험안내",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "HYOKU JLPT",
    title: "HYOKU JLPT | JLPT D-Day · 모의고사 · 오답노트",
    description:
      "JLPT D-Day와 레벨별 모의고사, 오답노트 복습 루틴을 제공하는 학습 서비스입니다.",
  },
  twitter: {
    card: "summary_large_image",
    title: "HYOKU JLPT | JLPT D-Day · 모의고사 · 오답노트",
    description:
      "N5 N4 N3 N2 N1 레벨별 JLPT 모의고사와 오답노트 복습을 이어가세요.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}

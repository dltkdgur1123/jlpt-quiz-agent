import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { WrongNoteClient } from "@/components/wrong-note/WrongNoteClient";

export const metadata: Metadata = {
  title: "JLPT 오답노트",
  description: "JLPT 모의고사에서 틀린 문제와 저장한 문제를 다시 풀며 취약 영역을 복습하는 오답노트입니다.",
  alternates: { canonical: "/wrong-note" },
  openGraph: {
    title: "JLPT 오답노트",
    description: "오답, 반복 오답, 저장한 문제를 다시 풀어보는 JLPT 복습 진입점입니다.",
    url: "/wrong-note",
  },
};

export default function WrongNotePage() {
  return (
    <main className="figma-shell wrong-note-shell">
      <SiteHeader active="history" />
      <h1 className="sr-only">JLPT 오답노트</h1>
      <Suspense fallback={null}>
        <WrongNoteClient />
      </Suspense>
    </main>
  );
}

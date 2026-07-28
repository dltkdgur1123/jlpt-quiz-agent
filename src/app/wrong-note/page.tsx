import { SiteHeader } from "@/components/layout/SiteHeader";
import { WrongNoteClient } from "@/components/wrong-note/WrongNoteClient";

export default function WrongNotePage() {
  return (
    <main className="figma-shell wrong-note-shell">
      <SiteHeader active="history" />
      <WrongNoteClient />
    </main>
  );
}

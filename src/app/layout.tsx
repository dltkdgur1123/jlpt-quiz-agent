import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JLPT Quiz Data Platform",
  description: "JLPT quiz MVP scaffold with Next.js and Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

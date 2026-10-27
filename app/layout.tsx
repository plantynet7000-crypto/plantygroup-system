import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "플랜티그룹 · 인원현황 보고",
  description: "플랜티넷·플랜티엠 인사현황 대시보드",
  other: {
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}

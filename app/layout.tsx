import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "차곡차곡 수학 | 4학년 복습",
  description: "하루 한 회차, 차곡차곡 쌓이는 수학 자신감. 4학년 2학기 통합 복습.",
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

import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "제이플리", template: "%s | 제이플리" },
  description: "제이플리에 올라온 J-POP 라이브와 가사, 내한 일정, 일본 공연을 한곳에서.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const demo = !process.env.VERCEL && (process.env.JPLY_STORAGE === "local" ||
    (!process.env.JPLY_STORAGE && process.env.NODE_ENV === "development"));
  return (
    <html lang="ko">
      <body>
        <a className="skip-link" href="#main">본문으로 이동</a>
        <SiteHeader />
        {demo && <div className="demo-note">로컬 미리보기 · 처음 표시되는 곡과 공연은 예시야.</div>}
        <main id="main" className="page-width">{children}</main>
        <footer className="site-footer"><div className="page-width">제이플리</div></footer>
      </body>
    </html>
  );
}

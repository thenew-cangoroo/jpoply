"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/songs", label: "노래" },
  { href: "/concerts/korea", label: "내한 일정" },
  { href: "/concerts/japan", label: "일본 공연" },
];

export function SiteHeader() {
  const path = usePathname();
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="wordmark" href="/">
          <span className="wordmark-badge">
            <span className="logo-mark" aria-hidden="true">
              ▶
            </span>
            제이플리
          </span>
        </Link>
        <nav aria-label="주 메뉴">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={path.startsWith(link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

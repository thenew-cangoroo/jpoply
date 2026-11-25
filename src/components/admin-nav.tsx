import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";
import type { EntryKind } from "@/lib/model";

export const ADMIN_LABELS = { artists: "가수", songs: "곡", concerts: "공연" } as const;

export function AdminNav({ selected }: { selected?: EntryKind }) {
  return (
    <div className="admin-nav">
      <nav className="chips" aria-label="콘텐츠 관리">
        <Link className="chip" href="/admin" aria-current={!selected ? "page" : undefined}>관리 홈</Link>
        {(Object.keys(ADMIN_LABELS) as EntryKind[]).map(kind => (
          <Link key={kind} className="chip" href={`/admin/${kind}`} aria-current={kind === selected ? "page" : undefined}>
            {ADMIN_LABELS[kind]}
          </Link>
        ))}
      </nav>
      <div className="admin-nav-actions">
        <Link className="text-link" href="/">사이트 보기</Link>
        <form action={logoutAction}><button className="text-link" type="submit">로그아웃</button></form>
      </div>
    </div>
  );
}

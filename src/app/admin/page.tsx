import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin-nav";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "콘텐츠 관리" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  return (
    <>
      <AdminNav />
      <h1 className="page-title">콘텐츠 관리</h1>
      <div className="admin-sections">
        <Link className="panel" href="/admin/songs"><h2>곡</h2><p className="muted">영상, 공연 정보와 가사 편집</p></Link>
        <Link className="panel" href="/admin/artists"><h2>가수</h2><p className="muted">가수명과 검색 별칭 관리</p></Link>
        <Link className="panel" href="/admin/concerts"><h2>공연</h2><p className="muted">내한·일본 공연과 예매 일정 관리</p></Link>
      </div>
    </>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { ADMIN_LABELS, AdminNav } from "@/components/admin-nav";
import { requireAdmin } from "@/lib/auth";
import { REGIONS } from "@/lib/format";
import { isEntryKind } from "@/lib/model";
import { listEntries } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminList({ params }: { params: Promise<{ kind: string }> }) {
  await requireAdmin();
  const { kind } = await params;
  if (!isEntryKind(kind)) notFound();
  const entries = (await listEntries(kind)).sort((first, second) => second.updatedAt.localeCompare(first.updatedAt));
  return (
    <>
      <AdminNav selected={kind} />
      <div className="section-heading">
        <h1>{ADMIN_LABELS[kind]} 관리</h1>
        <Link className="button" href={`/admin/${kind}/new`}>{ADMIN_LABELS[kind]} 등록</Link>
      </div>
      <ul className="admin-records">
        {entries.map(entry => (
          <li key={entry.id}>
            <Link href={`/admin/${kind}/${entry.id}`}>
              <div>
                <strong>{"name" in entry ? entry.name : entry.title}</strong>
                <p className="muted small">{"region" in entry ? REGIONS[entry.region] + " · " : ""}{entry.id}</p>
              </div>
              {"published" in entry && <span className="small muted">{entry.published ? "공개" : "비공개"}</span>}
              <span aria-hidden="true">›</span>
            </Link>
          </li>
        ))}
      </ul>
      {!entries.length && <p className="empty-note">등록된 {ADMIN_LABELS[kind]}가 없어.</p>}
    </>
  );
}

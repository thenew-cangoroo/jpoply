import { randomUUID } from "node:crypto";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminEditor } from "@/components/admin-editor";
import { AdminNav, ADMIN_LABELS } from "@/components/admin-nav";
import { requireAdmin } from "@/lib/auth";
import { isEntryKind } from "@/lib/model";
import { getEntry, listEntries } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function EditEntry({ params, searchParams }: {
  params: Promise<{ kind: string; id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAdmin();
  const [{ kind, id }, query] = await Promise.all([params, searchParams]);
  if (!isEntryKind(kind)) notFound();
  const creating = id === "new";
  const [entry, artists] = await Promise.all([
    creating ? null : getEntry(kind, id),
    kind === "artists" ? [] : listEntries("artists"),
  ]);
  if (!creating && !entry) notFound();

  const useArtist = kind === "artists" || artists.length > 0;
  return (
    <>
      <AdminNav selected={kind} />
      <div className="section-heading">
        <h1>{ADMIN_LABELS[kind]} {creating ? "등록" : "수정"}</h1>
        <Link className="text-link" href={`/admin/${kind}`}>← 목록</Link>
      </div>
      {useArtist ? (
        <AdminEditor
          key={kind + ":" + id}
          kind={kind}
          entry={entry}
          draftId={creating ? kind.slice(0, -1) + "-" + randomUUID().slice(0, 8) : id}
          artists={artists}
          saved={query.saved === "1"}
        />
      ) : (
        <div className="panel">
          <p>곡이나 공연과 연결할 가수를 등록해.</p>
          <Link className="button" href="/admin/artists/new">가수 등록</Link>
        </div>
      )}
    </>
  );
}

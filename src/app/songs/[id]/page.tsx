import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LyricsViewer } from "@/components/lyrics-viewer";
import { YouTubePlayer } from "@/components/media";
import { formatDate, queryValue } from "@/lib/format";
import { getEntry } from "@/lib/store";

export const dynamic = "force-dynamic";
const loadSong = cache(async (id: string) => {
  const song = await getEntry("songs", id);
  return song?.published ? song : null;
});
type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ live?: string | string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const song = await loadSong((await params).id);
  return { title: song?.title ?? "노래" };
}

export default async function SongPage({ params, searchParams }: Props) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const song = await loadSong(id);
  if (!song) notFound();
  const artist = await getEntry("artists", song.artistId);
  const live = song.versions.find(version => version.id === queryValue(query.live)) ?? song.versions[0];
  if (!live) notFound();

  return (
    <article className="song-detail">
      <div className="breadcrumb">
        <Link href="/songs">노래</Link><span aria-hidden="true">›</span>
        <Link href={`/songs?artist=${song.artistId}`}>{artist?.name ?? "가수"}</Link>
      </div>
      <h1 className="song-title">{song.title}</h1>
      {song.koreanTitle && <p className="song-korean-title muted">{song.koreanTitle}</p>}
      {song.versions.length > 1 && (
        <nav className="chips version-select" aria-label="공연 버전">
          {song.versions.map((version, index) => (
            <Link key={version.id} className="chip" href={`/songs/${id}?live=${version.id}`} aria-current={live.id === version.id ? "page" : undefined}>
              {version.label || version.performance || "라이브 " + (index + 1)}
            </Link>
          ))}
        </nav>
      )}
      <figure id="video">
        <YouTubePlayer tone={song.tone} videoId={live.youtubeId} title={song.title} />
      </figure>
      {(live.performance || live.date || live.venue || live.youtubeId) && (
        <section className="performance-info" aria-label="영상 공연 정보">
          <h2>공연 정보</h2>
          <div>
            <p>{live.performance}</p>
            <p className="muted small">{[live.date && formatDate(live.date), live.venue].filter(Boolean).join(" · ")}</p>
          </div>
          {live.youtubeId && <a className="text-link" href={`https://www.youtube.com/watch?v=${live.youtubeId}`} target="_blank" rel="noreferrer">YouTube에서 보기 ↗</a>}
        </section>
      )}
      <LyricsViewer key={live.id} lyrics={live.lyrics} />
      <div className="detail-end">
        <Link className="text-link" href={`/songs?artist=${song.artistId}`}>{artist?.name ?? "가수"}의 곡 모아보기 →</Link>
        <a className="text-link" href="#video">↑ 영상으로</a>
      </div>
    </article>
  );
}

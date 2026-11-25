import type { Metadata } from "next";
import Link from "next/link";
import { ConcertCard } from "@/components/cards";
import { StageImage } from "@/components/media";
import { SongSearch } from "@/components/search-form";
import { queryValue } from "@/lib/format";
import { artistIndex, matchesSong, publicArtists, publicConcerts, publicSongs, upcomingConcerts } from "@/lib/queries";

export const metadata: Metadata = { title: "노래" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string | string[]; artist?: string | string[] }>;

function artistHref(id: string, query: string) {
  const params = new URLSearchParams();
  if (id) params.set("artist", id);
  if (query) params.set("q", query);
  return params.size ? "/songs?" + params.toString() : "/songs";
}

export default async function SongsPage({ searchParams }: { searchParams: SearchParams }) {
  const [params, artists, songs] = await Promise.all([searchParams, publicArtists(), publicSongs()]);
  const query = queryValue(params.q).slice(0, 160);
  const names = artistIndex(artists);
  const requested = queryValue(params.artist);
  const selected = Object.hasOwn(names, requested) ? requested : "";
  const filtered = songs.filter(song => (!selected || song.artistId === selected) && matchesSong(song, names[song.artistId], query));
  const groupedArtists = [...new Set(filtered.map(song => song.artistId))];
  const listedArtists = [...new Set(songs.map(song => song.artistId))].filter(id => names[id]);
  const concerts = selected ? upcomingConcerts(await publicConcerts()).filter(concert => concert.artistId === selected) : [];

  return (
    <>
      <h1 className="page-title">노래</h1>
      <SongSearch query={query} artistId={selected} />
      <div className="archive-grid">
        <aside className="artist-sidebar" aria-label="가수별 보기">
          <Link href={artistHref("", query)} aria-current={!selected ? "page" : undefined}>
            전체 가수 <span>{songs.length}곡</span>
          </Link>
          {listedArtists.map(id => (
            <Link key={id} href={artistHref(id, query)} aria-current={selected === id ? "page" : undefined}>
              {names[id].name}<span>{songs.filter(song => song.artistId === id).length}곡</span>
            </Link>
          ))}
        </aside>
        <form className="artist-mobile" action="/songs">
          <select name="artist" aria-label="가수 선택" defaultValue={selected}>
            <option value="">전체 가수</option>
            {listedArtists.map(id => <option key={id} value={id}>{names[id].name}</option>)}
          </select>
          {query && <input type="hidden" name="q" value={query} />}
          <button className="button secondary" type="submit">보기</button>
        </form>
        <div className="archive-results">
          {query && <p className="muted search-result">‘{query}’ 검색 결과 {filtered.length}곡</p>}
          {groupedArtists.map(id => (
            <section key={id} className="artist-group">
              <h2>{names[id]?.name ?? "가수"}</h2>
              {filtered.filter(song => song.artistId === id).map(song => (
                <Link key={song.id} className="song-row" href={`/songs/${song.id}`} prefetch={false}>
                  <StageImage tone={song.tone} videoId={song.versions[0]?.youtubeId} />
                  <div><strong>{song.title}</strong><div className="muted small">{song.versions[0]?.performance || "라이브 영상"}</div></div>
                  <span aria-hidden="true">›</span>
                </Link>
              ))}
            </section>
          ))}
          {!filtered.length && <p className="empty-note">해당하는 곡이 없어.</p>}
          {!!concerts.length && (
            <section className="related-concerts">
              <h2>다가오는 공연</h2>
              <div className="concert-grid teasers">
                {concerts.slice(0, 3).map(concert => <ConcertCard key={concert.id} concert={concert} artist={names[selected]} compact />)}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

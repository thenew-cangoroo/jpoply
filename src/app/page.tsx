import Link from "next/link";
import { SongTile } from "@/components/cards";
import { ConcertShelf } from "@/components/concert-shelf";
import { SongSearch } from "@/components/search-form";
import {
  artistIndex,
  artistNames,
  publicArtists,
  publicConcerts,
  publicSongs,
  upcomingConcerts,
} from "@/lib/queries";
import { HeroThumbnail } from "@/components/hero-thumbnail";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [artists, songs, concerts] = await Promise.all([
    publicArtists(),
    publicSongs(),
    publicConcerts(),
  ]);
  const names = artistIndex(artists);
  const [featured, ...recent] = songs;
  const featuredVideoId = featured?.versions[0]?.youtubeId;
  const featuredArtists = [
    ...new Set(songs.map((song) => song.artistId)),
  ].slice(0, 5);
  const upcoming = upcomingConcerts(concerts);

  return (
    <>
      <SongSearch />
      {featured && (
        <section className="hero" aria-label="최근 업로드">
          <HeroThumbnail
            key={featuredVideoId}
            tone={featured.tone}
            videoId={featuredVideoId}
          />
          <div className="hero-copy">
            <p className="green small">최근 업로드</p>
            <h1 className="song-title">{featured.title}</h1>
            <p>{artistNames(names[featured.artistId])}</p>
            <Link className="button" href={`/songs/${featured.id}`}>
              영상과 가사 보기 →
            </Link>
          </div>
        </section>
      )}
      <section className="home-songs" aria-label="최근 추가한 곡">
        <div className="section-heading">
          {featured ? <h2>최근 추가한 곡</h2> : <h1>최근 추가한 곡</h1>}
          <Link className="text-link" href="/songs">
            노래 전체 →
          </Link>
        </div>
        <div className="song-grid">
          {recent.slice(0, 8).map((song) => (
            <SongTile key={song.id} song={song} artist={names[song.artistId]} />
          ))}
        </div>
        {!featured && <p className="empty-note">등록된 곡이 없어.</p>}
        {!!featuredArtists.length && (
          <div className="chips artist-shortcuts">
            <span className="muted small">가수별 보기</span>
            {featuredArtists.map((id) => (
              <Link key={id} className="chip" href={`/songs?artist=${id}`}>
                {names[id]?.name ?? id}
              </Link>
            ))}
          </div>
        )}
      </section>
      <ConcertShelf concerts={upcoming} artists={names} />
    </>
  );
}

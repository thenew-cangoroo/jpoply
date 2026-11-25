import Link from "next/link";
import { formatDate, TICKET_STATES } from "@/lib/format";
import type { Artist, Concert, Song } from "@/lib/model";
import { StageImage } from "./media";

export function SongTile({ song, artist }: { song: Song; artist?: Artist }) {
  const koreanTitle = song.koreanTitle?.trim();
  const title =
    koreanTitle && koreanTitle !== song.title
      ? `${koreanTitle} · ${song.title}`
      : song.title;

  const koreanName = artist?.koreanName?.trim();
  const originalName = artist?.name;
  const artistLabel =
    koreanName && originalName && koreanName !== originalName
      ? `${koreanName} · ${originalName}`
      : koreanName || originalName;

  return (
    <Link className="song-tile" href={`/songs/${song.id}`} prefetch={false}>
      <StageImage tone={song.tone} videoId={song.versions[0]?.youtubeId} />
      <strong>{title}</strong>
      {artistLabel && (
        <span className="song-tile-artist muted small">{artistLabel}</span>
      )}
    </Link>
  );
}

export function ConcertPoster({
  concert,
  artist,
}: {
  concert: Concert;
  artist?: Artist;
}) {
  return (
    <div className="poster" data-tone={concert.tone} aria-hidden="true">
      <span className="poster-artist">{artist?.name}</span>
      <strong>{concert.title}</strong>
      <span className="poster-city">{concert.city}</span>
      {concert.posterUrl ? (
        <img src={concert.posterUrl} alt="" loading="lazy" />
      ) : null}
    </div>
  );
}

export function ConcertCard({
  concert,
  artist,
  compact = false,
}: {
  concert: Concert;
  artist?: Artist;
  compact?: boolean;
}) {
  return (
    <Link
      className={compact ? "concert-card concert-teaser" : "concert-card"}
      href={`/concerts/${concert.region}/${concert.id}`}
      prefetch={false}
    >
      <ConcertPoster concert={concert} artist={artist} />
      <div className="concert-card-meta">
        <div className="muted small">
          <time dateTime={concert.date}>{formatDate(concert.date)}</time> ·{" "}
          {concert.city}
        </div>
        <strong>
          {compact ? artist?.name ?? concert.title : concert.title}
        </strong>
        {!compact && (
          <span className="muted small">
            {[artist?.name, concert.venue].filter(Boolean).join(" · ")}
          </span>
        )}
        <span className="ticket-state" data-status={concert.status}>
          {TICKET_STATES[concert.status]}
        </span>
      </div>
    </Link>
  );
}

import "server-only";
import { cache } from "react";
import { localDate, searchableText } from "./format";
import { listEntries } from "./store";
import type { Artist, Concert, Song } from "./model";

export function artistNames(artist: Artist | undefined): string {
  if (!artist) return "";
  return artist.koreanName ? artist.name + " · " + artist.koreanName : artist.name;
}

export function artistIndex(artists: Artist[]): Record<string, Artist> {
  return Object.fromEntries(artists.map(artist => [artist.id, artist]));
}

export const publicArtists = cache(async () => listEntries("artists"));

export const publicSongs = cache(async () => {
  const songs = await listEntries("songs", true);
  return songs.sort((first, second) => second.publishedAt.localeCompare(first.publishedAt));
});

export const publicConcerts = cache(async () => {
  const concerts = await listEntries("concerts", true);
  return concerts.sort((first, second) => first.date.localeCompare(second.date));
});

export function upcomingConcerts(concerts: Concert[]) {
  const today = localDate();
  return concerts.filter(concert => (concert.endDate || concert.date) >= today);
}

export function matchesSong(song: Song, artist: Artist | undefined, query: string): boolean {
  if (!query) return true;
  const terms = [song.title, song.koreanTitle, ...song.aliases,
    artist?.name ?? "", artist?.koreanName ?? "", ...(artist?.aliases ?? [])];
  const needle = searchableText(query);
  return terms.some(term => searchableText(term).includes(needle));
}

import { z } from "zod";
import { getYouTubeId, REGIONS, TICKET_STATES, TONES } from "./format";

export const entryId = z.string().min(1).max(90).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "주소는 영문 소문자, 숫자, 하이픈으로 입력해.");
const requiredTitle = z.string().trim().min(1, "제목이나 이름을 입력해.").max(180);
const shortText = z.string().trim().max(200);
const lineText = z.string().max(3000);
const tone = z.enum(Object.keys(TONES) as [keyof typeof TONES, ...(keyof typeof TONES)[]]);
const safeUrl = z.string().trim().max(2000).refine(value => {
  if (!value) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}, "https://로 시작하는 주소를 입력해.");

function isDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T00:00:00Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

const date = z.string().refine(isDate, "올바른 날짜를 입력해.");
const optionalDate = z.string().refine(value => !value || isDate(value), "올바른 날짜를 입력해.");
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const time = z.string().refine(value => !value || timePattern.test(value), "올바른 시간을 입력해.");
const dateTime = z.string().refine(value => {
  if (!value) return true;
  const [day, clock, extra] = value.split("T");
  return !extra && isDate(day) && !!clock && timePattern.test(clock);
}, "예매 날짜와 시간을 입력해.");

export const lyricSchema = z.object({
  id: entryId,
  section: shortText,
  original: lineText.refine(value => !!value.trim(), "가사 묶음에는 원문을 입력해."),
  pronunciation: lineText,
  translation: lineText,
});

const liveSchema = z.object({
  id: entryId,
  label: shortText,
  youtubeId: z.string().trim().max(350)
    .refine(value => !value || !!getYouTubeId(value), "유효한 유튜브 링크나 영상 ID를 입력해.")
    .transform(value => getYouTubeId(value)),
  performance: shortText,
  date: optionalDate,
  venue: shortText,
  lyrics: z.array(lyricSchema).max(500),
});

export const artistSchema = z.object({
  name: requiredTitle,
  koreanName: shortText,
  aliases: z.array(z.string().trim().max(120)).max(50),
});

export const songSchema = z.object({
  title: requiredTitle,
  koreanTitle: shortText,
  artistId: entryId,
  aliases: z.array(z.string().trim().max(120)).max(50),
  tone,
  published: z.boolean(),
  versions: z.array(liveSchema).min(1, "라이브 영상 항목을 한 개 이상 만들어줘.").max(30),
});

export const concertSchema = z.object({
  title: requiredTitle,
  artistId: entryId,
  region: z.enum(["korea", "japan"]),
  city: requiredTitle,
  venue: shortText,
  date,
  endDate: optionalDate,
  time,
  presale: dateTime,
  generalSale: dateTime,
  price: shortText,
  status: z.enum(["upcoming", "open", "soldOut", "notice"]),
  posterUrl: safeUrl,
  ticketUrl: safeUrl,
  tone,
  published: z.boolean(),
}).refine(value => !value.endDate || value.endDate >= value.date, {
  message: "마지막 공연일은 첫 공연일 이후여야 해.",
  path: ["endDate"],
});

const recordKey = { id: entryId, expectedRevision: z.number().int().nonnegative() };
export const saveSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("artists"), ...recordKey, fields: artistSchema }),
  z.object({ kind: z.literal("songs"), ...recordKey, fields: songSchema }),
  z.object({ kind: z.literal("concerts"), ...recordKey, fields: concertSchema }),
]);

export type SaveInput = z.infer<typeof saveSchema>;
export type ArtistFields = z.output<typeof artistSchema>;
export type SongFields = z.output<typeof songSchema>;
export type ConcertFields = z.output<typeof concertSchema>;
export type LiveVersion = z.output<typeof liveSchema>;
export type Lyric = z.output<typeof lyricSchema>;
export type Region = keyof typeof REGIONS;
export type TicketState = keyof typeof TICKET_STATES;
export type Tone = keyof typeof TONES;

export type EntryMeta = { id: string; revision: number; updatedAt: string; createdAt: string };
export type Artist = ArtistFields & EntryMeta;
export type Song = SongFields & EntryMeta & { publishedAt: string };
export type Concert = ConcertFields & EntryMeta;
export type EntryMap = { artists: Artist; songs: Song; concerts: Concert };
export type EntryKind = keyof EntryMap;
export type Catalog = { [Kind in EntryKind]: EntryMap[Kind][] };

export function isEntryKind(value: string): value is EntryKind {
  return value === "artists" || value === "songs" || value === "concerts";
}

export function isRegion(value: string): value is Region {
  return value === "korea" || value === "japan";
}

export function assertUniqueLyrics(fields: SongFields): string | null {
  const versionIds = new Set(fields.versions.map(version => version.id));
  if (versionIds.size !== fields.versions.length) return "영상 항목이 중복되어 있어.";
  for (const version of fields.versions) {
    const ids = new Set(version.lyrics.map(lyric => lyric.id));
    if (ids.size !== version.lyrics.length) return "가사 묶음이 중복되어 있어.";
  }
  return null;
}

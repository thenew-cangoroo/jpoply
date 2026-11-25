import { localDate } from "./format";
import type { Artist, Catalog, Concert, ConcertFields, EntryMeta, LiveVersion, Song, Tone } from "./model";

const initialDate = "2026-01-01T00:00:00.000Z";
const entry = (id: string, createdAt = initialDate): EntryMeta => ({
  id, revision: 1, createdAt, updatedAt: createdAt,
});

const artist = (id: string, name: string, koreanName: string, aliases: string[]): Artist => ({
  ...entry(id), name, koreanName, aliases,
});

const artists = [
  artist("yuuri", "優里", "유우리", ["Yuuri", "유리"]),
  artist("aimyon", "あいみょん", "아이묭", ["Aimyon"]),
  artist("yoasobi", "YOASOBI", "요아소비", []),
  artist("back-number", "back number", "백넘버", ["backnumber"]),
  artist("mrs-green-apple", "Mrs. GREEN APPLE", "미세스 그린 애플", ["미세스그린애플"]),
  artist("radwimps", "RADWIMPS", "라드윔프스", ["래드윔프스"]),
];

const leoLyrics: LiveVersion["lyrics"] = [
  {
    id: "leo-line-1", section: "후렴",
    original: "名前はレオ\n名前呼んでよ", pronunciation: "나마에와 레오\n나마에 욘데요",
    translation: "내 이름은 레오\n이름을 불러줘",
  },
  {
    id: "leo-line-2", section: "",
    original: "君がつけてくれた名前だから", pronunciation: "키미가 츠케테 쿠레타 나마에다카라",
    translation: "네가 지어준 이름이니까",
  },
];

const tracks: Array<[string, string, string, string, Tone, string, string?]> = [
  ["leo", "yuuri", "レオ", "레오", "coral", "CENTRAL MUSIC & ENTERTAINMENT FESTIVAL 2026"],
  ["marigold", "aimyon", "マリーゴールド", "마리골드", "olive", "甲子園 弾き語り 2022"],
  ["sangenshoku", "yoasobi", "三原色", "삼원색", "blue", "NICE TO MEET YOU", "2021-12-05"],
  ["suiheisen", "back-number", "水平線", "수평선", "violet", ""],
  ["harunohi", "aimyon", "ハルノヒ", "하루노히", "coral", ""],
  ["mousukoshidake", "yoasobi", "もう少しだけ", "모우 스코시다케", "olive", "도쿄돔 라이브"],
  ["ai-no-hana", "aimyon", "愛の花", "아이노하나", "blue", "マジカル・バスルーム"],
  ["darling", "mrs-green-apple", "ダーリン", "달링", "violet", "BABEL no TOH"],
  ["sparkle", "radwimps", "スパークル", "스파클", "coral", ""],
];

function daysAhead(days: number): string {
  const value = new Date();
  value.setUTCDate(value.getUTCDate() + days);
  return localDate(value);
}

const concertDefaults = {
  endDate: "", time: "18:00", price: "", posterUrl: "", ticketUrl: "", published: true,
} satisfies Partial<ConcertFields>;

function demoConcert(id: string, day: number, fields: Omit<ConcertFields, keyof typeof concertDefaults | "date" | "presale" | "generalSale">): Concert {
  return {
    ...entry(id),
    ...concertDefaults,
    ...fields,
    date: daysAhead(day),
    presale: fields.status === "upcoming" ? daysAhead(2) + "T20:00" : "",
    generalSale: daysAhead(fields.status === "upcoming" ? 4 : -2) + "T20:00",
  };
}

export function demoCatalog(): Catalog {
  const songs: Song[] = tracks.map(([id, artistId, title, koreanTitle, tone, performance, date = ""], index) => {
    const publishedAt = new Date(Date.UTC(2026, 0, 10 - index)).toISOString();
    return {
      ...entry(id, publishedAt), id, artistId, title, koreanTitle, aliases: [id],
      tone, publishedAt, published: true,
      versions: [{
        id: "live", label: "라이브", youtubeId: "", performance, date,
        venue: id === "sangenshoku" ? "日本武道館" : "",
        lyrics: id === "leo" ? leoLyrics : [],
      }],
    };
  });

  return {
    artists,
    songs,
    concerts: [
      demoConcert("seoul-blue", 14, { title: "BLUE HOUR in SEOUL", artistId: "yoasobi", region: "korea", city: "서울", venue: "서울 공연장 A", status: "upcoming", tone: "blue" }),
      demoConcert("seoul-bloom", 22, { title: "LATE BLOOM in SEOUL", artistId: "aimyon", region: "korea", city: "서울", venue: "서울 공연장 B", status: "open", tone: "coral" }),
      demoConcert("busan-echo", 42, { title: "ECHO ROOM in BUSAN", artistId: "yuuri", region: "korea", city: "부산", venue: "부산 공연장 A", status: "upcoming", tone: "olive" }),
      demoConcert("tokyo-notes", 18, { title: "WINTER NOTES in TOKYO", artistId: "back-number", region: "japan", city: "도쿄", venue: "도쿄 공연장 A", status: "open", tone: "violet" }),
      demoConcert("osaka-blue", 26, { title: "BLUE HOUR in OSAKA", artistId: "yoasobi", region: "japan", city: "오사카", venue: "오사카 공연장 A", status: "upcoming", tone: "blue" }),
      demoConcert("tokyo-bloom", 54, { title: "LATE BLOOM in TOKYO", artistId: "aimyon", region: "japan", city: "도쿄", venue: "도쿄 공연장 B", status: "upcoming", tone: "coral" }),
    ],
  };
}

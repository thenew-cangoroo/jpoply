export const REGIONS = {
  korea: "내한 일정",
  japan: "일본 공연",
} as const;

export const TICKET_STATES = {
  upcoming: "예매 예정",
  open: "예매 중",
  soldOut: "매진",
  notice: "공지 확인",
} as const;

export const TONES = {
  blue: "블루",
  coral: "코랄",
  olive: "올리브",
  violet: "바이올렛",
} as const;

const youtubeIdPattern = /^[A-Za-z0-9_-]{11}$/;

export function getYouTubeId(input: string): string {
  const value = input.trim();
  if (youtubeIdPattern.test(value)) return value;
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol)) return "";
    const parts = url.pathname.split("/").filter(Boolean);
    let candidate: string | null = null;

    if (url.hostname === "youtu.be") {
      candidate = parts[0];
    } else if (["www.youtube.com", "youtube.com", "m.youtube.com", "www.youtube-nocookie.com"].includes(url.hostname)) {
      candidate = parts[0] === "watch" ? url.searchParams.get("v") : null;
      if (["shorts", "live", "embed"].includes(parts[0])) candidate = parts[1];
    }
    return candidate && youtubeIdPattern.test(candidate) ? candidate : "";
  } catch {
    return "";
  }
}

export function formatDate(date: string): string {
  return date.replaceAll("-", ".");
}

export function formatDateTime(value: string): string {
  if (!value) return "";
  const [date, time] = value.split("T");
  return [formatDate(date), time].filter(Boolean).join(" · ");
}

export function localDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  return ["year", "month", "day"].map(type => parts.find(part => part.type === type)?.value).join("-");
}

export function queryValue(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export function searchableText(value: string): string {
  return value.normalize("NFKC").toLowerCase().replace(/\s+/g, "");
}

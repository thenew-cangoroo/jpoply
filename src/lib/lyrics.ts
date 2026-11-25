import type { Lyric } from "./model";

type ImportedLyric = Omit<Lyric, "id">;
type ImportResult = { groups: ImportedLyric[]; error?: never } | { error: string; groups?: never };
const timestamp = /^\[?(?:\d{1,2}:)?\d{1,2}:\d{2}(?:[.,]\d{1,3})?\]?$/;

export function parseLyricPaste(text: string): ImportResult {
  const source = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").trim();
  if (!source) return { error: "붙여넣을 가사가 비어 있어." };

  const blocks = source.split(/\n[ \t]*\n+/).map(block =>
    block.split("\n").map(line => line.trim()).filter(line => line && !timestamp.test(line)),
  ).filter(block => block.length > 0);
  if (!blocks.length) return { error: "원문, 발음, 번역을 입력해." };

  if (blocks.length === 1 && blocks[0].length > 3 && blocks[0].length % 3 === 0) {
    const lines = blocks.pop()!;
    for (let index = 0; index < lines.length; index += 3) blocks.push(lines.slice(index, index + 3));
  }

  const invalid = blocks.findIndex(block => block.length !== 3);
  if (invalid >= 0) return { error: (invalid + 1) + "번째 묶음을 원문·발음·번역 세 줄로 맞춰줘." };
  if (blocks.length > 500) return { error: "한 영상에는 가사 묶음을 500개까지 등록할 수 있어." };

  return { groups: blocks.map(([original, pronunciation, translation]) => ({ section: "", original, pronunciation, translation })) };
}

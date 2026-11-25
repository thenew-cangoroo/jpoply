"use client";

import { useState } from "react";
import { parseLyricPaste } from "@/lib/lyrics";
import type { Lyric } from "@/lib/model";
import { LyricLines } from "./lyrics-viewer";

function blankLyric(): Lyric {
  return { id: crypto.randomUUID(), section: "", original: "", pronunciation: "", translation: "" };
}

export function LyricEditor({ lyrics, onChange }: { lyrics: Lyric[]; onChange: (lyrics: Lyric[]) => void }) {
  const [paste, setPaste] = useState("");
  const [feedback, setFeedback] = useState<{ message: string; error?: boolean } | null>(null);

  function importLyrics(replace: boolean) {
    const parsed = parseLyricPaste(paste);
    if (!parsed.groups) {
      setFeedback({ message: parsed.error, error: true });
      return;
    }
    if (!replace && lyrics.length + parsed.groups.length > 500) {
      setFeedback({ message: "한 영상에는 가사 묶음을 500개까지 등록할 수 있어.", error: true });
      return;
    }
    const imported = parsed.groups.map(line => ({ ...line, id: crypto.randomUUID() }));
    onChange(replace ? imported : [...lyrics, ...imported]);
    setFeedback({ message: imported.length + "개 구절을 가져왔어." });
    setPaste("");
  }

  function update(id: string, key: keyof Omit<Lyric, "id">, value: string) {
    onChange(lyrics.map(line => line.id === id ? { ...line, [key]: value } : line));
  }

  function insert(after: number) {
    const next = [...lyrics];
    next.splice(after + 1, 0, blankLyric());
    onChange(next);
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...lyrics];
    const destination = index + direction;
    [next[index], next[destination]] = [next[destination], next[index]];
    onChange(next);
  }

  return (
    <div className="lyric-editor-grid">
      <section aria-label="가사 편집">
        <div className="section-heading">
          <h2>가사 편집</h2>
          <a className="text-link mobile-preview-link" href="#lyric-preview">미리보기 ↓</a>
        </div>
        <div className="panel lyric-paste">
          <div className="field">
            <label htmlFor="lyric-paste-input">가사 한꺼번에 붙여넣기</label>
            <textarea id="lyric-paste-input" value={paste} onChange={event => setPaste(event.target.value)} rows={5}
              placeholder={"일본어 원문\n한글 발음\n한국어 번역\n\n다음 구절"}
              aria-describedby="lyric-import-help" />
          </div>
          <p id="lyric-import-help" className="small muted">구절마다 원문·발음·번역 세 줄을 쓰고, 구절 사이에 빈 줄을 넣어.</p>
          <div className="chips">
            <button className="button secondary" type="button" onClick={() => importLyrics(false)}>붙여넣어 추가</button>
            {!!lyrics.length && <button className="text-link" type="button" onClick={() => importLyrics(true)}>전체 교체</button>}
          </div>
          {feedback && <p className={feedback.error ? "form-error" : "green small"} role={feedback.error ? "alert" : "status"}>{feedback.message}</p>}
        </div>
        <ol className="lyric-fields-list">
          {lyrics.map((line, index) => (
            <li className="panel lyric-fields" key={line.id}>
              <div className="line-heading">
                <strong>{index + 1}번 구절</strong>
                <div className="chips">
                  <button type="button" className="text-link" onClick={() => move(index, -1)} disabled={index === 0} aria-label={(index + 1) + "번 구절 위로"}>↑</button>
                  <button type="button" className="text-link" onClick={() => move(index, 1)} disabled={index + 1 === lyrics.length} aria-label={(index + 1) + "번 구절 아래로"}>↓</button>
                  <button type="button" className="text-link" onClick={() => insert(index)} disabled={lyrics.length >= 500}>아래에 추가</button>
                  <button type="button" className="text-link subtle-danger" onClick={() => onChange(lyrics.filter(item => item.id !== line.id))}>삭제</button>
                </div>
              </div>
              <label className="field section-name">구간 이름
                <input value={line.section} onChange={event => update(line.id, "section", event.target.value)} placeholder="예: 1절, 후렴" />
              </label>
              <div className="line-inputs">
                <div className="field">
                  <label htmlFor={line.id + "-original"}>원문</label>
                  <textarea id={line.id + "-original"} value={line.original} onChange={event => update(line.id, "original", event.target.value)} rows={3} lang="ja" />
                </div>
                <div className="field">
                  <label htmlFor={line.id + "-pronunciation"}>발음</label>
                  <textarea id={line.id + "-pronunciation"} value={line.pronunciation} onChange={event => update(line.id, "pronunciation", event.target.value)} rows={3} />
                </div>
                <div className="field">
                  <label htmlFor={line.id + "-translation"}>번역</label>
                  <textarea id={line.id + "-translation"} value={line.translation} onChange={event => update(line.id, "translation", event.target.value)} rows={3} />
                </div>
              </div>
            </li>
          ))}
        </ol>
        <button className="button secondary" type="button" onClick={() => insert(lyrics.length - 1)} disabled={lyrics.length >= 500}>＋ 구절 추가</button>
      </section>
      <section id="lyric-preview" className="panel editor-preview" aria-label="가사 미리보기">
        <h2>가사 미리보기</h2>
        <LyricLines lyrics={lyrics.filter(line => line.original.trim() || line.pronunciation.trim() || line.translation.trim())} />
      </section>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { Lyric } from "@/lib/model";

export function LyricLines({ lyrics, showPronunciation = true }: { lyrics: Lyric[]; showPronunciation?: boolean }) {
  if (!lyrics.length) return <p className="empty-note">등록된 가사가 없어.</p>;
  return (
    <div className="lyric-lines">
      {lyrics.map((line, index) => {
        const newSection = line.section && lyrics[index - 1]?.section !== line.section;
        return (
          <div className="lyric-block" key={line.id}>
            {newSection && <h3 className="lyric-section">{line.section}</h3>}
            <p className="lyric-original" lang="ja">{line.original}</p>
            {showPronunciation && line.pronunciation && <p className="lyric-pronunciation">{line.pronunciation}</p>}
            {line.translation && <p className="lyric-translation">{line.translation}</p>}
          </div>
        );
      })}
    </div>
  );
}

export function LyricsViewer({ lyrics }: { lyrics: Lyric[] }) {
  const [show, setShow] = useState(true);
  return (
    <section className="lyrics-viewer" aria-label="가사">
      <div className="section-heading">
        <h2>가사</h2>
        {!!lyrics.length && (
          <label className="check">
            <input type="checkbox" checked={show} onChange={event => setShow(event.target.checked)} /> 발음 표시
          </label>
        )}
      </div>
      <LyricLines lyrics={lyrics} showPronunciation={show} />
    </section>
  );
}

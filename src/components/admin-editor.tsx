"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveContentAction } from "@/app/admin/actions";
import { REGIONS, TICKET_STATES, TONES } from "@/lib/format";
import type { Artist, Concert, EntryKind, EntryMap, LiveVersion, Song, Tone } from "@/lib/model";
import { LyricEditor } from "./lyric-editor";

const liveDefaults = { label: "", youtubeId: "", performance: "", date: "", venue: "", lyrics: [] };
const text = (form: FormData, name: string) => String(form.get(name) ?? "").trim();
const aliases = (form: FormData) => [...new Set(text(form, "aliases").split(/[,\n]/).map(value => value.trim()).filter(Boolean))];

function BasicField({ label, name, value = "", type = "text", required = false, placeholder = "" }: {
  label: string; name: string; value?: string; type?: string; required?: boolean; placeholder?: string;
}) {
  return <label className="field">{label}<input name={name} defaultValue={value} type={type} required={required} placeholder={placeholder} /></label>;
}

function ArtistChoice({ artists, value }: { artists: Artist[]; value?: string }) {
  return (
    <div className="field">
      <label htmlFor="artist-id">가수</label>
      <select id="artist-id" name="artistId" defaultValue={value ?? ""} required>
        <option value="" disabled>가수 선택</option>
        {artists.map(artist => <option value={artist.id} key={artist.id}>{artist.name}{artist.koreanName ? " · " + artist.koreanName : ""}</option>)}
      </select>
    </div>
  );
}

function ToneChoice({ value }: { value?: Tone }) {
  return (
    <label className="field">기본 썸네일 색
      <select name="tone" defaultValue={value ?? "blue"}>
        {Object.entries(TONES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select>
    </label>
  );
}

function VideoEditor({ versions, onChange }: { versions: LiveVersion[]; onChange: (versions: LiveVersion[]) => void }) {
  const [selected, setSelected] = useState(versions[0].id);
  const current = versions.find(version => version.id === selected) ?? versions[0];

  function update(fields: Partial<LiveVersion>) {
    onChange(versions.map(version => version.id === current.id ? { ...version, ...fields } : version));
  }

  function addVideo() {
    const id = crypto.randomUUID();
    onChange([...versions, { ...liveDefaults, id }]);
    setSelected(id);
  }

  function removeVideo() {
    const next = versions.filter(version => version.id !== current.id);
    onChange(next);
    setSelected(next[0].id);
  }

  return (
    <section>
      <div className="panel video-editor">
        <div className="section-heading">
          <h2>영상과 공연 정보</h2>
          <button className="button secondary" type="button" onClick={addVideo} disabled={versions.length >= 30}>＋ 공연 버전</button>
        </div>
        {versions.length > 1 && (
          <div className="version-editor">
            <div className="field">
              <label htmlFor="editing-video">편집할 영상</label>
              <select id="editing-video" value={current.id} onChange={event => setSelected(event.target.value)}>
                {versions.map((version, index) => (
                  <option value={version.id} key={version.id}>{version.label || version.performance || "라이브 " + (index + 1)}</option>
                ))}
              </select>
            </div>
            <button className="text-link subtle-danger" type="button" onClick={removeVideo}>선택한 버전 삭제</button>
          </div>
        )}
        <div className="form-grid">
          <label className="field">유튜브 링크 또는 영상 ID
            <input value={current.youtubeId} onChange={event => update({ youtubeId: event.target.value })} placeholder="https://youtu.be/…" />
          </label>
          <label className="field">버전 이름
            <input value={current.label} onChange={event => update({ label: event.target.value })} placeholder="예: 도쿄돔 라이브" />
          </label>
          <label className="field">공연명
            <input value={current.performance} onChange={event => update({ performance: event.target.value })} />
          </label>
          <label className="field">공연일
            <input type="date" value={current.date} onChange={event => update({ date: event.target.value })} />
          </label>
          <label className="field">공연장
            <input value={current.venue} onChange={event => update({ venue: event.target.value })} />
          </label>
        </div>
      </div>
      <LyricEditor key={current.id} lyrics={current.lyrics} onChange={lyrics => update({ lyrics })} />
    </section>
  );
}

function ConcertFields({ entry, artists }: { entry: Concert | null; artists: Artist[] }) {
  return (
    <div className="form-grid">
      <BasicField label="공연명" name="title" value={entry?.title} required />
      <ArtistChoice artists={artists} value={entry?.artistId} />
      <div className="field">
        <label htmlFor="concert-region">공연 지역</label>
        <select id="concert-region" name="region" defaultValue={entry?.region ?? "korea"}>
          {Object.entries(REGIONS).map(([key, label]) => <option value={key} key={key}>{label}</option>)}
        </select>
      </div>
      <BasicField label="도시" name="city" value={entry?.city} placeholder="예: 서울, 도쿄" required />
      <BasicField label="공연장" name="venue" value={entry?.venue} />
      <BasicField label="첫 공연일" name="date" type="date" value={entry?.date} required />
      <BasicField label="마지막 공연일" name="endDate" type="date" value={entry?.endDate} />
      <BasicField label="공연 시작 시간" name="time" type="time" value={entry?.time} />
      <BasicField label="선예매 (현지 시간)" name="presale" type="datetime-local" value={entry?.presale} />
      <BasicField label="일반예매 (현지 시간)" name="generalSale" type="datetime-local" value={entry?.generalSale} />
      <div className="field">
        <label htmlFor="ticket-status">예매 상태</label>
        <select id="ticket-status" name="status" defaultValue={entry?.status ?? "notice"}>
          {Object.entries(TICKET_STATES).map(([key, label]) => <option value={key} key={key}>{label}</option>)}
        </select>
      </div>
      <BasicField label="티켓 가격" name="price" value={entry?.price} />
      <BasicField label="포스터 주소" name="posterUrl" type="url" value={entry?.posterUrl} />
      <BasicField label="공식 예매처 주소" name="ticketUrl" type="url" value={entry?.ticketUrl} />
      <ToneChoice value={entry?.tone} />
    </div>
  );
}

function gatherFields(kind: EntryKind, form: FormData, versions: LiveVersion[]) {
  if (kind === "artists") {
    return { name: text(form, "name"), koreanName: text(form, "koreanName"), aliases: aliases(form) };
  }
  const common = {
    title: text(form, "title"), artistId: text(form, "artistId"),
    tone: text(form, "tone"), published: form.get("published") === "on",
  };
  if (kind === "songs") {
    return {
      ...common, koreanTitle: text(form, "koreanTitle"), aliases: aliases(form),
      versions: versions.map(version => ({
        ...version,
        lyrics: version.lyrics.filter(line => line.original.trim() || line.pronunciation.trim() || line.translation.trim() || line.section.trim()),
      })),
    };
  }
  return {
    ...common,
    region: text(form, "region"), city: text(form, "city"), venue: text(form, "venue"),
    date: text(form, "date"), endDate: text(form, "endDate"), time: text(form, "time"),
    presale: text(form, "presale"), generalSale: text(form, "generalSale"), status: text(form, "status"),
    price: text(form, "price"), posterUrl: text(form, "posterUrl"), ticketUrl: text(form, "ticketUrl"),
  };
}

export function AdminEditor({ kind, entry, artists, draftId, saved }: {
  kind: EntryKind; entry: EntryMap[EntryKind] | null; artists: Artist[]; draftId: string; saved?: boolean;
}) {
  const song = kind === "songs" ? entry as Song | null : null;
  const artist = kind === "artists" ? entry as Artist | null : null;
  const concert = kind === "concerts" ? entry as Concert | null : null;
  const [versions, setVersions] = useState<LiveVersion[]>(song?.versions ?? [{ ...liveDefaults, id: "live" }]);
  const [revision, setRevision] = useState(entry?.revision ?? 0);
  const [message, setMessage] = useState<{ error?: boolean; text: string } | null>(saved ? { text: "저장했어." } : null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const publicUrl = song?.published ? "/songs/" + song.id
    : concert?.published ? "/concerts/" + concert.region + "/" + concert.id : "";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    const payload = { kind, id: text(form, "id"), expectedRevision: revision, fields: gatherFields(kind, form, versions) };
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await saveContentAction(payload);
        if (!result.ok) {
          setMessage({ error: true, text: result.error });
          return;
        }
        setRevision(result.revision);
        setMessage({ text: "저장했어." });
        if (!entry) router.replace(`/admin/${kind}/${result.id}?saved=1`);
        else router.refresh();
      } catch {
        setMessage({ error: true, text: "저장 결과를 받지 못했어. 목록에서 저장된 내용을 확인해줘." });
      }
    });
  }

  return (
    <form className="editor-form" onSubmit={submit} aria-busy={pending}>
      <section className="panel">
        <h2>기본 정보</h2>
        <div className="field entry-id">
          <label htmlFor="entry-id">페이지 주소</label>
          <input id="entry-id" name="id" defaultValue={draftId} readOnly={!!entry} required aria-describedby="entry-id-help" />
          <span className="small muted" id="entry-id-help">영문 소문자, 숫자, 하이픈을 사용할 수 있어.</span>
        </div>
        {kind === "artists" && (
          <div className="form-grid">
            <BasicField label="가수명" name="name" value={artist?.name} required />
            <BasicField label="한국어 이름" name="koreanName" value={artist?.koreanName} />
            <BasicField label="검색 별칭 (쉼표로 구분)" name="aliases" value={artist?.aliases.join(", ")} />
          </div>
        )}
        {kind === "songs" && (
          <div className="form-grid">
            <BasicField label="곡명" name="title" value={song?.title} required />
            <ArtistChoice artists={artists} value={song?.artistId} />
            <BasicField label="한국어 곡명" name="koreanTitle" value={song?.koreanTitle} />
            <BasicField label="검색 별칭 (쉼표로 구분)" name="aliases" value={song?.aliases.join(", ")} />
            <ToneChoice value={song?.tone} />
          </div>
        )}
        {kind === "concerts" && <ConcertFields entry={concert} artists={artists} />}
      </section>
      {kind === "songs" && <VideoEditor versions={versions} onChange={setVersions} />}
      <div className="save-bar">
        {kind !== "artists" && <label className="check"><input name="published" type="checkbox" defaultChecked={song?.published ?? concert?.published ?? false} /> 사이트에 공개</label>}
        <button className="button" type="submit" disabled={pending}>{pending ? "저장 중" : "저장"}</button>
        {publicUrl && <Link className="text-link" href={publicUrl} target="_blank" rel="noreferrer">공개 페이지 보기 ↗</Link>}
        {message && <p className={message.error ? "form-error" : "green"} role={message.error ? "alert" : "status"}>{message.text}</p>}
      </div>
    </form>
  );
}

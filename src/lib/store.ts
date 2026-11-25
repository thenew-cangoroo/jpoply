import "server-only";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { demoCatalog } from "./demo";
import { storageMode } from "./environment";
import { firebaseDb } from "./firebase";
import { assertUniqueLyrics, entryId, type Catalog, type EntryKind, type EntryMap, type SaveInput, type Song } from "./model";

type Entry = EntryMap[EntryKind];
const directory = path.join(process.cwd(), ".data");
const localPath = path.join(directory, "catalog.json");
const localState = globalThis as typeof globalThis & { jplyLocalQueue?: Promise<void> };

export class ContentError extends Error {}

async function readLocalCatalog(): Promise<Catalog> {
  try {
    return JSON.parse(await readFile(localPath, "utf8")) as Catalog;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return structuredClone(demoCatalog());
    throw error;
  }
}

export async function listEntries<Kind extends EntryKind>(kind: Kind, publishedOnly = false): Promise<EntryMap[Kind][]> {
  const filtered = publishedOnly && kind !== "artists";
  if (storageMode() === "local") {
    const entries: EntryMap[Kind][] = (await readLocalCatalog())[kind];
    return filtered ? entries.filter(entry => "published" in entry && entry.published) : entries;
  }
  const collection = firebaseDb().collection(kind);
  const snapshot = await (filtered ? collection.where("published", "==", true) : collection).get();
  return snapshot.docs.map(doc => doc.data() as EntryMap[Kind]);
}

export async function getEntry<Kind extends EntryKind>(kind: Kind, id: string): Promise<EntryMap[Kind] | null> {
  if (!entryId.safeParse(id).success) return null;
  if (storageMode() === "local") {
    const catalog = await readLocalCatalog();
    return catalog[kind].find(item => item.id === id) ?? null;
  }
  const document = await firebaseDb().collection(kind).doc(id).get();
  return document.exists ? document.data() as EntryMap[Kind] : null;
}

function nextEntry(input: SaveInput, current: Entry | null): Entry {
  if ((current?.revision ?? 0) !== input.expectedRevision) {
    throw new ContentError(current
      ? "같은 주소가 이미 등록됐거나 다른 화면에서 수정됐어. 목록에서 다시 열어줘."
      : "저장할 항목을 찾지 못했어. 목록에서 다시 열어줘.");
  }

  const now = new Date().toISOString();
  const metadata = {
    id: input.id,
    revision: input.expectedRevision + 1,
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
  };
  if (input.kind === "songs") {
    const error = assertUniqueLyrics(input.fields);
    if (error) throw new ContentError(error);
    const previous = current as Song | null;
    const publishedAt = previous?.publishedAt || (input.fields.published ? now : "");
    return { ...input.fields, ...metadata, publishedAt };
  }

  return { ...input.fields, ...metadata };
}

function checkSize(entry: Entry) {
  if (Buffer.byteLength(JSON.stringify(entry), "utf8") > 768 * 1024) {
    throw new ContentError("저장할 내용이 너무 커. 가사나 영상 항목의 분량을 확인해줘.");
  }
}

function saveLocalEntry(input: SaveInput): Promise<Entry> {
  const operation = (localState.jplyLocalQueue ?? Promise.resolve()).then(async () => {
    const catalog = await readLocalCatalog();
    if (input.kind !== "artists") {
      const artistId = input.fields.artistId;
      if (!catalog.artists.some(artist => artist.id === artistId)) throw new ContentError("등록된 가수를 선택해.");
    }
    const entries: Entry[] = catalog[input.kind];
    const index = entries.findIndex(item => item.id === input.id);
    const entry = nextEntry(input, entries[index] ?? null);
    checkSize(entry);

    if (index < 0) entries.push(entry);
    else entries[index] = entry;

    await mkdir(directory, { recursive: true });
    const temporary = localPath + "." + randomUUID() + ".tmp";
    try {
      await writeFile(temporary, JSON.stringify(catalog, null, 2), "utf8");
      await rename(temporary, localPath);
    } finally {
      await unlink(temporary).catch(() => {});
    }
    return entry;
  });
  localState.jplyLocalQueue = operation.then(() => {}, () => {});
  return operation;
}

export async function saveEntry(input: SaveInput): Promise<Entry> {
  if (storageMode() === "local") return saveLocalEntry(input);

  const database = firebaseDb();
  const reference = database.collection(input.kind).doc(input.id);
  return database.runTransaction(async transaction => {
    const current = await transaction.get(reference);
    if (input.kind !== "artists") {
      const artist = await transaction.get(database.collection("artists").doc(input.fields.artistId));
      if (!artist.exists) throw new ContentError("등록된 가수를 선택해.");
    }
    const entry = nextEntry(input, current.exists ? current.data() as Entry : null);
    checkSize(entry);
    transaction.set(reference, entry);
    return entry;
  });
}

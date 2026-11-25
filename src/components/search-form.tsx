export function SongSearch({ query = "", artistId = "" }: { query?: string; artistId?: string }) {
  return (
    <form className="song-search" action="/songs" role="search">
      <input aria-label="곡 제목 또는 가수" type="search" name="q" defaultValue={query} placeholder="곡 제목 또는 가수 검색" />
      {artistId && <input type="hidden" name="artist" value={artistId} />}
      <button className="button" type="submit">검색</button>
    </form>
  );
}

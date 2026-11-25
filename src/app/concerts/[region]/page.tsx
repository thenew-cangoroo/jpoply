import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConcertCard } from "@/components/cards";
import { queryValue, REGIONS } from "@/lib/format";
import { isRegion } from "@/lib/model";
import { artistIndex, publicArtists, publicConcerts, upcomingConcerts } from "@/lib/queries";

export const dynamic = "force-dynamic";
type Props = {
  params: Promise<{ region: string }>;
  searchParams: Promise<{ city?: string | string[]; month?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region } = await params;
  return { title: isRegion(region) ? REGIONS[region] : "공연" };
}

export default async function ConcertsPage({ params, searchParams }: Props) {
  const [{ region }, filters] = await Promise.all([params, searchParams]);
  if (!isRegion(region)) notFound();
  const [all, artists] = await Promise.all([publicConcerts(), publicArtists()]);
  const names = artistIndex(artists);
  const regionConcerts = upcomingConcerts(all).filter(concert => concert.region === region);
  const months = [...new Set(regionConcerts.map(concert => concert.date.slice(0, 7)))];
  const cities = [...new Set(regionConcerts.map(concert => concert.city))].sort((a, b) => a.localeCompare(b, "ko"));
  const city = queryValue(filters.city);
  const month = queryValue(filters.month);
  const filtered = regionConcerts.filter(concert => (!city || city === concert.city) && (!month || concert.date.startsWith(month)));

  return (
    <>
      <h1 className="page-title">{REGIONS[region]}</h1>
      <form className="filters" action={`/concerts/${region}`}>
        <select name="month" aria-label="공연 월" defaultValue={month}>
          <option value="">전체 월</option>
          {months.map(value => <option value={value} key={value}>{value.replace("-", ".")}</option>)}
        </select>
        <select name="city" aria-label="공연 도시" defaultValue={city}>
          <option value="">전체 도시</option>
          {cities.map(value => <option value={value} key={value}>{value}</option>)}
        </select>
        <button className="button secondary" type="submit">보기</button>
      </form>
      <div className="concert-grid">
        {filtered.map(concert => <ConcertCard key={concert.id} concert={concert} artist={names[concert.artistId]} />)}
      </div>
      {!filtered.length && <p className="empty-note">해당하는 공연 일정이 없어.</p>}
    </>
  );
}

import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConcertPoster } from "@/components/cards";
import { formatDate, formatDateTime, REGIONS, TICKET_STATES } from "@/lib/format";
import { isRegion } from "@/lib/model";
import { getEntry } from "@/lib/store";

export const dynamic = "force-dynamic";
const loadConcert = cache(async (region: string, id: string) => {
  const concert = await getEntry("concerts", id);
  return concert?.published && concert.region === region ? concert : null;
});
type Props = { params: Promise<{ region: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region, id } = await params;
  const concert = await loadConcert(region, id);
  return { title: concert?.title ?? "공연" };
}

function Fact({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><dt>{title}</dt><dd>{children}</dd></div>;
}

export default async function ConcertPage({ params }: Props) {
  const { region, id } = await params;
  if (!isRegion(region)) notFound();
  const concert = await loadConcert(region, id);
  if (!concert) notFound();
  const artist = await getEntry("artists", concert.artistId);
  const date = formatDate(concert.date) + (concert.endDate && concert.endDate !== concert.date ? " ~ " + formatDate(concert.endDate) : "");

  return (
    <article className="concert-detail">
      <div className="breadcrumb"><Link href={`/concerts/${region}`}>← {REGIONS[region]}</Link></div>
      <div className="concert-feature">
        <ConcertPoster concert={concert} artist={artist ?? undefined} />
        <div>
          <p className="ticket-state" data-status={concert.status}>{TICKET_STATES[concert.status]}</p>
          <h1>{concert.title}</h1>
          {artist && <Link className="text-link" href={`/songs?artist=${artist.id}`}>{artist.name}</Link>}
          <dl className="facts">
            <Fact title="공연일">{date}{concert.time && " · " + concert.time}</Fact>
            <Fact title="공연장">{[concert.city, concert.venue].filter(Boolean).join(" · ")}</Fact>
            {concert.price && <Fact title="티켓 가격">{concert.price}</Fact>}
          </dl>
          {(concert.presale || concert.generalSale) && (
            <>
              <h2>예매 일정</h2>
              <dl className="facts">
                {concert.presale && <Fact title="선예매">{formatDateTime(concert.presale)}</Fact>}
                {concert.generalSale && <Fact title="일반예매">{formatDateTime(concert.generalSale)}</Fact>}
              </dl>
            </>
          )}
          {concert.ticketUrl && <a className="button" href={concert.ticketUrl} target="_blank" rel="noreferrer">공식 예매처 ↗</a>}
        </div>
      </div>
      {artist && (
        <div className="detail-end">
          <Link className="text-link" href={`/songs?artist=${artist.id}`}>{artist.name}의 곡 모아보기 →</Link>
        </div>
      )}
    </article>
  );
}

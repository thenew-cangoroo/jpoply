"use client";

import { useState } from "react";
import Link from "next/link";
import { REGIONS } from "@/lib/format";
import type { Artist, Concert, Region } from "@/lib/model";
import { ConcertCard } from "./cards";

export function ConcertShelf({ concerts, artists }: { concerts: Concert[]; artists: Record<string, Artist> }) {
  const [region, setRegion] = useState<Region>("korea");
  const featured = concerts.filter(concert => concert.region === region).slice(0, 3);

  return (
    <section className="home-concerts" aria-label="다가오는 공연">
      <div className="section-heading">
        <h2>다가오는 공연</h2>
        <Link className="text-link" href={`/concerts/${region}`}>전체 일정 →</Link>
      </div>
      <div className="chips" role="group" aria-label="공연 지역">
        {(Object.keys(REGIONS) as Region[]).map(key => (
          <button key={key} className="chip" type="button" onClick={() => setRegion(key)} aria-pressed={key === region}>
            {REGIONS[key]}
          </button>
        ))}
      </div>
      <div className="concert-grid teasers">
        {featured.map(concert => <ConcertCard key={concert.id} concert={concert} artist={artists[concert.artistId]} compact />)}
      </div>
      {!featured.length && <p className="empty-note">다가오는 공연 일정이 없어.</p>}
    </section>
  );
}

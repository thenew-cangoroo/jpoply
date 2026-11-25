"use client";

import { useState } from "react";
import type { Tone } from "@/lib/model";

export function HeroThumbnail({
  tone,
  videoId,
}: {
  tone: Tone;
  videoId?: string;
}) {
  const [size, setSize] = useState<"maxresdefault" | "mqdefault" | null>(
    "maxresdefault"
  );

  function checkImage(image: HTMLImageElement | null) {
    if (image?.complete && image.naturalWidth < 320) {
      setSize(size === "maxresdefault" ? "mqdefault" : null);
    }
  }

  return (
    <div className="stage-image" data-tone={tone}>
      {videoId && size && (
        <img
          key={size}
          ref={checkImage}
          src={`https://i.ytimg.com/vi/${videoId}/${size}.jpg`}
          alt=""
          fetchPriority="high"
          onLoad={(event) => checkImage(event.currentTarget)}
          onError={(event) => checkImage(event.currentTarget)}
        />
      )}
    </div>
  );
}

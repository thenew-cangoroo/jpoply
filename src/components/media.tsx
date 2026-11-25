import type { Tone } from "@/lib/model";

export function StageImage({
  tone,
  videoId = "",
  caption = "",
}: {
  tone: Tone;
  videoId?: string;
  caption?: string;
}) {
  return (
    <div className="stage-image" data-tone={tone}>
      {videoId ? (
        <img
          src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
          alt=""
          loading="lazy"
        />
      ) : null}
      {caption ? <span className="stage-caption">{caption}</span> : null}
    </div>
  );
}

export function YouTubePlayer({
  tone,
  videoId,
  title,
}: {
  tone: Tone;
  videoId: string;
  title: string;
}) {
  if (!videoId)
    return <StageImage tone={tone} caption="등록된 영상이 여기에 표시돼" />;
  return (
    <div className="video-frame">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title + " 라이브 영상"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}

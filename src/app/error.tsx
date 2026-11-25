"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="message-page">
      <h1>데이터를 불러오지 못했어</h1>
      <button type="button" className="button secondary" onClick={reset}>다시 시도</button>
    </section>
  );
}

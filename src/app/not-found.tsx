import Link from "next/link";

export default function NotFound() {
  return (
    <section className="message-page">
      <h1>페이지를 찾을 수 없어</h1>
      <Link className="button secondary" href="/">제이플리 홈으로</Link>
    </section>
  );
}

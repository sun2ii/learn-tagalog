import Link from "next/link";
import { lessons } from "@/content";
import { Legend } from "@/components/Token";

export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Kain na tayo.</h1>
        <p className="text-muted">See the system. Hear tiny conversations. Say your line.</p>
      </div>

      <section className="rounded-2xl border border-line bg-card p-4 space-y-3">
        <h2 className="font-semibold">The loop</h2>
        <ol className="text-sm space-y-1 text-muted">
          <li>1. Listen — no text. What's happening?</li>
          <li>2. Reveal — every piece colored by its job.</li>
          <li>3. Say your line — mic checks you're close.</li>
          <li>4. Variation — same pieces, new sentence.</li>
          <li>5. Rate — missed ones come back when due.</li>
        </ol>
        <Legend />
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Lessons</h2>
        {lessons.map((l) => (
          <Link key={l.id} href={`/lesson/${l.id}/`} className="block rounded-2xl border border-line bg-card p-4">
            <div className="text-lg font-semibold">{l.title}</div>
            <div className="text-sm text-muted">{l.subtitle} · {l.exchanges.length} exchanges</div>
          </Link>
        ))}
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Link href="/map/" className="rounded-2xl border border-line bg-card p-4"><div className="font-semibold">◈ System map</div><div className="text-sm text-muted">The skeleton, in one screen.</div></Link>
        <Link href="/anchors/" className="rounded-2xl border border-line bg-card p-4"><div className="font-semibold">⚓ Anchors</div><div className="text-sm text-muted">Words you already own via Indonesian & Spanish.</div></Link>
      </section>
    </div>
  );
}

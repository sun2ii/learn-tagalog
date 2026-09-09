import { pronouns, particles, markers, questionWords, verbEngine, skeleton } from "@/content/map";
import { Legend } from "@/components/Token";

// The system on one screen: skeleton → pronouns → particles/markers → question words → verb engine.
export default function MapPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">The system</h1>
        <p className="text-muted text-sm">Five pieces. Everything you'll hear is built from them.</p>
        <div className="mt-2"><Legend /></div>
      </div>

      <Section n="1" title="Sentence skeleton" note={skeleton.note}>
        {skeleton.examples.map((e) => (
          <div key={e.tl} className="rounded-xl border border-line bg-card p-3">
            <div className="text-lg font-semibold">{e.tl}</div>
            <div className="text-sm text-muted">{e.en}</div>
            <div className="mt-1 text-[11px] uppercase tracking-wide text-muted">{e.tag}</div>
          </div>
        ))}
      </Section>

      <Section n="2" title="Pronouns — two forms each" note={pronouns.note}>
        <Table head={["", "ANG-form", "NG-form", "Indonesian"]}
          rows={pronouns.rows.map((r) => [r.en, <b key="a" className="text-person">{r.ang}</b>, <b key="n" className="text-person">{r.ng}</b>, <span key="i" className="text-muted">{r.id}</span>])} />
        <Contrast a="Gutom ako." aEn="I'm hungry. (ako = spotlight)" b="Gusto ko ng kape." bEn="I want coffee. (ko = doer, kape is the thing)" />
      </Section>

      <Section n="3" title="Particles — the tiny words that carry meaning" note="They sit right after the first word. Learn these and sentences stop sounding like noise.">
        <Table head={["", "means", "example"]} rows={particles.map((p) => [<b key="t" className="text-particle">{p.t}</b>, p.m, <span key="e" className="text-muted">{p.ex}</span>])} />
        <Contrast a="Kumain na ako." aEn="I already ate." b="Hindi pa ako kumain." bEn="I haven't eaten yet." />
      </Section>

      <Section n="4" title="Markers — who is the spotlight" note="ang / ng / sa tag every noun. Names use si / ni / kay instead.">
        <Table head={["", "job", "example"]} rows={markers.map((p) => [<b key="t" className="text-particle">{p.t}</b>, p.m, <span key="e" className="text-muted">{p.ex}</span>])} />
      </Section>

      <Section n="5" title="Question words" note="Put them first; add nothing else. 'ba' is only for yes/no questions.">
        <div className="grid grid-cols-3 gap-2">
          {questionWords.map((q) => (
            <div key={q.t} className="rounded-xl border border-question/40 bg-question/10 p-2 text-center">
              <div className="font-bold text-question">{q.t}</div>
              <div className="text-[11px] text-muted">{q.m}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section n="6" title="Verb engine — aspect, not tense" note={verbEngine.note}>
        <Table head={["root", "type", "done", "ongoing", "not yet"]}
          rows={verbEngine.rows.map((r) => [
            <span key="r"><b>{r.root}</b><div className="text-[11px] text-muted">{r.en}</div></span>,
            <span key="t" className="text-muted">{r.type}</span>,
            <b key="d" className="text-action">{r.done}</b>,
            <b key="o" className="text-action">{r.ongoing}</b>,
            <b key="n" className="text-action">{r.notyet}</b>,
          ])} />
        <ul className="space-y-1 text-sm">
          {verbEngine.mechanism.map((m) => <li key={m} className="rounded-lg bg-card border border-line p-2">{m}</li>)}
        </ul>
        <Contrast a="Kumain ako ng adobo." aEn="Actor focus: I (ako) am the spotlight." b="Kinain ko ang adobo." bEn="Object focus: the adobo (ang) is the spotlight; I become 'ko'." />
      </Section>
    </div>
  );
}

function Section({ n, title, note, children }: { n: string; title: string; note: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-bold"><span className="text-muted mr-2">{n}</span>{title}</h2>
        <p className="text-sm text-muted">{note}</p>
      </div>
      {children}
    </section>
  );
}

function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-card">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-[11px] uppercase tracking-wide text-muted">{head.map((h, i) => <th key={i} className="px-2 py-1.5">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i} className="border-t border-line">{r.map((c, j) => <td key={j} className="px-2 py-1.5 align-top">{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function Contrast({ a, aEn, b, bEn }: { a: string; aEn: string; b: string; bEn: string }) {
  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div className="rounded-xl border border-line bg-card p-2"><div className="font-semibold">{a}</div><div className="text-muted">{aEn}</div></div>
      <div className="rounded-xl border border-line bg-card p-2"><div className="font-semibold">{b}</div><div className="text-muted">{bEn}</div></div>
    </div>
  );
}

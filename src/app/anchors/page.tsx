import { cognates, falseFriends } from "@/content/map";

const langName = { id: "Indonesian", es: "Spanish", en: "English" };

// Verified anchors only. Recognition, not guessing: the false-friend list is the point.
export default function AnchorsPage() {
  const byLang = (lang: "id" | "es") => cognates.filter((c) => c.lang === lang);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Anchors</h1>
        <p className="text-sm text-muted">Words you already own. Indonesian gives you the old Austronesian core; Spanish gives you objects, time and glue words. Only verified pairs are listed — don't guess beyond these.</p>
      </div>
      {(["id", "es"] as const).map((lang) => (
        <section key={lang} className="space-y-2">
          <h2 className="font-bold">From {langName[lang]}</h2>
          <div className="overflow-hidden rounded-xl border border-line bg-card">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[11px] uppercase tracking-wide text-muted"><th className="px-2 py-1.5">Tagalog</th><th className="px-2 py-1.5">{langName[lang]}</th><th className="px-2 py-1.5">meaning</th></tr></thead>
              <tbody>{byLang(lang).map((c) => (
                <tr key={c.tl} className="border-t border-line"><td className="px-2 py-1.5 font-semibold">{c.tl}</td><td className="px-2 py-1.5 text-muted">{c.other}</td><td className="px-2 py-1.5">{c.en}</td></tr>
              ))}</tbody>
            </table>
          </div>
        </section>
      ))}
      <section className="space-y-2">
        <h2 className="font-bold text-action">False friends — looks familiar, means something else</h2>
        <div className="space-y-2">
          {falseFriends.map((f) => (
            <div key={f.tl + f.lang} className="rounded-xl border border-action/40 bg-action/10 p-3 text-sm">
              <div className="font-semibold">{f.tl} <span className="text-muted font-normal">≠ {langName[f.lang]} {f.other}</span></div>
              <div>{f.en}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

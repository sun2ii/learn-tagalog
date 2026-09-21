"use client";
import Link from "next/link";
import { Eyebrow } from "@/components/ui";

/* The Guide: why the app is shaped this way, how Tagalog works, where it came from,
   and how people actually talk. Text first; every example is colored by role. */

type P = [string, "verb" | "actor" | "object" | "particle" | "question" | "time" | "negation" | "describe" | ""];

const ROLES: { role: string; word: string; name: string; where: string; what: string; more: string }[] = [
  // Ordered the way a sentence is built: the core first, in position order; then the moves that go in front.
  { role: "verb", word: "kumain", name: "Action", where: "1st · 0 ½ 1", what: "the verb — the anchor everything else hangs on. The red fills in as the action completes: pale = not yet (0), mid = ongoing (½), deep = done (1)", more: "bibili · bumibili · bumili · pupunta · pumupunta · pumunta" },
  { role: "actor", word: "ako", name: "Who", where: "2nd", what: "the doer, right after the action, in either form", more: "ako ka siya kami tayo kayo sila · ko mo niya namin natin ninyo nila · si Ben" },
  { role: "particle", word: "ng", name: "Marker", where: "3rd", what: "grey = structure, not meaning; says whether the thing is in focus", more: "ng · ang · sa · si ni kay — and the tone particles na pa lang din po that tuck in after the first word" },
  { role: "object", word: "adobo", name: "What", where: "4th", what: "the thing the action touches, always after its marker", more: "mangga · kanin · tubig · bahay · pera" },
  { role: "describe", word: "masarap", name: "Describe", where: "attaches", what: "adjectives — sit in front of the noun they describe, or lead a sentence on their own", more: "maganda · malaki · mahal · gutom · Masarap ang adobo." },
  { role: "time", word: "kahapon", name: "When / where", where: "last", what: "time and place — always at the end", more: "kahapon ngayon mamaya bukas · dito diyan doon" },
  { role: "negation", word: "hindi", name: "Not", where: "front", what: "goes in front of everything and pulls the who forward", more: "hindi · wala · ayaw" },
  { role: "question", word: "bakit", name: "Ask", where: "front · or after the who", what: "question words go first; ba slips in after the who", more: "ano sino saan kailan bakit paano · ba" },
];

function Ex({ parts, en, note }: { parts: P[]; en: string; note?: string }) {
  return (
    <div className="my-4 border-l-2 border-line pl-4">
      <div className="tl text-[22px] font-medium leading-tight md:text-[24px]">
        {parts.map(([t, r], i) => <span key={i} data-role={r || undefined}>{t}{i < parts.length - 1 ? " " : ""}</span>)}
      </div>
      <div className="mt-0.5 text-[13.5px] text-muted">{en}{note && <span className="text-faint"> — {note}</span>}</div>
    </div>
  );
}

/* Foldable section: native <details>, so it's keyboard-accessible and needs no state. */
function Fold({ id, title, defaultOpen = false, children }: { id: string; title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  return (
    <details id={id} open={defaultOpen} className="group scroll-mt-6 border-t border-line py-2 first:border-t-0">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
        <h2 className="text-[22px] font-semibold tracking-tight transition-colors group-hover:text-foreground md:text-[24px]">{title}</h2>
        <svg className="shrink-0 text-faint transition-transform duration-200 group-open:rotate-180" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6l5 5 5-5" /></svg>
      </summary>
      <div className="pb-8 animate-fade">{children}</div>
    </details>
  );
}

function openAndScroll(id: string) {
  const el = document.getElementById(id) as HTMLDetailsElement | null;
  if (!el) return;
  el.open = true;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}
function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-7 text-[17px] font-semibold tracking-tight">{children}</h3>;
}
function Para({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 max-w-2xl text-[15.5px] leading-relaxed text-foreground/90">{children}</p>;
}

const TOC = [
  ["colors", "The colors"],
  ["app", "How to use this app"],
  ["works", "How Tagalog works"],
  ["from", "Where Tagalog came from"],
  ["talk", "How Filipinos actually talk"],
];

export default function GuidePage() {
  return (
    <div className="animate-rise pb-10">
      <header>
        <Eyebrow><Link href="/library/" className="hover:text-foreground">Library</Link> · Guide</Eyebrow>
        <h1 className="mt-1.5 text-[28px] font-semibold leading-none tracking-tight">The map of the territory.</h1>
        <nav className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-[13.5px]">
          {TOC.map(([id, label]) => <button key={id} onClick={() => openAndScroll(id)} className="text-muted hover:text-foreground">{label}</button>)}
        </nav>
      </header>

      <div className="mt-8">
      <Fold id="colors" title="The colors" defaultOpen={true}>
        <Para>Every piece of Tagalog in this app is colored by the job it does in the sentence. The colors never change, so after a while you stop reading the labels and just see the structure. Listed in the order a sentence is built: the core pieces in position, then the two moves that go in front.</Para>
        <ul className="mt-5 max-w-2xl divide-y divide-line border-y border-line">
          {ROLES.map((r) => (
            <li key={r.role} className="grid grid-cols-[7rem_1fr] items-baseline gap-4 py-3 md:grid-cols-[9rem_1fr]">
              <div>
                {r.role === "verb" ? (
                  <div className="tl text-[22px] font-medium leading-none"><span data-aspect="contemplated">kakain</span> <span data-aspect="ongoing">kumakain</span> <span data-aspect="completed">kumain</span></div>
                ) : (
                  <div className="tl text-[24px] font-medium leading-none" data-role={r.role}>{r.word}</div>
                )}
                <div className="mt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-faint">{r.where}</div>
              </div>
              <div>
                <div className="text-[14.5px]"><span className="font-semibold">{r.name}</span> <span className="text-muted">— {r.what}</span></div>
                <div className="tl mt-1 text-[16px] text-muted">{r.more}</div>
              </div>
            </li>
          ))}
        </ul>
        <Para>Put together:</Para>
        <Ex parts={[["Hindi", "negation"], ["ako", "actor"], ["kumain", "verb"], ["ng", "particle"], ["adobo", "object"], ["kahapon.", "time"]]} en="I did not eat adobo yesterday." note="not · who · action · marker · what · when" />
        <Ex parts={[["Bakit", "question"], ["ka", "actor"], ["kumakain", "verb"], ["ng", "particle"], ["masarap", "describe"], ["na", "particle"], ["adobo?", "object"]]} en="Why are you eating delicious adobo?" note="ask · who · action · marker · describe · linker · what" />
        <Para>Read any sentence in the app by color first: find the red action, the blue who, then everything else attaches to those two.</Para>
      </Fold>
      <Fold id="app" title="How to use this app" defaultOpen={true}>
      <Para>Most language apps hand you sentences to memorize. This one hands you a machine and lets you see it move. Every mode is a different way of touching the same machine, so the modes are separate on purpose: each one trains one muscle.</Para>

      <H3>Everyday · survival first</H3>
      <Para>Phrases you will need in the first hour on the ground, organized by situation rather than by grammar. Say them as-is. Mark the ones you know with the check so the practice deck shrinks to what you still need. Many of these are Taglish, because that is what people say.</Para>

      <H3>Grammar Gym · reps until it is instinct</H3>
      <Para>You see a meaning and type the Tagalog. The workouts are listed in the order the grammar compounds: first <em>who did what to what, when</em> (actor focus); then the same event with the spotlight moved to the thing (focus / voice); then <em>hindi</em>; then <em>ba</em>; then question words; then everything mixed. Each step reuses every previous step, which is why the order matters and why the ladder on the Home screen is a ladder and not a menu.</Para>
      <Para>After each answer the sentence opens up: every piece gets its role written underneath. That reveal is the product. You are not being told <em>whether</em> you were right, you are being shown <em>why the sentence is built that way</em>.</Para>

      <H3>Builder · the physical version</H3>
      <Para>Same sentences, assembled by hand from pieces. Pieces that cannot come next grey out, and hovering one tells you why. This is the slowest, most explicit way to feel word order, and the reason the free build exists: you can poke the grammar and watch it push back.</Para>

      <H3>Questions · transformations</H3>
      <Para>A statement becomes a question in Tagalog by adding or moving one or two small pieces. The Questions screen shows before and after with the moved pieces highlighted, because the point is not the question word, it is the <em>movement</em>. Once you can see <em>Kumain ka</em> become <em>Kumain ka ba</em> become <em>Bakit ka kumain</em>, every other transformation looks familiar.</Para>

      <H3>Library · input</H3>
      <Para>Vocabulary and Stories are the other half. You cannot produce what you have not absorbed hundreds of times. Words feed the spaced-repetition deck; stories give you the rhythm. A session mixes drills with whatever is due.</Para>
      </Fold>
      <Fold id="works" title="How Tagalog works" defaultOpen={false}>
      <Para>Four ideas carry almost everything. If they are solid, the rest is vocabulary.</Para>

      <H3>1 · The verb comes first, then the who, then the what</H3>
      <Ex parts={[["Kumain", "verb"], ["ako", "actor"], ["ng", "particle"], ["adobo.", "object"]]} en="I ate adobo." note="verb · who · marker · what" />
      <Para>English leads with the subject. Tagalog leads with the action. The tiny words that modify a sentence (<em>na, pa, ba, ka, ko, mo</em>) cluster right after the first word, which is why <em>Kumain ka na ba?</em> stacks three of them in a row.</Para>

      <H3>2 · Focus: one thing is in the spotlight, and the markers say which</H3>
      <Ex parts={[["Kumain", "verb"], ["ako", "actor"], ["ng", "particle"], ["adobo.", "object"]]} en="I ate (some) adobo." note="actor in focus: ako · adobo takes ng" />
      <Ex parts={[["Kinain", "verb"], ["ko", "actor"], ["ang", "particle"], ["adobo.", "object"]]} en="I ate the adobo." note="object in focus: adobo takes ang · I become ko" />
      <Para>Same event, two sentences. The verb changes its affix (<em>-um-</em> → <em>-in-</em>), the thing in focus takes <em>ang</em>, everything else takes <em>ng</em>, and the pronoun switches form (<em>ako</em> → <em>ko</em>). This is the single most important mechanism in the language and the reason every pronoun in the Vocabulary tab is listed with two forms. Roughly: <em>ang</em> = <em>the one we are talking about</em>; <em>ng</em> = <em>a supporting role</em>.</Para>
      <Para>English gets at the same difference with articles (<em>some adobo</em> vs <em>the adobo</em>), but Tagalog makes it structural. That is why <em>ano</em> (what) forces object focus: <em>Ano ang kinain mo?</em> — the thing is what we are asking about, so the thing takes the spotlight.</Para>

      <H3>3 · Aspect, not tense: not yet · ongoing · done</H3>
      <div className="my-4 border-l-2 border-line pl-4">
        <div className="tl text-[22px] font-medium leading-tight md:text-[24px]"><span data-aspect="contemplated">kakain</span> · <span data-aspect="ongoing">kumakain</span> · <span data-aspect="completed">kumain</span></div>
        <div className="mt-0.5 text-[13.5px] text-muted">will eat · is eating · ate<span className="text-faint"> — 0 → ½ → 1: KA-kain · ku-MA-kain · k-um-ain. The shade of red tells you which.</span></div>
      </div>
      <Para>Tagalog verbs do not mark <em>when</em>; they mark how far along the action is: not started (0), in progress (½), finished (1). Two mechanisms do all the work: an affix (<em>-um-</em>, <em>mag-/nag-</em>, <em>-in-</em>) says which kind of verb and who is in focus, and doubling the first syllable says <em>not finished</em>. <em>Kakain</em> has a doubled syllable but no <em>-um-</em>: not even started. <em>Kumakain</em> has both, the doubled <em>ka</em> saying not finished, so ongoing. <em>Kumain</em> drops the doubling: done. Time words like <em>kahapon</em> and <em>bukas</em> then have to agree with the aspect, which is why the Builder greys <em>kahapon</em> out next to <em>kakain</em>.</Para>

      <H3>4 · Negation and questions move small pieces, not the whole sentence</H3>
      <Ex parts={[["Hindi", "negation"], ["ako", "actor"], ["kumain.", "verb"]]} en="I did not eat." note="hindi first, then the actor slides in front of the verb" />
      <Ex parts={[["Kumain", "verb"], ["ka", "actor"], ["ba?", "question"]]} en="Did you eat?" note="ba lands after the first piece" />
      <Ex parts={[["Bakit", "question"], ["ka", "actor"], ["kumain?", "verb"]]} en="Why did you eat?" note="question word first, then actor, then verb — no ba" />
      <Para>Notice the pattern: <em>hindi</em> and the question words both go first and both pull the actor forward. Once you feel that pull, negative questions (<em>Hindi ka ba kumain?</em>) are not a new rule, they are the two rules at once.</Para>

      <H3>The rest is smaller</H3>
      <Para><strong>Two <em>we</em>s.</strong> <em>Tayo</em> includes the listener, <em>kami</em> excludes them. <em>Kain tayo</em> is an invitation. <strong>No gender.</strong> <em>Siya</em> is he or she. <strong>Names get their own markers:</strong> <em>si</em>, <em>ni</em>, <em>kay</em> do for names what <em>ang</em>, <em>ng</em>, <em>sa</em> do for nouns. <strong>Plural is a word,</strong> <em>mga</em>, not an ending. <strong>Adjectives with <em>ma-</em></strong> mean <em>having that quality</em>: <em>ganda</em> (beauty) → <em>maganda</em> (beautiful), and <em>ang</em> + adjective is an exclamation: <em>Ang ganda!</em></Para>
      </Fold>
      <Fold id="from" title="Where Tagalog came from" defaultOpen={false}>
      <Para>Tagalog is an Austronesian language, part of the family that stretches from Madagascar to Hawaii and includes Malay, Indonesian, Javanese, Māori and Hawaiian. The ancestors of these languages left Taiwan roughly four to five thousand years ago and spread by sea. That is why <em>mata</em> (eye), <em>anak</em> (child), <em>langit</em> (sky), <em>lima</em> (five) and <em>takot / takut</em> (afraid) are the same or nearly the same in Tagalog and Indonesian: they are not loans, they are inheritance. The Vocabulary tab marks these anchors so you can lean on what you already know.</Para>
      <Para>The grammar you are learning — focus, aspect, verb-first order — is the old Austronesian machinery, preserved in the Philippines more fully than in Indonesian, which simplified much of it. Indonesian speakers find Tagalog vocabulary friendly and the verb system strange for exactly this reason.</Para>
      <Para>Then three centuries of Spain (1565–1898). Spanish did not replace the grammar; it poured in words. Numbers for money and time (<em>singkwenta, alas-dos</em>), the days and months, the kitchen (<em>mesa, kutsara, baso, kape</em>), the house (<em>kwarto, bintana, banyo</em>), and a long list of everyday words: <em>pero, pwede, gusto, sige, siguro, kumusta</em>. Some shifted meaning on the way: <em>siguro</em> means <em>maybe</em>, not <em>sure</em>; <em>syempre</em> means <em>of course</em>, not <em>always</em>. Tagalog has native numbers too, and both sets are alive: count things with <em>isa, dalawa, tatlo</em>; pay for them with <em>bente, trenta, singkwenta</em>.</Para>
      <Para>Then the United States (1898–1946) and English, which became the language of school and government and never left. Today English is an official language alongside Filipino, and most Filipinos move between the two mid-sentence without noticing. That mix is Taglish, and it is not broken Tagalog; it is the ordinary register of a bilingual country.</Para>
      <Para><strong>Tagalog or Filipino?</strong> Tagalog is the language of Manila and the surrounding provinces, one of about 180 languages in the Philippines. Filipino is the national language, defined in 1987 as a standardized form of Tagalog open to words from the other Philippine languages and from English and Spanish. In practice, what you are learning here is what a person in Manila speaks, and calling it Tagalog is normal. Outside the Tagalog region people may speak Cebuano, Ilocano, Hiligaynon or another language at home and use Tagalog or English with you.</Para>
      </Fold>
      <Fold id="talk" title="How Filipinos actually talk" defaultOpen={false}>
      <H3>Po and opo</H3>
      <Para>Add <em>po</em> to almost anything when speaking to someone older, to staff, or to a stranger. <em>Salamat po. Magandang umaga po. Hindi po.</em> It costs nothing and it is noticed. <em>Opo</em> is the polite yes. Between friends and people your age you drop it.</Para>
      <H3>Kuya, Ate, Tito, Tita</H3>
      <Para>Older brother, older sister, uncle, aunt — used for family, and also for the waiter, the driver, the cashier, the neighbor. <em>Kuya, magkano po?</em> is friendlier than any pronoun. When meeting her family, <em>Tito</em> and <em>Tita</em> for her parents&rsquo; generation is right; <em>kayo</em> instead of <em>ka</em> makes it polite.</Para>
      <H3>Kumain ka na ba?</H3>
      <Para><em>Have you eaten?</em> is a greeting, not a question about food. It means <em>I care about you</em>. Answer <em>Opo / Hindi pa po</em> and expect to be fed either way. <em>Kain tayo!</em> from anyone eating nearby is an invitation you can decline warmly with <em>Sige, salamat.</em></Para>
      <H3>Taglish is the default</H3>
      <Para>Nobody says <em>Pwede bang makuha ang bill</em> when <em>Bill, please</em> works. <em>Pa-take-out po. Pwede bang mag-card? Delayed ba ang flight?</em> Verbs get built on English roots with Tagalog affixes: <em>mag-Grab, nag-text, i-charge</em>. Use it. Speaking textbook Tagalog to a Manila waiter sounds like reading aloud.</Para>
      <H3>Softeners: naman, lang, na lang, kasi</H3>
      <Para>Filipino speech avoids sharp edges. <em>Ikaw naman?</em> (and you?), <em>Konti lang</em> (just a little), <em>Dito na lang po</em> (right here is fine), <em>Gutom kasi ako</em> (because I&rsquo;m hungry, that&rsquo;s why). These particles carry tone more than meaning; drop them and you sound abrupt.</Para>
      <H3>Hiya and pakikisama</H3>
      <Para><em>Hiya</em> is the sense of shame or propriety that keeps people from imposing; <em>nakakahiya</em> (how embarrassing) is said constantly. <em>Pakikisama</em> is getting along, smoothing the group. Practically: an indirect <em>siguro</em> or <em>tingnan natin</em> (we&rsquo;ll see) can be a no; a direct <em>hindi</em> is rarer than you expect; and accepting food, joining the table, and laughing at yourself buy more goodwill than perfect grammar.</Para>
      <H3>What sounds textbook</H3>
      <Para>Full <em>ikaw</em> where <em>ka</em> belongs. <em>Hindi</em> where <em>wala</em> belongs (<em>Wala akong pera</em>, not <em>Hindi ako may pera</em>). Spelling out <em>ano ang</em> when everyone says <em>anong</em>. Saying <em>oo</em> to an elder. None of these are wrong; they are just the marks of someone who learned from a book. The stories and the Everyday phrases are tuned to avoid them.</Para>
      </Fold>
      </div>
    </div>
  );
}

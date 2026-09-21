// Particles: how the speaker frames the event. Every item is a BASE sentence and the same
// sentence with one particle (or one combo) added — the English shows the shift in meaning,
// not a one-word gloss. Sentences use verbs already in vocab. Hand-written; native check pending
// on the cells marked `check`.

export interface ParticleItem {
  base: string;    // "Kumain ako."
  baseEn: string;  // "I ate."
  out: string;     // "Kumain na ako."
  outEn: string;   // "I've eaten already."
}
export interface ParticleCell {
  id: string;
  label: string;         // what the cell shows on the map
  ask: "add" | "which";  // add = "add X"; which = "make it mean: <outEn>" (contrast cells)
  rule: string;          // one line, mechanical — shown behind Why?
  sense: string;         // one line, what the particle does to the meaning
  items: ParticleItem[];
  check?: boolean;       // English readings are context-dependent → native check
}
export interface ParticleGroup { id: string; name: string; cells: ParticleCell[] }

const SECOND = "Particles sit in second position: right after the first full word. If a pronoun is there too, the pronoun goes first (ka na, ko pa, ako rin).";

export const PARTICLE_GROUPS: ParticleGroup[] = [
  {
    id: "time", name: "Time / state", cells: [
      {
        id: "na", label: "na", ask: "add", rule: SECOND,
        sense: "na = the state has been reached: already, now, at last. It moves the event into 'done / starting now'.",
        items: [
          { base: "Kumain ako.", baseEn: "I ate.", out: "Kumain na ako.", outEn: "I've eaten already." },
          { base: "Pupunta ako.", baseEn: "I'll go.", out: "Pupunta na ako.", outEn: "I'm going now." },
          { base: "Uuwi ako.", baseEn: "I'll go home.", out: "Uuwi na ako.", outEn: "I'm heading home now." },
          { base: "Natulog siya.", baseEn: "She slept.", out: "Natulog na siya.", outEn: "She's already asleep." },
          { base: "Dumating sila.", baseEn: "They arrived.", out: "Dumating na sila.", outEn: "They've arrived." },
          { base: "Aalis kami.", baseEn: "We're leaving.", out: "Aalis na kami.", outEn: "We're leaving now." },
          { base: "Nagbayad ako.", baseEn: "I paid.", out: "Nagbayad na ako.", outEn: "I already paid." },
          { base: "Kakain tayo.", baseEn: "We'll eat.", out: "Kakain na tayo.", outEn: "Let's eat now." },
          { base: "Tapos ako.", baseEn: "I'm done.", out: "Tapos na ako.", outEn: "I'm done now." },
        ],
      },
      {
        id: "pa", label: "pa", ask: "add", rule: SECOND, check: true,
        sense: "pa = not there yet / continuing: still, yet, more. With hindi it becomes 'not yet'.",
        items: [
          { base: "Kumakain ako.", baseEn: "I'm eating.", out: "Kumakain pa ako.", outEn: "I'm still eating." },
          { base: "Natutulog siya.", baseEn: "She's sleeping.", out: "Natutulog pa siya.", outEn: "She's still asleep." },
          { base: "Hindi ako kumain.", baseEn: "I didn't eat.", out: "Hindi pa ako kumain.", outEn: "I haven't eaten yet." },
          { base: "Hindi sila dumating.", baseEn: "They didn't arrive.", out: "Hindi pa sila dumating.", outEn: "They haven't arrived yet." },
          { base: "Nag-aaral ako.", baseEn: "I'm studying.", out: "Nag-aaral pa ako.", outEn: "I'm still studying." },
          { base: "Naghihintay kami.", baseEn: "We're waiting.", out: "Naghihintay pa kami.", outEn: "We're still waiting." },
          { base: "Gusto ko.", baseEn: "I want some.", out: "Gusto ko pa.", outEn: "I want more." },
          { base: "Isa.", baseEn: "One.", out: "Isa pa.", outEn: "One more." },
          { base: "Hindi ako tapos.", baseEn: "I'm not done.", out: "Hindi pa ako tapos.", outEn: "I'm not done yet." },
        ],
      },
      {
        id: "na-pa", label: "na ↔ pa", ask: "which", rule: SECOND,
        sense: "na = reached (already / now). pa = not reached or continuing (still / yet / more). Same slot, opposite direction.",
        items: [
          { base: "Kumain ako.", baseEn: "I ate.", out: "Kumain na ako.", outEn: "I've eaten already." },
          { base: "Kumakain ako.", baseEn: "I'm eating.", out: "Kumakain pa ako.", outEn: "I'm still eating." },
          { base: "Hindi ako kumain.", baseEn: "I didn't eat.", out: "Hindi pa ako kumain.", outEn: "I haven't eaten yet." },
          { base: "Uuwi ako.", baseEn: "I'll go home.", out: "Uuwi na ako.", outEn: "I'm going home now." },
          { base: "Naghihintay kami.", baseEn: "We're waiting.", out: "Naghihintay pa kami.", outEn: "We're still waiting." },
          { base: "Natulog siya.", baseEn: "She slept.", out: "Natulog na siya.", outEn: "She's already asleep." },
          { base: "Hindi sila dumating.", baseEn: "They didn't arrive.", out: "Hindi pa sila dumating.", outEn: "They haven't arrived yet." },
          { base: "Isa.", baseEn: "One.", out: "Isa pa.", outEn: "One more." },
          { base: "Tapos ako.", baseEn: "I'm done.", out: "Tapos na ako.", outEn: "I'm done now." },
          { base: "Kakain tayo.", baseEn: "We'll eat.", out: "Kakain na tayo.", outEn: "Let's eat now." },
        ],
      },
      {
        id: "muna", label: "muna", ask: "add", rule: SECOND,
        sense: "muna = first / for now: do this before anything else, or just for the moment.",
        items: [
          { base: "Kakain ako.", baseEn: "I'll eat.", out: "Kakain muna ako.", outEn: "I'll eat first." },
          { base: "Matutulog ako.", baseEn: "I'll sleep.", out: "Matutulog muna ako.", outEn: "I'll sleep first." },
          { base: "Uuwi tayo.", baseEn: "We'll go home.", out: "Uuwi muna tayo.", outEn: "Let's go home first." },
          { base: "Maghihintay ako.", baseEn: "I'll wait.", out: "Maghihintay muna ako.", outEn: "I'll wait for now." },
          { base: "Maliligo ako.", baseEn: "I'll shower.", out: "Maliligo muna ako.", outEn: "I'll shower first." },
          { base: "Titingin ako.", baseEn: "I'll look.", out: "Titingin muna ako.", outEn: "I'll take a look first." },
          { base: "Uupo ako.", baseEn: "I'll sit.", out: "Uupo muna ako.", outEn: "I'll sit down for a bit." },
          { base: "Teka.", baseEn: "Wait.", out: "Teka muna.", outEn: "Hold on a sec." },
          { base: "Tubig.", baseEn: "Water.", out: "Tubig muna.", outEn: "Water first." },
        ],
      },
    ],
  },
  {
    id: "limit", name: "Limit / add", cells: [
      {
        id: "lang", label: "lang", ask: "add", rule: SECOND,
        sense: "lang = just / only: it shrinks the claim — nothing more than this.",
        items: [
          { base: "Tubig.", baseEn: "Water.", out: "Tubig lang.", outEn: "Just water." },
          { base: "Isa.", baseEn: "One.", out: "Isa lang.", outEn: "Just one." },
          { base: "Titingin ako.", baseEn: "I'll look.", out: "Titingin lang ako.", outEn: "I'm just looking." },
          { base: "Sandali.", baseEn: "A moment.", out: "Sandali lang.", outEn: "Just a moment." },
          { base: "Nagtatanong ako.", baseEn: "I'm asking.", out: "Nagtatanong lang ako.", outEn: "I'm just asking." },
          { base: "Kumain ako.", baseEn: "I ate.", out: "Kumain lang ako.", outEn: "I just ate, that's all." },
          { base: "Naglalakad kami.", baseEn: "We're walking.", out: "Naglalakad lang kami.", outEn: "We're just walking." },
          { base: "Dito.", baseEn: "Here.", out: "Dito lang.", outEn: "Just here." },
          { base: "Ikaw.", baseEn: "You.", out: "Ikaw lang.", outEn: "Only you." },
        ],
      },
      {
        id: "din", label: "din / rin", ask: "add", rule: SECOND + " din after a consonant (kumain din), rin after a vowel (ako rin, pupunta rin).",
        sense: "din / rin = also, too. Same word; the d becomes r after a vowel sound.",
        items: [
          { base: "Kumain ako.", baseEn: "I ate.", out: "Kumain din ako.", outEn: "I ate too." },
          { base: "Pupunta siya.", baseEn: "She's going.", out: "Pupunta rin siya.", outEn: "She's going too." },
          { base: "Uuwi kami.", baseEn: "We're going home.", out: "Uuwi rin kami.", outEn: "We're going home too." },
          { base: "Gusto ko.", baseEn: "I like it.", out: "Gusto ko rin.", outEn: "I like it too." },
          { base: "Ako.", baseEn: "Me.", out: "Ako rin.", outEn: "Me too." },
          { base: "Natulog sila.", baseEn: "They slept.", out: "Natulog din sila.", outEn: "They slept too." },
          { base: "Nag-aaral ako.", baseEn: "I'm studying.", out: "Nag-aaral din ako.", outEn: "I'm studying too." },
          { base: "Umalis siya.", baseEn: "He left.", out: "Umalis din siya.", outEn: "He left too." },
          { base: "Masarap.", baseEn: "Delicious.", out: "Masarap din.", outEn: "Also delicious." },
        ],
      },
    ],
  },
  {
    id: "attitude", name: "Attitude", cells: [
      {
        id: "naman", label: "naman", ask: "add", rule: SECOND, check: true,
        sense: "naman = a turn or a contrast: 'and you?', 'on the other hand', or a softener that makes a statement gentler.",
        items: [
          { base: "Ikaw?", baseEn: "You?", out: "Ikaw naman?", outEn: "And you? How about you?" },
          { base: "Ako.", baseEn: "Me.", out: "Ako naman.", outEn: "My turn." },
          { base: "Masarap.", baseEn: "It's delicious.", out: "Masarap naman.", outEn: "It's pretty good, actually." },
          { base: "Okay.", baseEn: "It's okay.", out: "Okay naman.", outEn: "It's fine, really." },
          { base: "Hindi.", baseEn: "No.", out: "Hindi naman.", outEn: "Not really." },
          { base: "Kumain ka.", baseEn: "Eat.", out: "Kumain ka naman.", outEn: "Come on, eat." },
          { base: "Sino?", baseEn: "Who?", out: "Sino naman?", outEn: "And who would that be?" },
          { base: "Mahal.", baseEn: "Expensive.", out: "Mahal naman.", outEn: "That's expensive, though." },
          { base: "Siya.", baseEn: "Him.", out: "Siya naman.", outEn: "His turn." },
        ],
      },
      {
        id: "nga", label: "nga", ask: "add", rule: SECOND, check: true,
        sense: "nga = emphasis: really, indeed, I mean it. When asking for something it makes the request polite (Tubig nga).",
        items: [
          { base: "Oo.", baseEn: "Yes.", out: "Oo nga.", outEn: "Yes, indeed. Right." },
          { base: "Masarap.", baseEn: "Delicious.", out: "Masarap nga.", outEn: "It really is delicious." },
          { base: "Hindi.", baseEn: "No.", out: "Hindi nga.", outEn: "No, really." },
          { base: "Tama.", baseEn: "Correct.", out: "Tama nga.", outEn: "That's right, actually." },
          { base: "Kumain ka.", baseEn: "Eat.", out: "Kumain ka nga.", outEn: "Go on, eat — I mean it." },
          { base: "Tubig.", baseEn: "Water.", out: "Tubig nga.", outEn: "Water, please." },
          { base: "Sabi ko.", baseEn: "I said.", out: "Sabi ko nga.", outEn: "That's what I said." },
          { base: "Ano?", baseEn: "What?", out: "Ano nga?", outEn: "What was it again?" },
          { base: "Mahal.", baseEn: "Expensive.", out: "Mahal nga.", outEn: "It really is expensive." },
        ],
      },
    ],
  },
  {
    id: "realize", name: "Realize / report", cells: [
      {
        id: "pala", label: "pala", ask: "add", rule: SECOND + " After na: 'na pala'.",
        sense: "pala = a realization: oh, so it's… — you just found out, and it's a bit of a surprise.",
        items: [
          { base: "Ikaw.", baseEn: "It's you.", out: "Ikaw pala.", outEn: "Oh, it's you!" },
          { base: "Masarap.", baseEn: "Delicious.", out: "Masarap pala.", outEn: "Oh, it's delicious — didn't expect that." },
          { base: "Nandito siya.", baseEn: "She's here.", out: "Nandito pala siya.", outEn: "Oh, she's here." },
          { base: "Mahal.", baseEn: "Expensive.", out: "Mahal pala.", outEn: "Oh, it's expensive." },
          { base: "Umalis na siya.", baseEn: "She already left.", out: "Umalis na pala siya.", outEn: "Oh, she already left." },
          { base: "Kapatid mo.", baseEn: "Your sibling.", out: "Kapatid mo pala.", outEn: "Oh, that's your sibling." },
          { base: "Ganoon.", baseEn: "Like that.", out: "Ganoon pala.", outEn: "Oh, so that's how it is." },
          { base: "Hindi.", baseEn: "No.", out: "Hindi pala.", outEn: "Oh — never mind, it's not." },
          { base: "Oo.", baseEn: "Yes.", out: "Oo pala.", outEn: "Oh right, yes." },
        ],
      },
      {
        id: "daw", label: "daw / raw", ask: "add", rule: SECOND + " daw after a consonant (masarap daw), raw after a vowel (uuwi raw).",
        sense: "daw / raw = reported: they say, she says, apparently. You're passing on someone else's words.",
        items: [
          { base: "Masarap.", baseEn: "It's delicious.", out: "Masarap daw.", outEn: "They say it's delicious." },
          { base: "Uuwi siya.", baseEn: "She's going home.", out: "Uuwi raw siya.", outEn: "She says she's going home." },
          { base: "Dumating na sila.", baseEn: "They've arrived.", out: "Dumating na raw sila.", outEn: "They've arrived, apparently." },
          { base: "Mahal.", baseEn: "Expensive.", out: "Mahal daw.", outEn: "It's expensive, they say." },
          { base: "Hindi siya pupunta.", baseEn: "She's not going.", out: "Hindi raw siya pupunta.", outEn: "She says she's not going." },
          { base: "Bukas.", baseEn: "Tomorrow.", out: "Bukas daw.", outEn: "Tomorrow, they said." },
          { base: "Sarado.", baseEn: "Closed.", out: "Sarado raw.", outEn: "It's closed, apparently." },
          { base: "Kumain na siya.", baseEn: "He's eaten.", out: "Kumain na raw siya.", outEn: "He says he's already eaten." },
          { base: "Wala.", baseEn: "None.", out: "Wala raw.", outEn: "There's none, they say." },
        ],
      },
    ],
  },
  {
    id: "hedge", name: "Hedge / reason", cells: [
      {
        id: "yata", label: "yata", ask: "add", rule: SECOND,
        sense: "yata = I think / it seems: you're not sure, so you soften the claim.",
        items: [
          { base: "Umalis siya.", baseEn: "He left.", out: "Umalis yata siya.", outEn: "I think he left." },
          { base: "Sarado.", baseEn: "Closed.", out: "Sarado yata.", outEn: "I think it's closed." },
          { base: "Uulan.", baseEn: "It'll rain.", out: "Uulan yata.", outEn: "It might rain." },
          { base: "Nandito siya.", baseEn: "She's here.", out: "Nandito yata siya.", outEn: "She's here, I think." },
          { base: "Mali.", baseEn: "Wrong.", out: "Mali yata.", outEn: "That's wrong, I think." },
          { base: "Natutulog sila.", baseEn: "They're sleeping.", out: "Natutulog yata sila.", outEn: "They might be sleeping." },
          { base: "Bukas.", baseEn: "Tomorrow.", out: "Bukas yata.", outEn: "Tomorrow, I think." },
          { base: "Wala.", baseEn: "None.", out: "Wala yata.", outEn: "I don't think there's any." },
          { base: "Kumain na siya.", baseEn: "She's eaten.", out: "Kumain na yata siya.", outEn: "I think she's already eaten." },
        ],
      },
      {
        id: "kasi", label: "kasi", ask: "add", rule: "kasi also takes second position when it explains a whole statement: Pagod kasi ako. (It can also start a clause: Kasi pagod ako.)",
        sense: "kasi = because / it's because…: the reason, offered as the explanation.",
        items: [
          { base: "Pagod ako.", baseEn: "I'm tired.", out: "Pagod kasi ako.", outEn: "It's because I'm tired." },
          { base: "Umulan.", baseEn: "It rained.", out: "Umulan kasi.", outEn: "Because it rained." },
          { base: "Mahal.", baseEn: "Expensive.", out: "Mahal kasi.", outEn: "Because it's expensive." },
          { base: "Late ako.", baseEn: "I'm late.", out: "Late kasi ako.", outEn: "It's because I was late." },
          { base: "Busy siya.", baseEn: "She's busy.", out: "Busy kasi siya.", outEn: "It's because she's busy." },
          { base: "Gutom ako.", baseEn: "I'm hungry.", out: "Gutom kasi ako.", outEn: "It's because I'm hungry." },
          { base: "Sarado.", baseEn: "Closed.", out: "Sarado kasi.", outEn: "Because it's closed." },
          { base: "Malayo.", baseEn: "Far.", out: "Malayo kasi.", outEn: "Because it's far." },
          { base: "Wala akong pera.", baseEn: "I have no money.", out: "Wala kasi akong pera.", outEn: "It's because I have no money." },
        ],
      },
    ],
  },
  {
    id: "combos", name: "Combos", cells: [
      {
        id: "combos", label: "na lang · pa rin · na ba", ask: "which", rule: "Order inside the slot is fixed: na / pa first, then lang / rin / ba. Pronoun still comes before all of them: ka na ba.",
        sense: "Stacked particles: na lang = just settle for it · pa rin = still, even so · na ba = …yet? · sige na nga = fine, alright.",
        items: [
          { base: "Dito.", baseEn: "Here.", out: "Dito na lang.", outEn: "Let's just do it here." },
          { base: "Ako.", baseEn: "Me.", out: "Ako na lang.", outEn: "I'll just do it — let me." },
          { base: "Mamaya.", baseEn: "Later.", out: "Mamaya na lang.", outEn: "Let's just do it later." },
          { base: "Isa.", baseEn: "One.", out: "Isa na lang.", outEn: "Just one more — last one." },
          { base: "Kumain ka?", baseEn: "Did you eat?", out: "Kumain ka na ba?", outEn: "Have you eaten yet?" },
          { base: "Uuwi ka?", baseEn: "Are you going home?", out: "Uuwi ka na ba?", outEn: "Are you going home now?" },
          { base: "Tapos?", baseEn: "Done?", out: "Tapos na ba?", outEn: "Is it done yet?" },
          { base: "Kumakain ako.", baseEn: "I'm eating.", out: "Kumakain pa rin ako.", outEn: "I'm still eating, even so." },
          { base: "Gusto ko.", baseEn: "I like it.", out: "Gusto ko pa rin.", outEn: "I still like it anyway." },
          { base: "Hindi.", baseEn: "No.", out: "Hindi pa rin.", outEn: "Still no." },
          { base: "Sige.", baseEn: "Okay.", out: "Sige na nga.", outEn: "Fine, alright then — you win." },
        ],
      },
    ],
  },
];

export const PARTICLE_CELLS: ParticleCell[] = PARTICLE_GROUPS.flatMap((g) => g.cells);
export const getParticleCell = (id: string) => PARTICLE_CELLS.find((c) => c.id === id);

/** Compare answers loosely: case, punctuation, spacing, and the d/r alternation (din/rin, daw/raw) don't count. */
export function sameSentence(a: string, b: string): boolean {
  const n = (s: string) => s.toLowerCase().replace(/[.,!?'’]/g, "").replace(/\s+/g, " ").trim().replace(/\brin\b/g, "din").replace(/\braw\b/g, "daw");
  return n(a) === n(b);
}

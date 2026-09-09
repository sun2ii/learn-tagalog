// The "system map": the structural skeleton of Tagalog, in the order it pays off.

export const pronouns = {
  note: "Every pronoun has two forms. ANG-form = the spotlight of the sentence. NG-form = the doer/owner when something else is the spotlight (after gusto, and with -in verbs).",
  rows: [
    { en: "I", ang: "ako", ng: "ko", id: "aku / -ku" },
    { en: "you", ang: "ikaw / ka", ng: "mo", id: "engkau / -mu" },
    { en: "he / she", ang: "siya", ng: "niya", id: "dia / -nya" },
    { en: "we (incl. you)", ang: "tayo", ng: "natin", id: "kita" },
    { en: "we (excl. you)", ang: "kami", ng: "namin", id: "kami" },
    { en: "you (plural / polite)", ang: "kayo", ng: "ninyo", id: "kalian" },
    { en: "they", ang: "sila", ng: "nila", id: "mereka" },
  ],
};

export const particles = [
  { t: "na", m: "now / already", ex: "Kain na tayo. · Kumain na ako." },
  { t: "pa", m: "still / not yet", ex: "Hindi pa. · Gutom pa ako." },
  { t: "ba", m: "makes a yes/no question", ex: "Masarap ba? · Kumain ka na ba?" },
  { t: "lang", m: "just / only", ex: "Sa bahay na lang. · Konti lang." },
  { t: "din / rin", m: "also", ex: "Ako rin. · Gusto ko rin." },
  { t: "po / opo", m: "politeness / polite yes", ex: "Salamat po. · Opo." },
  { t: "naman", m: "softener / 'on the other hand'", ex: "Ikaw naman? · Sige naman." },
  { t: "kasi", m: "because", ex: "Gutom kasi ako." },
  { t: "talaga", m: "really", ex: "Masarap talaga." },
  { t: "siguro", m: "maybe (NOT 'sure')", ex: "Siguro bukas." },
];

export const markers = [
  { t: "ang", m: "marks the spotlight noun", ex: "Masarap ang adobo." },
  { t: "ng", m: "marks a non-spotlight noun (thing / doer)", ex: "Gusto ko ng kape." },
  { t: "sa", m: "at / to / in / for", ex: "Sa bahay. · Pupunta sa Manila." },
  { t: "si / sina", m: "'ang' but for names", ex: "Nasaan si Ate?" },
  { t: "ni", m: "'ng' but for names", ex: "Luto ni Ate." },
  { t: "kay", m: "'sa' but for names", ex: "Para kay Kuya." },
];

export const questionWords = [
  { t: "ano", m: "what" },
  { t: "sino", m: "who" },
  { t: "saan", m: "where (action happens)" },
  { t: "nasaan", m: "where is (location)" },
  { t: "kailan", m: "when" },
  { t: "bakit", m: "why" },
  { t: "paano", m: "how" },
  { t: "ilan", m: "how many" },
  { t: "magkano", m: "how much (price)" },
];

// The verb engine: aspect, not tense. Three cells per verb.
export const verbEngine = {
  note: "Tagalog verbs mark ASPECT (done / ongoing / not yet), not tense. Two mechanisms: an affix says WHO is the spotlight; doubling the first syllable says 'incomplete'.",
  rows: [
    { root: "kain", type: "-um-", done: "kumain", ongoing: "kumakain", notyet: "kakain", en: "eat" },
    { root: "inom", type: "-um-", done: "uminom", ongoing: "umiinom", notyet: "iinom", en: "drink" },
    { root: "punta", type: "-um-", done: "pumunta", ongoing: "pumupunta", notyet: "pupunta", en: "go" },
    { root: "alis", type: "-um-", done: "umalis", ongoing: "umaalis", notyet: "aalis", en: "leave" },
    { root: "luto", type: "mag-", done: "nagluto", ongoing: "nagluluto", notyet: "magluluto", en: "cook" },
    { root: "aral", type: "mag-", done: "nag-aral", ongoing: "nag-aaral", notyet: "mag-aaral", en: "study" },
    { root: "Tagalog", type: "mag-", done: "nag-Tagalog", ongoing: "nagta-Tagalog", notyet: "magta-Tagalog", en: "speak Tagalog" },
  ],
  mechanism: [
    "-um- goes INSIDE the root after the first consonant: k-um-ain.",
    "mag- becomes nag- once the action has started (done/ongoing).",
    "Doubling the first syllable = not finished: ku-MA-kain (ongoing), KA-kain (not yet).",
    "Object focus (-in) swaps the spotlight to the thing: 'Kinain ko ang adobo' — the adobo takes 'ang', the eater takes 'ko'.",
  ],
};

export const skeleton = {
  note: "Default order is VERB first, then who, then what. Small words (na, pa, ba, ka, ko, mo) cluster right after the first word.",
  examples: [
    { tl: "Kumain · ako · ng adobo", en: "ate · I · adobo", tag: "verb – doer – thing" },
    { tl: "Kumain · ka · na · ba?", en: "eaten · you · already · ?", tag: "verb + particles glued after it" },
    { tl: "Masarap · ang adobo", en: "delicious · the adobo", tag: "describe – spotlight" },
    { tl: "Gusto · ko · ng kape", en: "want · I · coffee", tag: "gusto takes ng-form doer" },
    { tl: "Nasa kusina · si Ate", en: "in the kitchen · Ate", tag: "location – name" },
  ],
};

export type AnchorRow = { tl: string; other: string; lang: "id" | "es" | "en"; en: string; note?: string };

export const cognates: AnchorRow[] = [
  { tl: "mata", other: "mata", lang: "id", en: "eye" },
  { tl: "anak", other: "anak", lang: "id", en: "child" },
  { tl: "langit", other: "langit", lang: "id", en: "sky" },
  { tl: "lima", other: "lima", lang: "id", en: "five" },
  { tl: "anim", other: "enam", lang: "id", en: "six" },
  { tl: "dalawa", other: "dua", lang: "id", en: "two" },
  { tl: "apat", other: "empat", lang: "id", en: "four" },
  { tl: "sampu", other: "sepuluh", lang: "id", en: "ten" },
  { tl: "takot", other: "takut", lang: "id", en: "afraid" },
  { tl: "sakit", other: "sakit", lang: "id", en: "pain / sick" },
  { tl: "inom", other: "minum", lang: "id", en: "drink" },
  { tl: "bili", other: "beli", lang: "id", en: "buy" },
  { tl: "balik", other: "balik", lang: "id", en: "return" },
  { tl: "tawa", other: "tertawa", lang: "id", en: "laugh" },
  { tl: "ulan", other: "hujan", lang: "id", en: "rain" },
  { tl: "pinto", other: "pintu", lang: "id", en: "door" },
  { tl: "kanan", other: "kanan", lang: "id", en: "right (side)" },
  { tl: "bato", other: "batu", lang: "id", en: "stone" },
  { tl: "apoy", other: "api", lang: "id", en: "fire" },
  { tl: "puti", other: "putih", lang: "id", en: "white" },
  { tl: "itim", other: "hitam", lang: "id", en: "black" },
  { tl: "lalaki", other: "laki-laki", lang: "id", en: "man / male" },
  { tl: "buwan", other: "bulan", lang: "id", en: "moon / month" },
  { tl: "libo", other: "ribu", lang: "id", en: "thousand" },
  { tl: "tulong", other: "tolong", lang: "id", en: "help" },
  { tl: "kumusta", other: "cómo está", lang: "es", en: "how are you" },
  { tl: "mesa / lamesa", other: "mesa", lang: "es", en: "table" },
  { tl: "silya", other: "silla", lang: "es", en: "chair" },
  { tl: "kotse", other: "coche", lang: "es", en: "car" },
  { tl: "kwarto", other: "cuarto", lang: "es", en: "room" },
  { tl: "banyo", other: "baño", lang: "es", en: "bathroom" },
  { tl: "bintana", other: "ventana", lang: "es", en: "window" },
  { tl: "sapatos", other: "zapatos", lang: "es", en: "shoes" },
  { tl: "oras", other: "horas", lang: "es", en: "time / hour" },
  { tl: "alas-dos", other: "a las dos", lang: "es", en: "two o'clock" },
  { tl: "pero", other: "pero", lang: "es", en: "but" },
  { tl: "pwede", other: "puede", lang: "es", en: "can / may" },
  { tl: "gusto", other: "gusto", lang: "es", en: "want / like" },
  { tl: "sige", other: "sigue", lang: "es", en: "okay / go on" },
  { tl: "kutsara / tinidor", other: "cuchara / tenedor", lang: "es", en: "spoon / fork" },
  { tl: "baso", other: "vaso", lang: "es", en: "glass" },
  { tl: "kape", other: "café", lang: "es", en: "coffee" },
  { tl: "intindi", other: "entender", lang: "es", en: "understand" },
];

export const falseFriends: AnchorRow[] = [
  { tl: "kita", other: "kita", lang: "id", en: "TL: 'I → you' (Mahal kita). ID: 'we'." },
  { tl: "salamat", other: "selamat", lang: "id", en: "TL: thanks. ID: safe / greeting." },
  { tl: "susu", other: "susu", lang: "id", en: "TL: breast. ID: milk. Say 'gatas' for milk." },
  { tl: "buko", other: "buku", lang: "id", en: "TL: young coconut. ID: book (TL book = 'libro')." },
  { tl: "mahal", other: "mahal", lang: "id", en: "TL: expensive AND love. ID: expensive only." },
  { tl: "bisa", other: "bisa", lang: "id", en: "TL: venom / effect. ID: can. Say 'pwede' or 'kaya'." },
  { tl: "siguro", other: "seguro", lang: "es", en: "TL: maybe. ES: sure. Opposite confidence!" },
  { tl: "syempre", other: "siempre", lang: "es", en: "TL: of course. ES: always." },
  { tl: "basta", other: "basta", lang: "es", en: "TL: 'as long as / whatever'. ES: enough." },
];

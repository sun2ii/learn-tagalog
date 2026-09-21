// Vocabulary: single words, organised by role and frequency.
// tier 1 = the ~150 words that cover most of what you'll hear. tier 2 = the next ring.
// Verbs carry their three aspect forms as one card. Anchors: id = Indonesian, es = Spanish.

import type { Role } from "./types";

export interface VocabEntry {
  t: string;                 // headword (root for verbs)
  m: string;                 // meaning
  role: Role;
  tier: 1 | 2;
  forms?: [string, string, string];   // verbs: not yet · ongoing · done  (0 → ½ → 1)
  ex?: string;               // example in Tagalog
  exEn?: string;
  anchor?: { lang: "id" | "es"; word: string; note?: string };
  note?: string;
}

export interface VocabGroup { id: string; name: string; scene: string; words: VocabEntry[] }

type V = [string, string, Role, 1 | 2, Partial<VocabEntry>?];
const g = (id: string, name: string, scene: string, rows: V[]): VocabGroup => ({
  id, name, scene, words: rows.map(([t, m, role, tier, extra]) => ({ t, m, role, tier, ...(extra ?? {}) })),
});
const id = (word: string, note?: string) => ({ anchor: { lang: "id" as const, word, note } });
const es = (word: string, note?: string) => ({ anchor: { lang: "es" as const, word, note } });

export const VOCAB: VocabGroup[] = [
  g("verbs-um", "Verbs · -um-", "Root → form: the -um- slips in after the first consonant (kain → kumain, punta → pumunta). Not yet doubles the first syllable with no -um- (kakain); ongoing has both (kumakain); done has -um- only (kumain).", [
    ["kain", "eat", "action", 1, { forms: ["kakain", "kumakain", "kumain"], ex: "Kumain ako ng kanin.", exEn: "I ate rice.", ...id("makan", "different word, same slot") }],
    ["inom", "drink", "action", 1, { forms: ["iinom", "umiinom", "uminom"], ex: "Uminom siya ng tubig.", exEn: "She drank water.", ...id("minum") }],
    ["punta", "go", "action", 1, { forms: ["pupunta", "pumupunta", "pumunta"], ex: "Pupunta kami sa mall.", exEn: "We will go to the mall." }],
    ["uwi", "go home", "action", 1, { forms: ["uuwi", "umuuwi", "umuwi"], ex: "Umuwi na sila.", exEn: "They went home already." }],
    ["alis", "leave", "action", 1, { forms: ["aalis", "umaalis", "umalis"], ex: "Aalis ako bukas.", exEn: "I'm leaving tomorrow." }],
    ["dating", "arrive", "action", 1, { forms: ["darating", "dumarating", "dumating"], ex: "Dumating na si Ate.", exEn: "Ate has arrived." }],
    ["bili", "buy", "action", 1, { forms: ["bibili", "bumibili", "bumili"], ex: "Bumili ako ng mangga.", exEn: "I bought a mango.", ...id("beli") }],
    ["kuha", "get / take", "action", 1, { forms: ["kukuha", "kumukuha", "kumuha"], ex: "Kukuha ako ng tubig.", exEn: "I'll get water." }],
    ["upo", "sit", "action", 1, { forms: ["uupo", "umuupo", "umupo"], ex: "Umupo ka.", exEn: "Sit down." }],
    ["tayo", "stand", "action", 2, { forms: ["tatayo", "tumatayo", "tumayo"], ex: "Tumayo siya.", exEn: "He stood up.", note: "Same spelling as 'tayo' (we) — context decides." }],
    ["takbo", "run", "action", 2, { forms: ["tatakbo", "tumatakbo", "tumakbo"], ex: "Tumakbo ang bata.", exEn: "The child ran." }],
    ["sakay", "ride / board", "action", 1, { forms: ["sasakay", "sumasakay", "sumakay"], ex: "Sumakay kami ng jeep.", exEn: "We rode a jeep." }],
    ["baba", "get off / go down", "action", 1, { forms: ["bababa", "bumababa", "bumaba"], ex: "Bababa ako dito.", exEn: "I'll get off here." }],
    ["tingin", "look", "action", 1, { forms: ["titingin", "tumitingin", "tumingin"], ex: "Tumingin siya sa langit.", exEn: "She looked at the sky." }],
    ["sagot", "answer", "action", 2, { forms: ["sasagot", "sumasagot", "sumagot"], ex: "Sumagot siya agad.", exEn: "She answered right away." }],
    ["tulong", "help", "action", 1, { forms: ["tutulong", "tumutulong", "tumulong"], ex: "Tulong!", exEn: "Help!", ...id("tolong") }],
    ["kanta", "sing", "action", 2, { forms: ["kakanta", "kumakanta", "kumanta"], ex: "Kumanta siya sa jeep.", exEn: "He sang on the jeep.", ...es("canta") }],
    ["tawa", "laugh", "action", 2, { forms: ["tatawa", "tumatawa", "tumawa"], ex: "Tumawa kami.", exEn: "We laughed.", ...id("tertawa") }],
    ["basa", "read", "action", 2, { forms: ["babasa", "bumabasa", "bumasa"], ex: "Bumasa ako ng libro.", exEn: "I read a book." }],
    ["sulat", "write", "action", 2, { forms: ["susulat", "sumusulat", "sumulat"], ex: "Sumulat siya ng liham.", exEn: "She wrote a letter." }],
    ["gawa", "make / do", "action", 1, { forms: ["gagawa", "gumagawa", "gumawa"], ex: "Gumawa kami ng plano.", exEn: "We made a plan." }],
  ]),
  g("verbs-mag", "Verbs · mag-", "Root → form: mag- sits in front (luto → magluluto). Once the action has started, mag- becomes nag- (nagluluto, nagluto). Many English borrowings take this: mag-text, mag-Grab.", [
    ["sabi", "say", "action", 1, { forms: ["magsasabi", "nagsasabi", "nagsabi"], ex: "Sabi ni Ate, kain na.", exEn: "Ate said, let's eat.", note: "'sabi ni X' with no affix = X says. The story word. Object focus (sinabi) is in the -in- group." }],
    ["bigay", "give", "action", 1, { forms: ["magbibigay", "nagbibigay", "nagbigay"], ex: "Nagbigay siya ng regalo.", exEn: "He gave a gift.", note: "mag- verb: mag- → nag- once started." }],
    ["lakad", "walk", "action", 1, { forms: ["maglalakad", "naglalakad", "naglakad"], ex: "Naglakad kami sa parke.", exEn: "We walked in the park." }],
    ["salita", "speak / talk", "action", 1, { forms: ["magsasalita", "nagsasalita", "nagsalita"], ex: "Nagsalita siya nang mabagal.", exEn: "He spoke slowly." }],
    ["tanong", "ask", "action", 1, { forms: ["magtatanong", "nagtatanong", "nagtanong"], ex: "Nagtanong ako sa driver.", exEn: "I asked the driver." }],
    ["hintay", "wait", "action", 1, { forms: ["maghihintay", "naghihintay", "naghintay"], ex: "Maghintay ka dito.", exEn: "Wait here." }],
    ["bayad", "pay", "action", 1, { forms: ["magbabayad", "nagbabayad", "nagbayad"], ex: "Nagbayad na ako.", exEn: "I already paid.", ...id("bayar") }],
    ["luto", "cook", "action", 1, { forms: ["magluluto", "nagluluto", "nagluto"], ex: "Nagluto si Tita ng adobo.", exEn: "Tita cooked adobo." }],
    ["trabaho", "work", "action", 1, { forms: ["magtatrabaho", "nagtatrabaho", "nagtrabaho"], ex: "Nagtatrabaho ako sa bahay.", exEn: "I work from home.", ...es("trabajo") }],
    ["aral", "study", "action", 1, { forms: ["mag-aaral", "nag-aaral", "nag-aral"], ex: "Nag-aaral ako ng Tagalog.", exEn: "I'm studying Tagalog.", ...id("ajar", "belajar") }],
    ["laro", "play", "action", 2, { forms: ["maglalaro", "naglalaro", "naglaro"], ex: "Naglalaro ang mga bata.", exEn: "The kids are playing." }],
  ]),
  g("verbs-ma", "Verbs · ma-", "Root → form: ma- in front, becoming na- once started (tulog → matutulog · natutulog · natulog). Often states and perceptions: sleep, see, hear, understand.", [
    ["gising", "wake up", "action", 1, { forms: ["magigising", "nagigising", "nagising"], ex: "Nagising ako nang alas-sais.", exEn: "I woke up at six." }],
    ["tulog", "sleep", "action", 1, { forms: ["matutulog", "natutulog", "natulog"], ex: "Natulog ako nang maaga.", exEn: "I slept early.", note: "ma- verb: ma- → na- once started." }],
    ["kita", "see", "action", 1, { forms: ["makikita", "nakikita", "nakita"], ex: "Nakita ko si Kuya.", exEn: "I saw Kuya.", note: "Object-focus by default: nakita KO." }],
    ["kinig", "listen", "action", 2, { forms: ["makikinig", "nakikinig", "nakinig"], ex: "Nakikinig ako ng musika.", exEn: "I'm listening to music." }],
    ["intindi", "understand", "action", 1, { forms: ["maiintindihan", "naiintindihan", "naintindihan"], ex: "Naiintindihan ko.", exEn: "I understand.", ...es("entender") }],
    ["ligo", "bathe / shower", "action", 2, { forms: ["maliligo", "naliligo", "naligo"], ex: "Maliligo muna ako.", exEn: "I'll shower first." }],
  ]),
  g("verbs-in", "Verbs · -in- (object focus)", "Same roots, the THING in focus. -in- says 'the object is the spotlight': it takes ang, the doer takes ko/mo/niya. Not yet: doubled + -in ending (kakainin) · ongoing: -in- inside + doubled (kinakain) · done: -in- inside (kinain). This is the form ano forces: Ano ang kinain mo?", [
    ["kain", "eat (object focus)", "action", 1, { forms: ["kakainin", "kinakain", "kinain"], ex: "Kinain ko ang adobo.", exEn: "I ate the adobo." }],
    ["inom", "drink (object focus)", "action", 1, { forms: ["iinumin", "iniinom", "ininom"], ex: "Ininom niya ang kape.", exEn: "She drank the coffee." }],
    ["bili", "buy (object focus)", "action", 1, { forms: ["bibilhin", "binibili", "binili"], ex: "Binili ko ang tsinelas.", exEn: "I bought the flip-flops." }],
    ["kuha", "get / take (object focus)", "action", 1, { forms: ["kukunin", "kinukuha", "kinuha"], ex: "Kinuha ni Ben ang payong.", exEn: "Ben took the umbrella." }],
    ["gawa", "make / do (object focus)", "action", 1, { forms: ["gagawin", "ginagawa", "ginawa"], ex: "Ano ang ginagawa mo?", exEn: "What are you doing?" }],
    ["luto", "cook (object focus)", "action", 1, { forms: ["lulutuin", "niluluto", "niluto"], ex: "Niluto ni Tita ang adobo.", exEn: "Tita cooked the adobo.", note: "l-in-uto → niluto: with l/r/y roots, -in- comes out as ni-." }],
    ["sulat", "write (object focus)", "action", 2, { forms: ["susulatin", "sinusulat", "sinulat"], ex: "Sinulat niya ang pangalan.", exEn: "He wrote the name." }],
    ["basa", "read (object focus)", "action", 2, { forms: ["babasahin", "binabasa", "binasa"], ex: "Binasa ko ang libro.", exEn: "I read the book." }],
    ["kanta", "sing (object focus)", "action", 2, { forms: ["kakantahin", "kinakanta", "kinanta"], ex: "Kinanta niya ang 'My Way'.", exEn: "He sang 'My Way'." }],
    ["hintay", "wait for (object focus)", "action", 2, { forms: ["hihintayin", "hinihintay", "hinintay"], ex: "Hinintay kita.", exEn: "I waited for you." }],
    ["sabi", "say (object focus)", "action", 1, { forms: ["sasabihin", "sinasabi", "sinabi"], ex: "Ano ang sinabi niya?", exEn: "What did she say?" }],
    ["gising", "wake up (object focus)", "action", 2, { forms: ["gigisingin", "ginigising", "ginising"], ex: "Ginising ko si Kuya.", exEn: "I woke Kuya up." }],
    ["tanong", "ask (object focus)", "action", 1, { forms: ["tatanungin", "tinatanong", "tinanong"], ex: "Tinanong ko ang driver.", exEn: "I asked the driver.", note: "o → u before the -in ending: tatanungin." }],
    ["sagot", "answer (object focus)", "action", 2, { forms: ["sasagutin", "sinasagot", "sinagot"], ex: "Sinagot niya ang tanong.", exEn: "She answered the question.", note: "o → u before the -in ending: sasagutin." }],
    ["laro", "play (object focus)", "action", 2, { forms: ["lalaruin", "nilalaro", "nilaro"], ex: "Nilaro namin ang basketball.", exEn: "We played basketball.", note: "l-initial roots take ni- instead of -in- (like luto → niluto)." }],
    ["aral", "study (object focus)", "action", 1, { forms: ["aaralin", "inaaral", "inaral"], ex: "Inaral ko ang Tagalog.", exEn: "I studied Tagalog.", note: "Vowel-initial root: -in- sits in front as in-." }],
  ]),
  g("verbs-none", "Verbs · no forms", "These never change shape. They take the ng-form doer (gusto KO, kailangan MO) and sit in front of another verb or a noun.", [
    ["alam", "know (a fact)", "action", 1, { ex: "Hindi ko alam.", exEn: "I don't know.", note: "No aspect forms — 'alam ko' = I know." }],
    ["gusto", "want / like", "action", 1, { ex: "Gusto ko ng kape.", exEn: "I want coffee.", note: "Takes the ng-form doer: gusto KO, gusto MO.", ...es("gusto") }],
    ["ayaw", "don't want", "action", 1, { ex: "Ayaw ko.", exEn: "I don't want to.", note: "The negative of gusto. Also ng-form doer." }],
    ["kailangan", "need", "action", 1, { ex: "Kailangan ko ng tubig.", exEn: "I need water." }],
    ["pwede", "can / may", "action", 1, { ex: "Pwede ba?", exEn: "May I? / Is it okay?", ...es("puede") }],
  ]),
  g("pronouns", "Pronouns & markers", "Two forms per pronoun. The markers say who is in focus.", [
    ["ako / ko", "I / me", "person", 1, { note: "ako = in focus (ang-form) · ko = doer when something else is in focus (ng-form).", ...id("aku") }],
    ["ikaw · ka / mo", "you", "person", 1, { note: "ikaw at the start, ka after a word; mo = ng-form." }],
    ["siya / niya", "he, she", "person", 1, { note: "No gender. siya = ang-form, niya = ng-form.", ...id("dia") }],
    ["kami / namin", "we (not you)", "person", 1, { note: "Exclusive: the listener is out.", ...id("kami") }],
    ["tayo / natin", "we (with you)", "person", 1, { note: "Inclusive: the listener is in. Kain tayo!", ...id("kita", "Tagalog 'kita' means I→you") }],
    ["kayo / ninyo", "you all · you (polite)", "person", 1, { note: "Also the polite singular for elders." }],
    ["sila / nila", "they", "person", 1, { note: "sila = ang-form, nila = ng-form." }],
    ["kita", "I → you", "person", 1, { ex: "Mahal kita.", exEn: "I love you.", note: "One word for 'I (do it to) you'. Not 'we' like Indonesian." }],
    ["ito / iyan / iyon", "this / that (near you) / that (far)", "thing", 1, { note: "Three distances. Colloquial: 'yan, 'yon." }],
    ["dito / diyan / doon", "here / there / over there", "time", 1, { note: "Same three distances, for places." }],
    ["ang", "marks the thing in focus", "particle", 1, { ex: "Masarap ang adobo.", exEn: "The adobo is delicious." }],
    ["ng", "marks a thing not in focus", "particle", 1, { ex: "Kumain ako ng adobo.", exEn: "I ate (some) adobo.", note: "Said 'nang'." }],
    ["sa", "at / to / in / for", "particle", 1, { ex: "Pupunta ako sa Manila.", exEn: "I'll go to Manila." }],
    ["si / ni / kay", "ang / ng / sa — for names", "particle", 1, { ex: "Nasaan si Ate? · Luto ni Ate · Para kay Kuya", exEn: "Where's Ate? · Ate's cooking · For Kuya" }],
    ["mga", "plural marker", "particle", 1, { ex: "mga bata", exEn: "kids", note: "Pronounced 'manga'." }],
    ["may / wala", "there is / there is none", "particle", 1, { ex: "May tubig ba? Wala.", exEn: "Is there water? None." }],
    ["nasa / nasaan", "is at / where is", "particle", 1, { ex: "Nasa bahay siya. Nasaan ang CR?", exEn: "He's at home. Where's the restroom?" }],
  ]),
  g("particles", "Particles & question words", "The tiny words that carry the meaning. They sit right after the first word.", [
    ["na", "now / already", "particle", 1, { ex: "Kumain na ako.", exEn: "I already ate." }],
    ["pa", "still / yet", "particle", 1, { ex: "Hindi pa.", exEn: "Not yet." }],
    ["ba", "yes / no question marker", "question", 1, { ex: "Masarap ba?", exEn: "Is it good?" }],
    ["hindi", "not / no", "particle", 1, { ex: "Hindi ako kumain.", exEn: "I didn't eat.", ...id("tidak", "different word") }],
    ["oo / opo", "yes / yes (polite)", "particle", 1]
    ,
    ["po", "politeness", "particle", 1, { note: "Add to almost anything with elders, staff, strangers." }],
    ["lang", "just / only", "particle", 1, { ex: "Konti lang.", exEn: "Just a little." }],
    ["din / rin", "also", "particle", 1, { ex: "Ako rin.", exEn: "Me too.", note: "din after a consonant, rin after a vowel." }],
    ["naman", "softener / on the other hand", "particle", 1, { ex: "Ikaw naman?", exEn: "And you?" }],
    ["kasi", "because", "particle", 1, { ex: "Gutom kasi ako.", exEn: "Because I'm hungry." }],
    ["talaga", "really", "particle", 1, { ex: "Masarap talaga.", exEn: "Really delicious." }],
    ["siguro", "maybe", "particle", 1, { note: "NOT 'sure' — opposite of Spanish seguro.", ...es("seguro", "meaning flipped") }],
    ["at", "and", "particle", 1]
    ,
    ["pero", "but", "particle", 1, { ...es("pero") }],
    ["o", "or", "particle", 2, { ...es("o") }],
    ["kaya", "so / therefore · can", "particle", 2, { ex: "Kaya ko.", exEn: "I can (do it)." }],
    ["ano", "what", "question", 1, { ...id("apa", "different word") }],
    ["sino", "who", "question", 1],
    ["saan", "where (it happens)", "question", 1],
    ["kailan", "when", "question", 1],
    ["bakit", "why", "question", 1],
    ["paano", "how", "question", 1],
    ["ilan", "how many", "question", 1],
    ["magkano", "how much (price)", "question", 1],
    ["alin", "which", "question", 2],
  ]),
  g("numbers-time", "Numbers & time", "Native numbers for counting; Spanish numbers for prices and clock time.", [
    ["isa", "one", "describe", 1, { ...id("satu") }], ["dalawa", "two", "describe", 1, { ...id("dua") }], ["tatlo", "three", "describe", 1, { ...id("tiga") }],
    ["apat", "four", "describe", 1, { ...id("empat") }], ["lima", "five", "describe", 1, { ...id("lima") }], ["anim", "six", "describe", 1, { ...id("enam") }],
    ["pito", "seven", "describe", 1], ["walo", "eight", "describe", 1], ["siyam", "nine", "describe", 1], ["sampu", "ten", "describe", 1, { ...id("sepuluh") }],
    ["bente / trenta / singkwenta / isang daan", "20 / 30 / 50 / 100", "describe", 1, { note: "Prices: Spanish. Counting things: native. Both are normal." }],
    ["piso", "peso", "thing", 1, { ex: "Singkwenta pesos.", exEn: "Fifty pesos." }],
    ["ngayon", "now / today", "time", 1], ["kahapon", "yesterday", "time", 1], ["bukas", "tomorrow", "time", 1], ["mamaya", "later (today)", "time", 1],
    ["kanina", "earlier (today)", "time", 1], ["umaga", "morning", "time", 1], ["tanghali", "noon", "time", 1], ["hapon", "afternoon", "time", 1], ["gabi", "night / evening", "time", 1],
    ["araw", "day / sun", "time", 1], ["linggo", "week / Sunday", "time", 1, { ...es("domingo") }], ["buwan", "month / moon", "time", 1, { ...id("bulan") }], ["taon", "year", "time", 1, { ...id("tahun") }],
    ["oras", "time / hour", "time", 1, { ...es("horas") }], ["alas-dos", "two o'clock", "time", 1, { note: "alas + Spanish number: alas-tres, alas-sais.", ...es("a las dos") }],
    ["lagi", "always", "time", 2], ["minsan", "sometimes", "time", 2], ["agad", "right away", "time", 2], ["mamayang gabi", "later tonight", "time", 2],
  ]),
  g("food", "Food & drink", "Ordering, cooking, the table.", [
    ["kanin", "cooked rice", "thing", 1, { note: "bigas = uncooked rice, palay = the plant." }], ["ulam", "the dish eaten with rice", "thing", 1], ["tubig", "water", "thing", 1],
    ["kape", "coffee", "thing", 1, { ...es("café") }], ["gatas", "milk", "thing", 1, { note: "Not 'susu' — that means breast here." }], ["tinapay", "bread", "thing", 1], ["itlog", "egg", "thing", 1],
    ["manok", "chicken", "thing", 1], ["baboy", "pork / pig", "thing", 1, { ...id("babi") }], ["baka", "beef / cow", "thing", 1, { ...es("vaca") }], ["isda", "fish", "thing", 1, { ...id("ikan", "different word") }],
    ["hipon", "shrimp", "thing", 2], ["gulay", "vegetables", "thing", 1], ["prutas", "fruit", "thing", 1, { ...es("frutas") }], ["mangga", "mango", "thing", 1], ["saging", "banana", "thing", 1],
    ["niyog / buko", "coconut / young coconut", "thing", 1, { note: "Indonesian 'buku' = book. Here it's a coconut." }], ["asukal", "sugar", "thing", 2, { ...es("azúcar") }], ["asin", "salt", "thing", 2],
    ["adobo", "adobo", "thing", 1], ["sinigang", "sour soup", "thing", 1], ["pancit", "noodles", "thing", 1], ["lumpia", "spring roll", "thing", 1], ["halo-halo", "shaved-ice dessert", "thing", 2],
    ["masarap", "delicious", "describe", 1], ["maanghang", "spicy", "describe", 1], ["matamis", "sweet", "describe", 1], ["maalat", "salty", "describe", 2], ["mainit / malamig", "hot / cold", "describe", 1],
    ["gutom", "hungry", "describe", 1], ["uhaw", "thirsty", "describe", 1], ["busog", "full", "describe", 1],
    ["almusal", "breakfast", "thing", 1, { ...es("almorzar") }], ["tanghalian", "lunch", "thing", 1], ["hapunan", "dinner", "thing", 1], ["merienda", "snack", "thing", 1, { ...es("merienda") }],
    ["kutsara / tinidor", "spoon / fork", "thing", 2, { ...es("cuchara / tenedor") }], ["baso", "glass", "thing", 2, { ...es("vaso") }], ["plato", "plate", "thing", 2, { ...es("plato") }],
  ]),
  g("places", "Places & getting around", "Where things are and how to get there.", [
    ["bahay", "house / home", "thing", 1], ["kwarto", "room", "thing", 1, { ...es("cuarto") }], ["banyo / CR", "bathroom / restroom", "thing", 1, { ...es("baño") }], ["kusina", "kitchen", "thing", 1, { ...es("cocina") }],
    ["tindahan", "store", "thing", 1], ["palengke", "market", "thing", 1], ["mall", "mall", "thing", 1], ["simbahan", "church", "thing", 1], ["ospital", "hospital", "thing", 1, { ...es("hospital") }],
    ["paaralan / eskwela", "school", "thing", 2, { ...es("escuela") }], ["opisina", "office", "thing", 2, { ...es("oficina") }], ["airport", "airport", "thing", 1], ["dagat", "sea", "thing", 1], ["bundok", "mountain", "thing", 2],
    ["kalye", "street", "thing", 1, { ...es("calle") }], ["daan", "road / way", "thing", 1], ["kanto", "corner", "thing", 1, { ...es("canto") }], ["labas / loob", "outside / inside", "thing", 1], ["taas / baba", "up / down", "thing", 1],
    ["kanan / kaliwa", "right / left", "describe", 1, { ...id("kanan") }], ["diretso", "straight ahead", "describe", 1, { ...es("derecho") }], ["malapit / malayo", "near / far", "describe", 1],
    ["jeep", "jeepney", "thing", 1], ["tricycle", "tricycle", "thing", 1], ["kotse", "car", "thing", 1, { ...es("coche") }], ["bus", "bus", "thing", 1], ["sakayan", "stop / terminal", "thing", 1],
    ["bayad", "fare / payment", "thing", 1], ["sukli", "change (money back)", "thing", 1], ["barya", "coins / small change", "thing", 1], ["pera", "money", "thing", 1, { ...es("perra", "old coin slang") }],
  ]),
  g("people", "People & family", "Who's who — and the words you use for strangers too.", [
    ["tao", "person / people", "thing", 1], ["lalaki / babae", "man / woman", "person", 1, { ...id("laki-laki") }], ["bata", "child", "person", 1], ["kaibigan", "friend", "person", 1],
    ["nanay / tatay", "mom / dad", "person", 1], ["ina / ama", "mother / father (formal)", "person", 2], ["anak", "child (offspring)", "person", 1, { ...id("anak") }], ["kapatid", "sibling", "person", 1],
    ["kuya / ate", "older brother / sister", "person", 1, { note: "Also for any slightly older stranger: waiter, driver, cashier." }], ["bunso", "youngest", "person", 2],
    ["lolo / lola", "grandpa / grandma", "person", 1], ["tito / tita", "uncle / aunt", "person", 1, { note: "Any adult of your parents' generation.", ...es("tío / tía") }], ["pinsan", "cousin", "person", 2], ["asawa", "spouse", "person", 1],
    ["nobyo / nobya", "boyfriend / girlfriend", "person", 2, { note: "Everyone actually says 'boyfriend' / 'girlfriend'.", ...es("novio / novia") }], ["pamilya", "family", "thing", 1, { ...es("familia") }],
    ["guro / titser", "teacher", "person", 2], ["doktor", "doctor", "person", 1], ["driver", "driver", "person", 1], ["tindera / tindero", "vendor (f / m)", "person", 1],
    ["pangalan", "name", "thing", 1, { ex: "Ano ang pangalan mo?", exEn: "What's your name?" }], ["bisita", "guest / visitor", "person", 2, { ...es("visita") }],
  ]),
  g("adjectives", "Describing", "Most start with ma-: ma- + root = 'having that quality'.", [
    ["maganda", "beautiful / good", "describe", 1], ["mabuti", "good / well", "describe", 1], ["masaya", "happy / fun", "describe", 1], ["malungkot", "sad", "describe", 1],
    ["malaki / maliit", "big / small", "describe", 1], ["mahaba / maikli", "long / short", "describe", 2], ["mataas / mababa", "tall, high / short, low", "describe", 2],
    ["mabilis / mabagal", "fast / slow", "describe", 1], ["mahal / mura", "expensive / cheap", "describe", 1, { note: "'mahal' is also 'love'." }], ["bago / luma", "new / old (things)", "describe", 1, { ...id("baru") }],
    ["bata / matanda", "young / old (people)", "describe", 1], ["malinis / marumi", "clean / dirty", "describe", 1], ["madali / mahirap", "easy / hard (also: poor)", "describe", 1],
    ["marami / konti", "many / few, a little", "describe", 1], ["pagod", "tired", "describe", 1], ["okay lang", "fine / okay", "describe", 1], ["sira", "broken", "describe", 1],
    ["puno", "full (container)", "describe", 2], ["totoo", "true / real", "describe", 2], ["mali / tama", "wrong / right", "describe", 1, { ex: "Tama!", exEn: "Correct!" }],
    ["maingay / tahimik", "noisy / quiet", "describe", 2], ["mabango / mabaho", "fragrant / smelly", "describe", 2], ["basa / tuyo", "wet / dry", "describe", 2, { ...id("basah") }],
  ]),
  g("objects", "Everyday objects", "Things you'll ask for, lose, or buy.", [
    ["phone / cellphone", "phone", "thing", 1], ["bag", "bag", "thing", 1], ["wallet / pitaka", "wallet", "thing", 1], ["susi", "key", "thing", 1], ["damit", "clothes", "thing", 1],
    ["sapatos", "shoes", "thing", 1, { ...es("zapatos") }], ["tsinelas", "flip-flops", "thing", 1, { ...es("chinelas") }], ["payong", "umbrella", "thing", 1, { ...id("payung") }], ["tubig", "water", "thing", 1],
    ["libro", "book", "thing", 1, { ...es("libro") }], ["papel", "paper", "thing", 2, { ...es("papel") }], ["mesa", "table", "thing", 1, { ...es("mesa") }], ["upuan / silya", "chair", "thing", 1, { ...es("silla") }],
    ["kama", "bed", "thing", 1, { ...es("cama") }], ["pinto", "door", "thing", 1, { ...id("pintu") }], ["bintana", "window", "thing", 2, { ...es("ventana") }], ["ilaw", "light", "thing", 1],
    ["tiket", "ticket", "thing", 1], ["regalo", "gift", "thing", 1, { ...es("regalo") }], ["gamot", "medicine", "thing", 1], ["tuwalya", "towel", "thing", 2, { ...es("toalla") }], ["sabon", "soap", "thing", 2, { ...es("jabón") }],
  ]),
  g("body-feelings", "Body & feelings", "For when something hurts, or something is wonderful.", [
    ["ulo", "head", "thing", 1], ["mata", "eye", "thing", 1, { ...id("mata") }], ["tenga", "ear", "thing", 2], ["ilong", "nose", "thing", 2], ["bibig", "mouth", "thing", 2], ["ngipin", "tooth", "thing", 2],
    ["kamay", "hand", "thing", 1], ["paa", "foot / leg", "thing", 1], ["tiyan", "stomach", "thing", 1], ["likod", "back", "thing", 2], ["puso", "heart", "thing", 1], ["katawan", "body", "thing", 2],
    ["masakit", "painful / hurts", "describe", 1, { ex: "Masakit ang ulo ko.", exEn: "My head hurts.", ...id("sakit") }], ["may sakit", "sick", "describe", 1], ["lagnat", "fever", "thing", 2], ["ubo / sipon", "cough / cold", "thing", 2],
    ["takot", "afraid", "describe", 1, { ...id("takut") }], ["galit", "angry", "describe", 1], ["inis", "annoyed", "describe", 2], ["hiya", "shy / embarrassed", "describe", 1, { note: "A core cultural word — 'nakakahiya' = how embarrassing." }],
    ["mahal", "love", "describe", 1, { ex: "Mahal kita.", exEn: "I love you." }], ["miss", "miss (someone)", "action", 1, { ex: "Miss na kita.", exEn: "I miss you already.", note: "Taglish, and completely standard." }],
    ["saya", "joy", "thing", 1, { ex: "Ang saya!", exEn: "So fun!" }], ["antok", "sleepiness", "thing", 1, { ex: "Inaantok ako.", exEn: "I'm sleepy." }],
  ]),
];

export const vocabId = (w: VocabEntry) => (w.m.includes("object focus") ? `vocab:${w.t}:of` : `vocab:${w.t}`);
export const getVocabGroup = (id: string) => VOCAB.find((g) => g.id === id);
export const ALL_VOCAB = VOCAB.flatMap((g) => g.words);

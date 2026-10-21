// Practice deeper, per journey: SUBSTITUTE (same grammar, new words), RECOMBINE (new
// situation, pick the connectors yourself), CREATE (describe a situation freely).
// Keyed by journey id; merged into JOURNEYS in ./sentences.ts.
//
// Every exercise reuses only the connectors its journey taught. Vocabulary stays small
// and conversational so the learner's attention is on how the ideas connect.

import type { JourneyPractice } from "./sentences";

export const PRACTICE: Record<string, JourneyPractice> = {
  /* ---------------- 1 · Going somewhere ---------------- */
  "going-somewhere": {
    substitute: [
      {
        original: { tagalog: "Galing ako sa bahay, papunta sa mall kasama ang kaibigan ko", indonesian: "Aku dari rumah, menuju mal bersama temanku" },
        indonesian: "Aku dari kantor, menuju pasar bersama ibuku.",
        tagalog: "Galing ako sa opisina, papunta sa palengke kasama ang nanay ko.",
        acceptedAnswers: ["Galing ako sa opisina, papunta sa palengke kasama ng nanay ko."],
        grammarFocus: "GALING SA + PLACE, PAPUNTA SA + PLACE, KASAMA ANG + PERSON",
        explanation: "The frame is untouched: origin, destination, companion. Only the two places and the person changed. ang still marks the companion.",
        connectors: ["galing-sa", "papunta-sa", "kasama"],
        vocabulary: [{ tagalog: "opisina", indonesian: "kantor" }, { tagalog: "palengke", indonesian: "pasar" }, { tagalog: "nanay", indonesian: "ibu" }, { tagalog: "ko", indonesian: "-ku" }],
      },
      {
        original: { tagalog: "pero dadaan muna ako sa tindahan para bumili ng tubig", indonesian: "tapi aku akan mampir dulu ke toko untuk membeli air" },
        indonesian: "Tapi aku akan mampir dulu ke bank untuk mengambil uang.",
        tagalog: "Pero dadaan muna ako sa bangko para kumuha ng pera.",
        grammarFocus: "PERO + VERB + MUNA + ACTOR, PARA + VERB + NG + THING",
        explanation: "muna still sits right after dadaan. para still takes a bare verb, kumuha, and ng still marks the thing taken.",
        connectors: ["pero", "muna", "para"],
        vocabulary: [{ tagalog: "dadaan", indonesian: "akan mampir", build: "da~ + daan", root: "daan = lewat" }, { tagalog: "bangko", indonesian: "bank" }, { tagalog: "kumuha", indonesian: "mengambil", build: "k + um + uha", root: "kuha = ambil" }, { tagalog: "pera", indonesian: "uang" }],
      },
      {
        original: { tagalog: "para bumili ng tubig bago kami kumain", indonesian: "untuk membeli air sebelum kami makan" },
        indonesian: "Aku pulang dulu untuk mandi sebelum kami pergi.",
        tagalog: "Uuwi muna ako para maligo bago kami umalis.",
        grammarFocus: "VERB + MUNA + ACTOR, PARA + VERB, BAGO + ACTOR + VERB",
        explanation: "Three relations in one breath: muna (first), para (purpose), bago (before). The verbs after para and bago stay bare: maligo, umalis.",
        connectors: ["muna", "para", "bago"],
        vocabulary: [{ tagalog: "uuwi", indonesian: "akan pulang", build: "u~ + uwi", root: "uwi = pulang" }, { tagalog: "maligo", indonesian: "mandi", build: "ma + ligo", root: "ligo = mandi" }, { tagalog: "kami", indonesian: "kami" }, { tagalog: "umalis", indonesian: "pergi", build: "um + alis", root: "alis = pergi" }],
      },
    ],
    recombine: [
      {
        indonesian: "Aku dari sekolah, tapi aku akan mampir dulu ke toko.",
        tagalog: "Galing ako sa paaralan, pero dadaan muna ako sa tindahan.",
        connectors: ["galing-sa", "pero", "muna"],
        explanation: [
          { connector: "galing-sa", note: "Where you are coming from opens the sentence." },
          { connector: "pero", note: "Contrast: you are on your way, yet you are not going straight there." },
          { connector: "muna", note: "The stop comes first, before the rest of the trip." },
        ],
        vocabulary: [{ tagalog: "paaralan", indonesian: "sekolah" }, { tagalog: "dadaan", indonesian: "akan mampir", build: "da~ + daan", root: "daan = lewat" }, { tagalog: "tindahan", indonesian: "toko" }],
      },
      {
        indonesian: "Aku menuju pasar bersama ayahku untuk membeli ikan sebelum makan.",
        tagalog: "Papunta ako sa palengke kasama ang tatay ko para bumili ng isda bago kumain.",
        acceptedAnswers: ["Papunta ako sa palengke kasama ng tatay ko para bumili ng isda bago kumain."],
        connectors: ["papunta-sa", "kasama", "para", "bago"],
        explanation: [
          { connector: "papunta-sa", note: "Destination, with the actor right after papunta." },
          { connector: "kasama", note: "Who comes along. ang marks the person." },
          { connector: "para", note: "Purpose of the trip. The verb after it is bare: bumili." },
          { connector: "bago", note: "Sequence: the buying happens before the eating. Bare verb again: kumain." },
        ],
        vocabulary: [{ tagalog: "palengke", indonesian: "pasar" }, { tagalog: "tatay", indonesian: "ayah" }, { tagalog: "bumili", indonesian: "membeli", build: "b + um + ili", root: "bili = beli" }, { tagalog: "isda", indonesian: "ikan" }, { tagalog: "kumain", indonesian: "makan", build: "k + um + ain", root: "kain = makan" }],
      },
      {
        indonesian: "Aku dari gym, tapi aku akan mampir dulu ke rumah temanku untuk mengambil tas sebelum pergi ke kantor.",
        tagalog: "Galing ako sa gym, pero dadaan muna ako sa bahay ng kaibigan ko para kumuha ng bag bago pumunta sa opisina.",
        connectors: ["galing-sa", "pero", "muna", "para", "bago"],
        explanation: [
          { connector: "galing-sa", note: "Origin first." },
          { connector: "pero", note: "Contrast: a detour before the office." },
          { connector: "muna", note: "The detour comes first; it sits right after dadaan." },
          { connector: "para", note: "Why the detour. Bare verb: kumuha." },
          { connector: "bago", note: "Before the last leg. Bare verb: pumunta." },
        ],
        vocabulary: [{ tagalog: "bahay ng kaibigan ko", indonesian: "rumah temanku" }, { tagalog: "kumuha", indonesian: "mengambil", build: "k + um + uha", root: "kuha = ambil" }, { tagalog: "bag", indonesian: "tas" }, { tagalog: "pumunta", indonesian: "pergi", build: "p + um + unta", root: "punta = pergi" }, { tagalog: "opisina", indonesian: "kantor" }],
      },
    ],
    create: [
      {
        situation: ["You just left the office.", "You are meeting a friend at the mall.", "You need to stop at the store first."],
        task: "Say where you are coming from, where you are going, and what you will do first.",
        exampleAnswer: "Galing ako sa opisina, papunta sa mall kasama ang kaibigan ko, pero dadaan muna ako sa tindahan.",
        exampleIndonesian: "Aku dari kantor, menuju mal bersama temanku, tapi aku akan mampir dulu ke toko.",
        connectors: ["galing-sa", "papunta-sa", "kasama", "pero", "muna"],
        explanation: "Origin and destination carry the frame. pero turns toward the detour; muna puts it first. Your version can swap any place or person, as long as those joints hold.",
      },
      {
        situation: ["You are heading home.", "You want to buy bread on the way.", "You will eat before you sleep."],
        task: "Say what you will do on the way, and what happens before you sleep.",
        exampleAnswer: "Uuwi ako, pero dadaan muna ako sa tindahan para bumili ng tinapay bago matulog.",
        exampleIndonesian: "Aku akan pulang, tapi aku akan mampir dulu ke toko untuk membeli roti sebelum tidur.",
        connectors: ["pero", "muna", "para", "bago"],
        explanation: "pero for the detour, muna for its order, para for its purpose, bago for what comes last. Compare where your connectors sit in the clause.",
      },
    ],
  },

  /* ---------------- 2 · A long day ---------------- */
  "a-long-day": {
    substitute: [
      {
        original: { tagalog: "Gumising ako nang maaga dahil may meeting ako", indonesian: "Aku bangun pagi-pagi karena ada rapat" },
        indonesian: "Aku pulang lebih awal karena capek.",
        tagalog: "Umuwi ako nang maaga dahil pagod ako.",
        grammarFocus: "ACTION + DAHIL + REASON",
        explanation: "Same frame: action, dahil, reason. nang maaga still says how. The reason is now a state, pagod ako, instead of may meeting ako.",
        connectors: ["dahil"],
        vocabulary: [{ tagalog: "umuwi", indonesian: "pulang", build: "um + uwi", root: "uwi = pulang" }, { tagalog: "nang maaga", indonesian: "lebih awal / pagi-pagi" }, { tagalog: "pagod", indonesian: "capek" }],
      },
      {
        original: { tagalog: "pero pagod pa rin ako, kaya iinom muna ako ng kape", indonesian: "tapi aku masih capek, jadi aku minum kopi dulu" },
        indonesian: "Tapi aku masih lapar, jadi aku makan roti dulu.",
        tagalog: "Pero gutom pa rin ako, kaya kakain muna ako ng tinapay.",
        grammarFocus: "PERO + STATE + PA RIN + ACTOR, KAYA + VERB + MUNA + ACTOR",
        explanation: "pa rin still follows the state word; muna still follows the verb. Only gutom, kakain and tinapay are new.",
        connectors: ["pero", "pa-rin", "kaya", "muna"],
        vocabulary: [{ tagalog: "gutom", indonesian: "lapar" }, { tagalog: "kakain", indonesian: "makan / akan makan", build: "ka~ + kain", root: "kain = makan" }, { tagalog: "tinapay", indonesian: "roti" }],
      },
      {
        original: { tagalog: "kaya iinom muna ako ng kape bago pumunta sa opisina", indonesian: "jadi aku minum kopi dulu sebelum pergi ke kantor" },
        indonesian: "Jadi aku mandi dulu sebelum pergi ke sekolah.",
        tagalog: "Kaya maliligo muna ako bago pumunta sa paaralan.",
        grammarFocus: "KAYA + VERB + MUNA + ACTOR, BAGO + VERB + SA + PLACE",
        explanation: "kaya opens the result, muna orders it, bago closes with a bare verb. Only the verb and the place changed.",
        connectors: ["kaya", "muna", "bago"],
        vocabulary: [{ tagalog: "maliligo", indonesian: "mandi / akan mandi", build: "ma + li~ + ligo", root: "ligo = mandi" }, { tagalog: "pumunta", indonesian: "pergi", build: "p + um + unta", root: "punta = pergi" }, { tagalog: "paaralan", indonesian: "sekolah" }],
      },
    ],
    recombine: [
      {
        indonesian: "Aku bangun terlambat karena capek, jadi aku nggak sarapan.",
        tagalog: "Gumising ako nang late dahil pagod ako, kaya hindi ako nag-almusal.",
        acceptedAnswers: ["Late akong gumising dahil pagod ako, kaya hindi ako nag-almusal."],
        connectors: ["dahil", "kaya"],
        explanation: [
          { connector: "dahil", note: "The reason for waking late." },
          { connector: "kaya", note: "The consequence: no breakfast. hindi pulls ako in front of the verb." },
        ],
        vocabulary: [{ tagalog: "gumising", indonesian: "bangun", build: "g + um + ising", root: "gising = bangun" }, { tagalog: "nang late", indonesian: "terlambat" }, { tagalog: "pagod", indonesian: "capek" }, { tagalog: "nag-almusal", indonesian: "sarapan", build: "nag + almusal", root: "almusal = sarapan" }],
      },
      {
        indonesian: "Aku lapar, tapi aku masih bekerja, jadi aku akan makan nanti.",
        tagalog: "Gutom ako, pero nagtatrabaho pa rin ako, kaya kakain ako mamaya.",
        acceptedAnswers: ["Gutom ako, pero nagtatrabaho pa ako, kaya kakain ako mamaya."],
        connectors: ["pero", "pa-rin", "kaya"],
        explanation: [
          { connector: "pero", note: "Contrast between being hungry and still working." },
          { connector: "pa-rin", note: "The work continues despite the hunger." },
          { connector: "kaya", note: "Introduces the consequence: eating later." },
        ],
        vocabulary: [{ tagalog: "gutom", indonesian: "lapar" }, { tagalog: "nagtatrabaho", indonesian: "sedang bekerja", build: "nag + tra~ + trabaho", root: "trabaho = kerja" }, { tagalog: "kakain", indonesian: "akan makan", build: "ka~ + kain", root: "kain = makan" }, { tagalog: "mamaya", indonesian: "nanti" }],
      },
      {
        indonesian: "Aku masih mengantuk, tapi aku minum kopi dulu sebelum bekerja karena ada rapat pagi ini.",
        tagalog: "Inaantok pa rin ako, pero iinom muna ako ng kape bago magtrabaho dahil may meeting ngayong umaga.",
        connectors: ["pa-rin", "pero", "muna", "bago", "dahil"],
        explanation: [
          { connector: "pa-rin", note: "The sleepiness persists." },
          { connector: "pero", note: "Contrast: sleepy, yet acting." },
          { connector: "muna", note: "Coffee comes first; it sits right after iinom." },
          { connector: "bago", note: "Before the work. Bare verb: magtrabaho." },
          { connector: "dahil", note: "The reason behind all of it: the morning meeting." },
        ],
        vocabulary: [{ tagalog: "inaantok", indonesian: "mengantuk" }, { tagalog: "iinom", indonesian: "minum", build: "i~ + inom", root: "inom = minum" }, { tagalog: "kape", indonesian: "kopi" }, { tagalog: "magtrabaho", indonesian: "bekerja", build: "mag + trabaho", root: "trabaho = kerja" }, { tagalog: "may meeting", indonesian: "ada rapat" }, { tagalog: "ngayong umaga", indonesian: "pagi ini" }],
      },
    ],
    create: [
      {
        situation: ["You woke up late.", "You are hungry.", "You need to go to work."],
        task: "Describe what you will do before leaving.",
        exampleAnswer: "Gumising ako nang late, pero kailangan kong pumunta sa opisina, kaya kakain muna ako bago umalis.",
        exampleIndonesian: "Aku bangun terlambat, tapi aku harus pergi ke kantor, jadi aku makan dulu sebelum berangkat.",
        connectors: ["pero", "kaya", "muna", "bago"],
        explanation: "pero sets the tension, kaya resolves it, muna orders the resolution, bago closes it. Any of the facts can be worded differently; check your joints.",
      },
      {
        situation: ["It is already evening.", "You are tired, but the work is not finished.", "You will finish it first."],
        task: "Say what you will do before sleeping, and why.",
        exampleAnswer: "Gabi na, pero hindi pa tapos ang trabaho ko, kaya tatapusin ko muna ito bago matulog.",
        exampleIndonesian: "Sudah malam, tapi kerjaanku belum selesai, jadi aku selesaikan dulu sebelum tidur.",
        connectors: ["na", "pero", "kaya", "muna", "bago"],
        explanation: "na marks that evening has arrived; pero holds the unfinished work against it; kaya gives the decision; muna and bago order it.",
      },
    ],
  },

  /* ---------------- 3 · Making plans ---------------- */
  "making-plans": {
    substitute: [
      {
        original: { tagalog: "Kung libre ka bukas, kumain tayo sa labas", indonesian: "Kalau kamu bebas besok, ayo kita makan di luar" },
        indonesian: "Kalau kamu ada waktu nanti, ayo kita minum kopi.",
        tagalog: "Kung may oras ka mamaya, uminom tayo ng kape.",
        grammarFocus: "KUNG + CONDITION, + VERB + TAYO",
        explanation: "kung still opens the condition; the plain verb plus tayo is still the invitation. may oras ka replaces libre ka.",
        connectors: ["kung"],
        vocabulary: [{ tagalog: "may oras ka", indonesian: "kamu ada waktu" }, { tagalog: "mamaya", indonesian: "nanti" }, { tagalog: "uminom tayo", indonesian: "ayo kita minum", build: "um + inom", root: "inom = minum" }, { tagalog: "kape", indonesian: "kopi" }],
      },
      {
        original: { tagalog: "pero kapag umuulan, magluto na lang tayo sa bahay", indonesian: "tapi kalau hujan, kita masak aja di rumah" },
        indonesian: "Tapi kalau macet, kita jalan kaki aja.",
        tagalog: "Pero kapag traffic, maglakad na lang tayo.",
        grammarFocus: "PERO KAPAG + EVENT, + VERB + NA LANG + TAYO",
        explanation: "kapag still marks a whenever, not a hypothetical. na lang still follows the verb. The event and the fallback changed.",
        connectors: ["pero", "kapag", "na-lang"],
        vocabulary: [{ tagalog: "traffic", indonesian: "macet" }, { tagalog: "maglakad", indonesian: "jalan kaki", build: "mag + lakad", root: "lakad = jalan" }],
      },
      {
        original: { tagalog: "kaya tatawagan muna kita", indonesian: "jadi aku akan telepon kamu dulu" },
        indonesian: "Jadi aku akan tanya ibuku dulu.",
        tagalog: "Kaya tatanungin ko muna ang nanay ko.",
        grammarFocus: "KAYA + VERB + MUNA",
        explanation: "kaya still opens the result and muna still follows the verb. tatanungin ko (I will ask) takes ang + the person asked.",
        connectors: ["kaya", "muna"],
        vocabulary: [{ tagalog: "tatanungin ko", indonesian: "akan kutanya", build: "ta~ + tanong + in", root: "tanong = tanya" }, { tagalog: "nanay", indonesian: "ibu" }],
      },
    ],
    recombine: [
      {
        indonesian: "Kalau hujan besok, kita di rumah aja.",
        tagalog: "Kung umuulan bukas, sa bahay na lang tayo.",
        acceptedAnswers: ["Kapag umuulan bukas, sa bahay na lang tayo."],
        connectors: ["kung", "na-lang"],
        explanation: [
          { connector: "kung", note: "A condition about tomorrow. kapag would also work for rain as a whenever." },
          { connector: "na-lang", note: "Settling for the simpler option. No verb needed." },
        ],
        vocabulary: [{ tagalog: "umuulan", indonesian: "hujan", build: "um + u~ + ulan", root: "ulan = hujan" }, { tagalog: "bukas", indonesian: "besok" }, { tagalog: "bahay", indonesian: "rumah" }],
      },
      {
        indonesian: "Kalau kamu lapar, makan dulu, tapi kalau belum, nanti aja.",
        tagalog: "Kung gutom ka, kumain ka muna, pero kung hindi pa, mamaya na lang.",
        acceptedAnswers: ["Kapag gutom ka, kumain ka muna, pero kung hindi pa, mamaya na lang."],
        connectors: ["kung", "muna", "pero", "na-lang"],
        explanation: [
          { connector: "kung", note: "Two conditions, one on each side of pero." },
          { connector: "muna", note: "Eat first. It follows the verb: kumain ka muna." },
          { connector: "pero", note: "Contrast between the two cases." },
          { connector: "na-lang", note: "The fallback: later, then." },
        ],
        vocabulary: [{ tagalog: "gutom", indonesian: "lapar" }, { tagalog: "kumain ka", indonesian: "makan (kamu)" }, { tagalog: "hindi pa", indonesian: "belum" }, { tagalog: "mamaya", indonesian: "nanti" }],
      },
      {
        indonesian: "Kalau aku selesai lebih awal, aku akan ke rumahmu, tapi kalau macet, aku telepon aja, jadi tunggu dulu.",
        tagalog: "Kung matatapos ako nang maaga, pupunta ako sa bahay mo, pero kapag traffic, tatawag na lang ako, kaya maghintay ka muna.",
        acceptedAnswers: ["Kung matatapos ako nang maaga, pupunta ako sa bahay mo, pero kung traffic, tatawag na lang ako, kaya maghintay ka muna."],
        connectors: ["kung", "pero", "kapag", "na-lang", "kaya", "muna"],
        explanation: [
          { connector: "kung", note: "The hopeful condition." },
          { connector: "pero", note: "Contrast with the other case." },
          { connector: "kapag", note: "Traffic as a whenever; kung is also accepted." },
          { connector: "na-lang", note: "The fallback: just a call." },
          { connector: "kaya", note: "What follows for the listener." },
          { connector: "muna", note: "Wait first. It follows the verb: maghintay ka muna." },
        ],
        vocabulary: [{ tagalog: "matatapos", indonesian: "akan selesai", build: "ma + ta~ + tapos", root: "tapos = selesai" }, { tagalog: "nang maaga", indonesian: "lebih awal" }, { tagalog: "pupunta", indonesian: "akan pergi", build: "pu~ + punta", root: "punta = pergi" }, { tagalog: "bahay mo", indonesian: "rumahmu" }, { tagalog: "traffic", indonesian: "macet" }, { tagalog: "tatawag", indonesian: "akan telepon", build: "ta~ + tawag", root: "tawag = telepon" }, { tagalog: "maghintay ka", indonesian: "tunggu (kamu)" }],
      },
    ],
    create: [
      {
        situation: ["A friend wants to meet this weekend.", "You are free on Saturday, unless it rains.", "You will confirm later."],
        task: "Make the plan: the condition, the fallback, and what you will do first.",
        exampleAnswer: "Kung libre ako sa Sabado, magkita tayo, pero kapag umuulan, sa susunod na lang, kaya tatawagan muna kita.",
        exampleIndonesian: "Kalau aku bebas hari Sabtu, ayo kita ketemu, tapi kalau hujan, lain kali aja, jadi aku akan telepon kamu dulu.",
        connectors: ["kung", "pero", "kapag", "na-lang", "kaya", "muna"],
        explanation: "kung for the plan, kapag for the rain, na lang for the fallback, kaya and muna for the next move. Compare which condition word you chose for each clause.",
      },
      {
        situation: ["You want to cook dinner.", "There is no rice at home.", "The store is nearby, but it may be closed."],
        task: "Say what you will do first, and what you will do if the store is closed.",
        exampleAnswer: "Magluluto ako ng hapunan, pero wala akong bigas, kaya pupunta muna ako sa tindahan. Kung sarado, umorder na lang tayo.",
        exampleIndonesian: "Aku akan masak makan malam, tapi aku nggak punya beras, jadi aku ke toko dulu. Kalau tutup, kita pesan aja.",
        connectors: ["pero", "kaya", "muna", "kung", "na-lang"],
        explanation: "pero raises the problem, kaya answers it, muna orders it; kung opens the second case and na lang settles it.",
      },
    ],
  },

  /* ---------------- 4 · Telling a story ---------------- */
  "telling-a-story": {
    substitute: [
      {
        original: { tagalog: "Habang naghihintay ako ng bus, umulan nang malakas", indonesian: "Sambil aku menunggu bus, hujan turun deras" },
        indonesian: "Sambil aku makan, hujan turun deras.",
        tagalog: "Habang kumakain ako, umulan nang malakas.",
        grammarFocus: "HABANG + ONGOING VERB + ACTOR, COMPLETED VERB + NANG + HOW",
        explanation: "habang still takes the ongoing verb, kumakain. The second clause is untouched: a completed verb, then nang for the manner.",
        connectors: ["habang", "nang"],
        vocabulary: [{ tagalog: "kumakain", indonesian: "sedang makan", build: "k + um + a~ + kain", root: "kain = makan" }, { tagalog: "umulan", indonesian: "hujan turun", build: "um + ulan", root: "ulan = hujan" }, { tagalog: "malakas", indonesian: "deras / kuat" }],
      },
      {
        original: { tagalog: "pero hindi ako umuwi dahil may dala akong payong", indonesian: "tapi aku nggak pulang karena aku bawa payung" },
        indonesian: "Tapi aku nggak lari karena aku bawa tas yang berat.",
        tagalog: "Pero hindi ako tumakbo dahil may dala akong mabigat na bag.",
        grammarFocus: "PERO HINDI + ACTOR + VERB, DAHIL + REASON",
        explanation: "hindi still pulls ako in front of the verb. dahil still introduces may dala akong + the thing. mabigat na bag: the describe-word links to its noun with na.",
        connectors: ["pero", "dahil"],
        vocabulary: [{ tagalog: "tumakbo", indonesian: "lari", build: "t + um + akbo", root: "takbo = lari" }, { tagalog: "may dala akong", indonesian: "aku bawa" }, { tagalog: "mabigat", indonesian: "berat" }, { tagalog: "bag", indonesian: "tas" }],
      },
      {
        original: { tagalog: "kaya naglakad na lang ako", indonesian: "jadi aku jalan kaki aja" },
        indonesian: "Jadi aku menunggu aja di toko.",
        tagalog: "Kaya naghintay na lang ako sa tindahan.",
        grammarFocus: "KAYA + COMPLETED VERB + NA LANG + ACTOR",
        explanation: "kaya and na lang keep their places; only the verb and the place changed. naghintay is the completed form: nag + hintay.",
        connectors: ["kaya", "na-lang"],
        vocabulary: [{ tagalog: "naghintay", indonesian: "menunggu (sudah)", build: "nag + hintay", root: "hintay = tunggu" }, { tagalog: "tindahan", indonesian: "toko" }],
      },
    ],
    recombine: [
      {
        indonesian: "Sambil aku menunggu teman, aku membaca buku, tapi dia nggak datang.",
        tagalog: "Habang naghihintay ako ng kaibigan, nagbasa ako ng libro, pero hindi siya dumating.",
        connectors: ["habang", "pero"],
        explanation: [
          { connector: "habang", note: "Two things at once: waiting and reading." },
          { connector: "pero", note: "Contrast with what was expected: the friend never came." },
        ],
        vocabulary: [{ tagalog: "naghihintay", indonesian: "menunggu", build: "nag + hi~ + hintay", root: "hintay = tunggu" }, { tagalog: "kaibigan", indonesian: "teman" }, { tagalog: "nagbasa", indonesian: "membaca (sudah)", build: "nag + basa", root: "basa = baca" }, { tagalog: "libro", indonesian: "buku" }, { tagalog: "dumating", indonesian: "datang (sudah)", build: "d + um + ating", root: "dating = datang" }],
      },
      {
        indonesian: "Aku lari dengan cepat karena hujan, jadi aku capek banget.",
        tagalog: "Tumakbo ako nang mabilis dahil umuulan, kaya pagod na pagod ako.",
        connectors: ["nang", "dahil", "kaya"],
        explanation: [
          { connector: "nang", note: "How you ran. nang, not ng, links the manner." },
          { connector: "dahil", note: "The reason: the rain." },
          { connector: "kaya", note: "The result. Doubling pagod makes it stronger." },
        ],
        vocabulary: [{ tagalog: "tumakbo", indonesian: "lari", build: "t + um + akbo", root: "takbo = lari" }, { tagalog: "mabilis", indonesian: "cepat" }, { tagalog: "umuulan", indonesian: "hujan", build: "um + u~ + ulan", root: "ulan = hujan" }, { tagalog: "pagod na pagod", indonesian: "capek banget" }],
      },
      {
        indonesian: "Sambil aku jalan pulang, ponselku mati karena baterainya habis, tapi aku nggak khawatir, jadi aku nyanyi aja.",
        tagalog: "Habang naglalakad ako pauwi, namatay ang phone ko dahil lowbat, pero hindi ako nag-alala, kaya kumanta na lang ako.",
        connectors: ["habang", "dahil", "pero", "kaya", "na-lang"],
        explanation: [
          { connector: "habang", note: "The walk is the background for everything else." },
          { connector: "dahil", note: "Why the phone died." },
          { connector: "pero", note: "Contrast: a dead phone, yet no worry." },
          { connector: "kaya", note: "What followed from not worrying." },
          { connector: "na-lang", note: "Settling for the simple thing: singing." },
        ],
        vocabulary: [{ tagalog: "naglalakad pauwi", indonesian: "jalan pulang", build: "nag + la~ + lakad", root: "lakad = jalan" }, { tagalog: "namatay", indonesian: "mati", build: "na + matay", root: "matay = mati" }, { tagalog: "phone ko", indonesian: "ponselku" }, { tagalog: "lowbat", indonesian: "baterainya habis" }, { tagalog: "nag-alala", indonesian: "khawatir", build: "nag + alala", root: "alala = khawatir" }, { tagalog: "kumanta", indonesian: "nyanyi", build: "k + um + anta", root: "kanta = nyanyi" }],
      },
    ],
    create: [
      {
        situation: ["You were waiting for a friend at a café.", "It started to rain hard.", "The friend never came."],
        task: "Tell what happened, and what you did in the end.",
        exampleAnswer: "Habang naghihintay ako sa café, umulan nang malakas, pero hindi dumating ang kaibigan ko, kaya umuwi na lang ako.",
        exampleIndonesian: "Sambil aku menunggu di kafe, hujan turun deras, tapi temanku nggak datang, jadi aku pulang aja.",
        connectors: ["habang", "nang", "pero", "kaya", "na-lang"],
        explanation: "habang sets the scene, nang describes the rain, pero breaks the expectation, kaya and na lang give the quiet ending.",
      },
      {
        situation: ["You walked home last night.", "Your phone died.", "You were not worried."],
        task: "Tell the story: what happened while you walked, why, and what you did instead.",
        exampleAnswer: "Habang naglalakad ako pauwi kagabi, namatay ang phone ko dahil lowbat, pero hindi ako nag-alala, kaya tumingin na lang ako sa mga bituin.",
        exampleIndonesian: "Sambil aku jalan pulang tadi malam, ponselku mati karena baterainya habis, tapi aku nggak khawatir, jadi aku lihat bintang aja.",
        connectors: ["habang", "dahil", "pero", "kaya", "na-lang"],
        explanation: "The same four joints as the journey: habang for the background, dahil for the cause, pero for the turn, kaya and na lang for what you did instead.",
      },
    ],
  },
};

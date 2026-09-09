import type { Lesson } from "./types";

// Lesson 1 — "Kain na tayo": food, plans, joining in.
// Register: casual, proper Tagalog (no Taglish). Speaker B is you.

export const lesson1: Lesson = {
  id: "kain",
  title: "Kain na tayo",
  subtitle: "Food, plans, and being included",
  exchanges: [
    {
      id: "e1",
      situation: "You're at a friend's house. Someone calls out from the kitchen.",
      lines: [
        {
          id: "e1a",
          speaker: "A",
          text: "Kain na tayo.",
          gloss: "Let's eat (now).",
          tokens: [
            { t: "Kain", role: "action", m: "eat", root: "kain", note: "Bare root used as a casual command/invite. Full verb would be 'kumain'." },
            { t: "na", role: "particle", m: "now / already", note: "'na' = the moment has arrived. Its opposite is 'pa' (still / not yet)." },
            { t: "tayo", role: "person", m: "we (including YOU)", note: "Tagalog has two 'we': tayo (you're in) vs kami (you're out). This one includes you.", anchor: { lang: "id", word: "kita", note: "Indonesian 'kita' = we-inclusive. Same job, different word. Careful: Tagalog 'kita' means 'I → you'." } },
          ],
        },
        {
          id: "e1b",
          speaker: "B",
          yours: true,
          text: "Sige, gutom na ako.",
          gloss: "Okay, I'm hungry now.",
          tokens: [
            { t: "Sige", role: "particle", m: "okay / go ahead", anchor: { lang: "es", word: "sigue", note: "From Spanish 'sigue' (continue). Now = okay / sure / go on." } },
            { t: "gutom", role: "describe", m: "hungry" },
            { t: "na", role: "particle", m: "now / already" },
            { t: "ako", role: "person", m: "I", anchor: { lang: "id", word: "aku", note: "Same Austronesian pronoun." } },
          ],
        },
      ],
      quiz: {
        prompt: "What just happened?",
        options: ["An invitation", "A question", "A refusal"],
        answer: 0,
        why: "'tayo' + 'na' = 'let's… now'. No question particle 'ba', so it's not a question.",
      },
      variation: {
        id: "e1v",
        speaker: "A",
        text: "Alis na tayo.",
        gloss: "Let's go (leave) now.",
        tokens: [
          { t: "Alis", role: "action", m: "leave / go", root: "alis" },
          { t: "na", role: "particle", m: "now" },
          { t: "tayo", role: "person", m: "we (incl. you)" },
        ],
      },
      takeaway: "ROOT + na + tayo = 'let's ___ now'. The speaker is including you.",
    },
    {
      id: "e2",
      situation: "You're deciding what to order.",
      lines: [
        {
          id: "e2a",
          speaker: "A",
          text: "Anong gusto mong kainin?",
          gloss: "What do you want to eat?",
          tokens: [
            { t: "Anong", role: "question", m: "what (+ linker)", note: "ano + -ng. The -ng glues 'what' to the next word." },
            { t: "gusto", role: "action", m: "want / like", anchor: { lang: "es", word: "gusto", note: "Spanish 'gusto' (pleasure). In Tagalog it's the everyday 'want'." } },
            { t: "mong", role: "person", m: "you (+ linker)", note: "mo + -ng. 'mo' is the 'ng-form' of you — used after gusto.", anchor: { lang: "id", word: "-mu", note: "Indonesian '-mu' (your). Same ancestor." } },
            { t: "kainin", role: "action", m: "to eat (the thing)", root: "kain", note: "kain + -in = object focus: the FOOD is the spotlight, so the food would take 'ang'." },
          ],
        },
        {
          id: "e2b",
          speaker: "B",
          yours: true,
          text: "Gusto ko ng adobo.",
          gloss: "I want adobo.",
          tokens: [
            { t: "Gusto", role: "action", m: "want" },
            { t: "ko", role: "person", m: "I (ng-form)", note: "With 'gusto', the wanter takes the ng-form: ko / mo / niya.", anchor: { lang: "id", word: "-ku", note: "Indonesian '-ku' (my)." } },
            { t: "ng", role: "particle", m: "(marks the thing wanted)", note: "Pronounced 'nang'. Marks a non-focused noun." },
            { t: "adobo", role: "thing", m: "adobo (dish)", anchor: { lang: "es", word: "adobo", note: "Spanish marinade word → the national dish." } },
          ],
        },
      ],
      quiz: {
        prompt: "What is being asked?",
        options: ["Where to eat", "What to eat", "Whether you've eaten"],
        answer: 1,
        why: "'Ano' = what. 'Saan' would be where.",
      },
      variation: {
        id: "e2v",
        speaker: "A",
        text: "Anong gusto mong inumin?",
        gloss: "What do you want to drink?",
        tokens: [
          { t: "Anong", role: "question", m: "what" },
          { t: "gusto", role: "action", m: "want" },
          { t: "mong", role: "person", m: "you" },
          { t: "inumin", role: "action", m: "to drink (the thing)", root: "inom", anchor: { lang: "id", word: "minum", note: "Indonesian 'minum' = drink. Same root." } },
        ],
      },
      takeaway: "Gusto ko ng ___ = I want ___. Gusto mo ng ___? = Do you want ___?",
    },
    {
      id: "e3",
      situation: "Plans are being made for dinner.",
      lines: [
        {
          id: "e3a",
          speaker: "A",
          text: "Saan tayo kakain?",
          gloss: "Where will we eat?",
          tokens: [
            { t: "Saan", role: "question", m: "where (to/at)" },
            { t: "tayo", role: "person", m: "we (incl. you)" },
            { t: "kakain", role: "action", m: "will eat", root: "kain", note: "ka-kain: the first syllable is doubled = not yet happened (future)." },
          ],
        },
        {
          id: "e3b",
          speaker: "B",
          yours: true,
          text: "Sa bahay na lang.",
          gloss: "Let's just (eat) at home.",
          tokens: [
            { t: "Sa", role: "particle", m: "at / to / in", note: "'sa' marks location or direction." },
            { t: "bahay", role: "thing", m: "house / home" },
            { t: "na lang", role: "particle", m: "just… (instead)", note: "Very common combo: settles on the easier option." },
          ],
        },
      ],
      quiz: {
        prompt: "What's being decided?",
        options: ["When to eat", "Where to eat", "Who is cooking"],
        answer: 1,
        why: "'Saan' = where. 'Sa' in the reply points to a place.",
      },
      variation: {
        id: "e3v",
        speaker: "A",
        text: "Saan tayo pupunta?",
        gloss: "Where are we going?",
        tokens: [
          { t: "Saan", role: "question", m: "where" },
          { t: "tayo", role: "person", m: "we (incl. you)" },
          { t: "pupunta", role: "action", m: "will go", root: "punta", note: "pu-punta: doubled syllable = not yet." },
        ],
      },
      takeaway: "Saan = where. Doubled first syllable (ka-kain, pu-punta) = hasn't happened yet.",
    },
    {
      id: "e4",
      situation: "You've just taken a bite. Someone watches your face.",
      lines: [
        {
          id: "e4a",
          speaker: "A",
          text: "Masarap ba?",
          gloss: "Is it delicious?",
          tokens: [
            { t: "Masarap", role: "describe", m: "delicious", note: "ma- + sarap (deliciousness). ma- turns a quality into an adjective." },
            { t: "ba", role: "particle", m: "(question mark, spoken)", note: "'ba' turns any statement into a yes/no question. Always second position." },
          ],
        },
        {
          id: "e4b",
          speaker: "B",
          yours: true,
          text: "Oo, masarap talaga!",
          gloss: "Yes, really delicious!",
          tokens: [
            { t: "Oo", role: "particle", m: "yes", note: "Two syllables: o-o. Polite form: 'opo'." },
            { t: "masarap", role: "describe", m: "delicious" },
            { t: "talaga", role: "describe", m: "really / truly" },
          ],
        },
      ],
      quiz: {
        prompt: "What kind of sentence is 'Masarap ba?'",
        options: ["A statement", "A yes/no question", "A command"],
        answer: 1,
        why: "'ba' is the spoken question mark.",
      },
      variation: {
        id: "e4v",
        speaker: "A",
        text: "Gutom ka ba?",
        gloss: "Are you hungry?",
        tokens: [
          { t: "Gutom", role: "describe", m: "hungry" },
          { t: "ka", role: "person", m: "you (short form)", note: "'ka' is the short 'you' that follows the first word. 'Ikaw' starts a sentence." },
          { t: "ba", role: "particle", m: "(question)" },
        ],
      },
      takeaway: "Add 'ba' after the first word → yes/no question. Answer: Oo / Hindi.",
    },
    {
      id: "e5",
      situation: "You walk in around lunchtime.",
      lines: [
        {
          id: "e5a",
          speaker: "A",
          text: "Kumain ka na ba?",
          gloss: "Have you eaten already?",
          tokens: [
            { t: "Kumain", role: "action", m: "ate / have eaten", root: "kain", note: "k-um-ain: the -um- infix = actor focus, completed. The eater is the spotlight." },
            { t: "ka", role: "person", m: "you" },
            { t: "na", role: "particle", m: "already" },
            { t: "ba", role: "particle", m: "(question)" },
          ],
        },
        {
          id: "e5b",
          speaker: "B",
          yours: true,
          text: "Hindi pa. Ikaw?",
          gloss: "Not yet. You?",
          tokens: [
            { t: "Hindi", role: "particle", m: "no / not" },
            { t: "pa", role: "particle", m: "yet / still", note: "'pa' is the mirror of 'na'. na = already, pa = not yet." },
            { t: "Ikaw", role: "person", m: "you (full form)", anchor: { lang: "id", word: "engkau / kau", note: "Same ancestor." } },
          ],
        },
      ],
      quiz: {
        prompt: "This is the Filipino 'hello'. What's really being asked?",
        options: ["Are you hungry right now?", "Have you eaten yet?", "What did you eat?"],
        answer: 1,
        why: "'kumain' (past) + 'na' (already) + 'ba' (question).",
      },
      variation: {
        id: "e5v",
        speaker: "A",
        text: "Kumain na ako.",
        gloss: "I already ate.",
        tokens: [
          { t: "Kumain", role: "action", m: "ate", root: "kain" },
          { t: "na", role: "particle", m: "already" },
          { t: "ako", role: "person", m: "I" },
        ],
      },
      takeaway: "na ↔ pa. 'Kumain ka na ba?' is a greeting; 'Hindi pa' / 'Kumain na' are the two answers.",
    },
    {
      id: "e6",
      situation: "Someone offers you a drink.",
      lines: [
        {
          id: "e6a",
          speaker: "A",
          text: "Gusto mo ng kape?",
          gloss: "Do you want coffee?",
          tokens: [
            { t: "Gusto", role: "action", m: "want" },
            { t: "mo", role: "person", m: "you (ng-form)" },
            { t: "ng", role: "particle", m: "(marks the thing)" },
            { t: "kape", role: "thing", m: "coffee", anchor: { lang: "es", word: "café", note: "Also Indonesian 'kopi'." } },
          ],
        },
        {
          id: "e6b",
          speaker: "B",
          yours: true,
          text: "Sige, salamat.",
          gloss: "Sure, thanks.",
          tokens: [
            { t: "Sige", role: "particle", m: "sure / okay" },
            { t: "salamat", role: "particle", m: "thank you", anchor: { lang: "id", word: "selamat", note: "Both from Arabic 'salāmat'. Indonesian 'selamat' = safe / greeting, Tagalog 'salamat' = thanks. Meaning shifted!" } },
          ],
        },
        {
          id: "e6c",
          speaker: "A",
          text: "Walang anuman.",
          gloss: "You're welcome.",
          tokens: [
            { t: "Walang", role: "particle", m: "there is no (+ linker)", note: "wala + -ng. 'wala' = none / nothing. Opposite: 'may' / 'meron'." },
            { t: "anuman", role: "thing", m: "anything", note: "Literally: 'it's nothing'." },
          ],
        },
      ],
      quiz: {
        prompt: "What's being offered?",
        options: ["Food", "Coffee", "A ride"],
        answer: 1,
        why: "'kape' = café. Free word from Spanish.",
      },
      variation: {
        id: "e6v",
        speaker: "A",
        text: "Gusto mo ng tubig?",
        gloss: "Do you want water?",
        tokens: [
          { t: "Gusto", role: "action", m: "want" },
          { t: "mo", role: "person", m: "you" },
          { t: "ng", role: "particle", m: "(marks the thing)" },
          { t: "tubig", role: "thing", m: "water" },
        ],
      },
      takeaway: "Gusto mo ng ___? → Sige, salamat / Hindi, salamat. Reply: Walang anuman.",
    },
    {
      id: "e7",
      situation: "You're looking for someone in the house.",
      lines: [
        {
          id: "e7a",
          speaker: "B",
          yours: true,
          text: "Nasaan si Ate?",
          gloss: "Where is Ate (big sister)?",
          tokens: [
            { t: "Nasaan", role: "question", m: "where is (location of a person/thing)", note: "'nasaan' asks where something IS. 'saan' asks where an action happens." },
            { t: "si", role: "particle", m: "(marks a person's name)", note: "Names always get 'si' (or 'sina' for plural)." },
            { t: "Ate", role: "person", m: "big sister / older woman (respectful)", note: "Used for any slightly older woman, not just siblings. Male: 'Kuya'." },
          ],
        },
        {
          id: "e7b",
          speaker: "A",
          text: "Nasa kusina, nagluluto.",
          gloss: "In the kitchen, cooking.",
          tokens: [
            { t: "Nasa", role: "particle", m: "is at / is in", note: "'nasa' + place = 'is located at'." },
            { t: "kusina", role: "thing", m: "kitchen", anchor: { lang: "es", word: "cocina" } },
            { t: "nagluluto", role: "action", m: "is cooking", root: "luto", note: "nag-lu-luto: nag- (actor focus) + doubled 'lu' = ongoing." },
          ],
        },
      ],
      quiz: {
        prompt: "Who says the first line — and what do they want?",
        options: ["Someone asking where a person is", "Someone offering food", "Someone saying goodbye"],
        answer: 0,
        why: "'Nasaan' = where is. 'si' tells you a person's name/title follows.",
      },
      variation: {
        id: "e7v",
        speaker: "A",
        text: "Nasaan si Kuya?",
        gloss: "Where is Kuya (big brother)?",
        tokens: [
          { t: "Nasaan", role: "question", m: "where is" },
          { t: "si", role: "particle", m: "(name marker)" },
          { t: "Kuya", role: "person", m: "big brother / older man" },
        ],
      },
      takeaway: "Nasaan si ___? → Nasa ___. Ate / Kuya are respect words for anyone a bit older.",
    },
    {
      id: "e8",
      situation: "Recovering when you're lost. The most useful exchange of the trip.",
      lines: [
        {
          id: "e8a",
          speaker: "B",
          yours: true,
          text: "Pakiulit po, hindi ko naintindihan.",
          gloss: "Please repeat, I didn't understand.",
          tokens: [
            { t: "Pakiulit", role: "action", m: "please repeat", root: "ulit", note: "paki- + root = 'please ___'. Works on almost any verb: pakibagalan (please slow down), pakisabi (please say/tell)." },
            { t: "po", role: "particle", m: "(politeness)", note: "Drop into any sentence to make it respectful. Use with elders and strangers." },
            { t: "hindi", role: "particle", m: "not" },
            { t: "ko", role: "person", m: "I (ng-form)" },
            { t: "naintindihan", role: "action", m: "understood", root: "intindi", anchor: { lang: "es", word: "entender", note: "Spanish 'entender' → Tagalog root 'intindi'." } },
          ],
        },
        {
          id: "e8b",
          speaker: "A",
          text: "Sige, dahan-dahan lang.",
          gloss: "Okay, slowly then.",
          tokens: [
            { t: "Sige", role: "particle", m: "okay" },
            { t: "dahan-dahan", role: "describe", m: "slowly", note: "Doubling a word = intensifies or spreads it. dahan → dahan-dahan." },
            { t: "lang", role: "particle", m: "just / only" },
          ],
        },
      ],
      quiz: {
        prompt: "What did speaker B just do?",
        options: ["Agreed to something", "Asked for a repeat", "Asked where someone is"],
        answer: 1,
        why: "'Paki-' = please, 'ulit' = repeat, 'hindi ko naintindihan' = I didn't understand.",
      },
      variation: {
        id: "e8v",
        speaker: "B",
        text: "Anong ibig sabihin ng 'gutom'?",
        gloss: "What does 'gutom' mean?",
        tokens: [
          { t: "Anong", role: "question", m: "what" },
          { t: "ibig sabihin", role: "action", m: "means (lit. 'wants to say')", note: "Swap in any word you hear and don't know." },
          { t: "ng", role: "particle", m: "(marks the word)" },
          { t: "'gutom'", role: "thing", m: "the word you're asking about" },
        ],
      },
      takeaway: "Paki-___ po = please ___. 'Anong ibig sabihin ng ___?' unlocks every unknown word.",
    },
  ],
};

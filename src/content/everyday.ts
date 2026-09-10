// Everyday Tagalog: Common functional phrases
// Organized into practical groups for survival language
// These are things you can use TODAY

export interface Phrase {
  tagalog: string;
  english: string;
  indonesian?: string;
  note?: string;
  // Concepts this phrase practices (for curriculum integration)
  concepts?: string[];
}

export interface PhraseGroup {
  id: string;
  name: string;
  description?: string;
  phrases: Phrase[];
}

export const EVERYDAY_PHRASES: PhraseGroup[] = [
  {
    id: "greetings",
    name: "Greetings",
    phrases: [
      { tagalog: "Kamusta?", english: "How are you?", indonesian: "Apa kabar?" },
      { tagalog: "Mabuti.", english: "I'm fine.", indonesian: "Baik." },
      { tagalog: "Magandang umaga.", english: "Good morning.", indonesian: "Selamat pagi." },
      { tagalog: "Magandang hapon.", english: "Good afternoon.", indonesian: "Selamat siang." },
      { tagalog: "Magandang gabi.", english: "Good evening.", indonesian: "Selamat malam." },
    ],
  },
  {
    id: "courtesy",
    name: "Courtesy",
    phrases: [
      { tagalog: "Salamat.", english: "Thank you.", indonesian: "Terima kasih." },
      { tagalog: "Salamat po.", english: "Thank you (polite).", indonesian: "Terima kasih." },
      { tagalog: "Walang anuman.", english: "You're welcome.", indonesian: "Sama-sama." },
      { tagalog: "Paki-", english: "Please (prefix)", indonesian: "Tolong", note: "Attached to verbs: pakibigay = please give" },
      { tagalog: "Pasensya na.", english: "Sorry / Excuse me.", indonesian: "Maaf." },
      { tagalog: "Patawad.", english: "Forgive me.", indonesian: "Maafkan." },
    ],
  },
  {
    id: "yesno",
    name: "Yes / No / Maybe",
    phrases: [
      { tagalog: "Oo.", english: "Yes.", indonesian: "Iya." },
      { tagalog: "Hindi.", english: "No.", indonesian: "Tidak." },
      { tagalog: "Siguro.", english: "Maybe / Perhaps.", indonesian: "Mungkin." },
      { tagalog: "Sige.", english: "Okay / Alright.", indonesian: "Oke." },
      { tagalog: "Ayaw ko.", english: "I don't want.", indonesian: "Aku tidak mau." },
      { tagalog: "Gusto ko.", english: "I want.", indonesian: "Aku mau." },
    ],
  },
  {
    id: "questions",
    name: "Question Words",
    phrases: [
      { tagalog: "Ano?", english: "What?", indonesian: "Apa?" },
      { tagalog: "Sino?", english: "Who?", indonesian: "Siapa?" },
      { tagalog: "Saan?", english: "Where?", indonesian: "Di mana?" },
      { tagalog: "Kailan?", english: "When?", indonesian: "Kapan?" },
      { tagalog: "Bakit?", english: "Why?", indonesian: "Kenapa?" },
      { tagalog: "Paano?", english: "How?", indonesian: "Bagaimana?" },
      { tagalog: "Magkano?", english: "How much?", indonesian: "Berapa?" },
    ],
  },
  {
    id: "understanding",
    name: "Understanding",
    phrases: [
      { tagalog: "Hindi ko alam.", english: "I don't know.", indonesian: "Aku tidak tahu." },
      { tagalog: "Hindi ko maintindihan.", english: "I don't understand.", indonesian: "Aku tidak mengerti." },
      { tagalog: "Ulitin mo.", english: "Say it again.", indonesian: "Ulangi." },
      { tagalog: "Dahan-dahan.", english: "Slowly.", indonesian: "Pelan-pelan." },
      { tagalog: "Ano ibig sabihin ng ___?", english: "What does ___ mean?", indonesian: "Apa artinya ___?" },
      { tagalog: "Naiintindihan ko.", english: "I understand.", indonesian: "Aku mengerti." },
    ],
  },
  {
    id: "status",
    name: "Status / Feelings",
    phrases: [
      { tagalog: "Okay lang ako.", english: "I'm okay.", indonesian: "Aku baik-baik saja." },
      { tagalog: "Okay ka ba?", english: "Are you okay?", indonesian: "Kamu baik-baik saja?" },
      { tagalog: "Pagod ako.", english: "I'm tired.", indonesian: "Aku capek." },
      { tagalog: "Gutom ako.", english: "I'm hungry.", indonesian: "Aku lapar." },
      { tagalog: "Uhaw ako.", english: "I'm thirsty.", indonesian: "Aku haus." },
    ],
  },
  {
    id: "practical",
    name: "Practical",
    phrases: [
      { tagalog: "Nasaan ang ___?", english: "Where is ___?", indonesian: "Di mana ___?" },
      { tagalog: "Gusto ko ito.", english: "I want this.", indonesian: "Aku mau ini." },
      { tagalog: "Ayaw ko iyan.", english: "I don't want that.", indonesian: "Aku tidak mau itu." },
      { tagalog: "Pwede ba?", english: "Is it okay? / May I?", indonesian: "Boleh?" },
      { tagalog: "Teka.", english: "Wait.", indonesian: "Tunggu." },
      { tagalog: "Tara.", english: "Let's go.", indonesian: "Ayo." },
    ],
  },
];

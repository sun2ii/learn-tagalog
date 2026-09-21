// Everyday Tagalog: survival and conversation phrases, organised by situation.
// Register: how people actually talk. Where Filipinos would say it in Taglish,
// the Taglish is the main line; `formal` shows the textbook version if useful.

export interface Phrase {
  tagalog: string;
  english: string;
  indonesian?: string;   // anchor for an Indonesian speaker
  note?: string;         // mechanism / usage
  formal?: string;       // textbook or polite (po) variant
  concepts?: string[];   // curriculum integration
}

export interface PhraseGroup {
  id: string;
  name: string;
  scene: string;         // one line: when you'd reach for these
  phrases: Phrase[];
}

export const EVERYDAY_PHRASES: PhraseGroup[] = [
  {
    id: "greetings", name: "Greetings", scene: "Arriving, meeting, leaving.",
    phrases: [
      { tagalog: "Kumusta?", english: "How are you?", indonesian: "Apa kabar?", note: "From Spanish 'cómo está'. 'Kamusta' is the same word." },
      { tagalog: "Mabuti naman.", english: "I'm good.", indonesian: "Baik.", note: "'naman' softens it: 'good, thanks for asking'." },
      { tagalog: "Magandang umaga.", english: "Good morning.", indonesian: "Selamat pagi.", formal: "Magandang umaga po." },
      { tagalog: "Magandang hapon.", english: "Good afternoon.", indonesian: "Selamat siang.", formal: "Magandang hapon po." },
      { tagalog: "Magandang gabi.", english: "Good evening.", indonesian: "Selamat malam.", formal: "Magandang gabi po." },
      { tagalog: "Ako si Ben.", english: "I'm Ben.", note: "'si' marks a name the way 'ang' marks a noun." },
      { tagalog: "Tagasaan ka?", english: "Where are you from?", note: "Answer: 'Taga-Sacramento ako.'" },
      { tagalog: "Taga-America ako.", english: "I'm from America." },
      { tagalog: "Sige, ingat!", english: "Okay, take care!", note: "The standard goodbye. 'Ingat' = be careful." },
      { tagalog: "Kita-kits!", english: "See you!", note: "Casual Taglish from 'kita' (see). Very common." },
    ],
  },
  {
    id: "courtesy", name: "Courtesy", scene: "The small words that make you welcome.",
    phrases: [
      { tagalog: "Salamat.", english: "Thank you.", indonesian: "Terima kasih.", formal: "Salamat po." },
      { tagalog: "Maraming salamat.", english: "Thank you very much.", note: "'marami' = many." },
      { tagalog: "Walang anuman.", english: "You're welcome.", indonesian: "Sama-sama.", note: "Literally 'it's nothing'." },
      { tagalog: "Pasensya na.", english: "Sorry / bear with me.", indonesian: "Maaf.", note: "For small things. 'Sorry' itself is also used constantly." },
      { tagalog: "Excuse me lang po.", english: "Excuse me.", note: "Taglish, and exactly what people say." },
      { tagalog: "Makikiraan po.", english: "Let me pass, please.", note: "Squeezing through a crowd or a jeep." },
      { tagalog: "Paki- …", english: "Please … (prefix)", indonesian: "Tolong …", note: "Attach to a verb: pakibigay = please give, pakiulit = please repeat." },
      { tagalog: "Po / opo", english: "Politeness marker / polite yes", note: "Add 'po' to almost anything when talking to elders, staff, or parents." },
    ],
  },
  {
    id: "yesno", name: "Yes · no · maybe", scene: "Answering, agreeing, declining.",
    phrases: [
      { tagalog: "Oo.", english: "Yes.", indonesian: "Iya.", formal: "Opo." },
      { tagalog: "Hindi.", english: "No.", indonesian: "Tidak.", formal: "Hindi po." },
      { tagalog: "Siguro.", english: "Maybe.", indonesian: "Mungkin.", note: "Not 'sure' – opposite of Spanish 'seguro'." },
      { tagalog: "Sige.", english: "Okay / sure.", indonesian: "Oke.", note: "Agreement, and also 'go ahead'." },
      { tagalog: "Gusto ko.", english: "I want / I like it.", indonesian: "Aku mau.", note: "'gusto' takes the ng-form pronoun: ko, mo, niya." },
      { tagalog: "Ayaw ko.", english: "I don't want.", indonesian: "Aku tidak mau." },
      { tagalog: "Okay lang.", english: "It's fine.", note: "'lang' = just. Answers 'is it okay?' and 'how are you?'." },
      { tagalog: "Wala.", english: "Nothing / none.", note: "Also the answer to 'any problem?'" },
    ],
  },
  {
    id: "food", name: "Food & restaurants", scene: "Ordering, asking, paying.",
    phrases: [
      { tagalog: "Magkano ito?", english: "How much is this?", indonesian: "Berapa ini?" },
      { tagalog: "Ano ang masarap dito?", english: "What's good here?", note: "'masarap' = delicious. Servers love this question." },
      { tagalog: "Isa pa, please.", english: "One more, please.", note: "'pa' = still / more. 'Please' is just said in English." },
      { tagalog: "Tubig, please.", english: "Water, please.", formal: "Pahingi po ng tubig." },
      { tagalog: "Pahingi ng kanin.", english: "Can I have rice?", note: "'pahingi' = please give. Kanin = cooked rice." },
      { tagalog: "Hindi maanghang, please.", english: "Not spicy, please." },
      { tagalog: "Masarap!", english: "Delicious!", indonesian: "Enak!" },
      { tagalog: "Busog na ako.", english: "I'm full.", note: "'na' = already." },
      { tagalog: "Pwede bang makuha ang bill?", english: "Can I get the bill?", note: "Everyday version: just 'Bill, please.' or 'Bill out po.'" },
      { tagalog: "Pa-take-out po.", english: "For take-out, please.", note: "'pa-' on an English verb = please do X. Pure Taglish." },
      { tagalog: "Kain tayo!", english: "Let's eat!", note: "Said to anyone nearby. Polite answer if you're not eating: 'Sige, salamat.'" },
    ],
  },
  {
    id: "transport", name: "Transportation", scene: "Jeep, tricycle, Grab, taxi.",
    phrases: [
      { tagalog: "Para po!", english: "Stop here, please!", note: "How you get off a jeepney. From Spanish 'parar'." },
      { tagalog: "Bayad po.", english: "Here's my fare.", note: "Say it as you pass coins forward on a jeep." },
      { tagalog: "Magkano papuntang Makati?", english: "How much to Makati?", note: "'papunta' = going to." },
      { tagalog: "Sa SM po.", english: "To SM, please.", note: "'sa' + place. Enough for any driver." },
      { tagalog: "Dito na lang po.", english: "Right here is fine.", note: "'na lang' = just, settle for this." },
      { tagalog: "May Grab ba dito?", english: "Is there Grab here?" },
      { tagalog: "Saan ang sakayan?", english: "Where's the stop / terminal?", note: "'sakayan' = place to ride." },
      { tagalog: "Diretso lang.", english: "Straight ahead." },
      { tagalog: "Ingat sa pagmamaneho.", english: "Drive safe." },
    ],
  },
  {
    id: "directions", name: "Directions", scene: "Finding things and places.",
    phrases: [
      { tagalog: "Nasaan ang banyo?", english: "Where's the bathroom?", note: "'nasaan' asks where something IS. 'saan' asks where something HAPPENS." },
      { tagalog: "Saan ang CR?", english: "Where's the restroom?", note: "'CR' (comfort room) is what everyone says." },
      { tagalog: "Paano pumunta sa Intramuros?", english: "How do I get to Intramuros?" },
      { tagalog: "Malayo ba?", english: "Is it far?", indonesian: "Jauh?" },
      { tagalog: "Malapit lang.", english: "It's close." },
      { tagalog: "Kanan.", english: "Right.", indonesian: "Kanan." },
      { tagalog: "Kaliwa.", english: "Left." },
      { tagalog: "Dito.", english: "Here." },
      { tagalog: "Diyan.", english: "There (near you)." },
      { tagalog: "Doon.", english: "Over there (far)." },
    ],
  },
  {
    id: "shopping", name: "Shopping", scene: "Markets, malls, sari-sari stores.",
    phrases: [
      { tagalog: "Magkano?", english: "How much?", indonesian: "Berapa?" },
      { tagalog: "Ang mahal!", english: "So expensive!", note: "'ang' + adjective = exclamation. Also: 'Ang ganda!' (so beautiful)." },
      { tagalog: "May discount ba?", english: "Is there a discount?" },
      { tagalog: "Pwede bang tumawad?", english: "Can I bargain?", note: "Markets yes, malls no." },
      { tagalog: "Titingin lang ako.", english: "Just looking." },
      { tagalog: "Kukunin ko ito.", english: "I'll take this.", note: "Future of 'kuha' (get) with ko." },
      { tagalog: "May mas malaki ba?", english: "Is there a bigger one?", note: "'mas' = more. Mas maliit = smaller." },
      { tagalog: "Isa lang.", english: "Just one." },
    ],
  },
  {
    id: "money", name: "Money", scene: "Change, cards, ATMs.",
    phrases: [
      { tagalog: "Wala akong barya.", english: "I don't have coins / small change.", note: "'wala' = none. Drivers and stores will ask." },
      { tagalog: "Ang sukli ko po?", english: "My change, please?", note: "'sukli' = change you get back." },
      { tagalog: "Pwede bang mag-card?", english: "Can I pay by card?", note: "'mag-' turns the English noun into a verb. Very Taglish." },
      { tagalog: "Cash lang?", english: "Cash only?" },
      { tagalog: "Saan may ATM?", english: "Where is there an ATM?" },
      { tagalog: "Pwede bang magpapalit ng dollars?", english: "Can I exchange dollars?" },
      { tagalog: "Libre?", english: "Free?", note: "From Spanish 'libre'." },
      { tagalog: "Sobra na.", english: "That's too much.", note: "For a price or a serving." },
    ],
  },
  {
    id: "hotel", name: "Hotel", scene: "Check-in, rooms, small problems.",
    phrases: [
      { tagalog: "May reservation ako.", english: "I have a reservation.", note: "'may' = there is / I have." },
      { tagalog: "Ano ang WiFi password?", english: "What's the WiFi password?" },
      { tagalog: "Anong oras ang breakfast?", english: "What time is breakfast?", note: "'anong' = 'ano ang' squeezed together." },
      { tagalog: "Pahingi ng extra towel.", english: "Can I have an extra towel?" },
      { tagalog: "Sira ang aircon.", english: "The aircon is broken.", note: "'sira' = broken. Sira ang gripo = the tap is broken." },
      { tagalog: "Walang tubig.", english: "There's no water." },
      { tagalog: "Walang kuryente.", english: "There's no power." },
      { tagalog: "Pwede bang mag-late checkout?", english: "Can I do a late checkout?" },
    ],
  },
  {
    id: "airport", name: "Airport", scene: "Immigration, gates, luggage.",
    phrases: [
      { tagalog: "Turista lang ako.", english: "I'm just a tourist." },
      { tagalog: "Bakasyon lang.", english: "Just vacation." },
      { tagalog: "Dalawang linggo.", english: "Two weeks.", note: "'dalawa' + ng + linggo. Tatlong linggo = three weeks." },
      { tagalog: "Nasaan ang gate 12?", english: "Where's gate 12?" },
      { tagalog: "Delayed ba ang flight?", english: "Is the flight delayed?" },
      { tagalog: "Saan ang immigration?", english: "Where's immigration?" },
      { tagalog: "Nasaan ang bagahe ko?", english: "Where's my luggage?" },
      { tagalog: "May SIM card ba dito?", english: "Is there a SIM card here?" },
    ],
  },
  {
    id: "family", name: "Family & social", scene: "Meeting her family, being a guest.",
    phrases: [
      { tagalog: "Masaya akong makilala kayo.", english: "Happy to meet you (all).", note: "'kayo' is also the polite singular – safe with parents." },
      { tagalog: "Kuya / Ate", english: "Older brother / older sister", note: "Also for waiters, drivers, anyone slightly older. Use it freely." },
      { tagalog: "Tito / Tita", english: "Uncle / Aunt", note: "Any adult of your parents' generation, related or not." },
      { tagalog: "Lolo / Lola", english: "Grandpa / Grandma" },
      { tagalog: "Salamat sa pagkain.", english: "Thank you for the food.", note: "'sa' = for. Say it after every meal." },
      { tagalog: "Ang ganda!", english: "So beautiful!", note: "Works for places, food, people, the sunset." },
      { tagalog: "Ang saya!", english: "So fun!" },
      { tagalog: "Nag-aaral ako ng Tagalog.", english: "I'm learning Tagalog.", note: "Say this early. Everything gets easier." },
      { tagalog: "Mahal kita.", english: "I love you.", note: "'kita' = I → you, one word. Unlike Indonesian 'kita' (we)." },
      { tagalog: "Tara!", english: "Let's go!", indonesian: "Ayo!" },
    ],
  },
  {
    id: "understanding", name: "Understanding", scene: "When you're lost in the conversation.",
    phrases: [
      { tagalog: "Hindi ko maintindihan.", english: "I don't understand.", indonesian: "Aku tidak mengerti." },
      { tagalog: "Naiintindihan ko.", english: "I understand.", indonesian: "Aku mengerti." },
      { tagalog: "Hindi ko alam.", english: "I don't know.", indonesian: "Aku tidak tahu." },
      { tagalog: "Pakiulit po.", english: "Please repeat.", indonesian: "Tolong ulangi." },
      { tagalog: "Dahan-dahan lang.", english: "Slowly, please.", indonesian: "Pelan-pelan." },
      { tagalog: "Ano ang ibig sabihin ng 'sukli'?", english: "What does 'sukli' mean?", note: "'ibig sabihin' = meaning." },
      { tagalog: "Konting Tagalog lang.", english: "Just a little Tagalog.", note: "'konti' = a little." },
      { tagalog: "Marunong ka bang mag-English?", english: "Do you speak English?", note: "'marunong' = knows how." },
      { tagalog: "Teka.", english: "Wait / hold on.", indonesian: "Tunggu." },
    ],
  },
  {
    id: "problems", name: "Problems & help", scene: "When something goes wrong.",
    phrases: [
      { tagalog: "Tulong!", english: "Help!", indonesian: "Tolong!" },
      { tagalog: "Pwede bang tumulong?", english: "Can you help?" },
      { tagalog: "Nawawala ako.", english: "I'm lost." },
      { tagalog: "Nawala ang phone ko.", english: "I lost my phone.", note: "'nawala' = got lost. Nawala ang wallet ko." },
      { tagalog: "May nagnakaw ng bag ko.", english: "Someone stole my bag." },
      { tagalog: "Masakit ang tiyan ko.", english: "My stomach hurts.", note: "'masakit' = painful. Masakit ang ulo ko = headache." },
      { tagalog: "Kailangan ko ng doktor.", english: "I need a doctor.", note: "'kailangan' + ko + ng = I need." },
      { tagalog: "Tawagan mo ang pulis.", english: "Call the police." },
      { tagalog: "Okay ka lang?", english: "Are you okay?" },
      { tagalog: "Pagod ako.", english: "I'm tired.", indonesian: "Aku capek." },
      { tagalog: "Gutom ako.", english: "I'm hungry.", indonesian: "Aku lapar." },
    ],
  },
];

export const phraseId = (p: Phrase) => `phrase:${p.tagalog}`;
export const getGroup = (id: string) => EVERYDAY_PHRASES.find((g) => g.id === id);

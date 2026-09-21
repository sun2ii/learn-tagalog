# Tagalog Learning App: High-Level Architecture

## The Core Insight

This app teaches Tagalog through **compositional sentence construction**. Instead of memorizing phrases, you learn the **primitives** (pronouns, verbs, nouns, particles) and the **composition rules** (word order, verb conjugation, focus/voice) that generate all sentences.

```
Learning model:
  Memorization:     "Kumain ako" = "I ate" (isolated fact)
  Composition:      {actor: ako, root: kain, aspect: completed, focus: actor} → "Kumain ako"
                    Change aspect to ongoing → "Kumakain ako" (I'm eating)
                    Change actor to siya → "Kumain siya" (He ate)
```

**Why this matters for Tagalog:** Tagalog has regular morphology (verb conjugation patterns are predictable) but unusual structure (focus/voice system, flexible word order). Learning the rules gives you generative power fast.

---

## The Four Learning Modes

### 1. Everyday (`/everyday`)
**What:** Pre-built conversational phrases with spaced repetition.
**Learning style:** Pattern recognition, social scripts.
**Best for:** Immediate survival phrases ("Magkano?" = "How much?")
**Exercise:** Mark phrases as familiar → review based on Leitner boxes.

### 2. Grammar Gym (`/gym`)
**What:** Type the Tagalog sentence from a prompt.
**Learning style:** Production under constraint, muscle memory.
**Best for:** Internalizing verb conjugations and word order.
**Exercise:** See symbolic prompt or English → type full Tagalog sentence.

### 3. Builder (`/builder`)
**What:** Assemble sentence pieces in correct order.
**Learning style:** Spatial manipulation of grammar.
**Best for:** Understanding how pieces fit together.
**Exercise:** Drag tokens (verb, pronouns, particles, nouns) into position.

### 4. Questions (`/questions`)
**What:** Transform a statement into different question forms.
**Learning style:** Transformation drilling.
**Best for:** Learning the yes/no particle "ba" and wh-question words.
**Exercise:** Given "Kumain siya" → produce "Kumain ba siya?" or "Sino ang kumain?"

---

## The Curriculum: 10 Concepts in Order

```
Concept           New Ability                          Example Progression
─────────────────────────────────────────────────────────────────────────────
1. actor          Name the doer                        Ako. (I.)
2. aspect         Add verb, mark time-relation         Kumain ako. (I ate.)
3. object         Add what is affected                 Kumain ako ng mangga. (I ate mango.)
4. time           Add when                             Kumain ako ng mangga kahapon. (I ate mango yesterday.)
5. focus          Shift perspective (actor→object)     Kinain ko ang mangga. (I ate THE mango.)
6. negation       Add hindi                            Hindi ako kumain. (I didn't eat.)
7. yes-no         Add ba particle                      Kumain ka ba? (Did you eat?)
8. wh-questions   Replace element with question word   Ano ang kinain mo? (What did you eat?)
9. combination    Mix negation + questions             Bakit hindi ka kumain? (Why didn't you eat?)
10. connectors    Add kasi, kaya, para                 Hindi ako kumain kasi... (I didn't eat because...)
```

**Unlock rule:** 80% accuracy on at least 5 attempts → next concept unlocks.

---

## The Sentence State: Universal Structure

Every Tagalog sentence the app generates comes from this schema:

```typescript
SentenceState {
  root: string          // verb root: kain, inom, bili, kuha, gawa, sulat, basa, punta
  aspect: string        // completed | ongoing | contemplated
  actor: string         // pronoun: ako, ka, ikaw, siya, kami, tayo, kayo, sila
  focus: string         // "actor" (who did it) | "object" (what was affected)
  object?: string       // noun: mangga, kanin, tubig, libro, etc.
  time?: string         // kahapon (yesterday) | ngayon (now) | mamaya (later) | bukas (tomorrow)
  polarity?: string     // "affirmative" | "negative"
  mood?: string         // "statement" | "yes_no" | "wh_question"
  questionWord?: string // ano | sino | saan | kailan | bakit | paano
}
```

**The renderer is deterministic:** Given any valid `SentenceState`, the same Tagalog sentence is always produced. This is the generative engine.

---

## Tagalog Grammar Primitives (What You're Learning)

### Verb Conjugation: -um- and -in- patterns

```
Root: kain (eat)

Actor-focus (who did the eating):
  completed:    k-um-ain    (kumain)
  ongoing:      k-um-akain  (kumakain)
  contemplated: kakain

Object-focus (what was eaten):
  completed:    k-in-ain    (kinain)
  ongoing:      k-in-akain  (kinakain)
  contemplated: kakainin
```

### Pronoun Forms

```
Person          Ang-form (topic)    Ng-form (non-topic)
────────────────────────────────────────────────────────
I               ako                 ko
you (singular)  ikaw / ka           mo
he/she          siya                niya
we (excl.)      kami                namin
we (incl.)      tayo                natin
you (plural)    kayo                ninyo
they            sila                nila
```

### Focus/Voice System (The Unique Tagalog Feature)

**Actor-focus:** The doer is the topic (marked with ang-form pronoun).
```
Kumain ako ng mangga.
(ate I [some] mango)
"I ate mango." [Focus: I did the eating]
```

**Object-focus:** The object is the topic (marked with ang).
```
Kinain ko ang mangga.
(was-eaten by-me the mango)
"I ate THE mango." [Focus: The mango was what got eaten]
```

**Why this matters:** Tagalog speakers constantly shift focus based on what's important in the sentence. Learning to switch between `kumain` and `kinain` is essential.

### Word Order Rules

```
Affirmative:  VERB + ACTOR + [ng OBJECT] + [TIME]
Negative:     Hindi + ACTOR + VERB + [ng OBJECT] + [TIME]
Yes/No:       VERB + ba + ACTOR + [ng OBJECT] + [TIME]?
Wh-question:  [Q-WORD] + ang/sino + [VERB-OBJECT-FOCUS] + [ACTOR-NG-FORM]?
```

---

## Exercise Generation Flow

```
Curriculum concept → constrains which dimensions are available
                     ↓
Random SentenceState generated within constraints
                     ↓
Renderer produces {tagalog, english, parts[]}
                     ↓
Mode UI displays prompt + collects answer
                     ↓
Normalizer compares answer to target
                     ↓
Result updates learner progress in localStorage
```

**No hardcoded exercises.** Every drill is synthesized from the grammar engine.

---

## Vocabulary Scope

| Category | Examples | Compatible Verbs |
|----------|----------|------------------|
| food | mangga, kanin, isda, manok, itlog, tinapay | kain (eat) |
| drink | tubig, kape, tsaa, gatas, juice | inom (drink) |
| item | libro, papel, lapis, telepono, bag | kuha, bili, gawa (get, buy, make) |
| document | sulat, email, mensahe, kuwento | sulat, basa (write, read) |
| place | bahay, tindahan, eskwelahan, palengke | punta (go to) |

---

## Questions to Evaluate Each Mode

### Everyday Mode
- **Strengths:** Immediate utility, social scripts, recognition-based (low cognitive load)
- **Weaknesses:** No generative power, doesn't teach composition rules
- **Best use:** First 100 phrases for travel/survival
- **Question:** Do you need ready-made phrases fast, or do you want to construct your own sentences?

### Grammar Gym Mode
- **Strengths:** Production practice, internalizes conjugation patterns
- **Weaknesses:** Requires knowing the answer before typing, can feel like drills
- **Best use:** After you understand the rule, repeat until automatic
- **Question:** Do you learn better by producing output, or by seeing patterns first?

### Builder Mode
- **Strengths:** Visual, manipulative, shows how pieces fit, lower production barrier
- **Weaknesses:** Recognition-based (easier than production), less recall practice
- **Best use:** First exposure to a new concept, understanding structure
- **Question:** Do you need to see the pieces before you can produce the whole?

### Questions Mode
- **Strengths:** Transformation practice, exercises the focus/voice contrast
- **Weaknesses:** Narrower scope (only question formation)
- **Best use:** After basic sentences, before real conversations
- **Question:** Are you ready to manipulate sentences, not just produce them?

---

## Recommended Sequence

```
Phase 1: Foundation (Concepts 1-4)
├── Everyday: Learn 30 survival phrases
├── Builder: Assemble actor + verb + object sentences
└── Gym: Drill aspect changes (kumain/kumakain/kakain)

Phase 2: Voice/Focus (Concept 5)
├── Builder: Understand ang/ng placement
└── Gym: Drill the shift between actor-focus and object-focus

Phase 3: Negation & Questions (Concepts 6-8)
├── Questions mode: Transform statements → questions
└── Gym: Mix negation + questions

Phase 4: Fluency (Concepts 9-10)
├── Everyday: More complex phrases
└── All modes: Mix everything
```

---

## Key Tradeoffs

| Approach | Pro | Con |
|----------|-----|-----|
| Phrases first (Everyday) | Immediate utility | No generative power |
| Grammar first (Gym) | Deep understanding | Slower to first conversation |
| Assembly (Builder) | Visual, intuitive | Recognition > recall |
| Transformation (Questions) | Exercises flexibility | Narrow scope |

**Bottom line:** Use Builder for first exposure, Gym for internalization, Questions for flexibility, Everyday for ready-made scripts.

---

## Data Model Summary

```
Verbs:    8 roots × 3 aspects × 2 focuses = 48 verb forms
Nouns:    ~40 nouns across 5 categories
Pronouns: 8 persons × 2 forms = 16 pronoun forms
Times:    4 time expressions
Moods:    statement, yes_no, wh_question
Polarity: affirmative, negative

Sentence space: millions of valid combinations
(constrained by curriculum to what you've unlocked)
```

---

## File Map for Reference

```
/src/curriculum/index.ts     → 10 concepts in unlock order
/src/curriculum/unlock.ts    → mastery checking, progression
/src/engine/types.ts         → SentenceState, Exercise types
/src/languages/tagalog/
  ├── renderer.ts            → SentenceState → Tagalog + English
  ├── verbs.ts               → conjugation data
  ├── nouns.ts               → vocabulary with categories
  ├── pronouns.ts            → ang-form and ng-form
  └── particles.ts           → ang, ng, sa, ba, hindi
/src/lib/exercises.ts        → exercise generation per mode
/src/lib/learner.ts          → localStorage persistence
/src/content/everyday.ts     → pre-built phrases
```

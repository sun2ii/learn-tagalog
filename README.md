# Learn Tagalog

A symbolic drill system for learning Tagalog, designed for Indonesian speakers.

## The Approach

This isn't a vocabulary app. It's a **pattern trainer** that builds intuition for Tagalog's grammatical machinery.

The core insight: Tagalog and Indonesian share Austronesian roots, so cognates come free. What's hard is the **verb system** (aspect, not tense) and **focus/voice** (who gets the spotlight).

## Symbol System

Instead of translations, we use symbols to represent grammatical concepts:

### Pronouns
| Symbol | Pronoun | Meaning |
|--------|---------|---------|
| `I` | ako | speaker |
| `U` | ka/ikaw | listener |
| `U++` | kayo | listener + others |
| `I++` | kami | speaker + others (not you) |
| `IU++` | tayo | speaker + listener + others |
| `◇` | siya | third party |
| `◇++` | sila | third parties |

### Aspect (not tense!)
| Symbol | Form | Meaning |
|--------|------|---------|
| `x` | kumain | completed |
| `o` | kumakain | ongoing |
| `?` | kakain | contemplated/future |

### Time
| Symbol | Word | Meaning |
|--------|------|---------|
| `<` | kahapon | yesterday |
| `o` | ngayon | now |
| `>` | mamaya | later |
| `>1` | bukas | tomorrow |

### Marker
| Symbol | Word | Function |
|--------|------|----------|
| `->` | ng | links verb to object |

### Objects
Emoji symbols for food vocabulary used in drills.

## How It Works

The drill shows a symbolic prompt:
```
    x
kain IU++ -> rice o
```

You type the Tagalog:
```
Kumain tayo ng kanin ngayon.
```

The symbols encode:
- `x` above verb = completed aspect (kumain)
- `IU++` = inclusive we (tayo)
- `->` = ng (object marker)
- rice emoji = kanin
- `o` = now (ngayon)

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Structure

```
src/
  languages/tagalog/
    symbols.ts      # Single source of truth for all symbols
    pronouns.ts     # Pronoun data and case forms
    verbs.ts        # Verb conjugation engine
    nouns.ts        # Object vocabulary
  engine/
    session.ts      # Drill generation and answer checking
    stats.ts        # Progress tracking
  app/
    gym/            # Drill interface
    map/            # Grammar reference
  content/
    map.ts          # System map + cognates + false friends
```

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS

## License

MIT

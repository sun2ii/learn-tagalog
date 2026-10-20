// https://github.com/global-asp/global-asp/tree/master/tl

// Prints every spoken line as JSON: [{id, text, voice?}]. Used by gen-audio.py.
// voice: "A" = female (Blessica), "B" = male (Angelo). Omitted = decided by id suffix (legacy lessons).
import { lessons } from "../src/content";
import { STORIES } from "../src/content/stories";
const out: { id: string; text: string; voice?: string }[] = [];
for (const l of lessons) for (const e of l.exchanges) {
  for (const ln of e.lines) out.push({ id: ln.id, text: ln.text });
  out.push({ id: e.variation.id, text: e.variation.text });
}
// Stories: narrator is the female voice; Ben's own lines are male.
for (const s of STORIES) for (const ln of s.lines) out.push({ id: ln.id, text: ln.text.replace(/["“”]/g, ""), voice: ln.voice ?? "A" });
console.log(JSON.stringify(out, null, 2));

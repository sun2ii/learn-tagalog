// Prints every spoken line as JSON: [{id, text}]. Used by gen-audio.py.
import { lessons } from "../src/content";
const out: { id: string; text: string }[] = [];
for (const l of lessons) for (const e of l.exchanges) {
  for (const ln of e.lines) out.push({ id: ln.id, text: ln.text });
  out.push({ id: e.variation.id, text: e.variation.text });
}
console.log(JSON.stringify(out, null, 2));

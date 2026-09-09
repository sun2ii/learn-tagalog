"""Pre-generate Filipino audio for every line (free, Microsoft neural voice via edge-tts).
Usage:  pip install edge-tts && npx tsx scripts/export-lines.ts > scripts/lines.json && python3 scripts/gen-audio.py
Skips files that already exist. Voices: fil-PH-BlessicaNeural (female), fil-PH-AngeloNeural (male).
"""
import asyncio, json, os, sys, edge_tts
VOICE = {"A": "fil-PH-BlessicaNeural", "B": "fil-PH-AngeloNeural"}
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "audio")
async def main():
    lines = json.load(open(os.path.join(os.path.dirname(__file__), "lines.json")))
    proxy = os.environ.get("HTTPS_PROXY")
    for ln in lines:
        path = os.path.join(OUT, f"{ln['id']}.mp3")
        if os.path.exists(path) and os.path.getsize(path) > 0: continue
        # Speaker A lines get the female voice; everything else the male voice, so a dialogue sounds like two people.
        voice = VOICE["A"] if ln["id"].endswith("a") or ln["id"].endswith("c") or ln["id"].endswith("v") else VOICE["B"]
        c = edge_tts.Communicate(ln["text"], voice, rate="-10%", proxy=proxy)
        await c.save(path); print("ok", ln["id"], ln["text"])
asyncio.run(main())

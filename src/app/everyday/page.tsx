"use client";

import { useState } from "react";
import { EVERYDAY_PHRASES, type PhraseGroup } from "@/content/everyday";

function PhraseCard({ group }: { group: PhraseGroup }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-line bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between cursor-pointer"
      >
        <span className="text-lg font-semibold">{group.name}</span>
        <span className="text-muted text-xl">{expanded ? "−" : "+"}</span>
      </button>

      {expanded && (
        <div className="border-t border-line">
          {group.phrases.map((phrase, i) => (
            <div
              key={i}
              className={`p-4 ${i > 0 ? "border-t border-line/50" : ""}`}
            >
              <div className="text-lg font-semibold">{phrase.tagalog}</div>
              <div className="text-sm text-muted">{phrase.english}</div>
              {phrase.indonesian && (
                <div className="text-xs text-muted/70 mt-0.5">{phrase.indonesian}</div>
              )}
              {phrase.note && (
                <div className="text-xs text-muted/60 mt-1 italic">{phrase.note}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EverydayPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Everyday Tagalog</h1>
        <p className="text-muted">
          Common phrases for daily conversation.
        </p>
      </div>

      <div className="space-y-3">
        {EVERYDAY_PHRASES.map((group) => (
          <PhraseCard key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
}

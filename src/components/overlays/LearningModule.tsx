import { useState } from "react";
import { OverlayShell } from "@/components/OverlayShell";
import type { LearningGradeLevel } from "@/lib/types";
import { GraduationCap } from "lucide-react";

const TIERS: { id: LearningGradeLevel; title: string; sub: string; blurb: string }[] = [
  { id: "elementary", title: "Bug Buddy", sub: "K–5", blurb: "Meet our insect friends and foes through stories and pictures." },
  { id: "middle", title: "Field Scout", sub: "6–8", blurb: "Read the field: insect orders, life cycles, and host crops." },
  { id: "high", title: "IPM Specialist", sub: "9–12", blurb: "Integrated Pest Management, economic thresholds, and IRAC groups." },
  { id: "collegiate", title: "Field Entomologist", sub: "Collegiate", blurb: "Taxonomy, diagnostics, and resistance management deep dives." },
];

const TOPICS = [
  { id: "orders", title: "Insect orders at a glance", body: "Beetles, flies, moths/butterflies, true bugs, bees/wasps, grasshoppers — what to look for first." },
  { id: "life-cycle", title: "Complete vs. incomplete metamorphosis", body: "Egg → larva → pupa → adult, versus egg → nymph → adult. Why it matters for scouting." },
  { id: "ipm", title: "Integrated Pest Management", body: "Cultural, mechanical, biological, and chemical tactics layered into one plan." },
  { id: "thresholds", title: "Economic thresholds", body: "When scouting counts cross the line that justifies treatment." },
  { id: "natural-enemies", title: "Beneficial insects", body: "Lacewings, lady beetles, syrphid flies, parasitoid wasps — your unpaid scout team." },
];

export function LearningModule({ onClose }: { onClose: () => void }) {
  const [tier, setTier] = useState<LearningGradeLevel>("middle");
  const [topic, setTopic] = useState(TOPICS[0]);

  return (
    <OverlayShell title="Learn" subtitle="Topic guides by tier" onClose={onClose}>
      <div className="grid gap-3 sm:grid-cols-4">
        {TIERS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTier(t.id)}
            className={`rounded-xl border p-4 text-left transition ${
              tier === t.id ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/50"
            }`}
          >
            <GraduationCap className="h-5 w-5 text-primary" />
            <div className="mt-2 text-base font-semibold text-foreground">{t.title}</div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t.sub}</div>
            <p className="mt-1 text-xs text-muted-foreground">{t.blurb}</p>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[260px_1fr]">
        <aside className="space-y-1">
          <h3 className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Topics</h3>
          {TOPICS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTopic(t)}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm transition ${
                topic.id === t.id ? "bg-primary/10 font-semibold text-primary" : "text-foreground hover:bg-muted"
              }`}
            >
              {t.title}
            </button>
          ))}
        </aside>
        <article className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-bold text-foreground">{topic.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/85">{topic.body}</p>
          <p className="mt-6 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
            Tier-adjusted long-form content for the <span className="font-medium">{tier}</span> tier will appear here as the curriculum is fleshed out.
          </p>
        </article>
      </div>
    </OverlayShell>
  );
}
import { useMemo, useState } from "react";
import { OverlayShell } from "@/components/OverlayShell";
import type { LearningGradeLevel } from "@/lib/types";
import { GraduationCap, Sparkles } from "lucide-react";
import { CURRICULUM, type Lesson } from "@/data/curriculum";

const TIERS: { id: LearningGradeLevel; title: string; sub: string; blurb: string }[] = [
  { id: "elementary", title: "Bug Buddy", sub: "K–5", blurb: "Meet our insect friends and foes through stories and pictures." },
  { id: "middle", title: "Field Scout", sub: "6–8", blurb: "Read the field: insect orders, life cycles, and host crops." },
  { id: "high", title: "IPM Specialist", sub: "9–12", blurb: "Integrated Pest Management, economic thresholds, and IRAC groups." },
  { id: "collegiate", title: "Field Entomologist", sub: "Collegiate", blurb: "Taxonomy, diagnostics, and resistance management deep dives." },
];

export function LearningModule({ onClose }: { onClose: () => void }) {
  const [tier, setTier] = useState<LearningGradeLevel>("elementary");
  const units = CURRICULUM[tier];
  const firstLessonId = useMemo(() => units[0]?.lessons[0]?.id ?? "", [units]);
  const [lessonId, setLessonId] = useState<string>(firstLessonId);

  // Reset selection when tier changes
  const activeLesson: Lesson | undefined = useMemo(() => {
    for (const u of units) {
      const l = u.lessons.find((x) => x.id === lessonId);
      if (l) return l;
    }
    return units[0]?.lessons[0];
  }, [units, lessonId]);

  return (
    <OverlayShell title="Learn" subtitle="Topic guides by tier" onClose={onClose}>
      <div className="grid gap-3 sm:grid-cols-4">
        {TIERS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTier(t.id);
              setLessonId(CURRICULUM[t.id][0]?.lessons[0]?.id ?? "");
            }}
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

      <div className="mt-6 grid gap-6 md:grid-cols-[280px_1fr]">
        <aside className="space-y-5">
          {units.map((unit) => (
            <div key={unit.id}>
              <h3 className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {unit.title}
              </h3>
              <div className="mt-1 space-y-1">
                {unit.lessons.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLessonId(l.id)}
                    className={`block w-full rounded-md px-3 py-2 text-left text-sm transition ${
                      activeLesson?.id === l.id
                        ? "bg-primary/10 font-semibold text-primary"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {l.title}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>

        <article className="rounded-xl border border-border bg-card p-6">
          {activeLesson ? (
            <>
              <h2 className="text-2xl font-bold text-foreground">{activeLesson.title}</h2>
              <div className="mt-4 space-y-5">
                {activeLesson.sections.map((s, i) => (
                  <section key={i}>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                      {s.heading}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/85">{s.body}</p>
                  </section>
                ))}
              </div>
              {activeLesson.funFact && (
                <div className="mt-6 flex gap-3 rounded-lg border border-accent/40 bg-accent/15 p-4">
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-primary">
                      Did you know?
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-foreground/85">
                      {activeLesson.funFact}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No lessons yet for this tier.</p>
          )}
        </article>
      </div>
    </OverlayShell>
  );
}
import { useState } from "react";
import type { GradeLevel, LearningGradeLevel } from "@/lib/types";
import { Bug, BookOpen, Gamepad2, Sprout, Library, Trophy, Flame, Sparkles, ArrowLeft } from "lucide-react";

type Destination = "learn" | "practice" | "play";

interface Props {
  xp: number;
  streak: number;
  totalCorrect: number;
  totalWrong: number;
  speciesMastered: number;
  startGame: (g: GradeLevel) => void;
  onOpenLearning: (tier: LearningGradeLevel) => void;
  onOpenPractice: (tier: GradeLevel) => void;
  onOpenFarm: () => void;
  onOpenGlossary: () => void;
  onOpenStats: () => void;
}

const LEVELS: { id: LearningGradeLevel; title: string; sub: string; blurb: string; tone: string }[] = [
  { id: "elementary", title: "K–5", sub: "Bug Buddy", blurb: "Stories, pictures, and playful drills.", tone: "from-accent/40 to-secondary/25" },
  { id: "middle", title: "6–8", sub: "Field Scout", blurb: "Orders, life cycles, and scouting skills.", tone: "from-secondary/40 to-primary/20" },
  { id: "high", title: "9–12", sub: "IPM Specialist", blurb: "Thresholds, tactics, and resistance.", tone: "from-primary/25 to-accent/25" },
  { id: "collegiate", title: "College", sub: "Field Entomologist", blurb: "Taxonomy and diagnostics deep dives.", tone: "from-primary/15 to-secondary/30" },
];

const DEST_META: Record<Destination, { title: string; icon: typeof Bug; copy: string }> = {
  learn: { title: "Learn", icon: BookOpen, copy: "Pick a level to open its learning modules." },
  practice: { title: "Practice", icon: Gamepad2, copy: "Pick a level to open its mini-games." },
  play: { title: "Play", icon: Sprout, copy: "Pick a level to start an official run." },
};

export function LandingPage(p: Props) {
  const [dest, setDest] = useState<Destination | null>(null);

  const levels = dest === "learn" ? LEVELS : LEVELS.filter((l) => l.id !== "collegiate");

  const choose = (id: LearningGradeLevel) => {
    if (dest === "learn") p.onOpenLearning(id);
    else if (dest === "practice") p.onOpenPractice(id as GradeLevel);
    else if (dest === "play") p.startGame(id as GradeLevel);
    setDest(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-secondary/20 to-accent/30 p-8 sm:p-12">
        <div className="absolute -right-12 -top-12 opacity-20">
          <Bug className="h-64 w-64 text-primary" strokeWidth={1} />
        </div>
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1 rounded-full bg-card/80 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> 108 species · entomology field school
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Identify, scout, and manage insects from the field to the lab.
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            Choose Learn, Practice, or Play — then pick your grade level to begin.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Stat icon={Flame} label="Streak" value={p.streak} />
            <Stat icon={Sparkles} label="XP" value={p.xp} />
            <Stat icon={Trophy} label="Mastered" value={p.speciesMastered} />
          </div>
        </div>
      </section>

      {dest === null ? (
        <>
          {/* Primary modes */}
          <section className="mt-10">
            <div className="grid gap-5 sm:grid-cols-3">
              <BigTile icon={BookOpen} title="Learn" desc="Topic guides by grade level" tone="from-accent/40 to-secondary/25" onClick={() => setDest("learn")} />
              <BigTile icon={Gamepad2} title="Practice" desc="Mini-games and drills" tone="from-secondary/40 to-primary/20" onClick={() => setDest("practice")} />
              <BigTile icon={Sprout} title="Play" desc="Official scored runs" tone="from-primary/25 to-accent/25" onClick={() => setDest("play")} />
            </div>
          </section>

          {/* Secondary modes */}
          <section className="mt-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:max-w-xl">
              <SmallTile icon={Library} title="Glossary" desc="All 108 species" onClick={p.onOpenGlossary} />
              <SmallTile icon={Trophy} title="Stats" desc="Your XP & badges" onClick={p.onOpenStats} />
            </div>
          </section>
        </>
      ) : (
        <section className="mt-10">
          <button
            onClick={() => setDest(null)}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h2 className="mt-3 text-2xl font-bold text-foreground">
            {DEST_META[dest].title} — choose your level
          </h2>
          <p className="text-sm text-muted-foreground">{DEST_META[dest].copy}</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {levels.map((l) => (
              <button
                key={l.id}
                onClick={() => choose(l.id)}
                className={`group overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${l.tone} p-6 text-left transition hover:-translate-y-0.5 hover:shadow-lg`}
              >
                <div className="text-4xl font-black tracking-tighter text-primary">{l.title}</div>
                <div className="mt-1 text-sm font-semibold uppercase tracking-widest text-foreground/80">{l.sub}</div>
                <p className="mt-2 text-xs text-muted-foreground">{l.blurb}</p>
                <div className="mt-5 inline-flex items-center gap-1 rounded-full bg-card/90 px-3 py-1 text-xs font-medium text-foreground">
                  Enter →
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function BigTile({ icon: Icon, title, desc, tone, onClick }: { icon: typeof Bug; title: string; desc: string; tone: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex min-h-52 flex-col items-start justify-between rounded-2xl border border-border bg-gradient-to-br ${tone} p-7 text-left transition hover:-translate-y-0.5 hover:shadow-lg`}
    >
      <Icon className="h-12 w-12 text-primary" strokeWidth={1.5} />
      <div>
        <div className="text-2xl font-bold text-foreground">{title}</div>
        <div className="mt-1 text-sm text-muted-foreground">{desc}</div>
      </div>
    </button>
  );
}

function SmallTile({ icon: Icon, title, desc, onClick }: { icon: typeof Bug; title: string; desc: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition hover:bg-muted/50"
    >
      <Icon className="h-5 w-5 shrink-0 text-primary" />
      <div>
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </button>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Bug; label: string; value: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-card/80 px-3 py-1.5 text-sm">
      <Icon className="h-4 w-4 text-primary" />
      <span className="font-semibold text-foreground">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

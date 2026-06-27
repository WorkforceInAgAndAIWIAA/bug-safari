import type { GradeLevel } from "@/lib/types";
import { Bug, BookOpen, Gamepad2, Sprout, Library, Trophy, Flame, Sparkles } from "lucide-react";

interface Props {
  xp: number;
  streak: number;
  totalCorrect: number;
  totalWrong: number;
  speciesMastered: number;
  startGame: (g: GradeLevel) => void;
  onOpenLearning: () => void;
  onOpenPractice: () => void;
  onOpenFarm: () => void;
  onOpenGlossary: () => void;
  onOpenStats: () => void;
}

const GRADES: { id: GradeLevel; title: string; sub: string; tone: string }[] = [
  { id: "elementary", title: "K–5", sub: "Bug Buddy", tone: "from-accent/40 to-secondary/30" },
  { id: "middle", title: "6–8", sub: "Field Scout", tone: "from-secondary/40 to-primary/20" },
  { id: "high", title: "9–12", sub: "IPM Specialist", tone: "from-primary/25 to-accent/30" },
];

const TILES = [
  { id: "learn", icon: BookOpen, title: "Learn", desc: "Topic guides by tier", action: "learn" as const },
  { id: "practice", icon: Gamepad2, title: "Practice", desc: "Mini-games & drills", action: "practice" as const },
  { id: "farm", icon: Sprout, title: "Play / Farm", desc: "Manage a season", action: "farm" as const },
  { id: "glossary", icon: Library, title: "Glossary", desc: "All 108 species", action: "glossary" as const },
  { id: "stats", icon: Trophy, title: "Stats", desc: "Your XP & badges", action: "stats" as const },
];

export function LandingPage(p: Props) {
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
            Pick a grade tier to start an official run, or jump into Practice and the Glossary to explore at your own pace.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Stat icon={Flame} label="Streak" value={p.streak} />
            <Stat icon={Sparkles} label="XP" value={p.xp} />
            <Stat icon={Trophy} label="Mastered" value={p.speciesMastered} />
          </div>
        </div>
      </section>

      {/* Grade tiles */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-foreground">Start an official run</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {GRADES.map((g) => (
            <button
              key={g.id}
              onClick={() => p.startGame(g.id)}
              className={`group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${g.tone} p-6 text-left transition hover:-translate-y-0.5 hover:shadow-lg`}
            >
              <div className="text-5xl font-black tracking-tighter text-primary">{g.title}</div>
              <div className="mt-1 text-sm font-semibold uppercase tracking-widest text-foreground/80">{g.sub}</div>
              <div className="mt-6 inline-flex items-center gap-1 rounded-full bg-card/90 px-3 py-1 text-xs font-medium text-foreground">
                Start →
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Mode tiles */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-foreground">Explore</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {TILES.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                if (t.action === "learn") p.onOpenLearning();
                if (t.action === "practice") p.onOpenPractice();
                if (t.action === "farm") p.onOpenFarm();
                if (t.action === "glossary") p.onOpenGlossary();
                if (t.action === "stats") p.onOpenStats();
              }}
              className="flex flex-col items-start gap-2 rounded-xl border border-border bg-card p-4 text-left transition hover:bg-muted/50"
            >
              <t.icon className="h-6 w-6 text-primary" />
              <div className="font-semibold text-foreground">{t.title}</div>
              <div className="text-xs text-muted-foreground">{t.desc}</div>
            </button>
          ))}
        </div>
      </section>
    </div>
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
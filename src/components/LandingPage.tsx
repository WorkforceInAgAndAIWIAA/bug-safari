import { useEffect, useMemo, useState } from "react";
import type { GradeLevel, LearningGradeLevel } from "@/lib/types";
import { insects } from "@/data/insects";
import { getInsectImage } from "@/lib/insectImages";
import { Bug, BookOpen, Gamepad2, Sprout, Library, Trophy, UserRound, Flame, Sparkles, ArrowLeft } from "lucide-react";

type Destination = "learn" | "practice" | "play";

interface Props {
  xp: number;
  streak: number;
  totalCorrect: number;
  totalWrong: number;
  speciesMastered: number;
  startGame: (g: GradeLevel) => void;
  onOpenLearning: (tier: LearningGradeLevel) => void;
  onOpenPractice: (tier: LearningGradeLevel) => void;
  onOpenFarm: () => void;
  onOpenGlossary: () => void;
  onOpenScout: () => void;
}

const LEVELS: { id: LearningGradeLevel; title: string; sub: string; blurb: string; tone: string }[] = [
  { id: "elementary", title: "K–5", sub: "Bug Buddy", blurb: "Stories, pictures, and playful drills.", tone: "" },
  { id: "middle", title: "6–8", sub: "Field Scout", blurb: "Orders, life cycles, and scouting skills.", tone: "" },
  { id: "high", title: "9–12", sub: "IPM Specialist", blurb: "Thresholds, tactics, and resistance.", tone: "" },
  { id: "collegiate", title: "College", sub: "Field Entomologist", blurb: "Taxonomy and diagnostics deep dives.", tone: "" },
];

const DEST_META: Record<Destination, { title: string; icon: typeof Bug; copy: string }> = {
  learn: { title: "Learn", icon: BookOpen, copy: "Pick a level to open its learning modules." },
  practice: { title: "Practice", icon: Gamepad2, copy: "Pick a level to open its mini-games." },
  play: { title: "Play", icon: Sprout, copy: "Pick a level to start an official run." },
};

export function LandingPage(p: Props) {
  const [dest, setDest] = useState<Destination | null>(null);
  const heroShots = useMemo(
    () =>
      insects
        .map((i) => getInsectImage(i.id, "adult"))
        .filter((s): s is string => !!s)
        .filter((s, i, a) => a.indexOf(s) === i)
        .filter((_, i) => i % 5 === 0)
        .slice(0, 12),
    [],
  );
  const [heroIdx, setHeroIdx] = useState(0);
  useEffect(() => {
    if (heroShots.length < 2) return;
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % heroShots.length), 7000);
    return () => clearInterval(t);
  }, [heroShots.length]);

  const levels = dest === "play" ? LEVELS.filter((l) => l.id !== "collegiate") : LEVELS;

  const choose = (id: LearningGradeLevel) => {
    if (dest === "learn") p.onOpenLearning(id);
    else if (dest === "practice") p.onOpenPractice(id);
    else if (dest === "play") p.startGame(id as GradeLevel);
    setDest(null);
  };

  return (
    <div>
      {/* Full-bleed photo hero */}
      <section className="relative isolate overflow-hidden">
        <div aria-hidden className="absolute inset-0">
          {heroShots.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[2500ms] ease-in-out"
              style={{ opacity: i === heroIdx ? 1 : 0 }}
            />
          ))}
          <div className="absolute inset-0 bg-primary/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/85 to-primary/30" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32">
          <div className="max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-primary-foreground/90">EntoQuest</span>
            <h1 className="mt-4 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-primary-foreground sm:text-6xl">
              Entomology
              <br />
              <span className="text-accent">for Every Age</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-primary-foreground/90">
              Identify, scout, and manage 108 insect species. Learn, practice, and play through an
              interactive field school built for K–College classrooms.
            </p>
            <button
              onClick={() => setDest("learn")}
              className="mt-8 inline-flex items-center gap-2 border border-primary-foreground bg-primary-foreground px-6 py-3 text-sm font-bold uppercase tracking-wider text-primary transition hover:bg-transparent hover:text-primary-foreground"
            >
              Start your journey →
            </button>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Stat icon={Flame} label="Streak" value={p.streak} />
              <Stat icon={Sparkles} label="XP" value={p.xp} />
              <Stat icon={Trophy} label="Mastered" value={p.speciesMastered} />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-16">
      {dest === null ? (
        <>
          {/* Primary modes */}
          <section>
            <SectionLabel>Choose your path</SectionLabel>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              <BigTile icon={BookOpen} title="Learn" desc="Topic guides by grade level" tone="from-primary/50 to-secondary/30" onClick={() => setDest("learn")} />
              <BigTile icon={Gamepad2} title="Practice" desc="Mini-games and drills" tone="from-secondary/50 to-primary/30" onClick={() => setDest("practice")} />
              <BigTile icon={Sprout} title="Play" desc="Official scored runs" tone="from-primary/40 to-accent/30" onClick={() => setDest("play")} />
            </div>
          </section>

          {/* Secondary modes */}
          <section className="mt-8">
            <div className="grid gap-3 sm:grid-cols-2 lg:max-w-xl">
              <SmallTile icon={Library} title="Glossary" desc="All 108 species" onClick={p.onOpenGlossary} />
              <SmallTile icon={UserRound} title="My Bug Scout" desc="Gear up your detective" onClick={p.onOpenScout} />
            </div>
          </section>
        </>
      ) : (
        <section>
          <button
            onClick={() => setDest(null)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h2 className="mt-4 font-display text-3xl font-extrabold text-foreground">
            {DEST_META[dest].title} — choose your level
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{DEST_META[dest].copy}</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {levels.map((l) => (
              <button
                key={l.id}
                onClick={() => choose(l.id)}
                className="group relative overflow-hidden rounded-md border border-border bg-card p-6 text-left transition hover:-translate-y-0.5 hover:border-primary hover:shadow-lg"
              >
                <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-primary transition-transform group-hover:scale-x-100" />
                <div className="font-display text-4xl font-black tracking-tighter text-primary">{l.title}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-accent">{l.sub}</div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{l.blurb}</p>
                <div className="mt-5 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-foreground">
                  Enter →
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-8 bg-primary" />
      <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{children}</span>
    </div>
  );
}

function BigTile({ icon: Icon, title, desc, tone, onClick }: { icon: typeof Bug; title: string; desc: string; tone: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative flex min-h-56 flex-col items-start justify-between overflow-hidden rounded-md border border-border bg-card p-8 text-left transition hover:-translate-y-1 hover:shadow-xl"
    >
      <span className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tone} opacity-0 transition-opacity group-hover:opacity-100`} />
      <Icon className="relative h-10 w-10 text-primary transition group-hover:text-accent" strokeWidth={1.5} />
      <div>
        <div className="relative font-display text-3xl font-extrabold tracking-tight text-foreground">{title}</div>
        <div className="relative mt-2 text-sm text-muted-foreground">{desc}</div>
        <div className="relative mt-4 text-xs font-bold uppercase tracking-wider text-primary">Explore →</div>
      </div>
    </button>
  );
}

function SmallTile({ icon: Icon, title, desc, onClick }: { icon: typeof Bug; title: string; desc: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-md border border-border bg-card p-3.5 text-left transition hover:border-primary hover:bg-muted/40"
    >
      <Icon className="h-5 w-5 shrink-0 text-primary" />
      <div>
        <div className="text-sm font-bold text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </button>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Bug; label: string; value: number }) {
  return (
    <div className="inline-flex items-center gap-2 border-l-2 border-primary-foreground pl-3 text-sm">
      <Icon className="h-4 w-4 text-primary-foreground" />
      <span className="font-display text-lg font-extrabold text-primary-foreground">{value}</span>
      <span className="text-xs uppercase tracking-wider text-primary-foreground/80">{label}</span>
    </div>
  );
}

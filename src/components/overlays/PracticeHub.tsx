import { useMemo, useState } from "react";
import { OverlayShell } from "@/components/OverlayShell";
import type { GradeLevel, LearningGradeLevel } from "@/lib/types";
import { GRADE_LABEL } from "@/lib/types";
import { BugBuddyGamesHub } from "./BugBuddyGames";
import type { Insect } from "@/data/insects";
import { insectsForGrade } from "@/data/gradeInsects";
import { Gamepad2, Sparkles, CheckCircle2, BookOpen, Clock } from "lucide-react";
import { K5PracticeHub } from "./K5PracticeHub";
import { HighSchoolGamesHub } from "./games/HighSchoolGames";
import { linkForGame } from "@/data/topicLinks";

interface MiniGame {
  id: string;
  name: string;
  blurb: string;
  difficulty: "Easy" | "Medium" | "Hard";
  playable?: boolean;
}

const TIER_LABEL: Record<LearningGradeLevel, string> = {
  ...GRADE_LABEL,
  collegiate: "College Entomologist",
};

const GAMES: Record<LearningGradeLevel, MiniGame[]> = {
  elementary: [],
  middle: [],
  high: [
    { id: "field-scout", name: "Field Scout", blurb: "Identify by common name + host.", difficulty: "Medium", playable: true },
    { id: "order-up", name: "Order Up", blurb: "Drop each insect into its order.", difficulty: "Medium", playable: true },
    { id: "life-cycle", name: "Life Cycle Sort", blurb: "Complete vs. incomplete metamorphosis.", difficulty: "Medium", playable: true },
    { id: "lookalike", name: "Look-alike Lens", blurb: "Tell apart pairs that fool scouts.", difficulty: "Medium" },
    { id: "natural-enemies", name: "Natural Enemies", blurb: "Match pests to their predators.", difficulty: "Medium" },
  ],
  collegiate: [
    { id: "scientific-name", name: "Scientific Name", blurb: "Type the binomial from the photo.", difficulty: "Hard", playable: true },
    { id: "family-diag", name: "Family Diagnostics", blurb: "Identify the family from traits.", difficulty: "Hard", playable: true },
    { id: "threshold", name: "Economic Threshold", blurb: "Treat or scout again?", difficulty: "Hard", playable: true },
    { id: "irac", name: "Mode of Action", blurb: "Pick the right IRAC group.", difficulty: "Hard", playable: true },
    { id: "resistance", name: "Resistance Manager", blurb: "Rotate modes of action across a season.", difficulty: "Hard" },
  ],
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function PracticeHub({
  onClose,
  initialTier = "elementary",
  initialGameId,
  onOpenLesson,
}: {
  onClose: () => void;
  initialTier?: LearningGradeLevel;
  initialGameId?: string;
  onOpenLesson?: (tier: LearningGradeLevel, lessonId: string) => void;
}) {
  const [tab, setTab] = useState<LearningGradeLevel>(initialTier);
  const [active, setActive] = useState<MiniGame | null>(null);

  return (
    <OverlayShell title="Practice Hub" subtitle="Standalone drills · medals coming soon" onClose={onClose}>
      <div className="mb-5 inline-flex flex-wrap rounded-lg border border-border bg-card p-1 text-sm">
        {(Object.keys(GAMES) as LearningGradeLevel[]).map((g) => (
          <button
            key={g}
            onClick={() => setTab(g)}
            className={`rounded-md px-3 py-1.5 transition ${
              tab === g ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {TIER_LABEL[g]}
          </button>
        ))}
      </div>

      {tab === "elementary" ? (
        <BugBuddyGamesHub initialGameId={initialGameId} onOpenLesson={(id) => onOpenLesson?.("elementary", id)} />
      ) : tab === "middle" ? (
        <K5PracticeHub initialGameId={initialGameId} onOpenLesson={(id) => onOpenLesson?.("middle", id)} />
      ) : tab === "high" ? (
        <HighSchoolGamesHub initialGameId={initialGameId} onOpenLesson={(id) => onOpenLesson?.("high", id)} />
      ) : tab === "collegiate" ? (
        <div className="flex items-start gap-3 rounded-xl border border-dashed border-accent/50 bg-accent/10 p-5">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <div>
            <div className="font-display text-lg font-extrabold text-foreground">Coming soon</div>
            <p className="mt-1 text-sm text-muted-foreground">
              College-level games are in development. In the meantime, try the 9–12 IPM Specialist drills.
            </p>
          </div>
        </div>
      ) : (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES[tab].map((game) => {
          const link = linkForGame(tab, game.id);
          return (
          <button
            key={game.id}
            onClick={() => game.playable && setActive(game)}
            className={`flex flex-col items-start gap-2 rounded-xl border border-border bg-card p-4 text-left transition hover:bg-muted/50 ${
              !game.playable ? "cursor-not-allowed opacity-70" : ""
            }`}
          >
            <div className="flex w-full items-start justify-between">
              <Gamepad2 className="h-5 w-5 text-primary" />
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                {game.difficulty}
              </span>
            </div>
            <div className="font-semibold text-foreground">{game.name}</div>
            <div className="text-xs text-muted-foreground">{game.blurb}</div>
            <div className="mt-1 text-[11px] font-medium text-primary">{game.playable ? "Play →" : "Coming soon"}</div>
            {link && onOpenLesson && (
              <span
                role="link"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenLesson(tab, link.lessonId);
                }}
                className="mt-2 inline-flex items-center gap-1 rounded-full border border-accent/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent hover:bg-accent/10"
              >
                <BookOpen className="h-3 w-3" /> Lesson
              </span>
            )}
          </button>
          );
        })}
      </div>
      )}

      {active && (
        <QuickDrill game={active} grade={(tab === "collegiate" ? "high" : tab) as GradeLevel} onClose={() => setActive(null)} />
      )}
    </OverlayShell>
  );
}

function QuickDrill({ game, grade, onClose }: { game: MiniGame; grade: GradeLevel; onClose: () => void }) {
  const [streak, setStreak] = useState(0);
  const [done, setDone] = useState(0);
  const [last, setLast] = useState<{ correct: boolean; answer: string } | null>(null);
  const [round, setRound] = useState(0);

  const insect: Insect = useMemo(
    () => {
      const pool = insectsForGrade(grade);
      return pool[Math.floor(Math.random() * pool.length)];
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [round],
  );

  function answer(value: string, correctValue: string) {
    const ok = value === correctValue;
    setLast({ correct: ok, answer: correctValue });
    setDone((d) => d + 1);
    setStreak((s) => (ok ? s + 1 : 0));
    setTimeout(() => {
      setLast(null);
      setRound((r) => r + 1);
    }, 900);
  }

  function answerSci(typed: string) {
    const target = insect.scientificName.toLowerCase();
    const v = typed.trim().toLowerCase();
    const ok = v.length > 1 && (target.startsWith(v) || v.startsWith(target.split(" ")[0]));
    setLast({ correct: ok, answer: insect.scientificName });
    setDone((d) => d + 1);
    setStreak((s) => (ok ? s + 1 : 0));
    setTimeout(() => {
      setLast(null);
      setRound((r) => r + 1);
    }, 1200);
  }

  const isMcqByName = game.id === "name-the-bug" || game.id === "field-scout";
  const isFriendFoe = game.id === "friend-or-foe";
  const isOrder = game.id === "order-up";
  const isLifeCycle = game.id === "life-cycle";
  const isSciName = game.id === "scientific-name";
  const isFamily = game.id === "family-diag";
  const isThreshold = game.id === "threshold";
  const isIrac = game.id === "irac";
  const gradePool = useMemo(() => insectsForGrade(grade), [grade]);

  const nameOptions = useMemo(() => shuffle([insect, ...shuffle(gradePool.filter((i) => i.id !== insect.id)).slice(0, 3)]), [gradePool, insect]);
  const orderOptions = useMemo(() => {
    const orders = Array.from(new Set(gradePool.map((i) => i.order)));
    return shuffle([insect.order, ...shuffle(orders.filter((o) => o !== insect.order)).slice(0, 3)]);
  }, [gradePool, insect]);
  const familyOptions = useMemo(() => {
    const fams = Array.from(new Set(gradePool.map((i) => i.family)));
    return shuffle([insect.family, ...shuffle(fams.filter((f) => f !== insect.family)).slice(0, 3)]);
  }, [gradePool, insect]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/60 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{GRADE_LABEL[grade]} · Practice</div>
            <h3 className="text-lg font-bold text-foreground">{game.name}</h3>
          </div>
          <button onClick={onClose} className="rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted">
            Close
          </button>
        </div>

        <div className="mb-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Answered {done}
          </span>
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Streak {streak}
          </span>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-secondary/30 via-accent/30 to-primary/15 p-8 text-center">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {isSciName ? "Type the genus" : "Insect specimen"}
          </div>
          <div className="mt-2 text-xl font-bold text-foreground">{insect.commonName}</div>
          {isSciName && <p className="mt-1 text-xs italic text-muted-foreground">Hint: family is {insect.family}</p>}
        </div>

        <div className="mt-5">
          {isMcqByName && (
            <div className="grid gap-2 sm:grid-cols-2">
              {nameOptions.map((o) => (
                <button
                  key={o.id}
                  onClick={() => answer(o.commonName, insect.commonName)}
                  className="rounded-lg border border-border bg-background px-4 py-3 text-left text-sm hover:bg-muted"
                >
                  {o.commonName}
                </button>
              ))}
            </div>
          )}
          {isFriendFoe && (
            <div className="grid grid-cols-2 gap-2">
              {["Pest", "Helper"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => answer(opt, insect.role === "Beneficial" || insect.role === "Pollinator" ? "Helper" : "Pest")}
                  className="rounded-lg border border-border bg-background px-4 py-3 text-sm hover:bg-muted"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
          {isOrder && (
            <div className="grid gap-2 sm:grid-cols-2">
              {orderOptions.map((o) => (
                <button
                  key={o}
                  onClick={() => answer(o, insect.order)}
                  className="rounded-lg border border-border bg-background px-4 py-3 text-left text-sm hover:bg-muted"
                >
                  {o}
                </button>
              ))}
            </div>
          )}
          {isLifeCycle && (
            <div className="grid grid-cols-2 gap-2">
              {["Complete", "Incomplete"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => answer(opt, insect.metamorphosis)}
                  className="rounded-lg border border-border bg-background px-4 py-3 text-sm hover:bg-muted"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
          {isFamily && (
            <div className="grid gap-2 sm:grid-cols-2">
              {familyOptions.map((o) => (
                <button
                  key={o}
                  onClick={() => answer(o, insect.family)}
                  className="rounded-lg border border-border bg-background px-4 py-3 text-left text-sm hover:bg-muted"
                >
                  {o}
                </button>
              ))}
            </div>
          )}
          {isThreshold && (
            <div className="grid grid-cols-2 gap-2">
              {["Treat", "Continue monitoring"].map((opt) => (
                <button
                  key={opt}
                  onClick={() =>
                    answer(
                      opt,
                      insect.role === "Beneficial" || insect.role === "Pollinator" ? "Continue monitoring" : "Treat",
                    )
                  }
                  className="rounded-lg border border-border bg-background px-4 py-3 text-sm hover:bg-muted"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
          {isIrac && (
            <div className="grid gap-2 sm:grid-cols-2">
              {["IRAC 1B", "IRAC 3A", "IRAC 4A", "Biological control"].map((opt) => (
                <button
                  key={opt}
                  onClick={() =>
                    answer(opt, insect.role === "Beneficial" || insect.role === "Pollinator" ? "Biological control" : "IRAC 3A")
                  }
                  className="rounded-lg border border-border bg-background px-4 py-3 text-left text-sm hover:bg-muted"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
          {isSciName && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                answerSci(String(data.get("sci") ?? ""));
                e.currentTarget.reset();
              }}
              className="flex gap-2"
            >
              <input
                name="sci"
                autoFocus
                placeholder="Genus or full binomial…"
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Submit
              </button>
            </form>
          )}
        </div>

        {last && (
          <div
            className={`mt-4 rounded-lg border p-3 text-sm ${
              last.correct
                ? "border-success/40 bg-success/10 text-success"
                : "border-destructive/40 bg-destructive/10 text-destructive"
            }`}
          >
            {last.correct ? "Correct!" : `Answer: ${last.answer}`}
          </div>
        )}
      </div>
    </div>
  );
}
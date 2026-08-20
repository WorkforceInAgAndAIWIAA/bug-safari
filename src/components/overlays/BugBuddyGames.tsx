import { linkForGame } from "@/data/topicLinks";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Insect } from "@/data/insects";
import { insectsForGrade } from "@/data/gradeInsects";
import { InsectImage } from "@/components/InsectImage";
import { InsectInvasion } from "@/components/overlays/games/InsectInvasion";
import { WebOfLife } from "@/components/overlays/games/WebOfLife";
import { PullTheString } from "@/components/overlays/games/PullTheString";
import { getInsectImage, hasInsectImage, type InsectStage } from "@/lib/insectImages";
import {
  AlertTriangle, Armchair, ArrowLeft, Bug, Carrot, CheckCircle2, Eye, Flower2,
  HelpCircle, Leaf, Moon, RefreshCcw, Shield, Sparkles, Sword, Target,
  Trophy, XCircle, Zap,
  BookOpen,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */
export function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}
const rand = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

const POOL = insectsForGrade("elementary").filter((i) => hasInsectImage(i.id));
const helpers = POOL.filter((i) => i.role === "Beneficial" || i.role === "Pollinator" || i.role === "Pollinator/Pest");
const pollinators = POOL.filter((i) => i.role === "Pollinator" || i.role === "Pollinator/Pest");
const pests = POOL.filter((i) => i.role === "Pest" || i.role === "Invasive Pest");
const isHelper = (i: Insect) => helpers.some((h) => h.id === i.id);

const POINTS_KEY = "entoquest.k5.points";
export function useK5Points() {
  const [pts, setPts] = useState(0);
  useEffect(() => {
    const raw = localStorage.getItem(POINTS_KEY);
    if (raw) setPts(Number(raw) || 0);
  }, []);
  const add = (n: number) =>
    setPts((p) => {
      const next = Math.max(0, p + n);
      localStorage.setItem(POINTS_KEY, String(next));
      return next;
    });
  const reset = () => {
    setPts(0);
    localStorage.setItem(POINTS_KEY, "0");
  };
  return { pts, add, reset };
}

function Feedback({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div
      className={`mt-3 flex items-start gap-2 rounded-lg border p-3 text-sm ${
        ok ? "border-success/40 bg-success/10 text-success" : "border-destructive/40 bg-destructive/10 text-destructive"
      }`}
    >
      {ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
      <span>{text}</span>
    </div>
  );
}

function Progress({ round, total, score }: { round: number; total: number; score: number }) {
  return (
    <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
      <span>Round {Math.min(round + 1, total)} of {total}</span>
      <span className="inline-flex items-center gap-1 font-semibold text-primary">
        <Sparkles className="h-3.5 w-3.5" /> {score} correct
      </span>
    </div>
  );
}

/** Lets any game offer a "Return to all games" button without prop drilling. */
export const GameExitContext = createContext<(() => void) | null>(null);

function Done({ score, total, onRestart, title, note }: { score: number; total: number; onRestart: () => void; title?: string; note?: string }) {
  const exit = useContext(GameExitContext);
  return (
    <div className="rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-secondary/40 via-accent/25 to-primary/20 p-6 text-center shadow-md">
      <div className="text-5xl">🎉🌻🚜</div>
      <div className="mt-2 text-2xl font-extrabold text-foreground">{title ?? "Level complete!"}</div>
      <p className="mt-1 text-sm font-medium text-foreground/80">You got {score} of {total} right.</p>
      {note && <p className="mt-1 text-sm text-muted-foreground">{note}</p>}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button onClick={onRestart} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          🔁 Play again
        </button>
        {exit && (
          <button onClick={exit} className="rounded-md border-2 border-primary/40 bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted">
            🎮 Return to all games
          </button>
        )}
      </div>
    </div>
  );
}

/** Standalone "Return to all games" button for custom end screens. */
function ReturnToGamesBtn() {
  const exit = useContext(GameExitContext);
  if (!exit) return null;
  return (
    <button onClick={exit} className="rounded-md border-2 border-primary/40 bg-card px-4 py-2 text-sm font-bold text-foreground hover:bg-primary/10">
      🎮 Return to all games
    </button>
  );
}

function NextBtn({ onClick, label = "Next" }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="mt-3 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90"
    >
      {label} →
    </button>
  );
}

/**
 * Multiple-choice block (3+ options) with one free retry: a wrong first pick
 * shows a hint and lets the player choose again before the answer is revealed.
 */
function QuizChoices({
  options,
  answer,
  hint,
  cols = 1,
  rightText = "That's right! 🎉",
  explain,
  onCorrect,
  onNext,
}: {
  options: string[];
  answer: string;
  hint: string;
  cols?: 1 | 2 | 3;
  rightText?: string;
  explain?: string;
  onCorrect: (firstTry: boolean) => void;
  onNext: () => void;
}) {
  const [wrongs, setWrongs] = useState<string[]>([]);
  const [state, setState] = useState<"asking" | "hint" | "right" | "revealed">("asking");

  const grid = cols === 3 ? "sm:grid-cols-3" : cols === 2 ? "sm:grid-cols-2" : "";
  const locked = state === "right" || state === "revealed";

  return (
    <div>
      <div className={`grid gap-2 ${grid}`}>
        {options.map((o) => {
          const isWrong = wrongs.includes(o);
          const isAnswer = locked && o === answer;
          return (
            <button
              key={o}
              disabled={locked || isWrong}
              onClick={() => {
                if (o === answer) {
                  setState("right");
                  onCorrect(wrongs.length === 0);
                } else if (wrongs.length === 0) {
                  setWrongs([o]);
                  setState("hint");
                } else {
                  setWrongs((w) => [...w, o]);
                  setState("revealed");
                }
              }}
              className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition disabled:cursor-not-allowed ${
                isAnswer
                  ? "border-success bg-success/20 text-success"
                  : isWrong
                    ? "border-destructive/60 bg-destructive/10 text-destructive opacity-70"
                    : "border-primary/30 bg-card hover:bg-primary/10"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
      {state === "hint" && (
        <div className="mt-3 rounded-lg border-2 border-secondary/60 bg-secondary/20 p-3 text-sm font-medium text-foreground">
          💡 Not quite — here's a hint: {hint} Try again!
        </div>
      )}
      {state === "right" && <Feedback ok text={explain ? `${rightText} ${explain}` : rightText} />}
      {state === "revealed" && <Feedback ok={false} text={explain ? `The answer is ${answer}. ${explain}` : `The answer is ${answer}.`} />}
      {locked && <NextBtn onClick={onNext} />}
    </div>
  );
}

function Btn({ children, onClick, tone = "plain", disabled }: { children: ReactNode; onClick?: () => void; tone?: "plain" | "primary"; disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={
        tone === "primary"
          ? "rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          : "rounded-lg border border-border bg-card px-4 py-3 text-left text-sm transition hover:bg-muted disabled:opacity-50"
      }
    >
      {children}
    </button>
  );
}

function describe(i: Insect): string {
  const job =
    i.role === "Pollinator" || i.role === "Pollinator/Pest"
      ? "visits flowers and moves pollen"
      : i.role === "Beneficial"
        ? "hunts other insects to protect plants"
        : i.role === "Invasive Pest"
          ? "came here from far away and damages plants"
          : "feeds on plants and can hurt a crop";
  return `This bug ${job}. You can find it on ${i.hosts.toLowerCase()}. It grows up with ${i.metamorphosis.toLowerCase()} metamorphosis.`;
}
function memoryHook(i: Insect): string {
  const w = i.commonName.split(" ")[0];
  return `Memory hook: "${w}" — think of ${i.hosts.split(",")[0].trim().toLowerCase()} when you hear ${i.commonName}.`;
}

/* ================================================================== */
/* 1. Insect or Not?                                                   */
/* ================================================================== */
const NON_INSECTS = [
  { name: "Garden Spider", emoji: "🕷️", why: "Spiders are arachnids — 8 legs and 2 body parts." },
  { name: "Scorpion", emoji: "🦂", why: "Scorpions are arachnids with pincers and a stinging tail." },
  { name: "Deer Tick", emoji: "🕸️", why: "Ticks are arachnids, not insects." },
  { name: "Daddy Long-Legs", emoji: "🕷️", why: "Harvestmen are arachnids with one body section." },
  { name: "Roly-Poly (Pillbug)", emoji: "🦐", why: "Pillbugs are crustaceans, like tiny shrimp." },
  { name: "Crayfish", emoji: "🦞", why: "Crayfish are crustaceans with 10 legs." },
  { name: "Sowbug", emoji: "🦀", why: "Sowbugs are crustaceans that breathe with gills." },
  { name: "Centipede", emoji: "🐛", why: "Centipedes are myriapods — one pair of legs per body ring." },
  { name: "Millipede", emoji: "🪱", why: "Millipedes are myriapods with two pairs of legs per ring." },
  { name: "Spider Mite", emoji: "🔴", why: "Mites are tiny arachnids with 8 legs." },
];

function InsectOrNot({ onAward }: { onAward: (n: number) => void }) {
  const TOTAL = 10;
  const [seed, setSeed] = useState(0);
  const items = useMemo(
    () =>
      shuffle([
        ...shuffle(POOL).slice(0, 5).map((i) => ({ insect: true as const, data: i })),
        ...shuffle(NON_INSECTS).slice(0, 5).map((n) => ({ insect: false as const, data: n })),
      ]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seed],
  );
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(10);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (round >= TOTAL || msg) return;
    setLeft(10);
    const t = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [round, msg]);

  useEffect(() => {
    if (left <= 0 && !msg && round < TOTAL) answer(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  function answer(said: boolean | null) {
    const cur = items[round];
    const ok = said === cur.insect;
    if (ok) {
      setScore((s) => s + 1);
      onAward(1);
    }
    const why = cur.insect ? "Insects have 3 body parts and 6 legs." : (cur.data as { why: string }).why;
    setMsg({ ok, text: said === null ? `Time's up! ${why}` : ok ? `Yes! ${why}` : `Not quite. ${why}` });
    setTimeout(() => {
      setMsg(null);
      setRound((r) => r + 1);
    }, 1600);
  }

  if (round >= TOTAL) return <Done score={score} total={TOTAL} onRestart={() => { setSeed((s) => s + 1); setRound(0); setScore(0); }} />;
  const cur = items[round];
  return (
    <div>
      <Progress round={round} total={TOTAL} score={score} />
      <div className="mb-3">
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${(Math.max(left, 0) / 10) * 100}%` }} />
        </div>
        <div className="mt-1 text-right text-xs font-semibold text-muted-foreground">{Math.max(left, 0)}s left</div>
      </div>
      <div className="grid place-items-center rounded-2xl bg-gradient-to-br from-secondary/30 to-accent/30 p-8">
        {cur.insect ? (
          <InsectImage id={(cur.data as Insect).id} name={(cur.data as Insect).commonName} className="h-48 w-48" />
        ) : (
          <div className="grid h-48 w-48 place-items-center rounded-xl bg-card text-8xl">{(cur.data as { emoji: string }).emoji}</div>
        )}
        <div className="mt-3 text-2xl font-bold text-foreground">
          {cur.insect ? (cur.data as Insect).commonName : (cur.data as { name: string }).name}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button onClick={() => !msg && answer(true)} className="rounded-xl border-2 border-success/50 bg-success/10 py-5 text-lg font-bold text-success hover:bg-success/20">
          🐞 Insect
        </button>
        <button onClick={() => !msg && answer(false)} className="rounded-xl border-2 border-destructive/50 bg-destructive/10 py-5 text-lg font-bold text-destructive hover:bg-destructive/20">
          🚫 Not an insect
        </button>
      </div>
      {msg && <Feedback ok={msg.ok} text={msg.text} />}
    </div>
  );
}

/* ================================================================== */
/* 2. Name the Insect                                                  */
/* ================================================================== */
const NAME_LEVELS = [
  { id: "beetles", label: "Beetle Level", filter: (i: Insect) => i.order === "Coleoptera" },
  { id: "butterflies", label: "Moths & Butterflies", filter: (i: Insect) => i.order === "Lepidoptera" },
  { id: "truebugs", label: "True Bugs & Hoppers", filter: (i: Insect) => i.order === "Hemiptera" },
  { id: "helpers", label: "Helper Insects", filter: (i: Insect) => isHelper(i) },
  { id: "invasive", label: "Invasive Insects", filter: (i: Insect) => i.role === "Invasive Pest" },
];

function NameTheInsect({ onAward }: { onAward: (n: number) => void }) {
  const TOTAL = 10;
  const [level, setLevel] = useState<typeof NAME_LEVELS[number] | null>(null);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  const list = useMemo(() => (level ? shuffle(POOL.filter(level.filter)) : []), [level]);
  const target = list.length ? list[round % list.length] : null;
  const options = useMemo(() => {
    if (!target) return [];
    return shuffle([target, ...shuffle(POOL.filter((i) => i.id !== target.id)).slice(0, 3)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.id]);

  if (!level)
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <p className="sm:col-span-2 text-sm text-muted-foreground">Pick a level to start:</p>
        {NAME_LEVELS.map((l) => (
          <Btn key={l.id} onClick={() => { setLevel(l); setRound(0); setScore(0); }}>{l.label}</Btn>
        ))}
      </div>
    );
  if (round >= TOTAL || !target) return <Done score={score} total={TOTAL} onRestart={() => setLevel(null)} />;

  return (
    <div>
      <Progress round={round} total={TOTAL} score={score} />
      {picked ? (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <InsectImage id={target.id} name={target.commonName} className="h-40 w-40 shrink-0" />
            <div>
              <div className="text-xl font-bold text-foreground">{target.commonName}</div>
              <p className="mt-1 text-sm text-muted-foreground">{describe(target)}</p>
              <p className="mt-2 text-sm font-medium text-primary">{memoryHook(target)}</p>
            </div>
          </div>
          <Feedback ok={picked === target.id} text={picked === target.id ? "Correct!" : `The right answer was ${target.commonName}.`} />
          <div className="mt-3 text-right">
            <Btn tone="primary" onClick={() => { setPicked(null); setRound((r) => r + 1); }}>Next →</Btn>
          </div>
        </div>
      ) : (
        <>
          <div className="grid place-items-center rounded-2xl bg-gradient-to-br from-secondary/45 via-accent/30 to-primary/20 p-6">
            <InsectImage id={target.id} name="Mystery insect" className="h-64 w-64" />
            <p className="mt-3 max-w-xl text-center text-base text-foreground">{describe(target)}</p>
          </div>
          <div className="mt-4">
            <QuizChoices
              key={target.id}
              options={options.map((o) => o.commonName)}
              answer={target.commonName}
              hint={memoryHook(target).replace("Memory hook: ", "")}
              cols={2}
              explain={describe(target)}
              onCorrect={() => { setScore((s) => s + 1); onAward(2); }}
              onNext={() => { setPicked(null); setRound((r) => r + 1); }}
            />
          </div>
        </>
      )}
    </div>
  );
}

/* ================================================================== */
/* 3. Insect Mix and Match (biodiversity)                              */
/* ================================================================== */
const BIO_Q = [
  { q: "What does biodiversity mean?", a: ["Many different kinds of living things", "One kind of animal", "Only plants", "No animals at all"], hint: "“Bio” means life and “diversity” means variety. 🌿" },
  { q: "About how many insect species have scientists named?", a: ["About 1 million", "About 100", "About 500", "About 12"], hint: "Insects are the biggest animal group on Earth — think really, really big. 🐜" },
  { q: "What makes an insect an insect?", a: ["3 body parts and 6 legs", "8 legs", "A shell and claws", "Feathers"], hint: "Count the legs on a ladybug and the parts of its body. 🐞" },
  { q: "Why is a biodiverse field healthier?", a: ["Many species keep each other in balance", "It looks nicer", "It has fewer plants", "It rains more"], hint: "Think about who eats the pests when lots of species live together. ⚖️" },
];

const MIX_FIELDS = ["Backyard garden", "Corn field edge", "Prairie meadow"];
const MIX_ROUNDS = MIX_FIELDS.length;

function makeMix() {
  const base = shuffle(POOL).slice(0, 3);
  return shuffle([base[0], base[0], base[0], base[1], base[1], base[2]]);
}

function MixAndMatch({ onAward }: { onAward: (n: number) => void }) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<"quiz" | "rate" | "fix" | "cleared" | "done">("quiz");
  // Questions are dealt from a shuffled deck so no question repeats between rounds.
  const [deck, setDeck] = useState(() => shuffle(BIO_Q));
  const quiz = deck[0];
  const quizOpts = useMemo(() => shuffle(quiz.a), [quiz]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [mix, setMix] = useState<Insect[]>(makeMix);
  const [bench, setBench] = useState<Insect[]>(() => shuffle(POOL).slice(0, 6));
  const [slot, setSlot] = useState<number | null>(null);

  const unique = new Set(mix.map((i) => i.id)).size;
  const rating = unique <= 2 ? "Low" : unique <= 4 ? "Medium" : "High";

  const startRound = (next: number) => {
    const rest = deck.slice(1);
    setDeck(rest.length ? rest : shuffle(BIO_Q));
    setMix(makeMix());
    setBench(shuffle(POOL).slice(0, 6));
    setSlot(null);
    setMsg(null);
    setRound(next);
    setPhase("quiz");
  };

  const restart = () => {
    setScore(0);
    setDeck(shuffle(BIO_Q));
    setMix(makeMix());
    setBench(shuffle(POOL).slice(0, 6));
    setSlot(null);
    setMsg(null);
    setRound(0);
    setPhase("quiz");
  };

  if (phase === "done") return <Done score={score} total={MIX_ROUNDS * 3} onRestart={restart} />;

  return (
    <div>
      <Progress round={round} total={MIX_ROUNDS} score={score} />
      <div className="mb-3 text-sm font-semibold text-foreground">🌿 Field {round + 1}: {MIX_FIELDS[round]}</div>
      {phase === "quiz" && (
        <div>
          <p className="mb-3 text-base font-semibold text-foreground">{quiz.q}</p>
          <QuizChoices
            key={quiz.q}
            options={quizOpts}
            answer={quiz.a[0]}
            hint={quiz.hint}
            cols={2}
            explain="Now look at this mix of bugs."
            onCorrect={() => { onAward(2); setScore((s) => s + 1); }}
            onNext={() => setPhase("rate")}
          />
        </div>
      )}

      {(phase === "rate" || phase === "fix" || phase === "cleared") && (
        <>
          <div className="mb-3 rounded-lg border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
            <strong className="text-foreground">Biodiversity scale:</strong> 1–2 different species = Low · 3–4 = Medium · 5–6 = High
          </div>
          <div className="grid grid-cols-3 gap-3 rounded-xl bg-muted p-4 sm:grid-cols-6">
            {mix.map((i, idx) => (
              <button
                key={idx}
                onClick={() => phase === "fix" && setSlot(idx)}
                className={`rounded-lg p-1 ${slot === idx ? "ring-2 ring-primary" : ""} ${phase === "fix" ? "hover:bg-card" : ""}`}
              >
                <InsectImage id={i.id} name={i.commonName} className="h-16 w-full" />
                <div className="mt-1 truncate text-[10px] text-muted-foreground">{i.commonName}</div>
              </button>
            ))}
          </div>
          <div className="mt-2 text-sm text-muted-foreground">Different species in this mix: <strong className="text-foreground">{unique}</strong></div>
        </>
      )}

      {phase === "rate" && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {["Low", "Medium", "High"].map((r) => (
            <Btn
              key={r}
              onClick={() => {
                const ok = r === rating;
                setMsg({ ok, text: ok ? `Yes — ${unique} species means ${rating.toLowerCase()} biodiversity. Now swap duplicates to make it more diverse!` : `This mix has ${unique} species, so it is ${rating.toLowerCase()} biodiversity.` });
                if (ok) { onAward(2); setScore((s) => s + 1); }
                setTimeout(() => { setMsg(null); setPhase("fix"); }, 1800);
              }}
            >
              {r} biodiversity
            </Btn>
          ))}
        </div>
      )}

      {phase === "fix" && (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">
            {slot === null ? "Tap a repeated bug above, then pick a new species below to swap it in." : "Now pick a replacement:"}
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {bench.map((b) => (
              <button
                key={b.id}
                disabled={slot === null}
                onClick={() => {
                  if (slot === null) return;
                  const next = [...mix];
                  next[slot] = b;
                  setMix(next);
                  setSlot(null);
                  const u = new Set(next.map((x) => x.id)).size;
                  if (u >= 5) {
                    onAward(3);
                    setScore((s) => s + 1);
                    setMsg({ ok: true, text: `Awesome! ${MIX_FIELDS[round]} now has high biodiversity.` });
                    setPhase("cleared");
                  }
                }}
                className="rounded-lg border border-border bg-card p-1 disabled:opacity-40 hover:bg-muted"
              >
                <InsectImage id={b.id} name={b.commonName} className="h-14 w-full" />
                <div className="mt-1 truncate text-[10px] text-muted-foreground">{b.commonName}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {msg && <Feedback ok={msg.ok} text={msg.text} />}

      {phase === "cleared" && (
        <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            {round + 1 < MIX_ROUNDS
              ? `Field ${round + 1} restored! Ready to help the ${MIX_FIELDS[round + 1].toLowerCase()}?`
              : "You restored every field — great job, bug buddy!"}
          </p>
          <button
            onClick={() => (round + 1 < MIX_ROUNDS ? startRound(round + 1) : setPhase("done"))}
            className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {round + 1 < MIX_ROUNDS ? "Next field →" : "Finish game 🎉"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/* 4. Decomposer Dash                                                  */
/* ================================================================== */
const DECOMP_Q = {
  q: "What does a decomposer insect do?",
  right: "Breaks down dead leaves and plants into healthy topsoil",
  wrong: ["Pollinates flowers", "Eats living crops", "Bites people"],
};
const FALLING = ["🍂", "🍁", "🌿", "🪵", "🍄", "🌾"];
const DECOMP_ROUNDS = [
  { name: "Backyard compost pile", glyph: "🍂", fact: "Healthy topsoil in a backyard pile feeds worms, microbes, and plant roots." },
  { name: "Farm field edge", glyph: "🌾", fact: "Rich topsoil on a farm holds water so crops grow strong during dry spells." },
  { name: "Forest floor", glyph: "🍄", fact: "A healthy forest floor supports trees, mushrooms, and a whole underground ecosystem." },
];

function DecomposerDash({ onAward }: { onAward: (n: number) => void }) {
  const [unlocked, setUnlocked] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [items, setItems] = useState<{ key: number; x: number; y: number; glyph: string }[]>([]);
  const [bank, setBank] = useState(0);
  const [soil, setSoil] = useState(0);
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);
  const [slicing, setSlicing] = useState(false);
  const [caught, setCaught] = useState(0);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<"playing" | "cleared" | "done">("playing");
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const idRef = useRef(0);
  const collectedRef = useRef<Set<number>>(new Set());
  const decomposer = useMemo(() => rand(POOL.filter((i) => /grub|wireworm|maggot|beetle/i.test(i.commonName))) ?? POOL[0], []);
  const options = useMemo(() => shuffle([DECOMP_Q.right, ...DECOMP_Q.wrong]), []);

  const BANK_TARGET = 8;
  const level = Math.min(5, 1 + Math.floor(caught / 6));
  const fallStep = 1.8 + (level - 1) * 0.7;
  const spawnMs = Math.max(600, 1200 - (level - 1) * 140);

  useEffect(() => {
    if (!unlocked || phase !== "playing") return;
    const spawn = setInterval(() => {
      idRef.current += 1;
      setItems((it) => [...it, { key: idRef.current, x: Math.random() * 85, y: -8, glyph: DECOMP_ROUNDS[round].glyph }]);
    }, spawnMs);
    const move = setInterval(() => {
      setItems((it) => it.map((i) => ({ ...i, y: i.y + fallStep })).filter((i) => i.y < 100));
    }, 100);
    return () => { clearInterval(spawn); clearInterval(move); };
  }, [unlocked, phase, fallStep, spawnMs, round]);

  useEffect(() => {
    if (bank >= BANK_TARGET) {
      setBank(0);
      setSoil((s) => Math.min(100, s + 25));
      onAward(3);
    }
  }, [bank, onAward]);

  useEffect(() => {
    if (soil >= 100 && phase === "playing") {
      setPhase("cleared");
      setItems([]);
      setTrail([]);
      collectedRef.current.clear();
      onAward(5);
    }
  }, [soil, phase, onAward]);

  const swipeAt = (clientX: number, clientY: number) => {
    const el = fieldRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * 100;
    const y = ((clientY - r.top) / r.height) * 100;
    setTrail((t) => [...t.slice(-14), { x, y }]);
    setItems((it) => {
      const kept: typeof it = [];
      let sliced = 0;
      for (const i of it) {
        if (Math.abs(i.x + 3 - x) <= 9 && Math.abs(i.y + 4 - y) <= 11 && !collectedRef.current.has(i.key)) {
          collectedRef.current.add(i.key);
          sliced += 1;
        } else {
          kept.push(i);
        }
      }
      if (sliced > 0) {
        setBank((b) => Math.min(BANK_TARGET, b + sliced));
        setCaught((c) => c + sliced);
      }
      return kept;
    });
  };

  useEffect(() => {
    if (!trail.length) return;
    const t = setTimeout(() => setTrail((p) => p.slice(1)), 90);
    return () => clearTimeout(t);
  }, [trail]);

  const nextRound = () => {
    if (round + 1 >= DECOMP_ROUNDS.length) {
      setPhase("done");
    } else {
      setRound((r) => r + 1);
      setSoil(0);
      setBank(0);
      setPhase("playing");
      setItems([]);
      setTrail([]);
    }
  };

  const restart = () => {
    setRound(0);
    setSoil(0);
    setBank(0);
    setCaught(0);
    setItems([]);
    setTrail([]);
    setPhase("playing");
  };

  if (!unlocked)
    return (
      <div>
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-muted p-4">
          <InsectImage id={decomposer.id} name={decomposer.commonName} className="h-20 w-20" />
          <div>
            <div className="font-semibold text-foreground">You are a {decomposer.commonName}!</div>
            <div className="text-xs text-muted-foreground">Answer one question to unlock composting mode.</div>
          </div>
        </div>
        <p className="mb-2 font-semibold text-foreground">{DECOMP_Q.q}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {options.map((o) => (
            <Btn
              key={o}
              onClick={() => {
                const ok = o === DECOMP_Q.right;
                setMsg({ ok, text: ok ? "Composting mode unlocked!" : `Decomposers ${DECOMP_Q.right.toLowerCase()}.` });
                if (ok) { onAward(2); setTimeout(() => { setMsg(null); setUnlocked(true); }, 1200); }
                else setTimeout(() => setMsg(null), 1500);
              }}
            >
              {o}
            </Btn>
          ))}
        </div>
        {msg && <Feedback ok={msg.ok} text={msg.text} />}
      </div>
    );

  if (phase === "done") {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
        <div className="text-4xl">🌱</div>
        <div className="mt-2 text-xl font-bold text-foreground">Ecosystem restored!</div>
        <p className="mt-1 text-sm text-muted-foreground">
          You built healthy topsoil across three habitats. Healthy topsoil supports plants, insects, and the whole ecosystem.
        </p>
        <button onClick={restart} className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          Play again
        </button>
      </div>
    );
  }

  if (phase === "cleared") {
    return (
      <div className="rounded-xl border border-success/30 bg-success/10 p-6 text-center">
        <div className="text-4xl">🎉</div>
        <div className="mt-2 text-xl font-bold text-foreground">{DECOMP_ROUNDS[round].name} — topsoil healthy!</div>
        <p className="mt-2 text-sm text-foreground">{DECOMP_ROUNDS[round].fact}</p>
        <button
          onClick={nextRound}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {round + 1 >= DECOMP_ROUNDS.length ? "Finish game 🌟" : `Next habitat →`}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-foreground">Compost bank: {bank}/8</span>
        <span className="text-muted-foreground">Habitat {round + 1} of {DECOMP_ROUNDS.length} · Level {level} · Topsoil health: {soil}%</span>
      </div>
      <p className="mb-2 text-xs text-muted-foreground">
        Swipe across the falling leaves and litter to slice them up — chewed-up litter builds rich <strong>topsoil</strong> that holds water and feeds plant roots. Collect 10 pieces and they automatically return to the soil. Build healthy topsoil to support the ecosystem!
      </p>
      <div
        ref={fieldRef}
        onPointerDown={(e) => { setSlicing(true); e.currentTarget.setPointerCapture(e.pointerId); swipeAt(e.clientX, e.clientY); }}
        onPointerMove={(e) => { if (slicing) swipeAt(e.clientX, e.clientY); }}
        onPointerUp={() => { setSlicing(false); setTrail([]); }}
        onPointerLeave={() => { setSlicing(false); setTrail([]); }}
        className="relative h-80 touch-none select-none overflow-hidden rounded-xl border border-border bg-gradient-to-b from-sky-200/40 to-secondary/30"
      >
        {items.map((i) => (
          <div
            key={i.key}
            className="pointer-events-none absolute text-3xl"
            style={{ left: `${i.x}%`, top: `${i.y}%` }}
          >
            {i.glyph}
          </div>
        ))}
        {trail.length > 1 && (
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline
              points={trail.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="currentColor"
              className="text-primary"
              strokeWidth={1.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.8}
            />
          </svg>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-[hsl(30_35%_30%)]/70 transition-all" style={{ height: `${soil * 0.6}%` }} />
        <div className="absolute bottom-1 left-2 text-xs font-semibold text-background">🌱 topsoil</div>
      </div>
      {soil >= 75 && (
        <div className="mt-3 text-sm font-semibold text-success">Topsoil is getting healthy — it will soon support a living ecosystem!</div>
      )}
    </div>
  );
}

/* ================================================================== */
/* 5. Pollinator Power                                                 */
/* ================================================================== */
function PollinatorPower({ onAward }: { onAward: (n: number) => void }) {
  const TOTAL = 8;
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [pollen, setPollen] = useState(0);
  const [stage, setStage] = useState<"id" | "land">("id");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const visitor = useMemo(
    () => (Math.random() < 0.5 ? rand(pollinators) : rand(POOL.filter((i) => !pollinators.includes(i)))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [round],
  );
  const isPol = pollinators.includes(visitor);

  if (round >= TOTAL) return <Done score={score} total={TOTAL} onRestart={() => { setRound(0); setScore(0); setPollen(0); setStage("id"); }} />;

  return (
    <div>
      <Progress round={round} total={TOTAL} score={score} />
      <div className="relative grid place-items-center rounded-2xl bg-gradient-to-b from-sky-200/40 to-success/20 p-8">
        <div className="text-6xl">🌻</div>
        <div className="mt-1 text-xs text-muted-foreground">Your flower · {pollen} pollen collected</div>
        <div className="mt-4 flex flex-col items-center rounded-xl bg-card/80 p-3">
          <InsectImage id={visitor.id} name={visitor.commonName} className="h-32 w-32" />
          <div className="mt-2 font-semibold text-foreground">{visitor.commonName}</div>
        </div>
      </div>

      {stage === "id" ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {[true, false].map((v) => (
            <Btn
              key={String(v)}
              onClick={() => {
                const ok = v === isPol;
                if (ok) { setScore((s) => s + 1); onAward(1); }
                setMsg({ ok, text: ok ? (isPol ? "Yes, a pollinator! Should it land?" : "Right — not a pollinator.") : isPol ? "It IS a pollinator — it moves pollen between flowers." : "Not a pollinator — it feeds on plants instead." });
                setTimeout(() => { setMsg(null); if (isPol) setStage("land"); else setRound((r) => r + 1); }, 1500);
              }}
            >
              {v ? "🌸 Pollinator" : "🚫 Not a pollinator"}
            </Btn>
          ))}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Btn onClick={() => { setPollen((p) => p + 1); onAward(1); setStage("id"); setRound((r) => r + 1); }}>✅ Let it land and collect pollen</Btn>
          <Btn onClick={() => { setStage("id"); setRound((r) => r + 1); }}>🚪 Send it away</Btn>
        </div>
      )}
      {msg && <Feedback ok={msg.ok} text={msg.text} />}
    </div>
  );
}

/* ================================================================== */
/* 6. Predator vs. Pest — abstract castle-defense quest                  */
/* ================================================================== */
type KnightCard = {
  name: string;
  icon: LucideIcon;
  helpful: boolean;
  reason: string;
  bullets: string[];
};

const HELPFUL_KNIGHTS: KnightCard[] = [
  {
    name: "Sir Chomps-a-Lot",
    icon: Bug,
    helpful: true,
    reason: "eats plant-munching pests so plants can grow strong",
    bullets: ["Hunts plant-eating pests like beetles and caterpillars", "Protects leaves and roots from chewing damage", "Helps plants stay strong so the garden can thrive"],
  },
  {
    name: "Lady Lace-a-Lot",
    icon: Target,
    helpful: true,
    reason: "traps soft, sap-sucking pests in her sticky lace",
    bullets: ["Lays eggs that hatch into pest-eating larvae", "Catches soft, sap-sucking pests in sticky silk", "Keeps aphid and mite populations from exploding"],
  },
  {
    name: "Count Crunch",
    icon: Sword,
    helpful: true,
    reason: "crunches caterpillars and beetle pests with mighty jaws",
    bullets: ["Crunches through caterpillars and beetle pests", "Breaks up pest groups before they can spread", "Returns nutrients to the soil when finished"],
  },
  {
    name: "Dame Dash",
    icon: Zap,
    helpful: true,
    reason: "runs fast and catches pests before they escape",
    bullets: ["Sprints after hopping and flying pests", "Catches pests before they can lay eggs", "Patrols the garden day and night"],
  },
  {
    name: "Sir Sting-a-Lot",
    icon: Shield,
    helpful: true,
    reason: "stops pest eggs from hatching, protecting the garden",
    bullets: ["Finds pest eggs and lays eggs inside them", "Stops new pests from hatching", "Works quietly in the background like a secret guard"],
  },
];

const UNHELPFUL_KNIGHTS: KnightCard[] = [
  {
    name: "Sir Leaf-Sampler",
    icon: Leaf,
    helpful: false,
    reason: "eats the same plants as the pest, so the garden gets doubly damaged",
    bullets: ["Eats the same leaves the pest is damaging", "Doubles the harm to garden plants", "Competes with crops for food and sunlight"],
  },
  {
    name: "Lord Wilt-Worsener",
    icon: AlertTriangle,
    helpful: false,
    reason: "spreads sickness that makes plants weaker",
    bullets: ["Carries plant sickness from leaf to leaf", "Makes plants yellow, wilt, and die faster", "Weakens the whole garden, not just one plant"],
  },
  {
    name: "Baron Root-Nibbler",
    icon: Carrot,
    helpful: false,
    reason: "munches roots underground, hurting plants from below",
    bullets: ["Chews on roots underground where no one sees", "Blocks plants from drinking water", "Makes stems wobble and fall over"],
  },
  {
    name: "Dame Distracted",
    icon: Flower2,
    helpful: false,
    reason: "spends all day smelling flowers and forgets to hunt pests",
    bullets: ["Loves visiting flowers for nectar", "Forgets to patrol for pests", "Lets invaders walk right past the castle gate"],
  },
  {
    name: "Sir Snooze-a-Lot",
    icon: Moon,
    helpful: false,
    reason: "naps under a leaf while pests march past the castle",
    bullets: ["Sleeps under leaves during the day", "Misses pests marching into the garden", "Wakes up too late to help"],
  },
  {
    name: "Count Confused",
    icon: HelpCircle,
    helpful: false,
    reason: "chases the wrong bugs and leaves the real pests alone",
    bullets: ["Chases harmless bugs instead of pests", "Wastes energy on the wrong target", "Leaves the real invaders alone"],
  },
  {
    name: "Lady Lazy",
    icon: Armchair,
    helpful: false,
    reason: "too comfy to patrol the castle garden",
    bullets: ["Stays in one spot all day", "Never patrols the castle garden", "Lets pests settle in and multiply"],
  },
  {
    name: "Sir Sap-Sipper",
    icon: Bug,
    helpful: false,
    reason: "drinks plant sap just like the pest, so plants stay thirsty",
    bullets: ["Drinks the same plant juices as the pest", "Makes leaves curl and turn yellow", "Competes with plants for their own food"],
  },
  {
    name: "Baron Bystander",
    icon: Eye,
    helpful: false,
    reason: "watches the pests but never stops them",
    bullets: ["Watches pests but never stops them", "Does not hunt or trap invaders", "The garden keeps getting damaged"],
  },
];

function helpfulKnightFor(pest: Insect): KnightCard {
  const name = pest.commonName.toLowerCase();
  if (/aphid/i.test(name)) return HELPFUL_KNIGHTS.find((k) => k.name === "Lady Lace-a-Lot") ?? HELPFUL_KNIGHTS[0];
  if (/worm|caterpillar|moth|borer/i.test(name)) return HELPFUL_KNIGHTS.find((k) => k.name === "Count Crunch") ?? HELPFUL_KNIGHTS[0];
  if (/beetle|weevil|rootworm/i.test(name)) return HELPFUL_KNIGHTS.find((k) => k.name === "Sir Chomps-a-Lot") ?? HELPFUL_KNIGHTS[0];
  if (/hopper|bug|thrips|mite/i.test(name)) return HELPFUL_KNIGHTS.find((k) => k.name === "Dame Dash") ?? HELPFUL_KNIGHTS[0];
  return HELPFUL_KNIGHTS[0];
}

function pestStory(pest: Insect): string[] {
  const name = pest.commonName;
  const lines = [
    `The ${name} has marched up to the castle gate!`,
    `It attacks the royal garden of ${pest.hosts}.`,
  ];
  if (/aphid/i.test(name)) lines.push("Aphids sip sugary sap with a straw-like mouth, so leaves curl and get sticky.");
  else if (/worm|caterpillar|moth|borer/i.test(name)) lines.push("This one is a hungry caterpillar that chews big holes in leaves and stems.");
  else if (/beetle|weevil|rootworm/i.test(name)) lines.push("Beetles have strong chewing jaws that bite leaves and roots.");
  else if (/hopper|bug|thrips|mite/i.test(name)) lines.push("It pokes the plant and drinks its juices, leaving spots and wilting.");
  else lines.push("It feeds on the plants the kingdom needs for food.");
  if (/invasive/i.test(pest.role)) lines.push("It is an invasive pest — it came from far away, so few knights here know how to stop it.");
  return lines;
}

function PredatorVsPest({ onAward, onClose }: { onAward: (n: number) => void; onClose?: () => void }) {
  const TOTAL = 5;
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [stage, setStage] = useState<"story" | "pick" | "won">("story");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pest = useMemo(() => rand(pests), [round]);
  const hero = useMemo(() => helpfulKnightFor(pest), [pest]);
  const villain = useMemo(() => rand(UNHELPFUL_KNIGHTS.filter((k) => k.name !== hero.name)), [hero]);
  const choices = useMemo(() => shuffle([hero, villain]), [hero, villain]);
  const story = useMemo(() => pestStory(pest), [pest]);

  const restart = () => { setRound(0); setScore(0); setStage("story"); setMsg(null); };

  if (round >= TOTAL) {
    const saved = score >= 3;
    return (
      <div className={`rounded-2xl border p-6 text-center ${saved ? "border-success/40 bg-success/10" : "border-destructive/40 bg-destructive/10"}`}>
        <div className="text-5xl">{saved ? "🏰✨" : "🐛🏰"}</div>
        <div className={`mt-3 text-2xl font-black ${saved ? "text-success" : "text-destructive"}`}>
          {saved ? "You've saved the castle!" : "Oh no! The castle is invaded."}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {saved
            ? `You chose ${score} of ${TOTAL} natural predator knights. The princess, the garden, and the whole ecosystem are safe.`
            : `You only chose ${score} of ${TOTAL} natural predator knights. The pests snuck past the gate — but you can try again!`}
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button onClick={restart} className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <RefreshCcw className="h-4 w-4" /> Play again
          </button>
          {onClose && (
            <button onClick={onClose} className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">
              <ArrowLeft className="h-4 w-4" /> Return to games
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Progress round={round} total={TOTAL} score={score} />

      <div className="flex items-center justify-center gap-4 rounded-2xl bg-gradient-to-r from-destructive/10 to-primary/15 p-5 sm:gap-6">
        <div className="text-center">
          <div className="text-4xl">🏰</div>
          <div className="mt-1 text-[11px] font-semibold text-muted-foreground">Castle garden</div>
          <div className="text-2xl">👸</div>
        </div>
        <div className="text-center">
          <InsectImage id={pest.id} name={pest.commonName} className="h-28 w-28" />
          <div className="mt-1 text-sm font-semibold text-destructive">🐛 {pest.commonName}</div>
          <div className="text-[11px] text-muted-foreground">Invader of the {pest.hosts}</div>
        </div>
        <div className="text-2xl font-black text-muted-foreground">⚔️</div>
        <div className="grid h-24 w-24 place-items-center rounded-xl border-2 border-dashed border-border text-3xl">🛡️</div>
      </div>

      {stage === "story" && (
        <div className="mt-4 rounded-xl border border-border bg-card p-4">
          <p className="mb-1 text-sm font-bold text-foreground">📜 Royal report</p>
          <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
            {story.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <Btn onClick={() => setStage("pick")}>Call a knight! 🛡️</Btn>
        </div>
      )}

      {stage === "pick" && (
        <div className="mt-4">
          <p className="mb-2 text-center text-sm font-semibold text-foreground">
            Which knight will defend the princess and help the ecosystem?
          </p>
          <p className="mb-3 text-center text-xs text-muted-foreground">
            One knight is a natural predator that controls pests. The other looks helpful but would not help the ecosystem.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {choices.map((c) => (
              <button
                key={c.name}
                onClick={() => {
                  const ok = c.helpful;
                  if (ok) { setScore((s) => s + 1); onAward(3); }
                  setMsg({
                    ok,
                    text: ok
                      ? `${c.name} ${c.reason}. The castle garden is safe and the ecosystem stays balanced!`
                      : `${c.name} ${c.reason}. A natural predator knight would have helped instead.`,
                  });
                  setStage("won");
                }}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3 text-left hover:bg-muted"
              >
                <div className="grid h-24 w-24 place-items-center rounded-xl bg-primary text-5xl shadow-inner">
                  <c.icon className="h-14 w-14 text-primary-foreground" strokeWidth={2.5} />
                </div>
                <div className="w-full">
                  <div className="text-center text-xs font-bold text-foreground">{c.name}</div>
                  <ul className="mt-1 ml-4 list-disc text-[11px] leading-snug text-muted-foreground">
                    {c.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {stage === "won" && msg && (
        <div className="mt-4">
          <Feedback ok={msg.ok} text={msg.text} />
          <Btn onClick={() => { setMsg(null); setStage("story"); setRound((r) => r + 1); }}>
            {round + 1 >= TOTAL ? "Finish the quest 🎉" : "Next invader →"}
          </Btn>
        </div>
      )}
      {stage !== "won" && msg && <Feedback ok={msg.ok} text={msg.text} />}
    </div>
  );
}

/* ================================================================== */
/* 7. Beneficial Sort                                                  */
/* ================================================================== */
function sortBullets(i: Insect): string[] {
  const host = i.hosts.split(",")[0].trim().toLowerCase();
  const meta = i.metamorphosis.toLowerCase();
  if (isHelper(i)) {
    if (i.role === "Pollinator" || i.role === "Pollinator/Pest") {
      return [
        `Visits flowers to help plants make seeds and fruit`,
        `Moves pollen from bloom to bloom`,
        `Grows up with ${meta} metamorphosis`,
      ];
    }
    return [
      `Eats or traps plant-damaging bugs`,
      `Protects gardens and farm crops`,
      `Grows up with ${meta} metamorphosis`,
    ];
  }
  if (i.role === "Invasive Pest") {
    return [
      `Came from far away with few natural enemies`,
      `Damages ${host}`,
      `Grows up with ${meta} metamorphosis`,
    ];
  }
  return [
    `Feeds on ${host}`,
    `Can hurt leaves, roots, or fruit`,
    `Grows up with ${meta} metamorphosis`,
  ];
}

function BeneficialSort({ onAward }: { onAward: (n: number) => void }) {
  const FIELDS = 3;
  const BUGS_PER_FIELD = 10;
  const [field, setField] = useState(0);
  const [phase, setPhase] = useState<"collect" | "sort" | "review" | "done">("collect");
  const [left, setLeft] = useState(15);
  const [caught, setCaught] = useState<Insect[]>([]);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [totalRight, setTotalRight] = useState(0);
  const [fieldScore, setFieldScore] = useState(0);

  const spread = useMemo(
    () => shuffle(POOL).slice(0, BUGS_PER_FIELD).map((i) => ({ i, x: 5 + Math.random() * 82, y: 8 + Math.random() * 74 })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [field],
  );

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase !== "collect") return;
    setLeft(15);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setLeft((s) => {
      if (s <= 1) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        setPhase("sort");
        return 0;
      }
      return s - 1;
    }), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [phase, field]);

  useEffect(() => {
    if (phase === "collect" && caught.length === BUGS_PER_FIELD) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setPhase("sort");
    }
  }, [phase, caught.length]);

  const submitSort = () => {
    const right = caught.filter((i) => answers[i.id] === isHelper(i)).length;
    setFieldScore(right);
    setTotalRight((t) => t + right);
    onAward(right);
    setPhase("review");
  };

  const nextField = () => {
    if (field + 1 >= FIELDS) {
      setPhase("done");
    } else {
      setField((f) => f + 1);
      setCaught([]);
      setAnswers({});
      setPhase("collect");
    }
  };

  const restart = () => {
    setField(0);
    setTotalRight(0);
    setFieldScore(0);
    setCaught([]);
    setAnswers({});
    setPhase("collect");
  };

  if (phase === "done") {
    return <Done score={totalRight} total={FIELDS * BUGS_PER_FIELD} onRestart={restart} />;
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-sm shadow-sm">
        <span className="font-bold text-foreground">🌻 Field {field + 1} of {FIELDS}</span>
        {phase === "collect" ? (
          <span className="text-muted-foreground">⏱ {left}s · caught {caught.length}/{BUGS_PER_FIELD}</span>
        ) : (
          <span className="inline-flex items-center gap-1 font-semibold text-primary">
            <Trophy className="h-3.5 w-3.5" /> {totalRight} sorted right
          </span>
        )}
      </div>

      {phase === "collect" && (
        <div className="relative h-96 overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-secondary/40 via-success/15 to-primary/20 shadow-inner">
          <div className="pointer-events-none absolute inset-0 opacity-30">
            <div className="absolute left-[10%] top-[12%] h-16 w-16 rounded-full bg-primary/20 blur-xl" />
            <div className="absolute right-[15%] top-[60%] h-20 w-20 rounded-full bg-success/20 blur-xl" />
            <div className="absolute left-[60%] top-[30%] h-12 w-12 rounded-full bg-accent/30 blur-lg" />
          </div>
          <div className="absolute left-4 top-4 rounded-full bg-card/80 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur-sm">
            Tap every bug you see!
          </div>
          {spread.map(({ i, x, y }) =>
            caught.some((c) => c.id === i.id) ? null : (
              <button
                key={i.id}
                onClick={() => setCaught((c) => [...c, i])}
                className="absolute h-16 w-16 overflow-hidden rounded-full border-2 border-card shadow-md transition hover:scale-110 hover:ring-2 hover:ring-primary"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <InsectImage id={i.id} name={i.commonName} className="h-full w-full" rounded={false} />
              </button>
            ),
          )}
        </div>
      )}

      {phase === "sort" && (
        <div>
          <div className="mb-3 rounded-xl bg-accent/20 p-3 text-sm text-foreground">
            <strong>Sort your bugs!</strong> Read the clues, then tap{" "}
            <span className="font-bold text-success">🐞 Helper</span> if it helps plants or eats pests, or{" "}
            <span className="font-bold text-destructive">🐛 Pest</span> if it damages plants.
          </div>
          <div className="space-y-3">
            {caught.map((i) => (
              <div key={i.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <InsectImage id={i.id} name={i.commonName} className="h-20 w-20 shrink-0 rounded-xl" />
                  <div className="flex-1">
                    <div className="text-base font-bold text-foreground">{i.commonName}</div>
                    <ul className="mt-1 ml-4 list-disc text-xs text-muted-foreground">
                      {sortBullets(i).map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setAnswers((a) => ({ ...a, [i.id]: true }))}
                    className={`rounded-xl border-2 px-2 py-3 text-sm font-bold transition ${
                      answers[i.id] === true
                        ? "border-success bg-success text-success-foreground"
                        : "border-success/40 bg-success/10 text-success hover:bg-success/20"
                    }`}
                  >
                    🐞🌻 Helper
                  </button>
                  <button
                    onClick={() => setAnswers((a) => ({ ...a, [i.id]: false }))}
                    className={`rounded-xl border-2 px-2 py-3 text-sm font-bold transition ${
                      answers[i.id] === false
                        ? "border-destructive bg-destructive text-destructive-foreground"
                        : "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20"
                    }`}
                  >
                    🐛⚠️ Pest
                  </button>
                </div>
              </div>
            ))}
            {caught.length === 0 && (
              <div className="rounded-xl bg-muted p-6 text-center text-sm text-muted-foreground">
                You didn&apos;t catch any bugs this time! Try tapping faster in the meadow.
              </div>
            )}
          </div>
          <div className="mt-4 text-right">
            <Btn tone="primary" onClick={submitSort} disabled={caught.length === 0}>
              Submit sort
            </Btn>
          </div>
        </div>
      )}

      {phase === "review" && (
        <div>
          <div className="mb-3 rounded-xl bg-primary/10 p-3 text-center text-sm font-semibold text-foreground">
            You sorted {fieldScore} of {caught.length} bugs correctly on this field!
          </div>
          <div className="space-y-3">
            {caught.map((i) => {
              const ok = answers[i.id] === isHelper(i);
              return (
                <div key={i.id} className={`flex items-center gap-3 rounded-2xl border p-3 text-sm ${ok ? "border-success/40 bg-success/10" : "border-destructive/40 bg-destructive/10"}`}>
                  <InsectImage id={i.id} name={i.commonName} className="h-16 w-16 shrink-0 rounded-xl" />
                  <div className="flex-1">
                    <div className="font-bold text-foreground">{i.commonName}</div>
                    <div className="text-xs text-muted-foreground">
                      {isHelper(i) ? "🐞 Beneficial helper" : "🐛 Pest"}
                    </div>
                  </div>
                  {ok ? <CheckCircle2 className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-destructive" />}
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-right">
            <Btn tone="primary" onClick={nextField}>
              {field + 1 >= FIELDS ? "Finish →" : "Next field →"}
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/* 10. Find the Disease                                                */
/* ================================================================== */
const VECTORS: Record<string, { disease: string; wrong: string[] }> = {
  "corn-flea-beetle": { disease: "Spreads Stewart's wilt bacteria to corn", wrong: ["Carries a virus that infects cattle", "Spreads mildew on apples"] },
  "potato-leafhopper": { disease: "Causes hopperburn and spreads plant diseases", wrong: ["Carries rabies", "Spreads soil fungus to trees"] },
  "corn-leaf-aphid": { disease: "Spreads plant viruses like maize dwarf mosaic", wrong: ["Carries malaria", "Spreads Dutch elm disease"] },
  "striped-cucumber-beetle": { disease: "Spreads bacterial wilt to cucumbers and melons", wrong: ["Carries Lyme disease", "Spreads apple scab"] },
  "soybean-thrips": { disease: "Spreads soybean vein necrosis virus", wrong: ["Carries the flu", "Spreads corn smut"] },
};
const VECTOR_IDS = Object.keys(VECTORS);

function FindTheDisease({ onAward }: { onAward: (n: number) => void }) {
  const [phase, setPhase] = useState<"search" | "quiz" | "done">("search");
  const [left, setLeft] = useState(15);
  const [found, setFound] = useState<string[]>([]);
  const [qi, setQi] = useState(0);
  const [right, setRight] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const vectors = useMemo(() => POOL.filter((i) => VECTOR_IDS.includes(i.id)), []);
  const board = useMemo(
    () => shuffle([...vectors, ...shuffle(POOL.filter((i) => !VECTOR_IDS.includes(i.id))).slice(0, 8)]).map((i) => ({
      i, x: 4 + Math.random() * 84, y: 6 + Math.random() * 78,
    })),
    [vectors],
  );

  useEffect(() => {
    if (phase !== "search") return;
    const t = setInterval(() => setLeft((s) => {
      if (s <= 1) { clearInterval(t); setPhase("quiz"); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const foundVectors = vectors.filter((v) => found.includes(v.id));

  if (phase === "search")
    return (
      <div>
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-semibold text-foreground">Click the disease-carrying insects!</span>
          <span className="text-muted-foreground">⏱ {left}s · found {foundVectors.length}/{vectors.length}</span>
        </div>
        <div className="relative h-96 overflow-hidden rounded-2xl bg-gradient-to-br from-accent/25 to-secondary/25">
          {board.map(({ i, x, y }) => (
            <button
              key={i.id}
              onClick={() => setFound((f) => (f.includes(i.id) ? f : [...f, i.id]))}
              className={`absolute h-16 w-16 overflow-hidden rounded-full border-2 shadow transition hover:scale-110 ${found.includes(i.id) ? (VECTOR_IDS.includes(i.id) ? "border-success" : "border-destructive") : "border-card"}`}
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <InsectImage id={i.id} name={i.commonName} className="h-full w-full" rounded={false} />
            </button>
          ))}
        </div>
      </div>
    );

  if (phase === "quiz") {
    if (qi >= foundVectors.length)
      return (
        <Done
          score={right}
          total={vectors.length}
          title="🔬 Lab work complete!"
          note={`You found ${foundVectors.length} of ${vectors.length} disease carriers.`}
          onRestart={() => { setPhase("search"); setLeft(15); setFound([]); setQi(0); setRight(0); }}
        />
      );
    const v = foundVectors[qi];
    const info = VECTORS[v.id];
    const opts = shuffle([info.disease, ...info.wrong]);
    return (
      <div>
        <div className="grid place-items-center rounded-2xl bg-gradient-to-br from-secondary/40 via-accent/25 to-primary/20 p-6">
          <InsectImage id={v.id} name={v.commonName} className="h-32 w-32" />
          <div className="mt-2 font-bold text-foreground">{v.commonName}</div>
          <p className="text-sm text-muted-foreground">What does this insect spread?</p>
        </div>
        <div className="mt-3">
          <QuizChoices
            key={v.id}
            options={opts}
            answer={info.disease}
            hint={`This insect feeds on ${v.hosts.toLowerCase()} — the sickness travels along with its bite. 🌾`}
            onCorrect={() => { setRight((r) => r + 1); onAward(2); }}
            onNext={() => setQi((q) => q + 1)}
          />
        </div>
      </div>
    );
  }
  return null;
}

/* ================================================================== */
/* 11. Insect Travel — "My Big Bug Trip" (story, first-person)         */
/* ================================================================== */
const TRAVEL_WAYS: { id: string; emoji: string; label: string; note: string }[] = [
  { id: "wind", emoji: "🌬️", label: "Ride the wind", note: "Tiny, light insects float away on a breeze." },
  { id: "fly", emoji: "✈️", label: "Fly with my wings", note: "Strong wings carry me field to field." },
  { id: "human", emoji: "🚗", label: "Hitch a ride with people", note: "Cars, trucks and firewood move insects far away." },
  { id: "water", emoji: "💧", label: "Float on the water", note: "Rain and streams wash insects downhill." },
  { id: "animal", emoji: "🐕", label: "Hitchhike on an animal", note: "I grab onto fur or feathers and hold on." },
  { id: "crawl", emoji: "🐛", label: "Crawl with my legs", note: "Slow and steady — good for short trips." },
];

const TRAVEL_STORIES: { scene: string; me: string; goal: string; answer: string; hint: string; win: string; bg: string }[] = [
  {
    scene: "🌾 A crowded corn leaf",
    me: "I am a tiny aphid. My leaf is packed with hundreds of cousins and the sap is running out!",
    goal: "I am lighter than a crumb and my wings are tiny. How should I travel to the next field?",
    answer: "wind",
    hint: "You weigh almost nothing — what invisible thing pushes leaves and seeds across a field? 🌬️",
    win: "Whoosh! The breeze lifts you high over the fence row and drops you in a fresh green field. Tiny insects travel a LONG way on wind.",
    bg: "from-secondary/45 via-accent/25 to-primary/20",
  },
  {
    scene: "🌻 A sunny flower patch",
    me: "I am a honey bee. This clover is empty, but I can see a sunflower field a mile away.",
    goal: "I have strong wings and a good sense of direction. How should I travel?",
    answer: "fly",
    hint: "You buzz! What body part on your thorax beats 200 times a second? ✈️",
    win: "Zoom! You fly straight to the sunflowers and bring pollen along for the ride. 🌻",
    bg: "from-primary/30 via-secondary/40 to-accent/20",
  },
  {
    scene: "🪵 A stack of firewood",
    me: "I am a beetle larva tucked deep inside a log. I cannot fly and I am hidden in the wood.",
    goal: "A family is loading this firewood into their truck for a camping trip. How will I travel?",
    answer: "human",
    hint: "You cannot move on your own — but the log you live in is about to go for a ride. 🚗",
    win: "You travel 200 miles in one afternoon! This is how invasive insects sneak into new forests — that's why we 'buy it where you burn it'.",
    bg: "from-accent/35 via-secondary/35 to-primary/20",
  },
  {
    scene: "🌧️ A rainstorm in the garden",
    me: "I am a soil insect washed out of my burrow. Water is rushing down the row.",
    goal: "The stream is heading toward the creek and the field on the other side. How will I travel?",
    answer: "water",
    hint: "Look at what is carrying the soil down the row right now. 💧",
    win: "Splash! You float downstream and crawl out on a new bank. Floods move insects and eggs to brand-new places.",
    bg: "from-accent/40 via-primary/20 to-secondary/35",
  },
  {
    scene: "🐄 The edge of a pasture",
    me: "I am a sticky little hitchhiker with hooks on my body. A cow is grazing right next to me.",
    goal: "The herd walks to a new pasture every evening. How will I travel?",
    answer: "animal",
    hint: "Something warm and furry is walking past you — grab on! 🐕",
    win: "You hook onto the cow's hair and ride to the next pasture. Animals carry insects, eggs and seeds all over the farm. 🐄",
    bg: "from-secondary/40 via-primary/25 to-accent/25",
  },
  {
    scene: "🥬 One cabbage plant",
    me: "I am a hungry caterpillar with no wings at all. The leaf above me is still juicy.",
    goal: "My trip is only a few inches. How should I travel?",
    answer: "crawl",
    hint: "No wings, no wind needed — just use the six legs you already have. 🐛",
    win: "Munch, munch! You inch up to the fresh leaf. Not every insect journey has to be a long one.",
    bg: "from-primary/25 via-secondary/45 to-accent/20",
  },
];

function InsectTravel({ onAward }: { onAward: (n: number) => void }) {
  const ROUNDS = 5;
  const [deck, setDeck] = useState(() => shuffle(TRAVEL_STORIES).slice(0, ROUNDS));
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongs, setWrongs] = useState<string[]>([]);
  const [state, setState] = useState<"asking" | "hint" | "right" | "revealed">("asking");

  const story = deck[round];

  const restart = () => {
    setDeck(shuffle(TRAVEL_STORIES).slice(0, ROUNDS));
    setRound(0);
    setScore(0);
    setWrongs([]);
    setState("asking");
  };

  if (round >= deck.length || !story)
    return <Done score={score} total={ROUNDS} title="🧳 Trip complete!" note="Insects travel by wind, wings, water, animals and even our cars." onRestart={restart} />;

  const answerWay = TRAVEL_WAYS.find((w) => w.id === story.answer)!;
  const locked = state === "right" || state === "revealed";

  return (
    <div>
      <Progress round={round} total={ROUNDS} score={score} />
      <div className={`rounded-2xl bg-gradient-to-br ${story.bg} p-5 shadow-sm`}>
        <div className="text-sm font-bold uppercase tracking-wide text-foreground/70">{story.scene}</div>
        <p className="mt-2 text-base font-semibold text-foreground">“{story.me}”</p>
        <p className="mt-2 text-sm font-medium text-foreground/80">{story.goal}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-2xl">🌾 🌳 ☀️ 🚜 🐝 🌻</div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {TRAVEL_WAYS.map((w) => {
          const isWrong = wrongs.includes(w.id);
          const isAnswer = locked && w.id === story.answer;
          return (
            <button
              key={w.id}
              disabled={locked || isWrong}
              onClick={() => {
                if (w.id === story.answer) {
                  setState("right");
                  setScore((s) => s + 1);
                  onAward(wrongs.length === 0 ? 2 : 1);
                } else if (wrongs.length === 0) {
                  setWrongs([w.id]);
                  setState("hint");
                } else {
                  setWrongs((x) => [...x, w.id]);
                  setState("revealed");
                }
              }}
              className={`rounded-2xl border-2 p-3 text-center transition disabled:cursor-not-allowed ${
                isAnswer
                  ? "border-success bg-success/20"
                  : isWrong
                    ? "border-destructive/60 bg-destructive/10 opacity-70"
                    : "border-primary/30 bg-card hover:-translate-y-0.5 hover:bg-primary/10"
              }`}
            >
              <div className="text-4xl">{w.emoji}</div>
              <div className="mt-1 text-sm font-bold text-foreground">{w.label}</div>
              <div className="text-[11px] text-muted-foreground">{w.note}</div>
            </button>
          );
        })}
      </div>

      {state === "hint" && (
        <div className="mt-3 rounded-lg border-2 border-secondary/60 bg-secondary/20 p-3 text-sm font-medium text-foreground">
          💡 Not quite — here's a hint: {story.hint} Try again!
        </div>
      )}
      {state === "right" && <Feedback ok text={story.win} />}
      {state === "revealed" && <Feedback ok={false} text={`The best way was ${answerWay.emoji} ${answerWay.label}. ${story.win}`} />}
      {locked && (
        <NextBtn
          onClick={() => {
            setWrongs([]);
            setState("asking");
            setRound((r) => r + 1);
          }}
          label={round + 1 >= deck.length ? "Finish trip" : "Next stop"}
        />
      )}
    </div>
  );
}

/* ================================================================== */
/* 12. Life Stages Sequence                                            */
/* ================================================================== */
const STAGE_EMOJI: Record<string, string> = { egg: "🥚", larva: "🐛", pupa: "🍯", nymph: "🦗", adult: "🦋" };

function LifeStagesSequence({ onAward }: { onAward: (n: number) => void }) {
  const ROUNDS = 4;
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [held, setHeld] = useState<number | null>(null);

  const bug = useMemo(() => rand(POOL), [round]);
  const stages: InsectStage[] = bug.metamorphosis === "Complete" ? ["egg", "larva", "pupa", "adult"] : ["egg", "nymph", "adult"];
  const [order, setOrder] = useState<InsectStage[]>(() => shuffle(stages));

  // Re-deal the cards whenever a new bug appears.
  useEffect(() => {
    setOrder(shuffle(bug.metamorphosis === "Complete" ? ["egg", "larva", "pupa", "adult"] : ["egg", "nymph", "adult"]));
    setHeld(null);
  }, [bug]);

  const swap = (a: number, b: number) =>
    setOrder((o) => {
      const c = [...o];
      [c[a], c[b]] = [c[b], c[a]];
      return c;
    });

  if (round >= ROUNDS)
    return <Done score={score} total={ROUNDS} title="🦋 Life cycles mastered!" onRestart={() => { setRound(0); setScore(0); setMsg(null); }} />;

  return (
    <div>
      <Progress round={round} total={ROUNDS} score={score} />
      <div className="mb-3 flex items-center gap-3 rounded-xl bg-gradient-to-r from-secondary/40 to-accent/25 p-3">
        <InsectImage id={bug.id} name={bug.commonName} className="h-16 w-16" />
        <div>
          <div className="font-semibold text-foreground">{bug.commonName}</div>
          <div className="text-xs text-muted-foreground">{bug.metamorphosis} metamorphosis · {stages.length} stages</div>
        </div>
      </div>
      <p className="mb-3 text-sm font-medium text-foreground">
        🚜 Move the cards into the right order, from egg to adult. Drag a card onto another one — or tap one card, then tap where it should go.
      </p>

      <div className="flex items-stretch gap-1 overflow-x-auto rounded-2xl bg-gradient-to-br from-primary/15 via-secondary/35 to-accent/20 p-3">
        {order.map((s, idx) => (
          <div key={s} className="flex items-center gap-1">
            <button
              draggable={!msg}
              onDragStart={() => setHeld(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { if (held !== null && held !== idx) swap(held, idx); setHeld(null); }}
              disabled={!!msg}
              onClick={() => {
                if (held === null) setHeld(idx);
                else if (held === idx) setHeld(null);
                else { swap(held, idx); setHeld(null); }
              }}
              className={`w-24 shrink-0 cursor-grab rounded-xl border-2 bg-card p-2 text-center transition active:cursor-grabbing ${
                held === idx ? "-translate-y-1 border-primary ring-2 ring-primary" : "border-primary/30 hover:bg-primary/10"
              }`}
            >
              {getInsectImage(bug.id, s) ? (
                <img src={getInsectImage(bug.id, s)!} alt={s} className="h-20 w-full rounded-lg object-cover" />
              ) : (
                <div className="grid h-20 place-items-center text-4xl">{STAGE_EMOJI[s]}</div>
              )}
              <div className="mt-1 text-xs font-bold capitalize text-foreground">
                {STAGE_EMOJI[s]} {s}
              </div>
            </button>
            {idx < order.length - 1 && <div className="shrink-0 text-2xl font-bold text-primary">➡️</div>}
          </div>
        ))}
      </div>

      {msg && <Feedback ok={msg.ok} text={msg.text} />}

      {msg ? (
        <NextBtn onClick={() => { setMsg(null); setRound((r) => r + 1); }} />
      ) : (
        <div className="mt-3 flex gap-2">
          <Btn onClick={() => setOrder(shuffle(stages))}>🔀 Shuffle</Btn>
          <Btn
            tone="primary"
            onClick={() => {
              const ok = order.every((s, idx) => s === stages[idx]);
              if (ok) { setScore((s) => s + 1); onAward(2); }
              setMsg({
                ok,
                text: ok
                  ? `Perfect life cycle: ${stages.map((s) => `${STAGE_EMOJI[s]} ${s}`).join(" → ")}!`
                  : `Not yet — the correct order is ${stages.map((s) => `${STAGE_EMOJI[s]} ${s}`).join(" → ")}.`,
              });
            }}
          >
            ✅ Check order
          </Btn>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/* 13. Build an Insect (3-part body plan)                              */
/* ================================================================== */
const BODY_PARTS = [
  { id: "head", label: "Head", note: "Eyes, antennae and mouthparts" },
  { id: "thorax", label: "Thorax", note: "Where the 6 legs and wings attach" },
  { id: "abdomen", label: "Abdomen", note: "Holds the stomach and breathing holes" },
];

/** Friendly cartoon bug head (antennae, big eyes, smile). */
function BugHead({ size = 96 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label="Cartoon insect head">
      <path d="M28 26 L14 8" stroke="currentColor" strokeWidth="5" strokeLinecap="round" className="text-foreground/70" />
      <path d="M72 26 L86 8" stroke="currentColor" strokeWidth="5" strokeLinecap="round" className="text-foreground/70" />
      <circle cx="12" cy="6" r="6" className="fill-primary" />
      <circle cx="88" cy="6" r="6" className="fill-primary" />
      <circle cx="50" cy="56" r="38" className="fill-primary" />
      <circle cx="36" cy="48" r="11" className="fill-card" />
      <circle cx="64" cy="48" r="11" className="fill-card" />
      <circle cx="37" cy="50" r="5" className="fill-foreground" />
      <circle cx="65" cy="50" r="5" className="fill-foreground" />
      <path d="M38 74 Q50 84 62 74" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" className="text-foreground" />
    </svg>
  );
}

/** Chunky body block used for thorax and abdomen. */
function BodyBlock({ label, tone, size = 96 }: { label: string; tone: "thorax" | "abdomen"; size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`grid place-items-center rounded-2xl border-4 text-center shadow-sm ${
        tone === "thorax" ? "border-accent/60 bg-accent/40" : "border-success/60 bg-success/30"
      }`}
    >
      <div>
        <div className="text-xs font-extrabold uppercase tracking-wide text-foreground">{label}</div>
        <div className="mt-1 text-lg">{tone === "thorax" ? "🦵🦵🦵" : "〰️"}</div>
      </div>
    </div>
  );
}

function PartArt({ id, size = 96 }: { id: string; size?: number }) {
  if (id === "head") return <BugHead size={size} />;
  return <BodyBlock label={id === "thorax" ? "Thorax" : "Abdomen"} tone={id === "thorax" ? "thorax" : "abdomen"} size={size} />;
}

function BuildAnInsect({ onAward }: { onAward: (n: number) => void }) {
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null]);
  const [wrong, setWrong] = useState<string | null>(null);
  const order = ["head", "thorax", "abdomen"];
  const complete = slots.every((s, i) => s === order[i]);

  function place(partId: string) {
    const next = slots.findIndex((s) => s === null);
    if (next < 0) return;
    if (partId !== order[next]) {
      setWrong(partId);
      setTimeout(() => setWrong(null), 500);
      return;
    }
    const copy = [...slots];
    copy[next] = partId;
    setSlots(copy);
    if (next === 2) onAward(3);
  }

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-foreground">🐞 Every insect has 3 body parts. Tap them in order from front to back.</p>
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-secondary/45 via-accent/25 to-primary/20 p-6">
        {slots.map((s, idx) => (
          <div key={idx} className={`grid h-28 w-28 place-items-center rounded-2xl border-4 border-dashed text-center ${s ? "border-success bg-card/70" : "border-primary/40"}`}>
            {s ? <PartArt id={s} size={88} /> : <span className="text-xs text-muted-foreground">part {idx + 1}</span>}
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {BODY_PARTS.map((p) => (
          <button
            key={p.id}
            disabled={slots.includes(p.id)}
            onClick={() => place(p.id)}
            className={`rounded-xl border-2 border-primary/30 bg-card p-3 text-left transition disabled:opacity-40 hover:bg-primary/10 ${wrong === p.id ? "k5-shake border-destructive" : ""}`}
          >
            <PartArt id={p.id} size={44} />
            <div className="mt-1 text-sm font-semibold">{p.label}</div>
            <div className="text-[11px] text-muted-foreground">{p.note}</div>
          </button>
        ))}
      </div>
      {complete && (
        <div className="mt-3">
          <Feedback ok text="You built an insect: head → thorax → abdomen, with 6 legs on the thorax! 🐜" />
          <div className="mt-2 flex flex-wrap gap-2">
            <Btn tone="primary" onClick={() => setSlots([null, null, null])}>🔁 Build another</Btn>
            <ReturnToGamesBtn />
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/* 14. Head Position Match                                             */
/* ================================================================== */
const HEAD_POSITIONS = [
  { id: "downward", label: "Downward (hypognathous)", hint: "Chewers that feed below them, like grasshoppers and caterpillars" },
  { id: "forward", label: "Forward (prognathous)", hint: "Hunters that chase prey, like ground beetles" },
  { id: "backward", label: "Backward (opisthognathous)", hint: "Sap suckers that tuck their beak back, like aphids and stink bugs" },
];
function headPos(i: Insect): string {
  if (i.order === "Hemiptera") return "backward";
  if (i.role === "Beneficial" && i.order === "Coleoptera") return "forward";
  return "downward";
}
const HEAD_QS = [
  {
    q: "Why do some insects have a forward-facing head?",
    right: "It helps predators chase and grab prey",
    wrong: ["It helps them sleep", "It keeps rain off their wings"],
    hint: "Think about a ground beetle running after its dinner. 🏃",
  },
  {
    q: "Why does a grasshopper's head point downward?",
    right: "So it can chew the leaves right below its mouth",
    wrong: ["So it can see the clouds", "So it can dig tunnels"],
    hint: "Where is a grasshopper's food when it stands on a leaf? 🌿",
  },
  {
    q: "Why do aphids and stink bugs tuck their beak backward under the body?",
    right: "It keeps the straw-like beak safe until they sip plant sap",
    wrong: ["It helps them fly faster", "It makes them look bigger"],
    hint: "Their mouth is a long straw — where would you keep a straw you're not using? 🥤",
  },
];

function HeadPositionMatch({ onAward }: { onAward: (n: number) => void }) {
  const ROUNDS = 3;
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<"match" | "quiz">("match");
  const [matched, setMatched] = useState<string[]>([]);
  const [selBug, setSelBug] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [qDeck] = useState(() => shuffle(HEAD_QS));

  const bugs = useMemo(() => {
    const pick = (pos: string) => rand(POOL.filter((i) => headPos(i) === pos));
    return shuffle(["downward", "forward", "backward"].map(pick).filter(Boolean));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);
  const positions = useMemo(() => shuffle(HEAD_POSITIONS), [round]);
  const quiz = qDeck[round % qDeck.length];
  const quizOpts = useMemo(() => shuffle([quiz.right, ...quiz.wrong]), [quiz]);

  if (round >= ROUNDS)
    return <Done score={score} total={ROUNDS} title="🔍 Head detective!" onRestart={() => { setRound(0); setScore(0); setMatched([]); setPhase("match"); }} />;

  const selected = bugs.find((b) => b.id === selBug);

  return (
    <div>
      <Progress round={round} total={ROUNDS} score={score} />
      {phase === "match" ? (
        <>
          <p className="mb-3 text-sm font-medium text-foreground">🔎 Tap an insect to zoom in, then choose the head position that matches it.</p>
          <div className="grid grid-cols-3 gap-3 rounded-2xl bg-gradient-to-br from-secondary/40 via-accent/20 to-primary/20 p-3">
            {bugs.map((b) => (
              <button
                key={b.id}
                disabled={matched.includes(b.id)}
                onClick={() => { setSelBug(b.id); setShowHint(false); }}
                className={`rounded-2xl border-4 bg-card p-1 text-center transition ${
                  matched.includes(b.id)
                    ? "border-success opacity-70"
                    : selBug === b.id
                      ? "-translate-y-1 border-primary ring-2 ring-primary"
                      : "border-primary/25 hover:bg-primary/10"
                }`}
              >
                <InsectImage id={b.id} name={b.commonName} className="mx-auto h-36 w-full sm:h-48" />
                <div className="mt-1 text-xs font-bold text-foreground">{matched.includes(b.id) ? "✅ " : ""}{b.commonName}</div>
              </button>
            ))}
          </div>

          {selected && (
            <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-muted/60 p-2 text-sm">
              <span className="font-semibold text-foreground">Selected: {selected.commonName}</span>
              <button onClick={() => setShowHint((h) => !h)} className="rounded-md border-2 border-secondary/60 bg-secondary/20 px-3 py-1 text-xs font-bold text-foreground">
                💡 {showHint ? "Hide hint" : "Need a hint?"}
              </button>
            </div>
          )}
          {selected && showHint && (
            <div className="mt-2 rounded-lg border-2 border-secondary/60 bg-secondary/20 p-3 text-sm font-medium text-foreground">
              This insect is a {selected.order === "Hemiptera" ? "sap sucker with a long straw-like beak 🥤" : isHelper(selected) && selected.order === "Coleoptera" ? "fast hunter that chases other bugs 🏃" : "leaf chewer that eats what is right below it 🌿"}.
            </div>
          )}

          <div className="mt-3 space-y-2">
            {positions.map((p) => {
              const owner = bugs.find((b) => headPos(b) === p.id);
              const isDone = owner && matched.includes(owner.id);
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    if (!selBug) return;
                    const bug = bugs.find((b) => b.id === selBug)!;
                    const ok = headPos(bug) === p.id;
                    if (ok) {
                      const nm = [...matched, bug.id];
                      setMatched(nm);
                      onAward(1);
                      if (nm.length === bugs.length) setTimeout(() => { setMsg(null); setPhase("quiz"); }, 900);
                    }
                    setMsg({ ok, text: ok ? `${bug.commonName}: ${p.hint}` : "Not that one — tap 💡 for a hint and try again." });
                    setSelBug(ok ? null : selBug);
                    setTimeout(() => setMsg(null), 1800);
                  }}
                  className={`w-full rounded-lg border-2 p-3 text-left text-sm ${isDone ? "border-success bg-success/15" : "border-primary/30 bg-card hover:bg-primary/10"}`}
                >
                  <div className="font-bold text-foreground">{p.label}</div>
                  <div className="text-[11px] text-muted-foreground">{p.hint}</div>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div>
          <p className="mb-2 text-base font-bold text-foreground">{quiz.q}</p>
          <QuizChoices
            key={quiz.q}
            options={quizOpts}
            answer={quiz.right}
            hint={quiz.hint}
            onCorrect={() => { setScore((s) => s + 1); onAward(2); }}
            onNext={() => { setMatched([]); setPhase("match"); setRound((r) => r + 1); }}
          />
        </div>
      )}
      {msg && <Feedback ok={msg.ok} text={msg.text} />}
    </div>
  );
}

/* ================================================================== */
/* 15. IPM Beginner                                                    */
/* ================================================================== */
function IPMBeginner({ onAward }: { onAward: (n: number) => void }) {
  const [seed, setSeed] = useState(0);
  const [cleared, setCleared] = useState<string[]>([]);
  const [open, setOpen] = useState<Insect | null>(null);
  const [step, setStep] = useState<"id" | "manage">("id");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const field = useMemo(
    () => shuffle(POOL).slice(0, 8).map((i) => ({ i, x: 5 + Math.random() * 82, y: 8 + Math.random() * 74 })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seed],
  );
  const options = useMemo(() => (open ? shuffle([open, ...shuffle(POOL.filter((p) => p.id !== open.id)).slice(0, 3)]) : []), [open]);
  const doneAll = cleared.length === field.length;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-foreground">Scout the field: {cleared.length}/{field.length} handled</span>
        {doneAll && <button onClick={() => { setSeed((s) => s + 1); setCleared([]); }} className="text-primary underline">New field</button>}
      </div>
      <div className="relative h-96 overflow-hidden rounded-2xl bg-gradient-to-b from-sky-200/50 via-success/20 to-[hsl(95_35%_35%)]/40">
        {field.map(({ i, x, y }) =>
          cleared.includes(i.id) ? null : (
            <button
              key={i.id}
              onClick={() => { setOpen(i); setStep("id"); }}
              className="absolute h-16 w-16 overflow-hidden rounded-full border-2 border-card shadow-md hover:scale-110"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <InsectImage id={i.id} name={i.commonName} className="h-full w-full" rounded={false} />
            </button>
          ),
        )}
        {doneAll && (
          <div className="grid h-full place-items-center p-4 text-center">
            <div>
              <div className="text-4xl">🚜🌽🌻</div>
              <div className="mt-2 text-2xl font-extrabold text-foreground">Field cleared!</div>
              <p className="mx-auto mt-2 max-w-md text-sm font-medium text-foreground/80">
                You managed the pests and protected every helper. The farmer's corn keeps its leaves, the bees keep pollinating, and this field
                will yield about <span className="font-extrabold">15% more grain</span> than a field that was sprayed all over. 🌾
              </p>
              <div className="mt-3 inline-block rounded-full bg-success/25 px-4 py-1.5 text-sm font-bold text-success">🏅 Badge earned: Junior IPM Scout</div>
            </div>
          </div>
        )}
      </div>
      {doneAll && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn tone="primary" onClick={() => { setSeed((s) => s + 1); setCleared([]); }}>🔁 Scout a new field</Btn>
          <ReturnToGamesBtn />
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5">
            <InsectImage id={open.id} name="Insect" className="mx-auto h-32 w-32" />
            {step === "id" ? (
              <>
                <p className="mt-3 text-center font-semibold text-foreground">Which insect is this?</p>
                <div className="mt-2 grid gap-2">
                  {options.map((o) => (
                    <Btn
                      key={o.id}
                      onClick={() => {
                        const ok = o.id === open.id;
                        setMsg({ ok, text: ok ? "Correct ID!" : `This is a ${open.commonName}.` });
                        setTimeout(() => { setMsg(null); if (ok) setStep("manage"); }, 1300);
                        if (ok) onAward(1);
                      }}
                    >
                      {o.commonName}
                    </Btn>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="mt-3 text-center font-semibold text-foreground">Should you manage the {open.commonName}?</p>
                <p className="mt-2 rounded-lg border-2 border-secondary/60 bg-secondary/20 p-2 text-center text-xs font-medium text-foreground">
                  💡 Field clue: {isHelper(open)
                    ? "you keep spotting this one hunting other bugs or visiting flowers — the leaves around it look untouched. 🌻"
                    : `the leaves near this one are chewed, spotted or curled, and it keeps feeding on ${open.hosts.toLowerCase()}. 🍃`}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[true, false].map((v) => (
                    <Btn
                      key={String(v)}
                      onClick={() => {
                        const shouldManage = !isHelper(open);
                        const ok = v === shouldManage;
                        setMsg({ ok, text: ok ? (shouldManage ? "Yes — it damages the crop." : "Right — leave helpers alone!") : shouldManage ? "This pest damages the crop, so manage it." : "This one helps the crop — leave it alone." });
                        if (ok) { onAward(2); setCleared((c) => [...c, open.id]); }
                        setTimeout(() => { setMsg(null); if (ok) setOpen(null); }, 1600);
                      }}
                    >
                      {v ? "Manage it" : "Leave it alone"}
                    </Btn>
                  ))}
                </div>
              </>
            )}
            {msg && <Feedback ok={msg.ok} text={msg.text} />}
            <div className="mt-3 text-right">
              <button onClick={() => setOpen(null)} className="text-xs text-muted-foreground underline">close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/* 16. Insect Steward                                                  */
/* ================================================================== */
const STEWARD_GOOD = [
  "Plant native flowers nearby so it has food",
  "Leave a strip of grass and leaves for shelter",
  "Skip spraying when this insect is active",
  "Add a water source and a bee house",
];
const STEWARD_BAD = ["Spray the whole field to kill it", "Squash every one you find", "Remove all flowers from the field"];

function InsectSteward({ onAward }: { onAward: (n: number) => void }) {
  const TOTAL = 8;
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const list = useMemo(() => shuffle(helpers).slice(0, TOTAL), []);
  const bug = list[round];
  const opts = useMemo(() => (bug ? shuffle([rand(STEWARD_GOOD), ...shuffle(STEWARD_BAD).slice(0, 2)]) : []), [bug]);

  if (round >= TOTAL || !bug) return <Done score={score} total={TOTAL} onRestart={() => { setRound(0); setScore(0); }} />;

  return (
    <div>
      <Progress round={round} total={TOTAL} score={score} />
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-br from-success/15 to-accent/25 p-6 sm:flex-row">
        <InsectImage id={bug.id} name={bug.commonName} className="h-32 w-32 shrink-0" />
        <div>
          <div className="text-lg font-bold text-foreground">{bug.commonName}</div>
          <p className="text-sm text-muted-foreground">{describe(bug)}</p>
          <p className="mt-1 text-sm font-medium text-primary">How should a good steward take care of it?</p>
        </div>
      </div>
      <div className="mt-4">
        <QuizChoices
          key={bug.id}
          options={opts}
          answer={opts.find((o) => STEWARD_GOOD.includes(o))!}
          hint="A good steward keeps helpers alive — look for the choice that gives food, water or shelter instead of killing bugs. 🌻"
          rightText="Great stewardship — the helper stays alive and keeps working! 🐝"
          onCorrect={() => { setScore((s) => s + 1); onAward(2); }}
          onNext={() => setRound((r) => r + 1)}
        />
      </div>
    </div>
  );
}

/* ================================================================== */
/* Hub                                                                 */
/* ================================================================== */
interface BBGame { id: string; name: string; emoji: string; topic: string; blurb: string; render: (a: (n: number) => void, onClose?: () => void) => ReactNode }

export const BUG_BUDDY_GAMES: BBGame[] = [
  { id: "insect-or-not", name: "Insect or Not?", emoji: "🔎", topic: "Insect definition", blurb: "10 seconds to decide: insect or imposter?", render: (a) => <InsectOrNot onAward={a} /> },
  { id: "name-insect", name: "Name the Insect", emoji: "🏷️", topic: "Common names", blurb: "Pick the right name from a picture and clue.", render: (a) => <NameTheInsect onAward={a} /> },
  { id: "mix-match", name: "Insect Mix and Match", emoji: "🌈", topic: "Biodiversity", blurb: "Rate the mix, then swap in new species.", render: (a) => <MixAndMatch onAward={a} /> },
  { id: "decomposer-dash", name: "Decomposer Dash", emoji: "♻️", topic: "Decomposers", blurb: "Catch leaves and return compost to the soil.", render: (a) => <DecomposerDash onAward={a} /> },
  { id: "pollinator-power", name: "Pollinator Power", emoji: "🌻", topic: "Pollinators", blurb: "Guard your flower and welcome pollinators.", render: (a) => <PollinatorPower onAward={a} /> },
  { id: "predator-pest", name: "Predator vs. Pest", emoji: "🏰", topic: "Predator/pest", blurb: "Knights vs. invaders: pick the helper that keeps the ecosystem balanced.", render: (a, onClose) => <PredatorVsPest onAward={a} onClose={onClose} /> },
  { id: "beneficial-sort", name: "Beneficial Sort", emoji: "🧺", topic: "Beneficial insects", blurb: "Collect bugs in 15s, then sort them.", render: (a) => <BeneficialSort onAward={a} /> },
  { id: "insect-invasion", name: "Insect Invasion: Save the Farm!", emoji: "🚨", topic: "Invasive species", blurb: "Scout, identify and stop an invader before it unbalances the farm.", render: (a, onClose) => <InsectInvasion onAward={a} onClose={onClose} /> },
  { id: "web-of-life", name: "Web of Life: Story of the Meadow", emoji: "🕸️", topic: "Food webs", blurb: "Explore a meadow, build food chains into a web, then predict what happens when things change.", render: (a, onClose) => <WebOfLife onAward={a} onClose={onClose} /> },
  { id: "pull-the-string", name: "Pull the String", emoji: "🪢", topic: "Ecosystem balance", blurb: "Tug one strand of the web, watch the ripple, then build and rescue a balanced ecosystem.", render: (a, onClose) => <PullTheString onAward={a} onClose={onClose} /> },
  { id: "find-disease", name: "Find the Disease", emoji: "🦠", topic: "Disease carriers", blurb: "Spot vectors, then name what they spread.", render: (a) => <FindTheDisease onAward={a} /> },
  { id: "insect-travel", name: "Insect Travel", emoji: "🧳", topic: "Dispersal", blurb: "Be the insect: pick how to travel — wind, wings, water, animals or a ride with people.", render: (a) => <InsectTravel onAward={a} /> },
  { id: "life-stages", name: "Life Stages Sequence", emoji: "🥚", topic: "Life stages", blurb: "Put the life stages in order.", render: (a) => <LifeStagesSequence onAward={a} /> },
  { id: "build-insect", name: "Build an Insect", emoji: "🧱", topic: "3-part body plan", blurb: "Head, thorax, abdomen — in order.", render: (a) => <BuildAnInsect onAward={a} /> },
  { id: "head-position", name: "Head Position Match", emoji: "🙂", topic: "Head position", blurb: "Match insects to their head positions.", render: (a) => <HeadPositionMatch onAward={a} /> },
  { id: "ipm-beginner", name: "IPM Beginner", emoji: "🚜", topic: "Basic management", blurb: "ID each field bug and decide what to do.", render: (a) => <IPMBeginner onAward={a} /> },
  { id: "insect-steward", name: "Insect Steward", emoji: "🌱", topic: "Stewardship", blurb: "Care for beneficial insects.", render: (a) => <InsectSteward onAward={a} /> },
];

export function BugBuddyGamesHub({ initialGameId, onOpenLesson }: { initialGameId?: string; onOpenLesson?: (lessonId: string) => void } = {}) {
  const { pts, add, reset } = useK5Points();
  const [active, setActive] = useState<BBGame | null>(
    () => BUG_BUDDY_GAMES.find((g) => g.id === initialGameId) ?? null,
  );
  const lessonLink = active ? linkForGame("elementary", active.id) : undefined;

  if (active)
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => setActive(null)} className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted">
            <ArrowLeft className="h-4 w-4" /> All games
          </button>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            <Trophy className="h-4 w-4" /> {pts} pts
          </div>
        </div>
        <h3 className="mb-1 text-lg font-bold text-foreground">{active.emoji} {active.name}</h3>
        <p className="mb-2 text-xs text-muted-foreground">{active.blurb}</p>
        {lessonLink && onOpenLesson && (
          <button
            onClick={() => onOpenLesson(lessonLink.lessonId)}
            className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent hover:bg-accent/20"
          >
            <BookOpen className="h-3.5 w-3.5" /> Read the lesson: {lessonLink.topic}
          </button>
        )}
        {active.render(add, () => setActive(null))}
      </div>
    );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-3">
        <div className="inline-flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Bug Buddy points</div>
            <div className="text-2xl font-bold text-primary">{pts}</div>
          </div>
        </div>
        <button onClick={reset} className="rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted">
          <RefreshCcw className="mr-1 inline h-3 w-3" /> Reset
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {BUG_BUDDY_GAMES.map((g) => (
          <button key={g.id} onClick={() => setActive(g)} className="flex flex-col items-start gap-1 rounded-xl border border-border bg-card p-4 text-left transition hover:bg-muted/50 hover:shadow-md">
            <span className="text-3xl">{g.emoji}</span>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{g.topic}</div>
            <div className="font-semibold text-foreground">{g.name}</div>
            <div className="text-xs text-muted-foreground">{g.blurb}</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[11px] font-medium text-primary">Play →</span>
              {onOpenLesson && linkForGame("elementary", g.id) && (
                <span className="inline-flex items-center gap-1 rounded-full border border-accent/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                  <BookOpen className="h-3 w-3" /> Lesson linked
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

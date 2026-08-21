import { useMemo, useState } from "react";
import { Bug, Dices, DollarSign, Search } from "lucide-react";
import type { GameMeta, GameProps } from "./GameFrame";

/* ------------------------------------------------------------------ utils */

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ------------------------------------------------- 1. Metamorphosis Race -- */

interface Square {
  label: string;
  kind: "stage" | "molt" | "resource" | "plain";
}

const COMPLETE_TRACK: Square[] = [
  { label: "Egg", kind: "stage" },
  { label: "Hatch", kind: "plain" },
  { label: "Larva (instar 1)", kind: "stage" },
  { label: "Molt gate", kind: "molt" },
  { label: "Feeding: gain resource", kind: "resource" },
  { label: "Larva (instar 3)", kind: "stage" },
  { label: "Molt gate", kind: "molt" },
  { label: "Pupa — the detour", kind: "stage" },
  { label: "Tissue rebuild: gain resource", kind: "resource" },
  { label: "Molt gate", kind: "molt" },
  { label: "Adult", kind: "stage" },
];

const INCOMPLETE_TRACK: Square[] = [
  { label: "Egg", kind: "stage" },
  { label: "Hatch", kind: "plain" },
  { label: "Nymph (instar 1)", kind: "stage" },
  { label: "Molt gate", kind: "molt" },
  { label: "Feeding: gain resource", kind: "resource" },
  { label: "Nymph (instar 4, wing pads)", kind: "stage" },
  { label: "Molt gate", kind: "molt" },
  { label: "Adult", kind: "stage" },
];

interface MoltQ {
  q: string;
  options: string[];
  answer: string;
  why: string;
}

const MOLT_QUESTIONS: MoltQ[] = [
  {
    q: "What must an insect shed to grow past a molt gate?",
    options: ["Its exoskeleton (cuticle)", "Its tracheae", "Its wings", "Its ommatidia"],
    answer: "Its exoskeleton (cuticle)",
    why: "The rigid cuticle cannot stretch, so growth happens in steps: the old cuticle splits and is shed (ecdysis).",
  },
  {
    q: "The stage between two molts is called…",
    options: ["An instar", "A pupa", "A caste", "A morph"],
    answer: "An instar",
    why: "Each instar is one step; most insects pass through 3–6 instars before becoming adults.",
  },
  {
    q: "Which track has a pupal stage?",
    options: ["Complete metamorphosis only", "Incomplete only", "Both", "Neither"],
    answer: "Complete metamorphosis only",
    why: "Holometabolous insects add a non-feeding pupal detour where larval tissue is rebuilt into an adult.",
  },
  {
    q: "A nymph differs from a larva because a nymph…",
    options: [
      "Resembles the adult and shares its habitat",
      "Has no legs",
      "Never feeds",
      "Always lives in water",
    ],
    answer: "Resembles the adult and shares its habitat",
    why: "Nymphs are miniature adults with wing pads, so they compete for the same food as the adult.",
  },
  {
    q: "Which resource is required before a successful molt?",
    options: ["Stored energy from feeding", "A mate", "Cold temperatures", "Pesticide exposure"],
    answer: "Stored energy from feeding",
    why: "Molting is metabolically expensive — larvae/nymphs must bank energy from feeding first.",
  },
];

export function MetamorphosisRace({ add, onFinish }: GameProps) {
  const [posC, setPosC] = useState(0);
  const [posI, setPosI] = useState(0);
  const [resC, setResC] = useState(0);
  const [resI, setResI] = useState(0);
  const [turn, setTurn] = useState(1);
  const [die, setDie] = useState<number | null>(null);
  const [log, setLog] = useState<string[]>(["Roll for the complete-metamorphosis track to begin."]);
  const [gate, setGate] = useState<{ track: "C" | "I"; q: MoltQ } | null>(null);
  const [gateFeedback, setGateFeedback] = useState<{ ok: boolean; why: string } | null>(null);
  const [right, setRight] = useState(0);
  const [asked, setAsked] = useState(0);
  const [qPool, setQPool] = useState<MoltQ[]>(() => shuffle(MOLT_QUESTIONS));

  const doneC = posC >= COMPLETE_TRACK.length - 1;
  const doneI = posI >= INCOMPLETE_TRACK.length - 1;
  const over = doneC && doneI;

  function nextQuestion(): MoltQ {
    const pool = qPool.length ? qPool : shuffle(MOLT_QUESTIONS);
    const [q, ...rest] = pool;
    setQPool(rest);
    return q;
  }

  function roll(track: "C" | "I") {
    if (gate || over) return;
    const n = 1 + Math.floor(Math.random() * 3);
    setDie(n);
    const board = track === "C" ? COMPLETE_TRACK : INCOMPLETE_TRACK;
    const pos = track === "C" ? posC : posI;
    let next = Math.min(board.length - 1, pos + n);
    const sq = board[next];
    let msg = `${track === "C" ? "Complete" : "Incomplete"} track rolled ${n} → ${sq.label}.`;

    if (sq.kind === "molt") {
      const res = track === "C" ? resC : resI;
      if (res > 0) {
        if (track === "C") setResC(res - 1);
        else setResI(res - 1);
        msg += " You spent a stored-energy card to molt straight through.";
      } else {
        setGate({ track, q: nextQuestion() });
        msg += " No energy card — answer the molt question to pass.";
        if (track === "C") setPosC(next);
        else setPosI(next);
        setLog((l) => [msg, ...l]);
        setTurn((t) => t + 1);
        return;
      }
    }
    if (sq.kind === "resource") {
      if (track === "C") setResC((r) => r + 1);
      else setResI((r) => r + 1);
      msg += " +1 stored-energy card.";
    }
    if (next === board.length - 1) msg += " Adult reached!";

    if (track === "C") setPosC(next);
    else setPosI(next);
    setLog((l) => [msg, ...l]);
    setTurn((t) => t + 1);
  }

  function answerGate(opt: string) {
    if (!gate || gateFeedback) return;
    const ok = opt === gate.q.answer;
    setAsked((a) => a + 1);
    if (ok) {
      setRight((r) => r + 1);
      add(8);
    } else {
      // wrong answer sends you back one square — a failed molt
      if (gate.track === "C") setPosC((p) => Math.max(0, p - 1));
      else setPosI((p) => Math.max(0, p - 1));
    }
    setGateFeedback({ ok, why: gate.q.why });
  }

  function finish() {
    const score = right * 8 + (posC >= COMPLETE_TRACK.length - 1 ? 15 : 0) + (posI >= INCOMPLETE_TRACK.length - 1 ? 15 : 0);
    onFinish({
      score,
      correct: right,
      total: Math.max(asked, 1),
      message:
        "The complete-metamorphosis track is longer because of the pupal detour — that extra stage is where larval tissue is rebuilt into an adult with a totally different diet and habitat.",
    });
  }

  const Track = ({ board, pos, res, name, track }: { board: Square[]; pos: number; res: number; name: string; track: "C" | "I" }) => (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-foreground">{name}</div>
        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent">⚡ {res} energy</span>
      </div>
      <ol className="mt-2 space-y-1">
        {board.map((s, i) => (
          <li
            key={`${name}-${i}`}
            className={`flex items-center gap-2 rounded-md border px-2 py-1 text-xs ${
              i === pos
                ? "border-primary bg-primary/10 font-semibold text-foreground"
                : s.kind === "molt"
                  ? "border-destructive/30 bg-destructive/5 text-muted-foreground"
                  : s.kind === "resource"
                    ? "border-accent/30 bg-accent/5 text-muted-foreground"
                    : "border-border bg-background text-muted-foreground"
            }`}
          >
            <span className="w-4 text-center">{i === pos ? "🐛" : s.kind === "molt" ? "🔒" : s.kind === "resource" ? "⚡" : "·"}</span>
            {s.label}
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={() => roll(track)}
        disabled={!!gate || pos >= board.length - 1}
        className="mt-2 w-full rounded-md bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-40"
      >
        {pos >= board.length - 1 ? "Adult ✓" : "Roll & advance"}
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">Turn {turn}</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">
          <Dices className="h-3.5 w-3.5" /> Last roll {die ?? "—"}
        </span>
        <span className="rounded-full bg-success/15 px-3 py-1 font-semibold text-success">Molt gates passed {right}</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Track board={COMPLETE_TRACK} pos={posC} res={resC} name="Complete metamorphosis" track="C" />
        <Track board={INCOMPLETE_TRACK} pos={posI} res={resI} name="Incomplete metamorphosis" track="I" />
      </div>

      {gate && (
        <div className="rounded-xl border border-accent/50 bg-accent/10 p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-accent">Molt gate</div>
          <p className="mt-1 text-sm font-semibold text-foreground">{gate.q.q}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {gate.q.options.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => answerGate(o)}
                disabled={!!gateFeedback}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                  gateFeedback && o === gate.q.answer
                    ? "border-success/60 bg-success/15"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                {o}
              </button>
            ))}
          </div>
          {gateFeedback && (
            <div className="mt-3 rounded-lg border border-border bg-card p-3 text-sm">
              <div className="font-semibold text-foreground">{gateFeedback.ok ? "Molt successful. +8 pts" : "Failed molt — back one square."}</div>
              <p className="mt-1 text-muted-foreground">{gateFeedback.why}</p>
              <button
                type="button"
                onClick={() => {
                  setGate(null);
                  setGateFeedback(null);
                }}
                className="mt-2 rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90"
              >
                Continue →
              </button>
            </div>
          )}
        </div>
      )}

      {over && !gate && (
        <button
          type="button"
          onClick={finish}
          className="w-full rounded-md bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:opacity-90"
        >
          Both tracks reached adult — see results →
        </button>
      )}

      <div className="space-y-1.5">
        {log.slice(0, 5).map((l, i) => (
          <div key={i} className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------------------------- 2. Farm Economics --- */

interface PestEvent {
  name: string;
  emoji: string;
  crop: string;
  brief: string;
  fact: string;
  /** loss in $ per acre if ignored */
  ignoreLoss: number;
  treatCost: number;
  treatResidual: number;
  preventCost: number;
  preventResidual: number;
}

const EVENTS: PestEvent[] = [
  {
    name: "Boll weevil",
    emoji: "🪳",
    crop: "Cotton",
    brief: "Punctured squares are dropping across the field.",
    fact: "Before eradication programs, the boll weevil cost U.S. cotton growers an estimated $300 million a year.",
    ignoreLoss: 220,
    treatCost: 60,
    treatResidual: 40,
    preventCost: 95,
    preventResidual: 10,
  },
  {
    name: "Soybean aphid",
    emoji: "🐜",
    crop: "Soybean",
    brief: "Scouting shows ~180 aphids per plant and rising.",
    fact: "The economic threshold is 250 aphids/plant with populations increasing — treating earlier usually loses money.",
    ignoreLoss: 130,
    treatCost: 55,
    treatResidual: 30,
    preventCost: 80,
    preventResidual: 25,
  },
  {
    name: "European corn borer",
    emoji: "🐛",
    crop: "Corn",
    brief: "Shot-holing in whorls, larvae tunneling into stalks.",
    fact: "Corn borer historically cost about $1 billion per year in yield loss and control across the U.S.",
    ignoreLoss: 190,
    treatCost: 70,
    treatResidual: 55,
    preventCost: 85,
    preventResidual: 8,
  },
  {
    name: "Western corn rootworm",
    emoji: "🪲",
    crop: "Corn",
    brief: "Lodged, goose-necked plants after a windy night.",
    fact: "Called the 'billion-dollar bug' — rootworm control plus losses top $1 billion annually.",
    ignoreLoss: 240,
    treatCost: 90,
    treatResidual: 80,
    preventCost: 70,
    preventResidual: 15,
  },
  {
    name: "Spider mites",
    emoji: "🕷️",
    crop: "Soybean",
    brief: "Hot, dry week; stippling and webbing on lower leaves.",
    fact: "Broad-spectrum sprays often flare mites by killing their predators — treatment can make it worse.",
    ignoreLoss: 110,
    treatCost: 50,
    treatResidual: 70,
    preventCost: 40,
    preventResidual: 30,
  },
  {
    name: "Black cutworm",
    emoji: "🌙",
    crop: "Corn",
    brief: "Cut seedlings at 4% of stand, larvae under residue.",
    fact: "Rescue treatments only pay when cutting exceeds ~3–5% of stand — otherwise the crop compensates.",
    ignoreLoss: 95,
    treatCost: 45,
    treatResidual: 20,
    preventCost: 75,
    preventResidual: 10,
  },
];

export function FarmEconomics({ add, onFinish }: GameProps) {
  const rounds = useMemo(() => shuffle(EVENTS).slice(0, 5), []);
  const [idx, setIdx] = useState(0);
  const [ledger, setLedger] = useState<{ label: string; amount: number }[]>([]);
  const [balance, setBalance] = useState(1000);
  const [outcome, setOutcome] = useState<{ text: string; fact: string; good: boolean } | null>(null);
  const [good, setGood] = useState(0);

  const ev = rounds[idx];

  function choose(kind: "prevent" | "treat" | "ignore") {
    if (outcome) return;
    let cost = 0;
    let label = "";
    if (kind === "ignore") {
      cost = ev.ignoreLoss;
      label = `${ev.name}: no action — crop loss`;
    } else if (kind === "treat") {
      cost = ev.treatCost + ev.treatResidual;
      label = `${ev.name}: rescue treatment + residual loss`;
    } else {
      cost = ev.preventCost + ev.preventResidual;
      label = `${ev.name}: prevention program + residual loss`;
    }
    const best = Math.min(
      ev.ignoreLoss,
      ev.treatCost + ev.treatResidual,
      ev.preventCost + ev.preventResidual,
    );
    const isBest = cost === best;
    if (isBest) {
      setGood((g) => g + 1);
      add(12);
    }
    setBalance((b) => b - cost);
    setLedger((l) => [...l, { label, amount: -cost }]);
    setOutcome({
      good: isBest,
      text: isBest
        ? `Best call. That path cost $${cost}/acre — the cheapest option available this season.`
        : `Costly call: $${cost}/acre. The cheapest option this season was $${best}/acre.`,
      fact: ev.fact,
    });
  }

  function next() {
    if (idx + 1 >= rounds.length) {
      const profit = balance;
      onFinish({
        score: Math.max(0, good * 12),
        correct: good,
        total: rounds.length,
        message: `You finished the season at $${profit}/acre. Economic thresholds exist because treatment only pays when the expected loss exceeds the cost of control.`,
      });
      return;
    }
    setIdx((i) => i + 1);
    setOutcome(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">Season {idx + 1}/{rounds.length}</span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-bold ${
            balance >= 700 ? "bg-success/15 text-success" : balance >= 400 ? "bg-accent/15 text-accent" : "bg-destructive/15 text-destructive"
          }`}
        >
          <DollarSign className="h-3.5 w-3.5" /> {balance} / acre
        </span>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-3xl">{ev.emoji}</div>
        <div className="mt-1 font-display text-xl font-extrabold text-foreground">{ev.name}</div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{ev.crop} · pest event</div>
        <p className="mt-2 text-sm text-muted-foreground">{ev.brief}</p>
      </div>

      {!outcome ? (
        <div className="grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => choose("prevent")}
            className="rounded-lg border border-border bg-background p-3 text-left text-sm hover:bg-muted"
          >
            <div className="font-semibold text-foreground">Prevention</div>
            <div className="text-xs text-muted-foreground">Resistant seed, rotation, refuge — ${ev.preventCost}/acre up front.</div>
          </button>
          <button
            type="button"
            onClick={() => choose("treat")}
            className="rounded-lg border border-border bg-background p-3 text-left text-sm hover:bg-muted"
          >
            <div className="font-semibold text-foreground">Treat now</div>
            <div className="text-xs text-muted-foreground">Rescue application — ${ev.treatCost}/acre plus whatever damage is already done.</div>
          </button>
          <button
            type="button"
            onClick={() => choose("ignore")}
            className="rounded-lg border border-border bg-background p-3 text-left text-sm hover:bg-muted"
          >
            <div className="font-semibold text-foreground">Do nothing</div>
            <div className="text-xs text-muted-foreground">Spend $0 and accept whatever yield loss follows.</div>
          </button>
        </div>
      ) : (
        <div className={`rounded-xl border p-4 text-sm ${outcome.good ? "border-success/40 bg-success/10" : "border-destructive/40 bg-destructive/10"}`}>
          <div className="font-semibold text-foreground">{outcome.text}</div>
          <p className="mt-1 text-muted-foreground">📊 {outcome.fact}</p>
          <button
            type="button"
            onClick={next}
            className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
          >
            {idx + 1 >= rounds.length ? "Close the books →" : "Next season →"}
          </button>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Ledger</div>
        {ledger.length === 0 ? (
          <p className="mt-1 text-xs text-muted-foreground">No entries yet — you start the year at $1,000/acre budget.</p>
        ) : (
          <ul className="mt-1 space-y-1 text-xs">
            {ledger.map((l, i) => (
              <li key={i} className="flex justify-between">
                <span className="text-muted-foreground">{l.label}</span>
                <span className="font-semibold text-destructive">${l.amount}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------ 3. Damage CSI ---- */

interface Case {
  pattern: string;
  evidence: string[];
  culprit: string;
  mouthpart: string;
  suspects: string[];
  why: string;
}

const CASES: Case[] = [
  {
    pattern: "Leaf skeletonizing — veins left as lace",
    evidence: ["Tissue removed between veins", "Ragged, chewed margins", "Frass pellets on lower leaves"],
    culprit: "Japanese beetle",
    mouthpart: "Chewing",
    suspects: ["Japanese beetle", "Potato leafhopper", "Soybean aphid", "Thrips"],
    why: "Only chewing mouthparts can remove tissue outright. Skeletonizing beetles graze between veins because the veins are too tough.",
  },
  {
    pattern: "Round boring holes in the stalk with sawdust-like frass",
    evidence: ["Entry hole ~3 mm", "Frass extruded at the hole", "Tunnel running up the pith"],
    culprit: "European corn borer",
    mouthpart: "Chewing (larval)",
    suspects: ["European corn borer", "Corn leaf aphid", "Chinch bug", "Two-spotted spider mite"],
    why: "Boring damage plus frass means a chewing larva inside the plant, not a sap feeder on the surface.",
  },
  {
    pattern: "Yellow V-shaped tip burn on leaves; plants stunted",
    evidence: ["No tissue missing", "Wedge-shaped insects flee sideways", "Damage starts at leaf tip"],
    culprit: "Potato leafhopper",
    mouthpart: "Piercing-sucking",
    suspects: ["Potato leafhopper", "Bean leaf beetle", "Fall armyworm", "Corn rootworm"],
    why: "'Hopperburn' comes from saliva injected while a piercing-sucking beak feeds in the vascular tissue — no tissue is removed.",
  },
  {
    pattern: "Fine stippling and silk webbing on the underside of leaves",
    evidence: ["Tiny pale dots on leaves", "Webbing between leaflets", "Worse in hot, dry weather"],
    culprit: "Two-spotted spider mite",
    mouthpart: "Piercing stylets (arachnid)",
    suspects: ["Two-spotted spider mite", "Squash bug", "Imported cabbageworm", "Wireworm"],
    why: "Stippling plus webbing is diagnostic for mites — eight legs, stylets that empty individual cells.",
  },
  {
    pattern: "Seedlings cut off at the soil line overnight",
    evidence: ["Clean cut at the base", "Wilted plants lying beside stubble", "Grey larva curled under residue"],
    culprit: "Black cutworm",
    mouthpart: "Chewing",
    suspects: ["Black cutworm", "Soybean thrips", "Green stink bug", "Honey bee"],
    why: "Cutworm larvae feed at night and cut stems with strong mandibles, then hide in soil or residue by day.",
  },
  {
    pattern: "Curled, sticky leaves with black sooty mold",
    evidence: ["Honeydew coating leaves", "Soft pear-shaped insects in colonies", "Ants tending the colony"],
    culprit: "Soybean aphid",
    mouthpart: "Piercing-sucking",
    suspects: ["Soybean aphid", "Colorado potato beetle", "Corn earworm", "Ground beetle"],
    why: "Honeydew is excess plant sap — only a phloem-feeding piercing-sucking insect produces it.",
  },
  {
    pattern: "Deformed, dimpled pods with 'cat-facing' scars",
    evidence: ["Punctures on the pod wall", "Shriveled seed inside", "Shield-shaped insect on the plant"],
    culprit: "Green stink bug",
    mouthpart: "Piercing-sucking",
    suspects: ["Green stink bug", "Alfalfa weevil", "Diamondback moth", "Syrphid fly"],
    why: "Stink bugs puncture developing seed; the plant reacts with scarring rather than losing tissue.",
  },
];

export function DamageCSI({ add, onFinish }: GameProps) {
  const cases = useMemo(() => shuffle(CASES).slice(0, 5), []);
  const [idx, setIdx] = useState(0);
  const [eliminated, setEliminated] = useState<string[]>([]);
  const [phase, setPhase] = useState<"suspect" | "mouthpart" | "reveal">("suspect");
  const [wrongThisCase, setWrongThisCase] = useState(0);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const [mouthPick, setMouthPick] = useState<string | null>(null);

  const c = cases[idx];
  const suspects = useMemo(() => shuffle(c.suspects), [c]);
  const mouthOptions = useMemo(
    () => shuffle(Array.from(new Set([c.mouthpart, "Chewing", "Piercing-sucking", "Siphoning", "Sponging"])).slice(0, 4)),
    [c],
  );

  function accuse(name: string) {
    if (phase !== "suspect" || eliminated.includes(name)) return;
    if (name === c.culprit) {
      setPhase("mouthpart");
    } else {
      setEliminated((e) => [...e, name]);
      setWrongThisCase((w) => w + 1);
    }
  }

  function pickMouth(m: string) {
    if (phase !== "mouthpart") return;
    setMouthPick(m);
    const ok = m === c.mouthpart;
    const gain = Math.max(4, 20 - wrongThisCase * 5) + (ok ? 5 : 0);
    setScore((s) => s + gain);
    add(gain);
    if (ok && wrongThisCase === 0) setSolved((s) => s + 1);
    setPhase("reveal");
  }

  function next() {
    if (idx + 1 >= cases.length) {
      onFinish({
        score,
        correct: solved,
        total: cases.length,
        message:
          "Damage type is evidence: chewing removes tissue, piercing-sucking leaves stippling, honeydew, or distortion with the tissue intact. Read the mouthpart from the wound.",
      });
      return;
    }
    setIdx((i) => i + 1);
    setEliminated([]);
    setPhase("suspect");
    setWrongThisCase(0);
    setMouthPick(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">Case {idx + 1}/{cases.length}</span>
        <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">Score {score}</span>
        <span className="rounded-full bg-destructive/10 px-3 py-1 text-destructive">Wrong accusations {wrongThisCase}</span>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-accent">
          <Search className="h-3.5 w-3.5" /> Crime scene
        </div>
        <div className="mt-1 font-display text-xl font-extrabold text-foreground">{c.pattern}</div>
        <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-muted-foreground">
          {c.evidence.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      </div>

      {phase === "suspect" && (
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Suspect line-up</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {suspects.map((s) => {
              const out = eliminated.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => accuse(s)}
                  disabled={out}
                  className={`rounded-lg border px-4 py-3 text-left text-sm transition ${
                    out ? "border-border bg-muted text-muted-foreground line-through" : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  <Bug className="mr-2 inline h-4 w-4 text-muted-foreground" />
                  {s}
                </button>
              );
            })}
          </div>
          {wrongThisCase > 0 && (
            <p className="mt-2 rounded-md border border-accent/40 bg-accent/10 p-2 text-xs text-foreground">
              Hint: match the wound to the mouthpart first — is tissue actually missing, or only discolored?
            </p>
          )}
        </div>
      )}

      {phase === "mouthpart" && (
        <div className="rounded-xl border border-success/40 bg-success/10 p-4">
          <div className="text-sm font-semibold text-foreground">Culprit identified: {c.culprit}. Now name the mouthpart type.</div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {mouthOptions.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => pickMouth(m)}
                className="rounded-lg border border-border bg-background px-4 py-3 text-left text-sm hover:bg-muted"
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === "reveal" && (
        <div className="rounded-xl border border-border bg-card p-4 text-sm">
          <div className="font-semibold text-foreground">
            {mouthPick === c.mouthpart ? "Case closed." : `Close — the mouthpart is ${c.mouthpart}.`}
          </div>
          <p className="mt-1 text-muted-foreground">{c.why}</p>
          <button
            type="button"
            onClick={next}
            className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
          >
            {idx + 1 >= cases.length ? "See results →" : "Next case →"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ meta */

export const HS_GAMES_2: GameMeta[] = [
  {
    id: "metamorphosis-race",
    name: "Molt & Move",
    emoji: "🎲",
    topic: "Metamorphosis",
    blurb: "A two-track race board: complete metamorphosis vs. incomplete, with molt gates in the way.",
    howTo: [
      "Two tracks run side by side — complete metamorphosis (with a pupal detour) and incomplete metamorphosis.",
      "Roll to advance either track. Landing on a ⚡ square banks a stored-energy card.",
      "🔒 Molt gates only open if you spend an energy card or answer the molt question correctly.",
      "A wrong answer is a failed molt — you slide back one square. Get both tracks to Adult to finish.",
    ],
    render: (p) => <MetamorphosisRace {...p} />,
  },
  {
    id: "farm-economics",
    name: "Bottom Line Farm",
    emoji: "💵",
    topic: "Economic impact of insects",
    blurb: "Run a farm through five pest events and keep the ledger in the black.",
    howTo: [
      "You start the year with $1,000 per acre of budget.",
      "Each season a real pest event hits. Choose prevention, a rescue treatment, or no action.",
      "Every choice has a cost: control spend plus whatever yield loss you still take.",
      "Picking the cheapest available option scores points — the ledger shows exactly what each call cost you.",
    ],
    render: (p) => <FarmEconomics {...p} />,
  },
  {
    id: "damage-csi",
    name: "Damage CSI",
    emoji: "🔍",
    topic: "Insect damage",
    blurb: "Read the damage pattern, eliminate suspects, and name the mouthpart that did it.",
    howTo: [
      "Each case opens with a damage pattern and three pieces of evidence.",
      "Accuse a suspect from the line-up. Wrong accusations are eliminated and cost you points.",
      "Once you name the culprit, identify the mouthpart type that produced the wound.",
      "Solve five cases without a wrong accusation for a perfect record.",
    ],
    render: (p) => <DamageCSI {...p} />,
  },
];

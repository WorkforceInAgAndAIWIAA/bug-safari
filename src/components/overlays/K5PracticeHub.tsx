import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { insects as ALL_INSECTS, type Insect } from "@/data/insects";
import { Sparkles, Trophy, ArrowLeft, CheckCircle2, XCircle, Clock, RefreshCcw } from "lucide-react";

const K5_IDS = [
  "alfalfa-weevil","bumble-bee","corn-leaf-aphid","honey-bee","japanese-beetle",
  "monarch-butterfly","potato-leafhopper","seven-spotted-lady-beetle","corn-flea-beetle",
  "differential-grasshopper","green-cloverworm","green-stink-bug","spongy-moth",
  "spotted-lantern-fly","striped-cucumber-beetle",
] as const;

// Emoji stand-ins per species (placeholder art)
const EMOJI: Record<string, string> = {
  "alfalfa-weevil": "🪲",
  "bumble-bee": "🐝",
  "corn-leaf-aphid": "🦗",
  "honey-bee": "🐝",
  "japanese-beetle": "🪲",
  "monarch-butterfly": "🦋",
  "potato-leafhopper": "🦗",
  "seven-spotted-lady-beetle": "🐞",
  "corn-flea-beetle": "🪲",
  "differential-grasshopper": "🦗",
  "green-cloverworm": "🐛",
  "green-stink-bug": "🪳",
  "spongy-moth": "🦋",
  "spotted-lantern-fly": "🦋",
  "striped-cucumber-beetle": "🪲",
};

const K5 = ALL_INSECTS.filter((i) => (K5_IDS as readonly string[]).includes(i.id));
const byId = (id: string): Insect => K5.find((i) => i.id === id)!;

const isHelper = (i: Insect) => i.role === "Beneficial" || i.role === "Pollinator" || i.role === "Pollinator/Pest";
const isPollinator = (i: Insect) => i.role === "Pollinator" || i.role === "Pollinator/Pest";
const isInvasive = (i: Insect) => i.role === "Invasive Pest";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const rand = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

// ------- Points context (localStorage) -------
const POINTS_KEY = "entoquest.k5.points";
function usePoints() {
  const [pts, setPts] = useState(0);
  useEffect(() => {
    const raw = localStorage.getItem(POINTS_KEY);
    if (raw) setPts(Number(raw) || 0);
  }, []);
  const add = (n: number) => {
    setPts((p) => {
      const next = Math.max(0, p + n);
      localStorage.setItem(POINTS_KEY, String(next));
      return next;
    });
  };
  const reset = () => {
    setPts(0);
    localStorage.setItem(POINTS_KEY, "0");
  };
  return { pts, add, reset };
}

// ------- Small shared UI -------
function InsectTile({ i, size = "md" }: { i: Insect; size?: "sm" | "md" | "lg" }) {
  const s = size === "lg" ? "text-6xl p-6" : size === "sm" ? "text-3xl p-2" : "text-4xl p-4";
  return (
    <div className={`grid place-items-center rounded-xl bg-gradient-to-br from-secondary/40 via-accent/30 to-primary/15 ${s}`}>
      <span aria-hidden>{EMOJI[i.id] ?? "🐜"}</span>
    </div>
  );
}

function Feedback({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className={`mt-3 flex items-center gap-2 rounded-lg border p-2 text-sm ${ok ? "border-success/40 bg-success/10 text-success" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
      {ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />} {text}
    </div>
  );
}

// ============================================================
// Game 1: Bug Name Match-Up (memory match)
// ============================================================
function BugNameMatchUp({ onAward }: { onAward: (n: number) => void }) {
  const [pairs] = useState(() => shuffle(K5).slice(0, 6));
  type Card = { id: string; kind: "name" | "pic"; key: string; matched: boolean };
  const [cards, setCards] = useState<Card[]>(() =>
    shuffle(pairs.flatMap((i) => [
      { id: i.id, kind: "name" as const, key: `${i.id}-n`, matched: false },
      { id: i.id, kind: "pic" as const, key: `${i.id}-p`, matched: false },
    ])),
  );
  const [flipped, setFlipped] = useState<string[]>([]);
  const [lock, setLock] = useState(false);

  function flip(key: string) {
    if (lock) return;
    const c = cards.find((x) => x.key === key);
    if (!c || c.matched || flipped.includes(key)) return;
    const next = [...flipped, key];
    setFlipped(next);
    if (next.length === 2) {
      setLock(true);
      const [a, b] = next.map((k) => cards.find((x) => x.key === k)!);
      if (a.id === b.id && a.kind !== b.kind) {
        setTimeout(() => {
          setCards((cs) => cs.map((x) => (x.id === a.id ? { ...x, matched: true } : x)));
          setFlipped([]);
          setLock(false);
          onAward(2);
        }, 500);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setLock(false);
        }, 800);
      }
    }
  }

  const done = cards.every((c) => c.matched);
  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">Flip two cards to match each picture with its name. +2 points per match.</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {cards.map((c) => {
          const show = c.matched || flipped.includes(c.key);
          const i = byId(c.id);
          return (
            <button
              key={c.key}
              onClick={() => flip(c.key)}
              className={`aspect-square rounded-xl border-2 p-2 text-center transition ${show ? "border-primary bg-card" : "border-border bg-muted"} ${c.matched ? "opacity-60" : ""}`}
            >
              {show ? (
                c.kind === "pic" ? (
                  <span className="text-4xl">{EMOJI[i.id]}</span>
                ) : (
                  <span className="text-xs font-semibold text-foreground">{i.commonName}</span>
                )
              ) : (
                <span className="text-2xl text-muted-foreground">?</span>
              )}
            </button>
          );
        })}
      </div>
      {done && <Feedback ok text="All matched! Great memory." />}
    </div>
  );
}

// ============================================================
// Game 2: Bug Detective (clues → guess)
// ============================================================
function BugDetective({ onAward }: { onAward: (n: number) => void }) {
  const [target, setTarget] = useState(() => rand(K5));
  const [revealed, setRevealed] = useState(1);
  const [choices] = useMemoTarget(target);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const clues = [
    `It is a ${target.order} insect.`,
    `It is in the family ${target.family}.`,
    `It feeds on: ${target.hosts}.`,
    `Role on the farm: ${isHelper(target) ? "helper" : isInvasive(target) ? "invasive pest" : "pest"}.`,
    `Metamorphosis: ${target.metamorphosis.toLowerCase()}.`,
  ];

  function guess(pick: Insect) {
    const ok = pick.id === target.id;
    setMsg({ ok, text: ok ? `Correct! It's the ${target.commonName}.` : `Not quite — it was ${target.commonName}.` });
    if (ok) onAward(Math.max(1, 6 - revealed));
    setTimeout(next, 1200);
  }
  function next() {
    setTarget(rand(K5));
    setRevealed(1);
    setMsg(null);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">Read the clues, then pick the bug. Fewer clues = more points!</p>
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <ul className="space-y-1 text-sm">
          {clues.slice(0, revealed).map((c, idx) => (
            <li key={idx}>🔎 {c}</li>
          ))}
        </ul>
        {revealed < clues.length && !msg && (
          <button onClick={() => setRevealed((r) => r + 1)} className="mt-3 rounded-md border border-border bg-card px-3 py-1.5 text-xs hover:bg-muted">
            Reveal another clue
          </button>
        )}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {choices.map((c) => (
          <button key={c.id} onClick={() => !msg && guess(c)} className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card p-3 text-xs hover:bg-muted">
            <span className="text-3xl">{EMOJI[c.id]}</span>
            <span className="font-medium">{c.commonName}</span>
          </button>
        ))}
      </div>
      {msg && <Feedback ok={msg.ok} text={msg.text} />}
    </div>
  );
}
function useMemoTarget(target: Insect) {
  return [useMemo(() => shuffle([target, ...shuffle(K5.filter((i) => i.id !== target.id)).slice(0, 3)]), [target])];
}

// ============================================================
// Game 3: Build-a-Bug (pick body parts)
// ============================================================
const PART_CATALOG = {
  mouthparts: [
    { id: "chew", label: "Chewing jaws", forRoles: ["Pest", "Invasive Pest"] as string[], forOrders: ["Coleoptera", "Orthoptera", "Lepidoptera"] },
    { id: "sip", label: "Coiled straw", forRoles: [], forOrders: ["Lepidoptera"] },
    { id: "suck", label: "Piercing beak", forRoles: [], forOrders: ["Hemiptera"] },
    { id: "lap", label: "Lapping tongue", forRoles: [], forOrders: ["Hymenoptera"] },
  ],
  wings: [
    { id: "hard", label: "Hard shield wings", forOrders: ["Coleoptera"] },
    { id: "scaly", label: "Scaly wings", forOrders: ["Lepidoptera"] },
    { id: "clear", label: "Clear wings", forOrders: ["Hymenoptera", "Hemiptera"] },
    { id: "leathery", label: "Leathery wings", forOrders: ["Orthoptera"] },
  ],
  antennae: [
    { id: "thread", label: "Threadlike", forOrders: ["Orthoptera", "Coleoptera"] },
    { id: "feather", label: "Feathery", forOrders: ["Lepidoptera"] },
    { id: "elbow", label: "Elbowed", forOrders: ["Hymenoptera"] },
    { id: "short", label: "Very short", forOrders: ["Hemiptera"] },
  ],
};

function correctPart(order: string, kind: keyof typeof PART_CATALOG) {
  return PART_CATALOG[kind].find((p) => p.forOrders.includes(order))?.id;
}

function BuildABug({ onAward }: { onAward: (n: number) => void }) {
  const [target, setTarget] = useState(() => rand(K5));
  const [picks, setPicks] = useState<Partial<Record<keyof typeof PART_CATALOG, string>>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function check() {
    let score = 0;
    (Object.keys(PART_CATALOG) as (keyof typeof PART_CATALOG)[]).forEach((k) => {
      if (picks[k] === correctPart(target.order, k)) score++;
    });
    const ok = score >= 2;
    setMsg({ ok, text: `You matched ${score} of 3 parts. ${target.commonName} is a ${target.order}.` });
    if (score > 0) onAward(score);
    setTimeout(() => {
      setTarget(rand(K5));
      setPicks({});
      setMsg(null);
    }, 1600);
  }

  const ready = Object.keys(picks).length === 3;
  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">Build the <b>{target.commonName}</b>. Pick the right mouthparts, wings, and antennae. +1 per correct part.</p>
      <InsectTile i={target} size="lg" />
      <div className="mt-3 space-y-3">
        {(Object.keys(PART_CATALOG) as (keyof typeof PART_CATALOG)[]).map((k) => (
          <div key={k}>
            <div className="mb-1 text-xs font-semibold uppercase text-muted-foreground">{k}</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PART_CATALOG[k].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPicks((x) => ({ ...x, [k]: p.id }))}
                  className={`rounded-lg border px-3 py-2 text-xs ${picks[k] === p.id ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-muted"}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        disabled={!ready || !!msg}
        onClick={check}
        className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        Build it!
      </button>
      {msg && <Feedback ok={msg.ok} text={msg.text} />}
    </div>
  );
}

// ============================================================
// Game 4: Side-by-Side Showdown (Venn)
// ============================================================
function Showdown({ onAward }: { onAward: (n: number) => void }) {
  const [pair, setPair] = useState(() => {
    const helper = rand(K5.filter(isHelper));
    const pest = rand(K5.filter((i) => !isHelper(i)));
    return [helper, pest] as const;
  });
  const [a, b] = pair;
  const traits = [
    { id: "eats-plants", label: "Eats plants", side: (i: Insect) => !isHelper(i) },
    { id: "eats-bugs", label: "Eats other bugs", side: (i: Insect) => i.hosts.toLowerCase().includes("aphid") || i.hosts.toLowerCase().includes("insect") },
    { id: "has-wings", label: "Has wings", side: () => true },
    { id: "visits-flowers", label: "Visits flowers", side: (i: Insect) => isPollinator(i) },
    { id: "damages-crops", label: "Damages crops", side: (i: Insect) => !isHelper(i) },
    { id: "six-legs", label: "Has 6 legs", side: () => true },
  ];
  const [placed, setPlaced] = useState<Record<string, "a" | "both" | "b" | null>>({});
  const [done, setDone] = useState(false);

  function correctSide(t: (typeof traits)[number]): "a" | "both" | "b" {
    const inA = t.side(a);
    const inB = t.side(b);
    return inA && inB ? "both" : inA ? "a" : inB ? "b" : "both"; // fallback both
  }

  function drop(traitId: string, zone: "a" | "both" | "b") {
    setPlaced((p) => ({ ...p, [traitId]: zone }));
  }
  function finish() {
    let score = 0;
    traits.forEach((t) => {
      if (placed[t.id] === correctSide(t)) score++;
    });
    onAward(score);
    setDone(true);
    setTimeout(() => {
      const helper = rand(K5.filter(isHelper));
      const pest = rand(K5.filter((i) => !isHelper(i)));
      setPair([helper, pest] as const);
      setPlaced({});
      setDone(false);
    }, 1800);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">Sort each trait into <b>{a.commonName}</b>, <b>Both</b>, or <b>{b.commonName}</b>. +1 per correct.</p>
      <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
        {(["a", "both", "b"] as const).map((z) => (
          <div key={z} className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-3 min-h-[120px]">
            <div className="mb-2 text-foreground">
              {z === "a" ? a.commonName : z === "b" ? b.commonName : "Both"}
            </div>
            <div className="space-y-1">
              {traits.filter((t) => placed[t.id] === z).map((t) => (
                <div key={t.id} className="rounded bg-card px-2 py-1">{t.label}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {traits.filter((t) => !placed[t.id]).map((t) => (
          <div key={t.id} className="flex items-center gap-2 rounded-lg border border-border bg-card p-2 text-sm">
            <span className="flex-1">{t.label}</span>
            <button onClick={() => drop(t.id, "a")} className="rounded bg-muted px-2 py-1 text-xs">← {a.commonName}</button>
            <button onClick={() => drop(t.id, "both")} className="rounded bg-muted px-2 py-1 text-xs">Both</button>
            <button onClick={() => drop(t.id, "b")} className="rounded bg-muted px-2 py-1 text-xs">{b.commonName} →</button>
          </div>
        ))}
      </div>
      {Object.keys(placed).length === traits.length && !done && (
        <button onClick={finish} className="mt-3 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Score my sort</button>
      )}
      {done && <Feedback ok text="Nice sorting!" />}
    </div>
  );
}

// ============================================================
// Game 5: Pollinator Pit Stop (60s click flowers)
// ============================================================
function PollinatorPitStop({ onAward }: { onAward: (n: number) => void }) {
  const [time, setTime] = useState(60);
  const [collected, setCollected] = useState(0);
  const [running, setRunning] = useState(false);
  const [flowers, setFlowers] = useState<{ id: number; x: number; y: number }[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTime((s) => (s > 0 ? s - 1 : 0)), 1000);
    const f = setInterval(() => {
      setFlowers((fs) => [...fs.slice(-5), { id: ++idRef.current, x: Math.random() * 85, y: Math.random() * 70 }]);
    }, 700);
    return () => {
      clearInterval(t);
      clearInterval(f);
    };
  }, [running]);

  useEffect(() => {
    if (running && time === 0) {
      setRunning(false);
      onAward(collected);
    }
  }, [time, running, collected, onAward]);

  function pick(id: number) {
    setFlowers((fs) => fs.filter((f) => f.id !== id));
    setCollected((c) => c + 1);
  }
  function start() {
    setTime(60);
    setCollected(0);
    setFlowers([]);
    setRunning(true);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">Fly bee-style! Click every flower you can in 60 seconds. Each pollen = 1 point.</p>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> {time}s</span>
        <span>Pollen collected: <b>{collected}</b></span>
      </div>
      <div className="relative h-72 overflow-hidden rounded-xl bg-gradient-to-b from-sky-100 to-green-100">
        {flowers.map((f) => (
          <button
            key={f.id}
            onClick={() => pick(f.id)}
            style={{ left: `${f.x}%`, top: `${f.y}%` }}
            className="absolute text-3xl transition-transform hover:scale-125"
          >
            🌼
          </button>
        ))}
        {!running && (
          <div className="absolute inset-0 grid place-items-center bg-background/80">
            <button onClick={start} className="rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground">
              {time === 0 ? "Play again" : "Start buzzing!"}
            </button>
          </div>
        )}
      </div>
      {!running && time === 0 && <Feedback ok text={`You collected ${collected} pollen and earned ${collected} points!`} />}
    </div>
  );
}

// ============================================================
// Game 6: Predator Pounce (click aphids, avoid bees) — 30s
// ============================================================
function PredatorPounce({ onAward }: { onAward: (n: number) => void }) {
  const [time, setTime] = useState(30);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  type Sp = { id: number; kind: "pest" | "helper"; x: number; y: number };
  const [sprites, setSprites] = useState<Sp[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTime((s) => (s > 0 ? s - 1 : 0)), 1000);
    const spawn = setInterval(() => {
      setSprites((s) => [
        ...s.slice(-7),
        { id: ++idRef.current, kind: Math.random() < 0.75 ? "pest" : "helper", x: Math.random() * 85, y: Math.random() * 75 },
      ]);
    }, 600);
    return () => {
      clearInterval(t);
      clearInterval(spawn);
    };
  }, [running]);

  useEffect(() => {
    if (running && time === 0) {
      setRunning(false);
      onAward(score);
    }
  }, [time, running, score, onAward]);

  function tap(s: Sp) {
    setSprites((all) => all.filter((x) => x.id !== s.id));
    setScore((v) => v + (s.kind === "pest" ? 1 : -2));
  }

  function start() {
    setTime(30);
    setScore(0);
    setSprites([]);
    setRunning(true);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">You're a lady beetle! Pounce on 🦗 aphids (+1). Don't hit 🐝 pollinators (-2). 30 seconds.</p>
      <div className="mb-2 flex justify-between text-sm">
        <span><Clock className="inline h-4 w-4" /> {time}s</span>
        <span>Score: <b>{score}</b></span>
      </div>
      <div className="relative h-72 overflow-hidden rounded-xl bg-green-50">
        {sprites.map((s) => (
          <button key={s.id} onClick={() => tap(s)} style={{ left: `${s.x}%`, top: `${s.y}%` }} className="absolute text-3xl">
            {s.kind === "pest" ? "🦗" : "🐝"}
          </button>
        ))}
        {!running && (
          <div className="absolute inset-0 grid place-items-center bg-background/80">
            <button onClick={start} className="rounded-md bg-primary px-5 py-3 text-sm text-primary-foreground">
              {time === 0 ? "Pounce again" : "Start hunt"}
            </button>
          </div>
        )}
      </div>
      {!running && time === 0 && <Feedback ok={score >= 0} text={`Final score: ${score}`} />}
    </div>
  );
}

// ============================================================
// Game 7: Decomposer Cleanup Crew (sort compostable) — 30s
// ============================================================
function DecomposerCleanup({ onAward }: { onAward: (n: number) => void }) {
  const ITEMS = [
    { id: "leaf", emoji: "🍂", compost: true },
    { id: "core", emoji: "🍎", compost: true },
    { id: "husk", emoji: "🌽", compost: true },
    { id: "stalk", emoji: "🌾", compost: true },
    { id: "can", emoji: "🥫", compost: false },
    { id: "bag", emoji: "🛍️", compost: false },
    { id: "bottle", emoji: "🧴", compost: false },
  ];
  const [queue, setQueue] = useState(() => shuffle(Array.from({ length: 20 }, (_, i) => ({ ...rand(ITEMS), key: i }))));
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(30);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTime((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (running && (time === 0 || queue.length === 0)) {
      setRunning(false);
      onAward(score);
    }
  }, [time, queue, running, score, onAward]);

  function sort(compost: boolean) {
    const [head, ...rest] = queue;
    if (!head) return;
    setScore((s) => s + (head.compost === compost ? 1 : -1));
    setQueue(rest);
  }
  function start() {
    setQueue(shuffle(Array.from({ length: 20 }, (_, i) => ({ ...rand(ITEMS), key: i }))));
    setScore(0);
    setTime(30);
    setRunning(true);
  }

  const head = queue[0];
  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">Grab each piece of farm junk with your tweezer-mouth. Compost = leaves & crops. +1 correct, -1 wrong.</p>
      <div className="mb-2 flex justify-between text-sm"><span><Clock className="inline h-4 w-4" /> {time}s</span><span>Score: <b>{score}</b></span></div>
      <div className="grid grid-cols-3 gap-3">
        <button disabled={!running || !head} onClick={() => sort(true)} className="rounded-xl border-2 border-dashed border-success/60 bg-success/10 p-6 text-sm font-semibold">🟢 Compost bin</button>
        <div className="grid place-items-center rounded-xl bg-muted p-6 text-5xl">{running && head ? head.emoji : "—"}</div>
        <button disabled={!running || !head} onClick={() => sort(false)} className="rounded-xl border-2 border-dashed border-destructive/60 bg-destructive/10 p-6 text-sm font-semibold">🔴 Trash bin</button>
      </div>
      {!running && (
        <button onClick={start} className="mt-3 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
          {time === 0 || queue.length === 0 ? "Play again" : "Start"}
        </button>
      )}
      {!running && time === 0 && <Feedback ok={score > 0} text={`Compost score: ${score}`} />}
    </div>
  );
}

// ============================================================
// Game 8: Pest or Not a Pest (thumbs vote)
// ============================================================
function PestOrNot({ onAward }: { onAward: (n: number) => void }) {
  const [i, setI] = useState(() => rand(K5));
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  function vote(pest: boolean) {
    const actualPest = !isHelper(i);
    const ok = pest === actualPest;
    setMsg({
      ok,
      text: ok
        ? `Yes! The ${i.commonName} is ${actualPest ? "a crop pest." : "a helper — not a pest."}`
        : `Trick! The ${i.commonName} is actually ${actualPest ? "a pest." : "a helper. Looks can fool you!"}`,
    });
    if (ok) onAward(1);
    setTimeout(() => {
      setI(rand(K5));
      setMsg(null);
    }, 1400);
  }
  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">Thumbs up = pest. Thumbs down = not a pest. Remember: bees look scary but help!</p>
      <div className="grid place-items-center rounded-xl bg-muted p-8">
        <div className="text-7xl">{EMOJI[i.id]}</div>
        <div className="mt-2 text-lg font-semibold">{i.commonName}</div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <button onClick={() => vote(true)} className="rounded-lg border border-border bg-card py-4 text-lg hover:bg-muted">👍 Pest</button>
        <button onClick={() => vote(false)} className="rounded-lg border border-border bg-card py-4 text-lg hover:bg-muted">👎 Not a pest</button>
      </div>
      {msg && <Feedback ok={msg.ok} text={msg.text} />}
    </div>
  );
}

// ============================================================
// Game 9: Germ Bug Tag (protect villagers before mosquito reaches)
// ============================================================
function GermBugTag({ onAward }: { onAward: (n: number) => void }) {
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(20);
  const [protectedIds, setProtectedIds] = useState<Set<number>>(new Set());
  const [infected, setInfected] = useState<Set<number>>(new Set());
  const [mosquitoTarget, setMosquitoTarget] = useState<number | null>(null);
  const villagers = Array.from({ length: 8 }, (_, i) => i);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTime((s) => (s > 0 ? s - 1 : 0)), 1000);
    const bite = setInterval(() => {
      const remaining = villagers.filter((v) => !protectedIds.has(v) && !infected.has(v));
      if (remaining.length === 0) return;
      const pick = rand(remaining);
      setMosquitoTarget(pick);
      setTimeout(() => {
        setInfected((s) => {
          if (protectedIds.has(pick)) return s;
          const n = new Set(s);
          n.add(pick);
          return n;
        });
        setMosquitoTarget(null);
      }, 900);
    }, 1600);
    return () => {
      clearInterval(t);
      clearInterval(bite);
    };
  }, [running, protectedIds, infected, villagers]);

  useEffect(() => {
    if (running && time === 0) {
      setRunning(false);
      onAward(protectedIds.size);
    }
  }, [time, running, protectedIds.size, onAward]);

  function shield(v: number) {
    if (infected.has(v)) return;
    setProtectedIds((s) => new Set(s).add(v));
  }
  function start() {
    setProtectedIds(new Set());
    setInfected(new Set());
    setTime(20);
    setRunning(true);
  }
  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">A mosquito 🦟 spreads germs fast! Tap villagers to give them nets 🛡️ before the mosquito reaches them. +1 per protected.</p>
      <div className="mb-2 flex justify-between text-sm"><span><Clock className="inline h-4 w-4" /> {time}s</span><span>Protected: <b>{protectedIds.size}</b> · Infected: <b>{infected.size}</b></span></div>
      <div className="grid grid-cols-4 gap-3">
        {villagers.map((v) => (
          <button key={v} disabled={!running} onClick={() => shield(v)} className={`aspect-square rounded-xl text-4xl ${infected.has(v) ? "bg-destructive/20" : protectedIds.has(v) ? "bg-success/20" : "bg-muted"} ${mosquitoTarget === v ? "ring-4 ring-destructive animate-pulse" : ""}`}>
            {infected.has(v) ? "🤒" : protectedIds.has(v) ? "🛡️" : "🧑"}
          </button>
        ))}
      </div>
      {!running && (
        <button onClick={start} className="mt-3 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
          {time === 0 ? "Play again" : "Start"}
        </button>
      )}
    </div>
  );
}

// ============================================================
// Game 10: Beneficial Bug Bodyguard (spray vs protect)
// ============================================================
function Bodyguard({ onAward }: { onAward: (n: number) => void }) {
  const [i, setI] = useState(() => rand(K5));
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  function act(spray: boolean) {
    const helper = isHelper(i);
    const ok = spray ? !helper : helper;
    setMsg({
      ok,
      text: ok
        ? helper ? `Saved a ${i.commonName}! +2 crop points.` : `Good call — pest sprayed. +1 crop point.`
        : helper ? `Ouch! You sprayed a ${i.commonName}. -2 crop points.` : `That was a pest you protected. -1 crop point.`,
    });
    onAward(ok ? (helper ? 2 : 1) : helper ? -2 : -1);
    setTimeout(() => { setI(rand(K5)); setMsg(null); }, 1500);
  }
  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">Farmer's choice: spray or protect? Protect helpers, control pests.</p>
      <div className="grid place-items-center rounded-xl bg-gradient-to-br from-secondary/40 to-primary/10 p-8">
        <div className="text-7xl">{EMOJI[i.id]}</div>
        <div className="mt-2 font-semibold">{i.commonName}</div>
        <div className="text-xs italic text-muted-foreground">Found on: {i.hosts}</div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <button onClick={() => act(false)} className="rounded-lg border border-success/40 bg-success/10 py-4 text-lg text-success hover:bg-success/20">🛡️ Protect</button>
        <button onClick={() => act(true)} className="rounded-lg border border-destructive/40 bg-destructive/10 py-4 text-lg text-destructive hover:bg-destructive/20">💨 Spray</button>
      </div>
      {msg && <Feedback ok={msg.ok} text={msg.text} />}
    </div>
  );
}

// ============================================================
// Game 11: Life Cycle Builder
// ============================================================
function LifeCycle({ onAward }: { onAward: (n: number) => void }) {
  const [i, setI] = useState(() => rand(K5));
  const complete = i.metamorphosis === "Complete";
  const stages = complete ? ["Egg", "Larva", "Pupa", "Adult"] : ["Egg", "Nymph", "Adult"];
  const [shuffled, setShuffled] = useState(() => shuffle(stages));
  const [placed, setPlaced] = useState<string[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    setShuffled(shuffle(complete ? ["Egg", "Larva", "Pupa", "Adult"] : ["Egg", "Nymph", "Adult"]));
    setPlaced([]);
    setMsg(null);
  }, [i.id, complete]);

  function place(s: string) {
    const next = [...placed, s];
    setPlaced(next);
    setShuffled((sh) => sh.filter((x) => x !== s));
    if (next.length === stages.length) {
      const ok = next.every((v, idx) => v === stages[idx]);
      setMsg({ ok, text: ok ? `Perfect life cycle for the ${i.commonName}!` : `Order should be: ${stages.join(" → ")}` });
      if (ok) onAward(3);
      setTimeout(() => setI(rand(K5)), 1600);
    }
  }

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">Put the life stages of the <b>{i.commonName}</b> in order (egg → adult). +3 points.</p>
      <div className="mb-3 flex flex-wrap gap-2">
        {placed.map((s, idx) => (
          <div key={idx} className="rounded-lg bg-primary/15 px-3 py-2 text-sm font-medium">{idx + 1}. {s}</div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {shuffled.map((s) => (
          <button key={s} onClick={() => place(s)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm hover:bg-muted">{s}</button>
        ))}
      </div>
      {msg && <Feedback ok={msg.ok} text={msg.text} />}
    </div>
  );
}

// ============================================================
// Game 12: Migration Map (native vs invasive)
// ============================================================
const ORIGINS: Record<string, string> = {
  "spotted-lantern-fly": "Asia",
  "spongy-moth": "Europe/Asia",
  "japanese-beetle": "Japan",
  "monarch-butterfly": "North America",
  "bumble-bee": "North America",
  "honey-bee": "Europe",
  "seven-spotted-lady-beetle": "Europe",
  "corn-leaf-aphid": "North America",
  "alfalfa-weevil": "Europe",
  "corn-flea-beetle": "North America",
  "differential-grasshopper": "North America",
  "green-cloverworm": "North America",
  "green-stink-bug": "North America",
  "potato-leafhopper": "North America",
  "striped-cucumber-beetle": "North America",
};
function MigrationMap({ onAward }: { onAward: (n: number) => void }) {
  const [i, setI] = useState(() => rand(K5));
  const options = ["North America", "Europe", "Japan", "Asia", "Europe/Asia"];
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  function pick(o: string) {
    const ok = o === ORIGINS[i.id];
    setMsg({ ok, text: ok ? `Right — the ${i.commonName} is from ${o}.` : `${i.commonName} actually came from ${ORIGINS[i.id]}.` });
    if (ok) onAward(2);
    setTimeout(() => { setI(rand(K5)); setMsg(null); }, 1500);
  }
  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">Where did this bug originally come from? Drag it home. +2 per correct.</p>
      <div className="grid place-items-center rounded-xl bg-muted p-6">
        <div className="text-6xl">{EMOJI[i.id]}</div>
        <div className="mt-1 font-semibold">{i.commonName}</div>
        {isInvasive(i) && <div className="text-xs text-destructive">🚢 Invasive on US farms</div>}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map((o) => (
          <button key={o} onClick={() => pick(o)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-muted">🌍 {o}</button>
        ))}
      </div>
      {msg && <Feedback ok={msg.ok} text={msg.text} />}
    </div>
  );
}

// ============================================================
// Game 13: Biodiversity Builder
// ============================================================
function BiodiversityBuilder({ onAward }: { onAward: (n: number) => void }) {
  const [added, setAdded] = useState<string[]>([]);
  const uniqueRoles = new Set(added.map((id) => byId(id).role));
  const health = Math.min(100, uniqueRoles.size * 25 + Math.min(added.length, 8) * 3);
  const [done, setDone] = useState(false);
  function add(id: string) {
    if (done) return;
    setAdded((a) => [...a, id]);
  }
  function finish() {
    onAward(Math.floor(health / 10));
    setDone(true);
  }
  function reset() {
    setAdded([]);
    setDone(false);
  }
  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">Add bugs to your farm. More variety = higher farm health. Points = health ÷ 10.</p>
      <div className="mb-3 rounded-full bg-muted">
        <div className="h-3 rounded-full bg-gradient-to-r from-destructive via-secondary to-success transition-all" style={{ width: `${health}%` }} />
      </div>
      <div className="mb-3 text-sm">Farm health: <b>{health}%</b> · Species: {added.length} · Roles: {uniqueRoles.size}</div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {K5.map((i) => (
          <button key={i.id} onClick={() => add(i.id)} className="rounded-lg border border-border bg-card p-2 text-xs hover:bg-muted">
            <div className="text-2xl">{EMOJI[i.id]}</div>
            <div>{i.commonName}</div>
          </button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        {!done ? (
          <button onClick={finish} disabled={added.length === 0} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">Finish farm</button>
        ) : (
          <button onClick={reset} className="rounded-md border border-border bg-card px-4 py-2 text-sm"><RefreshCcw className="mr-1 inline h-3 w-3" /> New farm</button>
        )}
      </div>
      {done && <Feedback ok={health >= 50} text={`Your farm scored ${health}% health!`} />}
    </div>
  );
}

// ============================================================
// Game 14: Food Chain Drag-Link
// ============================================================
function FoodChain({ onAward }: { onAward: (n: number) => void }) {
  const CHAINS = [
    ["Corn", "Corn leaf aphid", "Lady beetle", "Bird"],
    ["Alfalfa", "Alfalfa weevil", "Braconid wasp", "Bird"],
    ["Milkweed", "Monarch caterpillar", "Bird"],
    ["Soybean", "Green stink bug", "Assassin bug", "Bird"],
  ];
  const [chain, setChain] = useState(() => rand(CHAINS));
  const [scramble, setScramble] = useState(() => shuffle(chain));
  const [placed, setPlaced] = useState<string[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    setScramble(shuffle(chain));
    setPlaced([]);
    setMsg(null);
  }, [chain]);

  function place(x: string) {
    const next = [...placed, x];
    setPlaced(next);
    setScramble((s) => s.filter((y) => y !== x));
    if (next.length === chain.length) {
      const ok = next.every((v, idx) => v === chain[idx]);
      setMsg({ ok, text: ok ? "Perfect food chain!" : `Order: ${chain.join(" → ")}` });
      if (ok) onAward(3);
      setTimeout(() => setChain(rand(CHAINS)), 1600);
    }
  }

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">Link the food chain from plant → top predator. +3 points.</p>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        {placed.map((p, idx) => (
          <span key={idx} className="rounded-lg bg-primary/15 px-3 py-2 font-medium">{p}{idx < chain.length - 1 && " →"}</span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {scramble.map((s) => (
          <button key={s} onClick={() => place(s)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-muted">{s}</button>
        ))}
      </div>
      {msg && <Feedback ok={msg.ok} text={msg.text} />}
    </div>
  );
}

// ============================================================
// Game 15: Web It Up (choose who eats whom)
// ============================================================
function WebItUp({ onAward }: { onAward: (n: number) => void }) {
  const NODES = ["Corn", "Aphid", "Lady beetle", "Grasshopper", "Bird", "Decomposer"];
  const EDGES: [string, string][] = [
    ["Corn", "Aphid"], ["Corn", "Grasshopper"], ["Aphid", "Lady beetle"],
    ["Grasshopper", "Bird"], ["Lady beetle", "Bird"], ["Corn", "Decomposer"],
  ];
  const [from, setFrom] = useState<string | null>(null);
  const [made, setMade] = useState<[string, string][]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  function tap(n: string) {
    if (!from) {
      setFrom(n);
      return;
    }
    if (from === n) {
      setFrom(null);
      return;
    }
    const key: [string, string] = [from, n];
    const isValid = EDGES.some(([a, b]) => a === key[0] && b === key[1]);
    const already = made.some(([a, b]) => a === key[0] && b === key[1]);
    if (isValid && !already) {
      setMade((m) => [...m, key]);
      onAward(1);
      setMsg(`Good link: ${from} → ${n}`);
    } else if (!isValid) {
      setMsg(`${from} doesn't feed ${n}.`);
    }
    setFrom(null);
    setTimeout(() => setMsg(null), 1200);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">Tap "who eats what". First tap = food, second tap = eater. +1 per correct link ({made.length}/{EDGES.length}).</p>
      <div className="grid grid-cols-3 gap-2">
        {NODES.map((n) => (
          <button key={n} onClick={() => tap(n)} className={`rounded-lg border-2 px-3 py-3 text-sm ${from === n ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-muted"}`}>
            {n}
          </button>
        ))}
      </div>
      {msg && <div className="mt-3 rounded bg-muted px-3 py-2 text-xs">{msg}</div>}
      {made.length === EDGES.length && <Feedback ok text="You built the whole food web!" />}
    </div>
  );
}

// ============================================================
// Game 16: Movement Lab (timed style-matching)
// ============================================================
function MovementLab({ onAward }: { onAward: (n: number) => void }) {
  const [i, setI] = useState(() => rand(K5));
  const style =
    i.order === "Orthoptera" ? "Hop" :
    i.order === "Lepidoptera" ? "Flutter" :
    i.order === "Hemiptera" ? (i.id.includes("aphid") ? "Drift on wind" : "Fly") :
    i.order === "Hymenoptera" ? "Buzz" : "Crawl";
  const options = ["Hop", "Flutter", "Drift on wind", "Buzz", "Crawl", "Fly"];
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  function pick(o: string) {
    const ok = o === style;
    setMsg({ ok, text: ok ? `Yes! A ${i.commonName} moves by: ${style}.` : `A ${i.commonName} really moves by: ${style}.` });
    if (ok) onAward(2);
    setTimeout(() => { setI(rand(K5)); setMsg(null); }, 1400);
  }
  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">How does the <b>{i.commonName}</b> get around? +2 correct.</p>
      <div className="grid place-items-center rounded-xl bg-muted p-6 text-6xl">{EMOJI[i.id]}</div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map((o) => (
          <button key={o} onClick={() => pick(o)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-muted">{o}</button>
        ))}
      </div>
      {msg && <Feedback ok={msg.ok} text={msg.text} />}
    </div>
  );
}

// ============================================================
// Game 17: Bodyguard Decisions (batch protect/spray)
// ============================================================
function BodyguardDecisions({ onAward }: { onAward: (n: number) => void }) {
  const [scene, setScene] = useState(() => shuffle(K5).slice(0, 5));
  const [choices, setChoices] = useState<Record<string, "protect" | "spray">>({});
  const [done, setDone] = useState(false);
  function set(id: string, v: "protect" | "spray") {
    setChoices((c) => ({ ...c, [id]: v }));
  }
  function score() {
    let s = 0;
    scene.forEach((i) => {
      const helper = isHelper(i);
      const c = choices[i.id];
      if (!c) return;
      if (helper && c === "protect") s += 2;
      else if (!helper && c === "spray") s += 1;
      else if (helper && c === "spray") s -= 2;
      else if (!helper && c === "protect") s -= 1;
    });
    onAward(s);
    setDone(true);
    setTimeout(() => {
      setScene(shuffle(K5).slice(0, 5));
      setChoices({});
      setDone(false);
    }, 1800);
  }
  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">This farm has 5 insects. For each: protect or spray? Correct helpers +2, correct pests +1, mistakes lose points.</p>
      <div className="space-y-2">
        {scene.map((i) => (
          <div key={i.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-2">
            <span className="text-3xl">{EMOJI[i.id]}</span>
            <span className="flex-1 text-sm font-medium">{i.commonName}</span>
            <button onClick={() => set(i.id, "protect")} className={`rounded px-3 py-1 text-xs ${choices[i.id] === "protect" ? "bg-success/20 text-success" : "bg-muted"}`}>Protect</button>
            <button onClick={() => set(i.id, "spray")} className={`rounded px-3 py-1 text-xs ${choices[i.id] === "spray" ? "bg-destructive/20 text-destructive" : "bg-muted"}`}>Spray</button>
          </div>
        ))}
      </div>
      {Object.keys(choices).length === scene.length && !done && (
        <button onClick={score} className="mt-3 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Score my choices</button>
      )}
      {done && <Feedback ok text="Choices scored!" />}
    </div>
  );
}

// ============================================================
// Game 18: IPM Strategy Board (tool for pest)
// ============================================================
function IPMBoard({ onAward }: { onAward: (n: number) => void }) {
  const TOOLS = [
    { id: "row-cover", label: "🌾 Row covers", good: (i: Insect) => !isHelper(i) && (i.order === "Coleoptera" || i.order === "Orthoptera") },
    { id: "release", label: "🐞 Release lady beetles", good: (i: Insect) => i.hosts.toLowerCase().includes("aphid") || i.order === "Hemiptera" },
    { id: "hand", label: "🖐️ Hand-removal", good: (i: Insect) => isInvasive(i) || i.order === "Lepidoptera" },
    { id: "spray", label: "🎯 Targeted spray", good: (i: Insect) => !isHelper(i) },
  ];
  const [pest, setPest] = useState(() => rand(K5.filter((x) => !isHelper(x))));
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  function apply(t: (typeof TOOLS)[number]) {
    const ok = t.good(pest);
    setMsg({ ok, text: ok ? `Smart! ${t.label} works well on ${pest.commonName}.` : `${t.label} isn't the best tool for ${pest.commonName}.` });
    if (ok) onAward(2);
    setTimeout(() => { setPest(rand(K5.filter((x) => !isHelper(x)))); setMsg(null); }, 1500);
  }
  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">Pick the best IPM tool for this pest hotspot without harming helpers. +2 correct.</p>
      <div className="grid place-items-center rounded-xl bg-muted p-6">
        <div className="text-6xl">{EMOJI[pest.id]}</div>
        <div className="mt-1 font-semibold">{pest.commonName}</div>
        <div className="text-xs italic text-muted-foreground">Attacking: {pest.hosts}</div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {TOOLS.map((t) => (
          <button key={t.id} onClick={() => apply(t)} className="rounded-lg border border-border bg-card px-3 py-3 text-left text-sm hover:bg-muted">{t.label}</button>
        ))}
      </div>
      {msg && <Feedback ok={msg.ok} text={msg.text} />}
    </div>
  );
}

// ============================================================
// Hub
// ============================================================
export interface K5Game {
  id: string;
  name: string;
  blurb: string;
  render: (onAward: (n: number) => void) => ReactNode;
}

export const K5_GAMES: K5Game[] = [
  { id: "match", name: "Bug Name Match-Up", blurb: "Match names to pictures.", render: (a) => <BugNameMatchUp onAward={a} /> },
  { id: "detective", name: "Bug Detective", blurb: "Guess the bug from clues.", render: (a) => <BugDetective onAward={a} /> },
  { id: "build", name: "Build-a-Bug", blurb: "Assemble the right body parts.", render: (a) => <BuildABug onAward={a} /> },
  { id: "showdown", name: "Side-by-Side Showdown", blurb: "Sort traits into a Venn diagram.", render: (a) => <Showdown onAward={a} /> },
  { id: "pollinator", name: "Pollinator Pit Stop", blurb: "60s pollen collection sprint.", render: (a) => <PollinatorPitStop onAward={a} /> },
  { id: "predator", name: "Predator Pounce", blurb: "Pounce on pests, spare helpers.", render: (a) => <PredatorPounce onAward={a} /> },
  { id: "decomposer", name: "Decomposer Cleanup Crew", blurb: "Sort compost vs trash fast.", render: (a) => <DecomposerCleanup onAward={a} /> },
  { id: "pest-or-not", name: "Pest or Not a Pest?", blurb: "Thumbs up / thumbs down.", render: (a) => <PestOrNot onAward={a} /> },
  { id: "germ-tag", name: "Germ Bug Tag", blurb: "Shield villagers from a mosquito.", render: (a) => <GermBugTag onAward={a} /> },
  { id: "bodyguard", name: "Beneficial Bug Bodyguard", blurb: "Protect helpers, control pests.", render: (a) => <Bodyguard onAward={a} /> },
  { id: "life-cycle", name: "Life Cycle Builder", blurb: "Order egg to adult.", render: (a) => <LifeCycle onAward={a} /> },
  { id: "migration", name: "Migration Map", blurb: "Where did this bug come from?", render: (a) => <MigrationMap onAward={a} /> },
  { id: "biodiversity", name: "Biodiversity Builder", blurb: "Build a healthy diverse farm.", render: (a) => <BiodiversityBuilder onAward={a} /> },
  { id: "food-chain", name: "Food Chain Drag-Link", blurb: "Chain plant → top predator.", render: (a) => <FoodChain onAward={a} /> },
  { id: "web", name: "Web It Up", blurb: "Connect the food web.", render: (a) => <WebItUp onAward={a} /> },
  { id: "movement", name: "Movement Lab", blurb: "How does each bug move?", render: (a) => <MovementLab onAward={a} /> },
  { id: "bodyguard-2", name: "Bodyguard Decisions", blurb: "Score choices across a whole farm.", render: (a) => <BodyguardDecisions onAward={a} /> },
  { id: "ipm", name: "IPM Strategy Board", blurb: "Pick the right pest-control tool.", render: (a) => <IPMBoard onAward={a} /> },
];

export function K5PracticeHub() {
  const { pts, add, reset } = usePoints();
  const [active, setActive] = useState<K5Game | null>(null);

  if (active) {
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
        <h3 className="mb-1 text-lg font-bold text-foreground">{active.name}</h3>
        <p className="mb-3 text-xs text-muted-foreground">{active.blurb}</p>
        {active.render(add)}
      </div>
    );
  }

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
      <div className="mb-3 text-xs text-muted-foreground">
        Featured bugs: {K5.map((i) => i.commonName).join(" · ")}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {K5_GAMES.map((g) => (
          <button
            key={g.id}
            onClick={() => setActive(g)}
            className="flex flex-col items-start gap-2 rounded-xl border border-border bg-card p-4 text-left transition hover:bg-muted/50 hover:shadow-md"
          >
            <span className="text-2xl">🎮</span>
            <div className="font-semibold text-foreground">{g.name}</div>
            <div className="text-xs text-muted-foreground">{g.blurb}</div>
            <div className="mt-1 text-[11px] font-medium text-primary">Play →</div>
          </button>
        ))}
      </div>
    </div>
  );
}
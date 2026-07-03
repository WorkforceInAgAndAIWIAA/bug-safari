import { useEffect, useMemo, useRef, useState, type ReactNode, type DragEvent } from "react";
import { insects as ALL_INSECTS, type Insect } from "@/data/insects";
import { Sparkles, Trophy, ArrowLeft, CheckCircle2, XCircle, Clock, RefreshCcw, Undo2 } from "lucide-react";
import insectDiagram from "@/assets/insect_diagram.png.asset.json";
import worldMap from "@/assets/world_map.png.asset.json";

const K5_IDS = [
  "alfalfa-weevil","bumble-bee","corn-leaf-aphid","honey-bee","japanese-beetle",
  "monarch-butterfly","potato-leafhopper","seven-spotted-lady-beetle","corn-flea-beetle",
  "differential-grasshopper","green-cloverworm","green-stink-bug","spongy-moth",
  "spotted-lantern-fly","striped-cucumber-beetle","black-swallowtail",
] as const;

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
  "black-swallowtail": "🦋",
};

const K5 = ALL_INSECTS.filter((i) => (K5_IDS as readonly string[]).includes(i.id));
const byId = (id: string): Insect => K5.find((i) => i.id === id)!;

const isHelper = (i: Insect) => i.role === "Beneficial" || i.role === "Pollinator" || i.role === "Pollinator/Pest";
const isPollinator = (i: Insect) => i.role === "Pollinator" || i.role === "Pollinator/Pest";
const isInvasive = (i: Insect) => i.role === "Invasive Pest";

// Facts used by several games (no scientific names for K-5)
const FLIES: Record<string, boolean> = {
  "alfalfa-weevil": true, "bumble-bee": true, "corn-leaf-aphid": true, "honey-bee": true,
  "japanese-beetle": true, "monarch-butterfly": true, "potato-leafhopper": true,
  "seven-spotted-lady-beetle": true, "corn-flea-beetle": true, "differential-grasshopper": true,
  "green-cloverworm": true, "green-stink-bug": true, "spongy-moth": true,
  "spotted-lantern-fly": true, "striped-cucumber-beetle": true, "black-swallowtail": true,
};
const EATS_BUGS = (i: Insect) =>
  i.id === "seven-spotted-lady-beetle" ||
  i.hosts.toLowerCase().includes("aphid") ||
  i.hosts.toLowerCase().includes("insect");
const BODY_HINT: Record<string, string> = {
  "bumble-bee": "Fuzzy body with black and yellow stripes",
  "honey-bee": "Slim golden body with clear wings",
  "monarch-butterfly": "Big orange wings with black lines",
  "black-swallowtail": "Black wings with yellow spots and blue trim",
  "seven-spotted-lady-beetle": "Red domed shell with seven black spots",
  "japanese-beetle": "Shiny green head with copper wing covers",
  "corn-flea-beetle": "Tiny black beetle that jumps like a flea",
  "striped-cucumber-beetle": "Yellow beetle with three black stripes",
  "alfalfa-weevil": "Small brown beetle with a long snout",
  "differential-grasshopper": "Big green hopper with strong back legs",
  "green-cloverworm": "Skinny green caterpillar that wiggles",
  "green-stink-bug": "Flat green shield-shaped body",
  "spongy-moth": "Fuzzy moth with pale wings and dark bands",
  "spotted-lantern-fly": "Gray wings with black spots and red underwings",
  "corn-leaf-aphid": "Tiny soft blue-green bug in clusters",
  "potato-leafhopper": "Bright green wedge that hops off leaves",
};

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

// ------- Shared UI -------
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
// 1. Bug Name Match-Up
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
        setTimeout(() => { setFlipped([]); setLock(false); }, 800);
      }
    }
  }
  const done = cards.every((c) => c.matched);
  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">Flip two cards to match each picture with its name. +2 per match.</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {cards.map((c) => {
          const show = c.matched || flipped.includes(c.key);
          const i = byId(c.id);
          return (
            <button key={c.key} onClick={() => flip(c.key)}
              className={`aspect-square rounded-xl border-2 p-2 text-center transition ${show ? "border-primary bg-card" : "border-border bg-muted"} ${c.matched ? "opacity-60" : ""}`}>
              {show ? (c.kind === "pic" ? <span className="text-4xl">{EMOJI[i.id]}</span> : <span className="text-xs font-semibold text-foreground">{i.commonName}</span>) : <span className="text-2xl text-muted-foreground">?</span>}
            </button>
          );
        })}
      </div>
      {done && <Feedback ok text="All matched! Great memory." />}
    </div>
  );
}

// ============================================================
// 2. Bug Detective (K-5 clues: body, role, flies, food)
// ============================================================
function BugDetective({ onAward }: { onAward: (n: number) => void }) {
  const [target, setTarget] = useState(() => rand(K5));
  const [revealed, setRevealed] = useState(1);
  const [choices, setChoices] = useState(() => shuffle([target, ...shuffle(K5.filter((i) => i.id !== target.id)).slice(0, 3)]));
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const clues = [
    `Body: ${BODY_HINT[target.id] ?? "A small insect with six legs."}`,
    `Role: This bug is ${isHelper(target) ? "a helper (good for the farm)" : "a pest (hurts crops)"}.`,
    `Moves: ${FLIES[target.id] ? "It can fly." : "It does not fly."}`,
    `Eats: ${EATS_BUGS(target) ? "Other bugs (like aphids)" : `Plants — ${target.hosts.toLowerCase()}`}.`,
  ];

  function next() {
    const t = rand(K5.filter((i) => i.id !== target.id));
    setTarget(t);
    setRevealed(1);
    setMsg(null);
    setChoices(shuffle([t, ...shuffle(K5.filter((i) => i.id !== t.id)).slice(0, 3)]));
  }
  function guess(pick: Insect) {
    const ok = pick.id === target.id;
    setMsg({ ok, text: ok ? `Correct! It's the ${target.commonName}.` : `Not quite — it was ${target.commonName}.` });
    if (ok) onAward(Math.max(1, 5 - revealed));
    setTimeout(next, 1400);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">Read the clues, then pick the bug. Fewer clues = more points!</p>
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <ul className="space-y-1 text-sm">
          {clues.slice(0, revealed).map((c, idx) => (<li key={idx}>🔎 {c}</li>))}
        </ul>
        {revealed < clues.length && !msg && (
          <button onClick={() => setRevealed((r) => r + 1)} className="mt-3 rounded-md border border-border bg-card px-3 py-1.5 text-xs hover:bg-muted">Reveal another clue</button>
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

// ============================================================
// 3. Build-a-Bug: drag body-part words onto the cartoon diagram
// ============================================================
type ZoneId = "antennae" | "compound-eyes" | "head" | "thorax" | "wings" | "abdomen" | "legs" | "mouthparts";
const ZONES: { id: ZoneId; label: string; x: number; y: number }[] = [
  // Coordinates are % of the diagram image (240..1400 x, 60..1030 y crop)
  { id: "antennae",      label: "antennae",      x: 30, y: 8 },
  { id: "compound-eyes", label: "compound eyes", x: 25, y: 45 },
  { id: "head",          label: "head",          x: 22, y: 62 },
  { id: "thorax",        label: "thorax",        x: 45, y: 55 },
  { id: "wings",         label: "wings",         x: 55, y: 30 },
  { id: "abdomen",       label: "abdomen",       x: 78, y: 55 },
  { id: "legs",          label: "6 legs",        x: 55, y: 92 },
  { id: "mouthparts",    label: "mouthparts",    x: 22, y: 82 },
];

function BuildABug({ onAward }: { onAward: (n: number) => void }) {
  const [placed, setPlaced] = useState<Record<ZoneId, boolean>>({} as Record<ZoneId, boolean>);
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<ZoneId | null>(null);

  const remaining = useMemo(() => shuffle(ZONES.filter((z) => !placed[z.id])), [placed]);
  const done = Object.keys(placed).length === ZONES.length;

  function onDrop(target: ZoneId) {
    if (!dragging) return;
    if (dragging === target) {
      setPlaced((p) => ({ ...p, [target]: true }));
      onAward(1);
    } else {
      setShakeId(dragging);
      setTimeout(() => setShakeId(null), 550);
    }
    setDragging(null);
  }

  function reset() {
    setPlaced({} as Record<ZoneId, boolean>);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">Drag each body-part word onto the right spot on the bug. Wrong drops bounce back! +1 per correct part.</p>
      <div className="relative w-full overflow-hidden rounded-xl border border-border bg-white" style={{ aspectRatio: "1160 / 970" }}>
        <img src={insectDiagram.url} alt="Cartoon insect" className="absolute inset-0 h-full w-full object-contain" draggable={false} />
        {ZONES.map((z) => {
          const filled = placed[z.id];
          return (
            <div
              key={z.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(z.id)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 border-dashed px-2 py-1 text-xs font-semibold transition ${filled ? "border-success bg-success/20 text-success" : "border-primary/60 bg-white/70 text-muted-foreground"}`}
              style={{ left: `${z.x}%`, top: `${z.y}%` }}
            >
              {filled ? z.label : "?"}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {remaining.map((z) => (
          <div
            key={z.id}
            draggable
            onDragStart={() => setDragging(z.id)}
            onDragEnd={() => setDragging(null)}
            className={`cursor-grab rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium shadow-sm active:cursor-grabbing ${shakeId === z.id ? "k5-shake" : ""}`}
          >
            {z.label}
          </div>
        ))}
      </div>
      {done && (
        <div>
          <Feedback ok text="You built the whole bug!" />
          <button onClick={reset} className="mt-3 rounded-md border border-border bg-card px-3 py-1.5 text-xs"><RefreshCcw className="mr-1 inline h-3 w-3" /> Play again</button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 4. Side-by-Side Showdown (Venn)
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
    { id: "eats-bugs", label: "Eats other bugs", side: (i: Insect) => EATS_BUGS(i) },
    { id: "has-wings", label: "Has wings", side: () => true },
    { id: "visits-flowers", label: "Visits flowers", side: (i: Insect) => isPollinator(i) },
    { id: "damages-crops", label: "Damages crops", side: (i: Insect) => !isHelper(i) },
    { id: "six-legs", label: "Has 6 legs", side: () => true },
  ];
  const [placed, setPlaced] = useState<Record<string, "a" | "both" | "b" | null>>({});
  const [done, setDone] = useState(false);

  function correctSide(t: (typeof traits)[number]): "a" | "both" | "b" {
    const inA = t.side(a); const inB = t.side(b);
    return inA && inB ? "both" : inA ? "a" : inB ? "b" : "both";
  }
  function drop(traitId: string, zone: "a" | "both" | "b") { setPlaced((p) => ({ ...p, [traitId]: zone })); }
  function finish() {
    let score = 0;
    traits.forEach((t) => { if (placed[t.id] === correctSide(t)) score++; });
    onAward(score); setDone(true);
    setTimeout(() => {
      const helper = rand(K5.filter(isHelper));
      const pest = rand(K5.filter((i) => !isHelper(i)));
      setPair([helper, pest] as const); setPlaced({}); setDone(false);
    }, 1800);
  }
  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">Sort each trait into <b>{a.commonName}</b>, <b>Both</b>, or <b>{b.commonName}</b>. +1 each.</p>
      <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
        {(["a", "both", "b"] as const).map((z) => (
          <div key={z} className="min-h-[120px] rounded-xl border-2 border-dashed border-border bg-muted/30 p-3">
            <div className="mb-2 text-foreground">{z === "a" ? a.commonName : z === "b" ? b.commonName : "Both"}</div>
            <div className="space-y-1">
              {traits.filter((t) => placed[t.id] === z).map((t) => (<div key={t.id} className="rounded bg-card px-2 py-1">{t.label}</div>))}
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
// 5. Pollinator Pit Stop — drag bee to flowers, 30s
// ============================================================
function PollinatorPitStop({ onAward }: { onAward: (n: number) => void }) {
  const [time, setTime] = useState(30);
  const [collected, setCollected] = useState(0);
  const [running, setRunning] = useState(false);
  const [flowers, setFlowers] = useState<{ id: number; x: number; y: number }[]>([]);
  const idRef = useRef(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTime((s) => (s > 0 ? s - 1 : 0)), 1000);
    const f = setInterval(() => {
      setFlowers((fs) => [...fs.slice(-6), { id: ++idRef.current, x: 5 + Math.random() * 85, y: 5 + Math.random() * 75 }]);
    }, 750);
    return () => { clearInterval(t); clearInterval(f); };
  }, [running]);
  useEffect(() => {
    if (running && time === 0) { setRunning(false); onAward(collected); }
  }, [time, running, collected, onAward]);

  function pick(id: number) {
    setFlowers((fs) => fs.filter((f) => f.id !== id));
    setCollected((c) => c + 1);
  }
  function start() { setTime(30); setCollected(0); setFlowers([]); setRunning(true); }

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">Drag the 🐝 bee onto every flower to collect pollen. 30 seconds — each pollen = 1 point.</p>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> {time}s</span>
        <span>Pollen: <b>{collected}</b></span>
      </div>
      <div className="relative h-72 overflow-hidden rounded-xl bg-gradient-to-b from-sky-100 to-green-100">
        {flowers.map((f) => (
          <div
            key={f.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => pick(f.id)}
            style={{ left: `${f.x}%`, top: `${f.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-3xl"
          >
            🌼
          </div>
        ))}
        {running && (
          <div
            draggable
            onDragStart={() => setDragging(true)}
            onDragEnd={() => setDragging(false)}
            className={`absolute bottom-2 left-2 cursor-grab select-none text-4xl active:cursor-grabbing ${dragging ? "opacity-60" : ""}`}
            title="Drag me onto a flower"
          >
            🐝
          </div>
        )}
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
// 6. Predator Pounce — click aphids; bumble bees turn red and fly away
// ============================================================
function PredatorPounce({ onAward }: { onAward: (n: number) => void }) {
  const [time, setTime] = useState(30);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  type Sp = { id: number; kind: "pest" | "bee"; x: number; y: number; hit?: boolean };
  const [sprites, setSprites] = useState<Sp[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTime((s) => (s > 0 ? s - 1 : 0)), 1000);
    const spawn = setInterval(() => {
      setSprites((s) => [
        ...s.slice(-7),
        { id: ++idRef.current, kind: Math.random() < 0.75 ? "pest" : "bee", x: Math.random() * 85, y: Math.random() * 75 },
      ]);
    }, 650);
    return () => { clearInterval(t); clearInterval(spawn); };
  }, [running]);
  useEffect(() => { if (running && time === 0) { setRunning(false); onAward(score); } }, [time, running, score, onAward]);

  function tap(s: Sp) {
    if (s.hit) return;
    if (s.kind === "pest") {
      setSprites((all) => all.filter((x) => x.id !== s.id));
      setScore((v) => v + 1);
    } else {
      // bee: turn red, fly away, penalty
      setSprites((all) => all.map((x) => (x.id === s.id ? { ...x, hit: true } : x)));
      setScore((v) => v - 2);
      setTimeout(() => setSprites((all) => all.filter((x) => x.id !== s.id)), 700);
    }
  }
  function start() { setTime(30); setScore(0); setSprites([]); setRunning(true); }

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">You're a lady beetle! Pounce on 🦗 aphids (+1). Don't hit 🐝 bumble bees (-2). 30 seconds.</p>
      <div className="mb-2 flex justify-between text-sm">
        <span><Clock className="inline h-4 w-4" /> {time}s</span>
        <span>Score: <b>{score}</b></span>
      </div>
      <div className="relative h-72 overflow-hidden rounded-xl bg-green-50">
        {sprites.map((s) => (
          <button
            key={s.id}
            onClick={() => tap(s)}
            style={{ left: `${s.x}%`, top: `${s.y}%`, filter: s.hit ? "hue-rotate(-60deg) saturate(4)" : undefined }}
            className={`absolute text-3xl ${s.hit ? "k5-flyaway" : ""}`}
          >
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
// 7. Decomposer Cleanup Crew — drag middle item to compost/trash
// ============================================================
function DecomposerCleanup({ onAward }: { onAward: (n: number) => void }) {
  const ITEMS = [
    { id: "leaves",      name: "Fallen leaves",  emoji: "🍂", compost: true },
    { id: "core",        name: "Apple core",     emoji: "🍎", compost: true },
    { id: "husk",        name: "Corn husk",      emoji: "🌽", compost: true },
    { id: "stalk",       name: "Old plants",     emoji: "🌾", compost: true },
    { id: "grass",       name: "Grass clippings",emoji: "🌱", compost: true },
    { id: "can",         name: "Tin can",        emoji: "🥫", compost: false },
    { id: "bag",         name: "Shopping bag",   emoji: "🛍️", compost: false },
    { id: "bottle",      name: "Plastic bottle", emoji: "🧴", compost: false },
    { id: "wrapper",     name: "Candy wrapper",  emoji: "🍬", compost: false },
  ];
  const build = () => shuffle(Array.from({ length: 12 }, (_, i) => ({ ...rand(ITEMS), key: i })));
  const [queue, setQueue] = useState(build);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(30);
  const [running, setRunning] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTime((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [running]);
  useEffect(() => {
    if (running && (time === 0 || queue.length === 0)) { setRunning(false); onAward(score); }
  }, [time, queue, running, score, onAward]);

  function sortTo(compost: boolean) {
    const [head, ...rest] = queue; if (!head) return;
    if (head.compost === compost) { setScore((s) => s + 1); setQueue(rest); }
    else { setScore((s) => s - 1); setShake(true); setTimeout(() => { setShake(false); setQueue(rest); }, 500); }
  }
  function start() { setQueue(build()); setScore(0); setTime(30); setRunning(true); }

  const head = queue[0];
  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">Drag each item to the correct bin. Worms 🐛 eat leaves & food scraps; trash 🗑️ takes plastic & wrappers.</p>
      <div className="mb-2 flex justify-between text-sm"><span><Clock className="inline h-4 w-4" /> {time}s</span><span>Score: <b>{score}</b></span></div>
      <div className="grid grid-cols-3 gap-3">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => sortTo(true)}
          className="grid place-items-center rounded-xl border-2 border-dashed border-success/60 bg-success/10 p-4 text-center"
        >
          <div className="text-5xl">🐛</div>
          <div className="mt-1 text-sm font-semibold text-success">Compost bin</div>
          <div className="text-[11px] text-muted-foreground">Leaves, food, plants</div>
        </div>
        <div className="grid place-items-center rounded-xl bg-muted p-4">
          {running && head ? (
            <div
              draggable
              key={head.key}
              onDragStart={() => { /* noop */ }}
              className={`cursor-grab select-none text-center active:cursor-grabbing ${shake ? "k5-shake" : ""}`}
            >
              <div className="text-6xl">{head.emoji}</div>
              <div className="mt-1 text-xs font-semibold">{head.name}</div>
            </div>
          ) : (<span className="text-muted-foreground">—</span>)}
        </div>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => sortTo(false)}
          className="grid place-items-center rounded-xl border-2 border-dashed border-destructive/60 bg-destructive/10 p-4 text-center"
        >
          <div className="text-5xl">🗑️</div>
          <div className="mt-1 text-sm font-semibold text-destructive">Trash bin</div>
          <div className="text-[11px] text-muted-foreground">Plastic, cans, bags</div>
        </div>
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
// 8. Pest or Not a Pest
// ============================================================
function PestOrNot({ onAward }: { onAward: (n: number) => void }) {
  const [i, setI] = useState(() => rand(K5));
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  function vote(pest: boolean) {
    const actualPest = !isHelper(i);
    const ok = pest === actualPest;
    setMsg({ ok, text: ok
      ? `Yes! The ${i.commonName} is ${actualPest ? "a crop pest." : "a helper — not a pest."}`
      : `Trick! The ${i.commonName} is actually ${actualPest ? "a pest." : "a helper."}` });
    if (ok) onAward(1);
    setTimeout(() => { setI(rand(K5)); setMsg(null); }, 1400);
  }
  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">Thumbs up = pest. Thumbs down = not a pest.</p>
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
// 9. Beneficial Bug Bodyguard — with WHY explanation
// ============================================================
function whyForInsect(i: Insect): string {
  if (isPollinator(i)) return `It is a pollinator — it visits flowers and helps plants make ${i.hosts.toLowerCase().includes("nectar") ? "seeds" : "fruit and seeds"}.`;
  if (i.role === "Beneficial") return `It is a predator — it eats other pest bugs like aphids, so it helps the farm.`;
  if (isInvasive(i)) return `It is an invasive pest — it does not belong here and damages ${i.hosts.toLowerCase()}.`;
  return `It is a pest — it eats ${i.hosts.toLowerCase()}, which hurts the farmer's crop.`;
}
function Bodyguard({ onAward }: { onAward: (n: number) => void }) {
  const [i, setI] = useState(() => rand(K5));
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  function act(spray: boolean) {
    const helper = isHelper(i);
    const ok = spray ? !helper : helper;
    const why = whyForInsect(i);
    setMsg({ ok, text: `${ok ? "Good call!" : "Oops."} ${helper ? "Protect this one. " : "Control this one. "}${why}` });
    onAward(ok ? (helper ? 2 : 1) : helper ? -2 : -1);
    setTimeout(() => { setI(rand(K5)); setMsg(null); }, 2600);
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
// 10. Life Cycle Builder — photo spots + click in order + undo
// ============================================================
const STAGE_EMOJI = (stage: string, insect: Insect) => {
  if (stage === "Egg") return "🥚";
  if (stage === "Larva") return "🐛";
  if (stage === "Pupa") return "🛌";
  if (stage === "Nymph") return "🐜";
  if (stage === "Adult") return EMOJI[insect.id] ?? "🐞";
  return "❓";
};
function LifeCycle({ onAward }: { onAward: (n: number) => void }) {
  const [i, setI] = useState(() => rand(K5));
  const complete = i.metamorphosis === "Complete";
  const stages = complete ? ["Egg", "Larva", "Pupa", "Adult"] : ["Egg", "Nymph", "Adult"];
  const [placed, setPlaced] = useState<string[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => { setPlaced([]); setMsg(null); }, [i.id]);

  const remaining = stages.filter((s) => !placed.includes(s));

  function place(s: string) {
    if (msg) return;
    const next = [...placed, s];
    setPlaced(next);
    if (next.length === stages.length) {
      const ok = next.every((v, idx) => v === stages[idx]);
      setMsg({ ok, text: ok ? `Perfect life cycle for the ${i.commonName}!` : `Order should be: ${stages.join(" → ")}` });
      if (ok) onAward(3);
      setTimeout(() => setI(rand(K5)), 1800);
    }
  }
  function undo() { if (placed.length && !msg) setPlaced((p) => p.slice(0, -1)); }

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">
        Click each life stage in order (egg → adult) for the <b>{i.commonName}</b>. Use ↩ Undo to fix your last pick.
      </p>
      <div className="mb-4 grid place-items-center rounded-xl border border-border bg-muted/40 p-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">Featured insect</div>
        <div className="text-6xl">{EMOJI[i.id]}</div>
        <div className="mt-1 font-semibold">{i.commonName}</div>
      </div>
      <div className="mb-3 flex flex-wrap justify-center gap-2">
        {stages.map((_, idx) => {
          const s = placed[idx];
          return (
            <div key={idx} className={`w-24 rounded-xl border-2 p-2 text-center ${s ? "border-primary bg-primary/10" : "border-dashed border-border bg-muted/30"}`}>
              <div className="text-3xl">{s ? STAGE_EMOJI(s, i) : "?"}</div>
              <div className="mt-1 text-xs font-medium">{s ?? `Step ${idx + 1}`}</div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        {remaining.map((s) => (
          <button key={s} onClick={() => place(s)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm hover:bg-muted">
            {STAGE_EMOJI(s, i)} {s}
          </button>
        ))}
        {placed.length > 0 && !msg && (
          <button onClick={undo} className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground hover:bg-muted">
            <Undo2 className="mr-1 inline h-3 w-3" /> Remove last
          </button>
        )}
      </div>
      {msg && <Feedback ok={msg.ok} text={msg.text} />}
    </div>
  );
}

// ============================================================
// 11. Migration Map — drag bug to origin on world map
// ============================================================
const CONTINENTS: { id: string; label: string; x: number; y: number; w: number; h: number }[] = [
  { id: "north-america", label: "North America", x: 8,  y: 10, w: 32, h: 38 },
  { id: "south-america", label: "South America", x: 22, y: 48, w: 24, h: 45 },
  { id: "europe",        label: "Europe",        x: 45, y: 10, w: 15, h: 22 },
  { id: "africa",        label: "Africa",        x: 45, y: 30, w: 18, h: 45 },
  { id: "asia",          label: "Asia",          x: 60, y: 6,  w: 35, h: 42 },
  { id: "australia",     label: "Australia",     x: 78, y: 55, w: 15, h: 20 },
];
const ORIGIN_ID: Record<string, string> = {
  "spotted-lantern-fly": "asia",
  "spongy-moth": "europe",
  "japanese-beetle": "asia",
  "honey-bee": "europe",
  "seven-spotted-lady-beetle": "europe",
  "alfalfa-weevil": "europe",
  "monarch-butterfly": "north-america",
  "bumble-bee": "north-america",
  "corn-leaf-aphid": "north-america",
  "corn-flea-beetle": "north-america",
  "differential-grasshopper": "north-america",
  "green-cloverworm": "north-america",
  "green-stink-bug": "north-america",
  "potato-leafhopper": "north-america",
  "striped-cucumber-beetle": "north-america",
  "black-swallowtail": "north-america",
};
function MigrationMap({ onAward }: { onAward: (n: number) => void }) {
  const [i, setI] = useState(() => rand(K5));
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [shake, setShake] = useState(false);
  const [solved, setSolved] = useState(false);
  const [dragging, setDragging] = useState(false);

  function onDropContinent(cid: string) {
    const correctId = ORIGIN_ID[i.id];
    if (cid === correctId) {
      setSolved(true);
      const label = CONTINENTS.find((c) => c.id === cid)?.label;
      setMsg({ ok: true, text: `Right — the ${i.commonName} comes from ${label}.` });
      onAward(2);
      setTimeout(() => { setI(rand(K5.filter((x) => x.id !== i.id))); setMsg(null); setSolved(false); }, 1600);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 550);
    }
  }
  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">Drag this bug to the continent it originally came from. Wrong drops bounce back — try again!</p>
      <div className="relative w-full overflow-hidden rounded-xl border border-border bg-sky-100" style={{ aspectRatio: "1920 / 1419" }}>
        <img src={worldMap.url} alt="World map" className="absolute inset-0 h-full w-full object-contain" draggable={false} />
        {CONTINENTS.map((c) => (
          <div
            key={c.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDropContinent(c.id)}
            className="absolute rounded-md border-2 border-dashed border-transparent hover:border-primary/60"
            style={{ left: `${c.x}%`, top: `${c.y}%`, width: `${c.w}%`, height: `${c.h}%` }}
            title={c.label}
          />
        ))}
        {!solved && (
          <div
            draggable
            onDragStart={() => setDragging(true)}
            onDragEnd={() => setDragging(false)}
            className={`absolute bottom-2 right-2 cursor-grab select-none rounded-xl border border-border bg-card p-2 text-center shadow-md active:cursor-grabbing ${shake ? "k5-shake" : ""} ${dragging ? "opacity-60" : ""}`}
          >
            <div className="text-4xl">{EMOJI[i.id]}</div>
            <div className="text-xs font-semibold">{i.commonName}</div>
            {isInvasive(i) && <div className="text-[10px] text-destructive">Invasive here</div>}
          </div>
        )}
      </div>
      {msg && <Feedback ok={msg.ok} text={msg.text} />}
    </div>
  );
}

// ============================================================
// 12. Food Chain Drag-Link — cartoon chain with drop slots
// ============================================================
function FoodChain({ onAward }: { onAward: (n: number) => void }) {
  const CHAINS = [
    ["Corn", "Corn leaf aphid", "Lady beetle", "Bird"],
    ["Alfalfa", "Alfalfa weevil", "Braconid wasp", "Bird"],
    ["Milkweed", "Monarch caterpillar", "Bird", "Fox"],
    ["Soybean", "Green stink bug", "Assassin bug", "Bird"],
  ];
  const [chain, setChain] = useState<string[]>(() => rand(CHAINS));
  const [placed, setPlaced] = useState<(string | null)[]>(() => chain.map(() => null));
  const [bank, setBank] = useState<string[]>(() => shuffle(chain));
  const [dragging, setDragging] = useState<string | null>(null);
  const [shake, setShake] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => { setPlaced(chain.map(() => null)); setBank(shuffle(chain)); setMsg(null); }, [chain]);

  function drop(idx: number) {
    if (!dragging) return;
    if (chain[idx] === dragging) {
      setPlaced((p) => { const n = [...p]; n[idx] = dragging; return n; });
      setBank((b) => b.filter((x) => x !== dragging));
      const filled = placed.filter((_, i2) => i2 !== idx).filter(Boolean).length + 1;
      if (filled === chain.length) {
        setMsg({ ok: true, text: "Perfect food chain!" });
        onAward(3);
        setTimeout(() => setChain(rand(CHAINS)), 1600);
      }
    } else {
      setShake(dragging); setTimeout(() => setShake(null), 550);
    }
    setDragging(null);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">Drag each name to the right link in the chain (plant → top predator). Wrong drops bounce back.</p>
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        {chain.map((_, idx) => (
          <div key={idx} className="flex items-center gap-1">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => drop(idx)}
              className={`grid h-20 w-28 place-items-center rounded-full border-4 text-xs font-semibold ${placed[idx] ? "border-primary bg-primary/10" : "border-dashed border-border bg-muted/30"}`}
            >
              {placed[idx] ?? <span className="text-2xl text-muted-foreground">🔗</span>}
            </div>
            {idx < chain.length - 1 && <span className="text-2xl">→</span>}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {bank.map((b) => (
          <div key={b} draggable onDragStart={() => setDragging(b)} onDragEnd={() => setDragging(null)}
            className={`cursor-grab rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-sm active:cursor-grabbing ${shake === b ? "k5-shake" : ""}`}>
            {b}
          </div>
        ))}
      </div>
      {msg && <Feedback ok={msg.ok} text={msg.text} />}
    </div>
  );
}

// ============================================================
// 13. Web It Up — circle of nodes, draw arrows, submit after 3
// ============================================================
function WebItUp({ onAward }: { onAward: (n: number) => void }) {
  const NODES = ["Corn", "Aphid", "Lady beetle", "Grasshopper", "Bird", "Decomposer"];
  const VALID: [string, string][] = [
    ["Corn", "Aphid"], ["Corn", "Grasshopper"], ["Aphid", "Lady beetle"],
    ["Grasshopper", "Bird"], ["Lady beetle", "Bird"], ["Corn", "Decomposer"],
  ];
  const [from, setFrom] = useState<string | null>(null);
  const [made, setMade] = useState<[string, string][]>([]);
  const [result, setResult] = useState<{ correct: [string, string][]; wrong: [string, string][]; missed: [string, string][] } | null>(null);

  // node positions on a circle
  const positions = useMemo(() => {
    return NODES.map((n, i) => {
      const angle = (i / NODES.length) * Math.PI * 2 - Math.PI / 2;
      return { n, x: 50 + Math.cos(angle) * 38, y: 50 + Math.sin(angle) * 38 };
    });
  }, []);
  const posOf = (n: string) => positions.find((p) => p.n === n)!;

  function tap(n: string) {
    if (result) return;
    if (!from) return setFrom(n);
    if (from === n) return setFrom(null);
    if (made.some(([a, b]) => a === from && b === n)) { setFrom(null); return; }
    setMade((m) => [...m, [from, n]]);
    setFrom(null);
  }
  function submit() {
    const isValid = (link: [string, string]) => VALID.some(([a, b]) => a === link[0] && b === link[1]);
    const correct = made.filter(isValid);
    const wrong = made.filter((l) => !isValid(l));
    const missed = VALID.filter(([a, b]) => !made.some(([x, y]) => x === a && y === b));
    onAward(correct.length - wrong.length);
    setResult({ correct, wrong, missed });
  }
  function reset() { setMade([]); setFrom(null); setResult(null); }

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">Tap two nodes to draw an arrow: first = food, second = eater. Make at least 3 links, then submit.</p>
      <div className="relative mx-auto aspect-square w-full max-w-md rounded-xl border border-border bg-muted/30">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
          <defs>
            <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
            </marker>
          </defs>
          {made.map(([a, b], idx) => {
            const pa = posOf(a); const pb = posOf(b);
            const isValid = VALID.some(([x, y]) => x === a && y === b);
            const stroke = result ? (isValid ? "hsl(var(--success))" : "hsl(var(--destructive))") : "currentColor";
            return <line key={idx} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke={stroke} strokeWidth="0.8" markerEnd="url(#arr)" className="text-primary" />;
          })}
        </svg>
        {positions.map((p) => (
          <button key={p.n} onClick={() => tap(p.n)}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 px-3 py-2 text-xs font-semibold shadow-sm ${from === p.n ? "border-primary bg-primary/20" : "border-border bg-card hover:bg-muted"}`}>
            {p.n}
          </button>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-sm">
        <span>Links: <b>{made.length}</b></span>
        {made.length >= 3 && !result && (
          <button onClick={submit} className="rounded-md bg-primary px-4 py-1.5 text-sm text-primary-foreground">Submit</button>
        )}
        {result && <button onClick={reset} className="rounded-md border border-border bg-card px-3 py-1.5 text-xs"><RefreshCcw className="mr-1 inline h-3 w-3" /> New web</button>}
      </div>
      {result && (
        <div className="mt-3 space-y-2 text-xs">
          <div className="rounded-lg border border-success/40 bg-success/10 p-2 text-success">
            ✅ Correct: {result.correct.map(([a, b]) => `${a}→${b}`).join(", ") || "none"}
          </div>
          {result.wrong.length > 0 && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-2 text-destructive">
              ❌ Not a real link: {result.wrong.map(([a, b]) => `${a}→${b}`).join(", ")}
            </div>
          )}
          <div className="rounded-lg border border-border bg-muted/40 p-2">
            🔎 Missed: {result.missed.map(([a, b]) => `${a}→${b}`).join(", ") || "none — you got them all!"}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 14. Movement Lab — dotted pathway drop zones
// ============================================================
type MoveType = "Hop" | "Fly" | "Crawl" | "Flutter";
const PATHS: { id: MoveType; label: string; emoji: string; desc: string; path: string }[] = [
  { id: "Hop",     label: "Hop",     emoji: "🦘", desc: "bounces on the ground", path: "M2,80 Q15,20 30,80 T60,80 T90,80" },
  { id: "Fly",     label: "Fly",     emoji: "🕊️", desc: "flies straight above the ground", path: "M2,25 L98,25" },
  { id: "Crawl",   label: "Crawl",   emoji: "🐌", desc: "creeps along the ground", path: "M2,85 L98,85" },
  { id: "Flutter", label: "Flutter", emoji: "🦋", desc: "flutters up and down through the air", path: "M2,50 Q15,10 30,50 Q45,90 60,50 Q75,10 90,50" },
];
function moveFor(i: Insect): MoveType {
  if (i.order === "Orthoptera") return "Hop";
  if (i.order === "Lepidoptera") return "Flutter";
  if (i.order === "Hemiptera" && (i.id.includes("aphid") || i.id.includes("hopper"))) return "Crawl";
  if (i.order === "Hymenoptera") return "Fly";
  return "Fly";
}
function MovementLab({ onAward }: { onAward: (n: number) => void }) {
  const [i, setI] = useState(() => rand(K5));
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [shake, setShake] = useState(false);
  const [dragging, setDragging] = useState(false);
  const correct = moveFor(i);
  function onDropPath(p: MoveType) {
    if (p === correct) {
      setMsg({ ok: true, text: `Yes! A ${i.commonName} moves by: ${correct.toLowerCase()}.` });
      onAward(2);
      setTimeout(() => { setI(rand(K5.filter((x) => x.id !== i.id))); setMsg(null); }, 1500);
    } else {
      setShake(true); setTimeout(() => setShake(false), 550);
    }
  }
  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">Drag the bug onto the pathway that matches how it moves. Wrong drops bounce back!</p>
      <div className="space-y-2">
        {PATHS.map((p) => (
          <div
            key={p.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDropPath(p.id)}
            className="relative flex h-20 items-center gap-3 overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/20 px-3"
          >
            <div className="text-3xl">{p.emoji}</div>
            <div className="text-sm">
              <div className="font-semibold">{p.label}</div>
              <div className="text-xs text-muted-foreground">{p.desc}</div>
            </div>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-y-0 right-0 h-full w-2/3">
              <path d={p.path} fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" className="text-primary/60" />
            </svg>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div
          draggable
          onDragStart={() => setDragging(true)}
          onDragEnd={() => setDragging(false)}
          className={`cursor-grab select-none rounded-xl border border-border bg-card p-3 text-center shadow-md active:cursor-grabbing ${shake ? "k5-shake" : ""} ${dragging ? "opacity-60" : ""}`}
        >
          <div className="text-4xl">{EMOJI[i.id]}</div>
          <div className="text-xs font-semibold">{i.commonName}</div>
        </div>
        <div className="text-xs text-muted-foreground">Drag me onto a movement pathway.</div>
      </div>
      {msg && <Feedback ok={msg.ok} text={msg.text} />}
    </div>
  );
}

// ============================================================
// 15. Bodyguard Decisions (batch scenes)
// ============================================================
function BodyguardDecisions({ onAward }: { onAward: (n: number) => void }) {
  const [scene, setScene] = useState(() => shuffle(K5).slice(0, 5));
  const [choices, setChoices] = useState<Record<string, "protect" | "spray">>({});
  const [done, setDone] = useState(false);
  function set(id: string, v: "protect" | "spray") { setChoices((c) => ({ ...c, [id]: v })); }
  function score() {
    let s = 0;
    scene.forEach((i) => {
      const helper = isHelper(i); const c = choices[i.id]; if (!c) return;
      if (helper && c === "protect") s += 2;
      else if (!helper && c === "spray") s += 1;
      else if (helper && c === "spray") s -= 2;
      else if (!helper && c === "protect") s -= 1;
    });
    onAward(s); setDone(true);
    setTimeout(() => { setScene(shuffle(K5).slice(0, 5)); setChoices({}); setDone(false); }, 1800);
  }
  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">This farm has 5 insects. For each: protect or spray? Helpers +2, pests +1, mistakes lose points.</p>
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
// 16. IPM Strategy Board — with % efficacy bars per tool
// ============================================================
function IPMBoard({ onAward }: { onAward: (n: number) => void }) {
  type Tool = { id: string; label: string; efficacy: (i: Insect) => number };
  const TOOLS: Tool[] = [
    { id: "row-cover", label: "🌾 Row covers", efficacy: (i) => (!isHelper(i) && (i.order === "Coleoptera" || i.order === "Orthoptera") ? 85 : 25) },
    { id: "release",   label: "🐞 Release lady beetles", efficacy: (i) => (i.hosts.toLowerCase().includes("aphid") || i.order === "Hemiptera" ? 90 : 20) },
    { id: "hand",      label: "🖐️ Hand-removal", efficacy: (i) => (isInvasive(i) || i.order === "Lepidoptera" ? 70 : 30) },
    { id: "spray",     label: "🎯 Targeted spray", efficacy: (i) => (!isHelper(i) ? 80 : 10) },
  ];
  const [pest, setPest] = useState(() => rand(K5.filter((x) => !isHelper(x))));
  const [picked, setPicked] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const bars = TOOLS.map((t) => ({ ...t, pct: t.efficacy(pest) }));
  const best = Math.max(...bars.map((b) => b.pct));

  function apply(t: Tool) {
    setPicked(t.id);
    const pct = t.efficacy(pest);
    const ok = pct >= best - 5;
    setMsg({ ok, text: `${t.label} works at ~${pct}% on ${pest.commonName}. ${ok ? "Great choice!" : "There's a stronger tool."}` });
    if (ok) onAward(2);
    setTimeout(() => {
      setPest(rand(K5.filter((x) => !isHelper(x)))); setMsg(null); setPicked(null);
    }, 2000);
  }
  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">Pick the best IPM tool for this pest. The bars show how well each one works.</p>
      <div className="grid place-items-center rounded-xl bg-muted p-6">
        <div className="text-6xl">{EMOJI[pest.id]}</div>
        <div className="mt-1 font-semibold">{pest.commonName}</div>
        <div className="text-xs italic text-muted-foreground">Attacking: {pest.hosts}</div>
      </div>
      <div className="mt-3 space-y-2">
        {bars.map((t) => (
          <button key={t.id} onClick={() => !msg && apply(t)} className={`w-full rounded-lg border p-3 text-left ${picked === t.id ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-muted"}`}>
            <div className="flex items-center justify-between text-sm font-medium">
              <span>{t.label}</span>
              <span className="text-xs text-muted-foreground">{picked ? `${t.pct}%` : "click to try"}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-gradient-to-r from-destructive via-secondary to-success transition-all" style={{ width: picked ? `${t.pct}%` : "0%" }} />
            </div>
          </button>
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
  emoji: string;
  render: (onAward: (n: number) => void) => ReactNode;
}

export const K5_GAMES: K5Game[] = [
  { id: "match",       name: "Bug Name Match-Up",      emoji: "🃏", blurb: "Match names to pictures.",           render: (a) => <BugNameMatchUp onAward={a} /> },
  { id: "detective",   name: "Bug Detective",          emoji: "🔍", blurb: "Guess the bug from clues.",          render: (a) => <BugDetective onAward={a} /> },
  { id: "build",       name: "Build-a-Bug",            emoji: "🧩", blurb: "Drag parts onto the bug diagram.",   render: (a) => <BuildABug onAward={a} /> },
  { id: "showdown",    name: "Side-by-Side Showdown",  emoji: "⚖️", blurb: "Sort traits into a Venn diagram.",   render: (a) => <Showdown onAward={a} /> },
  { id: "pollinator",  name: "Pollinator Pit Stop",    emoji: "🌼", blurb: "Drag the bee to every flower.",      render: (a) => <PollinatorPitStop onAward={a} /> },
  { id: "predator",    name: "Predator Pounce",        emoji: "🐞", blurb: "Pounce on aphids, spare the bees.",  render: (a) => <PredatorPounce onAward={a} /> },
  { id: "decomposer",  name: "Decomposer Cleanup Crew",emoji: "♻️", blurb: "Sort compost vs trash.",             render: (a) => <DecomposerCleanup onAward={a} /> },
  { id: "pest-or-not", name: "Pest or Not a Pest?",    emoji: "👍", blurb: "Thumbs up / thumbs down.",           render: (a) => <PestOrNot onAward={a} /> },
  { id: "bodyguard",   name: "Beneficial Bug Bodyguard",emoji: "🛡️", blurb: "Protect helpers, control pests.",  render: (a) => <Bodyguard onAward={a} /> },
  { id: "life-cycle",  name: "Life Cycle Builder",     emoji: "🐛", blurb: "Order egg to adult.",                render: (a) => <LifeCycle onAward={a} /> },
  { id: "migration",   name: "Migration Map",          emoji: "🗺️", blurb: "Drag each bug to its home.",         render: (a) => <MigrationMap onAward={a} /> },
  { id: "food-chain",  name: "Food Chain Drag-Link",   emoji: "🔗", blurb: "Build the food chain in order.",     render: (a) => <FoodChain onAward={a} /> },
  { id: "web",         name: "Web It Up",              emoji: "🕸️", blurb: "Draw arrows in the food web.",       render: (a) => <WebItUp onAward={a} /> },
  { id: "movement",    name: "Movement Lab",           emoji: "🏃", blurb: "Match bugs to how they move.",       render: (a) => <MovementLab onAward={a} /> },
  { id: "bodyguard-2", name: "Bodyguard Decisions",    emoji: "🚜", blurb: "Score choices across a whole farm.", render: (a) => <BodyguardDecisions onAward={a} /> },
  { id: "ipm",         name: "IPM Strategy Board",     emoji: "📊", blurb: "Pick the right pest-control tool.",  render: (a) => <IPMBoard onAward={a} /> },
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
        <h3 className="mb-1 text-lg font-bold text-foreground">{active.emoji} {active.name}</h3>
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
            <span className="text-3xl">{g.emoji}</span>
            <div className="font-semibold text-foreground">{g.name}</div>
            <div className="text-xs text-muted-foreground">{g.blurb}</div>
            <div className="mt-1 text-[11px] font-medium text-primary">Play →</div>
          </button>
        ))}
      </div>
    </div>
  );
}

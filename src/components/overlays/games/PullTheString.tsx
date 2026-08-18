import { useMemo, useState, type ReactNode } from "react";
import { ArrowRight, CheckCircle2, Minus, Plus, RefreshCcw, Search, XCircle } from "lucide-react";
import { HealthMeter } from "@/components/overlays/games/WebOfLife";

/* ------------------------------------------------------------------ */
/* Pull the String — ripple effects, decomposer cycle, ecosystem       */
/* builder and a final ecosystem rescue. Goal: RESTORE THE BALANCE.    */
/* ------------------------------------------------------------------ */

function Btn({ children, onClick, tone = "plain", disabled }: { children: ReactNode; onClick?: () => void; tone?: "plain" | "primary"; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${
        tone === "primary" ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-border bg-card hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

function Note({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className={`mt-3 flex items-start gap-2 rounded-lg border p-3 text-sm ${ok ? "border-success/40 bg-success/10 text-success" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
      {ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
      <span>{text}</span>
    </div>
  );
}

/* --------------------------- web model ---------------------------- */
type Status = "healthy" | "struggling" | "risk" | "boom";
const STATUS_CLS: Record<Status, string> = {
  healthy: "border-success/50 bg-success/10 text-success",
  struggling: "border-primary/60 bg-primary/15 text-primary",
  risk: "border-destructive/50 bg-destructive/10 text-destructive",
  boom: "border-accent/60 bg-accent/20 text-accent-foreground",
};
const STATUS_DOT: Record<Status, string> = { healthy: "🟢 Healthy", struggling: "🟡 Struggling", risk: "🔴 At risk", boom: "🔵 Booming" };

interface Node { id: string; emoji: string; name: string }
const NODES: Node[] = [
  { id: "plant", emoji: "🌱", name: "Plants" },
  { id: "flower", emoji: "🌸", name: "Flowers" },
  { id: "caterpillar", emoji: "🐛", name: "Caterpillars" },
  { id: "grasshopper", emoji: "🦗", name: "Grasshoppers" },
  { id: "bee", emoji: "🐝", name: "Bees" },
  { id: "ladybug", emoji: "🐞", name: "Ladybugs" },
  { id: "spider", emoji: "🕷️", name: "Spiders" },
  { id: "frog", emoji: "🐸", name: "Frogs" },
  { id: "bird", emoji: "🐦", name: "Birds" },
  { id: "fox", emoji: "🦊", name: "Foxes" },
  { id: "fungi", emoji: "🍄", name: "Fungi" },
  { id: "worm", emoji: "🪱", name: "Earthworms" },
];
const node = (id: string) => NODES.find((n) => n.id === id)!;

/* who is connected to whom */
const LINKS: Record<string, string[]> = {
  plant: ["caterpillar", "grasshopper", "worm", "fungi"],
  flower: ["bee", "caterpillar"],
  caterpillar: ["plant", "bird", "spider"],
  grasshopper: ["plant", "frog", "bird"],
  bee: ["flower", "spider"],
  ladybug: ["bird", "plant"],
  spider: ["caterpillar", "bee", "bird"],
  frog: ["grasshopper", "bird"],
  bird: ["caterpillar", "grasshopper", "spider", "fox", "frog"],
  fox: ["bird"],
  fungi: ["plant"],
  worm: ["plant"],
};

/* result of removing most of an organism */
const REMOVE_EFFECT: Record<string, { states: Record<string, Status>; text: string }> = {
  caterpillar: {
    states: { plant: "boom", bird: "struggling", spider: "struggling", flower: "healthy" },
    text: "Fewer caterpillars → plants are eaten less and boom, but birds and spiders lose an important food source.",
  },
  bee: {
    states: { flower: "risk", plant: "struggling", spider: "struggling" },
    text: "Fewer bees → flowers are not pollinated, so fewer seeds and fruit. Plants slowly decline too.",
  },
  bird: {
    states: { caterpillar: "boom", grasshopper: "boom", plant: "risk", fox: "struggling" },
    text: "Fewer birds → plant-eating insects boom → plants get stripped, and foxes lose prey.",
  },
  fungi: {
    states: { plant: "risk", worm: "struggling" },
    text: "Fewer fungi → dead leaves pile up and nutrients never return to the soil, so plants struggle.",
  },
  frog: {
    states: { grasshopper: "boom", plant: "struggling", bird: "healthy" },
    text: "Fewer frogs → grasshoppers boom → they eat more plants.",
  },
  plant: {
    states: { caterpillar: "risk", grasshopper: "risk", bird: "struggling", frog: "struggling", fox: "risk", worm: "struggling" },
    text: "Remove the producers and EVERYTHING is at risk — every food chain starts with plants.",
  },
};
const PULLABLE = Object.keys(REMOVE_EFFECT);

function PullTheStringLab({ onDone, award, onHealth }: { onDone: () => void; award: (n: number) => void; onHealth: (d: number) => void }) {
  const [sel, setSel] = useState<string | null>(null);
  const [removed, setRemoved] = useState<string | null>(null);
  const [tried, setTried] = useState<string[]>([]);

  const effect = removed ? REMOVE_EFFECT[removed] : null;
  const statusOf = (id: string): Status | null => {
    if (!effect) return null;
    if (id === removed) return "risk";
    return effect.states[id] ?? "healthy";
  };
  const lit = sel ? [sel, ...(LINKS[sel] ?? [])] : [];

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">
        The food web is a giant spider web. Tap an organism to light up its connections, then pull the string and watch the ripple.
      </p>
      <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border bg-gradient-to-b from-success/5 to-card p-3 sm:grid-cols-4">
        {NODES.map((n) => {
          const st = statusOf(n.id);
          const isLit = lit.includes(n.id);
          return (
            <button
              key={n.id}
              onClick={() => { setSel(n.id); setRemoved(null); }}
              className={`rounded-xl border p-2 text-center transition ${st ? STATUS_CLS[st] : isLit ? "border-primary bg-primary/15" : "border-border bg-card hover:bg-muted"} ${sel === n.id ? "ring-2 ring-primary" : ""}`}
            >
              <div className="text-3xl">{n.emoji}</div>
              <div className="text-[11px] font-medium">{n.name}</div>
              {st && <div className="text-[10px]">{STATUS_DOT[st]}</div>}
            </button>
          );
        })}
      </div>

      {sel && !removed && (
        <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm">
          <div className="font-semibold text-foreground">{node(sel).emoji} {node(sel).name} is connected to:</div>
          <div className="mt-1 flex flex-wrap gap-1 text-xs">
            {(LINKS[sel] ?? []).map((id) => (
              <span key={id} className="rounded-full bg-primary/15 px-2 py-1 text-primary">{node(id).emoji} {node(id).name}</span>
            ))}
          </div>
          {PULLABLE.includes(sel) ? (
            <Btn
              tone="primary"
              onClick={() => {
                setRemoved(sel);
                setTried((t) => (t.includes(sel) ? t : [...t, sel]));
                award(2);
                onHealth(-3);
              }}
            >
              Remove most of the {node(sel).name.toLowerCase()}
            </Btn>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">Pick one of: {PULLABLE.map((p) => node(p).emoji).join(" ")} to pull a string.</p>
          )}
        </div>
      )}

      {effect && (
        <>
          <Note ok={false} text={effect.text} />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Btn onClick={() => { setRemoved(null); setSel(null); onHealth(3); }}><RefreshCcw className="mr-1 inline h-4 w-4" /> Reset the web</Btn>
            <span className="text-xs text-muted-foreground">{tried.length}/3 strings pulled</span>
            {tried.length >= 3 && <Btn tone="primary" onClick={onDone}>Next: decomposers <ArrowRight className="ml-1 inline h-4 w-4" /></Btn>}
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------- decomposer cycle ------------------------ */
const CYCLE = ["🍂 Dead leaves fall", "🍄🪱🦠 Fungi, worms and microbes break them down", "🌱 Nutrients return to the soil", "🌱 New plants grow"];

function DecomposerCycle({ onDone, award, onHealth }: { onDone: () => void; award: (n: number) => void; onHealth: (d: number) => void }) {
  const [picked, setPicked] = useState<string[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const jumbled = useMemo(() => [...CYCLE].sort(() => Math.random() - 0.5), []);
  const done = picked.length === CYCLE.length;

  return (
    <div>
      <h4 className="text-base font-bold text-foreground">♻️ Food webs are a cycle, not a line</h4>
      <p className="mb-3 text-sm text-muted-foreground">Put the recycling steps in order.</p>
      <div className="grid gap-2">
        {jumbled.map((step) => {
          const pos = picked.indexOf(step);
          return (
            <button
              key={step}
              disabled={pos >= 0 || !!msg}
              onClick={() => setPicked((p) => [...p, step])}
              className={`rounded-xl border px-4 py-3 text-left text-sm ${pos >= 0 ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-muted"}`}
            >
              {pos >= 0 && <span className="mr-2 font-bold">#{pos + 1}</span>}
              {step}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex gap-2">
        <Btn onClick={() => setPicked([])}>Clear</Btn>
        <Btn
          tone="primary"
          disabled={!done || !!msg}
          onClick={() => {
            const ok = picked.every((s, i) => s === CYCLE[i]);
            if (ok) award(3);
            onHealth(ok ? 8 : -4);
            setMsg({ ok, text: ok ? "Decomposers close the loop — dead material becomes soil nutrients that grow new plants." : `Correct order: ${CYCLE.join(" → ")}` });
            setTimeout(() => { setMsg(null); onDone(); }, 2800);
          }}
        >
          Check the cycle
        </Btn>
      </div>
      {msg && <Note ok={msg.ok} text={msg.text} />}
    </div>
  );
}

/* ------------------------ ecosystem builder ------------------------ */
type Group = "producer" | "insect" | "amphibian" | "bird" | "predator" | "decomposer";
const GROUPS: { id: Group; emoji: string; label: string; hint: string }[] = [
  { id: "producer", emoji: "🌱", label: "Producers", hint: "Plants make the food" },
  { id: "insect", emoji: "🐛", label: "Insects", hint: "Eat plants, pollinate, get eaten" },
  { id: "amphibian", emoji: "🐸", label: "Amphibians", hint: "Frogs eat insects" },
  { id: "bird", emoji: "🐦", label: "Birds", hint: "Eat insects" },
  { id: "predator", emoji: "🦊", label: "Predators", hint: "Eat birds and small animals" },
  { id: "decomposer", emoji: "🍄", label: "Decomposers", hint: "Recycle nutrients" },
];

function Builder({ onDone, award, onHealth }: { onDone: () => void; award: (n: number) => void; onHealth: (d: number) => void }) {
  const [counts, setCounts] = useState<Record<Group, number>>({ producer: 0, insect: 0, amphibian: 0, bird: 0, predator: 0, decomposer: 0 });
  const [checked, setChecked] = useState(false);
  const set = (g: Group, d: number) => { setChecked(false); setCounts((c) => ({ ...c, [g]: Math.max(0, Math.min(9, c[g] + d)) })); };

  const eaters = counts.bird + counts.amphibian + counts.predator;
  const warnings: string[] = [];
  if (counts.producer === 0) warnings.push("🌱 With no producers there is no food at all — every chain starts with plants.");
  if (counts.insect === 0) warnings.push("🐛 With no insects, pollination stops and predators have nothing to eat.");
  if (counts.insect > counts.producer * 1.5) warnings.push("⚠️ You have far more insects than plants. The plants will be eaten faster than they grow.");
  if (counts.insect >= 3 && eaters === 0) warnings.push("⚠️ Your ecosystem may become unbalanced. Who might eat these insects?");
  if (counts.decomposer === 0) warnings.push("🍄 Without decomposers, dead material piles up and nutrients never return to the soil.");
  if (counts.predator > counts.bird + counts.amphibian) warnings.push("🦊 More top predators than prey — the predators will run out of food.");
  const balanced = warnings.length === 0 && counts.producer >= 3 && counts.insect >= 2;

  return (
    <div>
      <h4 className="text-base font-bold text-foreground">🧩 Build a balanced ecosystem</h4>
      <p className="mb-3 text-sm text-muted-foreground">You have a blank meadow. Add organisms until the system can support itself.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {GROUPS.map((g) => (
          <div key={g.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
            <div>
              <div className="text-sm font-semibold text-foreground">{g.emoji} {g.label}</div>
              <div className="text-[11px] text-muted-foreground">{g.hint}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => set(g.id, -1)} className="rounded-md border border-border p-1 hover:bg-muted"><Minus className="h-4 w-4" /></button>
              <span className="w-6 text-center text-sm font-bold">{counts[g.id]}</span>
              <button onClick={() => set(g.id, 1)} className="rounded-md border border-border p-1 hover:bg-muted"><Plus className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 min-h-8 rounded-xl border border-border bg-muted/40 p-3 text-lg leading-relaxed">
        {GROUPS.flatMap((g) => Array.from({ length: counts[g.id] }, (_, i) => <span key={g.id + i}>{g.emoji}</span>))}
        {Object.values(counts).every((v) => v === 0) && <span className="text-sm text-muted-foreground">Empty meadow…</span>}
      </div>
      <div className="mt-3 flex gap-2">
        <Btn tone="primary" onClick={() => { setChecked(true); if (balanced) { award(4); onHealth(12); } else onHealth(-2); }}>Check balance</Btn>
        {checked && balanced && <Btn onClick={onDone}>Next: ecosystem rescue <ArrowRight className="ml-1 inline h-4 w-4" /></Btn>}
      </div>
      {checked && (balanced ? (
        <Note ok text="Balanced! Producers feed insects, insects feed frogs and birds, predators keep those numbers in check, and decomposers recycle everything back to the soil." />
      ) : (
        <div className="mt-3 space-y-2">
          {warnings.map((w) => <Note key={w} ok={false} text={w} />)}
        </div>
      ))}
    </div>
  );
}

/* -------------------------- ecosystem rescue ----------------------- */
const CLUES: Record<string, string> = {
  observe: "🔍 Observe: leaves everywhere are chewed to the stem, and you see very few birds in the hedges.",
  web: "🕸️ Food web: caterpillars are eaten by birds and spiders — both of those are missing from this meadow.",
  graphs: "📊 Graphs: 🐛 insects way up, 🌱 plants sharply down, 🐦 birds down for two seasons in a row.",
  habitat: "🌱 Habitat: the hedgerow and wildflower strip where birds nested were cleared last year.",
};

const FIXES = [
  { id: "spray", label: "🧪 Spray everything to kill all insects", ok: false, why: "Removing every insect also removes pollinators and predator insects — the web collapses. The goal is not to eliminate organisms." },
  { id: "hedge", label: "🌱 Restore the hedgerow and wildflower strip", ok: true, why: "Habitat brings nesting birds and predator insects back, so caterpillar numbers come down naturally." },
  { id: "predators", label: "🐦🐸 Welcome back birds and frogs", ok: true, why: "Predators keep the plant-eating insects in check — balance instead of elimination." },
  { id: "removeplants", label: "🌾 Remove the remaining plants", ok: false, why: "Plants are the producers — removing them starves the whole web." },
  { id: "decomp", label: "🍄🪱 Protect decomposers and the topsoil", ok: true, why: "Healthy soil grows healthy plants, which support everything above them." },
];

function Rescue({ onDone, award, onHealth }: { onDone: () => void; award: (n: number) => void; onHealth: (d: number) => void }) {
  const [found, setFound] = useState<string[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const investigated = found.length >= 3;

  return (
    <div>
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">
        <div className="font-bold text-destructive">🚨 ECOSYSTEM RESCUE</div>
        <div className="text-foreground">🐛 Insects have increased dramatically · 🌱 Plants are decreasing · 🐦 Birds are decreasing</div>
        <div className="mt-1 text-xs text-muted-foreground">Your goal isn't to win by eliminating an organism. Your goal is to 🌎 RESTORE THE BALANCE.</div>
      </div>

      <p className="mb-2 mt-3 text-sm font-semibold text-foreground">Step 1 — Investigate (find at least 3 clues)</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {Object.entries(CLUES).map(([k, text]) => (
          <button
            key={k}
            onClick={() => setFound((f) => (f.includes(k) ? f : [...f, k]))}
            className={`rounded-xl border p-3 text-left text-xs ${found.includes(k) ? "border-success/40 bg-success/10 text-success" : "border-border bg-card hover:bg-muted"}`}
          >
            {found.includes(k) ? text : <span className="inline-flex items-center gap-1 font-medium text-foreground"><Search className="h-3.5 w-3.5" /> {k === "observe" ? "Observe the field" : k === "web" ? "Check the food web" : k === "graphs" ? "Look at population graphs" : "Inspect the habitat"}</span>}
          </button>
        ))}
      </div>

      {investigated && (
        <>
          <p className="mb-2 mt-4 text-sm font-semibold text-foreground">Step 2 — Choose your restoration actions (pick 3)</p>
          <div className="grid gap-2">
            {FIXES.map((f) => (
              <button
                key={f.id}
                disabled={!!msg}
                onClick={() => setPicked((p) => (p.includes(f.id) ? p.filter((x) => x !== f.id) : p.length < 3 ? [...p, f.id] : p))}
                className={`rounded-xl border px-4 py-3 text-left text-sm ${picked.includes(f.id) ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-muted"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <Btn
              tone="primary"
              disabled={picked.length < 3 || !!msg}
              onClick={() => {
                const good = picked.filter((id) => FIXES.find((f) => f.id === id)!.ok).length;
                const ok = good === 3;
                award(good * 2);
                onHealth(ok ? 20 : good * 4 - 8);
                setMsg({ ok, text: picked.map((id) => FIXES.find((f) => f.id === id)!.why).join(" ") });
                setTimeout(() => { setMsg(null); onDone(); }, 4200);
              }}
            >
              Restore the balance
            </Btn>
          </div>
        </>
      )}
      {msg && <Note ok={msg.ok} text={msg.text} />}
    </div>
  );
}

/* ------------------------------ shell ------------------------------ */
const PHASES = ["Pull the string", "Decomposers", "Build a balance", "Ecosystem rescue"];

export function PullTheString({ onAward, onClose }: { onAward: (n: number) => void; onClose?: () => void }) {
  const [phase, setPhase] = useState(0);
  const [health, setHealth] = useState(65);
  const bump = (d: number) => setHealth((h) => Math.max(0, Math.min(100, h + d)));
  const restart = () => { setPhase(0); setHealth(65); };

  return (
    <div>
      <HealthMeter health={health} />
      <div className="mb-3 flex flex-wrap gap-1 text-[11px]">
        {PHASES.map((p, i) => (
          <span key={p} className={`rounded-full px-2 py-1 ${i === phase ? "bg-primary text-primary-foreground" : i < phase ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
            {i + 1}. {p}
          </span>
        ))}
      </div>

      {phase === 0 && <PullTheStringLab onDone={() => setPhase(1)} award={onAward} onHealth={bump} />}
      {phase === 1 && <DecomposerCycle onDone={() => setPhase(2)} award={onAward} onHealth={bump} />}
      {phase === 2 && <Builder onDone={() => setPhase(3)} award={onAward} onHealth={bump} />}
      {phase === 3 && <Rescue onDone={() => setPhase(4)} award={onAward} onHealth={bump} />}
      {phase >= 4 && (
        <div className="rounded-2xl border border-success/40 bg-success/10 p-6 text-center">
          <div className="text-4xl">🕸️🌎</div>
          <h4 className="mt-2 text-xl font-bold text-foreground">
            {health >= 75 ? "Balance restored — a thriving ecosystem!" : health >= 45 ? "The ecosystem is recovering, but still stressed." : "The ecosystem is still unbalanced. Try again!"}
          </h4>
          <p className="mt-2 text-sm text-muted-foreground">
            You changed ONE organism — but look at how many others were affected. 🕸️ Everything is connected: plants provide food, insects eat plants and each other, birds and frogs and spiders eat insects, predators eat other animals, and decomposers recycle nutrients back to the soil.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Btn tone="primary" onClick={restart}><RefreshCcw className="mr-1 inline h-4 w-4" /> Play again</Btn>
            {onClose && <Btn onClick={onClose}>Return to games</Btn>}
          </div>
        </div>
      )}
    </div>
  );
}

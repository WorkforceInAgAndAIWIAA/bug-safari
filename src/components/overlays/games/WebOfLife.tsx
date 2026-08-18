import { useMemo, useState, type ReactNode } from "react";
import { ArrowRight, CheckCircle2, RefreshCcw, Sparkles, XCircle } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Web of Life — a story walk through food chains, webs and change.    */
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

export function HealthMeter({ health }: { health: number }) {
  const h = Math.max(0, Math.min(100, Math.round(health)));
  const band =
    h >= 90 ? { label: "Thriving ecosystem", cls: "border-success/50 bg-success/10 text-success" }
    : h >= 70 ? { label: "Healthy", cls: "border-success/40 bg-success/5 text-success" }
    : h >= 45 ? { label: "Stressed", cls: "border-primary/50 bg-primary/10 text-primary" }
    : h >= 20 ? { label: "Unbalanced", cls: "border-primary/60 bg-primary/20 text-primary" }
    : { label: "Ecosystem crisis", cls: "border-destructive/50 bg-destructive/10 text-destructive" };
  return (
    <div className={`mb-4 rounded-xl border p-3 ${band.cls}`}>
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide">
        <span>🌎 Ecosystem health</span>
        <span>{h}% — {band.label}</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-current/15">
        <div className="h-full rounded-full bg-current transition-all duration-500" style={{ width: `${h}%` }} />
      </div>
    </div>
  );
}

/* ------------------------------ data ------------------------------ */
interface Org { id: string; emoji: string; name: string; role: string; fact: string }

export const ORGANISMS: Org[] = [
  { id: "plant", emoji: "🌱", name: "Plants", role: "Producer", fact: "Plants make their own food from sunlight. Every food chain starts here." },
  { id: "flower", emoji: "🌸", name: "Flowers", role: "Producer", fact: "Flowers make nectar and pollen — food for bees and butterflies." },
  { id: "caterpillar", emoji: "🐛", name: "Caterpillars", role: "Plant eater", fact: "Caterpillars chew leaves, then grow up into moths and butterflies." },
  { id: "grasshopper", emoji: "🦗", name: "Grasshoppers", role: "Plant eater", fact: "Grasshoppers munch grasses and leaves with strong chewing jaws." },
  { id: "ladybug", emoji: "🐞", name: "Ladybugs", role: "Insect predator", fact: "One ladybug can eat dozens of aphids in a single day." },
  { id: "bee", emoji: "🐝", name: "Bees", role: "Pollinator", fact: "Bees move pollen between flowers so plants can make seeds and fruit." },
  { id: "spider", emoji: "🕷️", name: "Spiders", role: "Insect predator", fact: "Spiders trap and eat insects — they are not insects themselves (8 legs!)." },
  { id: "frog", emoji: "🐸", name: "Frogs", role: "Predator", fact: "Frogs snap up flying and hopping insects near damp places." },
  { id: "bird", emoji: "🐦", name: "Birds", role: "Predator", fact: "Many birds feed their chicks caterpillars — thousands in one nesting season." },
  { id: "heron", emoji: "🪶", name: "Herons", role: "Top predator", fact: "Herons wade in shallow water and hunt frogs and fish." },
  { id: "fox", emoji: "🦊", name: "Foxes", role: "Top predator", fact: "Foxes eat small animals and birds — they sit near the top of the web." },
  { id: "fungi", emoji: "🍄", name: "Fungi", role: "Decomposer", fact: "Fungi break down dead leaves and wood and return nutrients to the soil." },
  { id: "worm", emoji: "🪱", name: "Earthworms", role: "Decomposer", fact: "Earthworms shred dead leaves and mix nutrients into the topsoil." },
];
const byId = (id: string) => ORGANISMS.find((o) => o.id === id)!;

function Chip({ id, big }: { id: string; big?: boolean }) {
  const o = byId(id);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 font-medium ${big ? "text-base" : "text-xs"}`}>
      <span className={big ? "text-xl" : "text-base"}>{o.emoji}</span> {o.name}
    </span>
  );
}

/* --------------------------- Level 0 ------------------------------ */
function Explore({ onDone }: { onDone: () => void }) {
  const [sel, setSel] = useState<string | null>(null);
  const [seen, setSeen] = useState<string[]>([]);
  const o = sel ? byId(sel) : null;
  return (
    <div>
      <div className="rounded-2xl border border-success/30 bg-gradient-to-b from-success/10 via-card to-card p-4">
        <h4 className="text-base font-bold text-foreground">🌎 A healthy meadow at the edge of the forest</h4>
        <p className="mt-1 text-sm text-muted-foreground">Tap any living thing to learn what it does here. Explore at least 5 to begin the story.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ORGANISMS.map((org) => (
            <button
              key={org.id}
              onClick={() => { setSel(org.id); setSeen((s) => (s.includes(org.id) ? s : [...s, org.id])); }}
              className={`rounded-xl border px-3 py-2 text-center transition hover:-translate-y-0.5 ${sel === org.id ? "border-primary bg-primary/15" : seen.includes(org.id) ? "border-success/40 bg-success/5" : "border-border bg-card hover:bg-muted"}`}
            >
              <div className="text-3xl">{org.emoji}</div>
              <div className="text-[11px] font-medium text-foreground">{org.name}</div>
            </button>
          ))}
        </div>
      </div>
      {o && (
        <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm">
          <div className="font-semibold text-foreground">{o.emoji} {o.name} — <span className="text-primary">{o.role}</span></div>
          <p className="mt-1 text-muted-foreground">{o.fact}</p>
        </div>
      )}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{seen.length}/13 explored</span>
        <Btn tone="primary" disabled={seen.length < 5} onClick={onDone}>Start the story <ArrowRight className="ml-1 inline h-4 w-4" /></Btn>
      </div>
    </div>
  );
}

/* --------------------------- Level 1 ------------------------------ */
const CHAIN_STEPS = [
  { from: "plant", q: "Who gets energy from the plant?", answer: "caterpillar", options: ["caterpillar", "fox", "fungi"], why: "Caterpillars are plant eaters — they chew leaves for energy." },
  { from: "caterpillar", q: "Who might eat the caterpillar?", answer: "bird", options: ["bird", "flower", "worm"], why: "Birds hunt caterpillars to feed themselves and their chicks." },
  { from: "bird", q: "Who might eat the bird?", answer: "fox", options: ["fox", "bee", "grasshopper"], why: "Foxes are top predators — they hunt small animals and birds." },
];

function LevelChain({ onDone, award }: { onDone: () => void; award: (n: number) => void }) {
  const [step, setStep] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const built = ["plant", ...CHAIN_STEPS.slice(0, step).map((s) => s.answer)];
  const s = CHAIN_STEPS[step];

  if (!s)
    return (
      <div className="rounded-2xl border border-success/40 bg-success/10 p-5 text-center">
        <div className="text-3xl">🌱 → 🐛 → 🐦 → 🦊</div>
        <h4 className="mt-2 text-lg font-bold text-foreground">You built a food chain!</h4>
        <p className="mt-1 text-sm text-muted-foreground">Energy moves from the plant all the way to the fox. A food chain is one path through the ecosystem.</p>
        <Btn tone="primary" onClick={onDone}>Next: build the web <ArrowRight className="ml-1 inline h-4 w-4" /></Btn>
      </div>
    );

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/40 p-3">
        {built.map((id, i) => (
          <span key={id} className="flex items-center gap-2">
            {i > 0 && <ArrowRight className="h-4 w-4 text-primary" />}
            <Chip id={id} big />
          </span>
        ))}
      </div>
      <p className="mb-2 text-sm font-semibold text-foreground">{s.q}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {s.options.map((id) => (
          <button
            key={id}
            disabled={!!msg}
            onClick={() => {
              const ok = id === s.answer;
              if (ok) award(2);
              setMsg({ ok, text: ok ? s.why : `Not quite — ${byId(s.answer).name.toLowerCase()} fit here. ${s.why}` });
              setTimeout(() => { setMsg(null); setStep((n) => n + 1); }, 2000);
            }}
            className="rounded-xl border border-border bg-card p-4 text-center hover:bg-muted"
          >
            <div className="text-4xl">{byId(id).emoji}</div>
            <div className="mt-1 text-sm font-medium">{byId(id).name}</div>
          </button>
        ))}
      </div>
      {msg && <Note ok={msg.ok} text={msg.text} />}
    </div>
  );
}

/* --------------------------- Level 2 ------------------------------ */
const WEB_LINKS: { from: string; to: string; q: string; options: string[]; why: string }[] = [
  { from: "flower", to: "bee", q: "Who visits the flower for nectar?", options: ["bee", "fox", "worm"], why: "Bees drink nectar and carry pollen between flowers." },
  { from: "plant", to: "grasshopper", q: "Who else eats the plant?", options: ["grasshopper", "heron", "spider"], why: "Grasshoppers are plant eaters too — plants feed many species." },
  { from: "grasshopper", to: "frog", q: "Who eats the grasshopper?", options: ["frog", "bee", "flower"], why: "Frogs snap up hopping insects near damp ground." },
  { from: "ladybug", to: "bird", q: "Who might eat the ladybug?", options: ["bird", "plant", "fungi"], why: "Birds eat many kinds of insects, even predator insects." },
  { from: "frog", to: "heron", q: "Who eats the frog?", options: ["heron", "caterpillar", "bee"], why: "Herons wade in shallow water hunting frogs." },
  { from: "worm", to: "plant", q: "Earthworms and fungi break down dead leaves. Who benefits from the nutrients?", options: ["plant", "fox", "spider"], why: "Decomposers return nutrients to the soil so plants can grow. The web is a cycle!" },
];

function LevelWeb({ onDone, award }: { onDone: () => void; award: (n: number) => void }) {
  const [i, setI] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const link = WEB_LINKS[i];

  if (!link)
    return (
      <div className="rounded-2xl border border-success/40 bg-success/10 p-5 text-center">
        <div className="text-4xl">🕸️</div>
        <h4 className="mt-2 text-lg font-bold text-foreground">You built a FOOD WEB!</h4>
        <p className="mt-1 text-sm text-muted-foreground">A food web is made of many connected food chains. Most organisms are part of more than one chain.</p>
        <Btn tone="primary" onClick={onDone}>Next: something changed <ArrowRight className="ml-1 inline h-4 w-4" /></Btn>
      </div>
    );

  return (
    <div>
      <div className="mb-3 rounded-xl border border-border bg-muted/40 p-3">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">Connections made</div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {WEB_LINKS.slice(0, i).map((l) => (
            <span key={l.to + l.from} className="rounded-full bg-success/15 px-2 py-1 text-success">
              {byId(l.from).emoji} → {byId(l.to).emoji}
            </span>
          ))}
          {i === 0 && <span className="text-muted-foreground">None yet — start connecting.</span>}
        </div>
      </div>
      <p className="mb-2 text-sm font-semibold text-foreground">{byId(link.from).emoji} {byId(link.from).name}: {link.q}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {link.options.map((id) => (
          <button
            key={id}
            disabled={!!msg}
            onClick={() => {
              const ok = id === link.to;
              if (ok) award(2);
              setMsg({ ok, text: ok ? link.why : `The ${byId(link.to).name.toLowerCase()} belongs here. ${link.why}` });
              setTimeout(() => { setMsg(null); setI((n) => n + 1); }, 1900);
            }}
            className="rounded-xl border border-border bg-card p-4 text-center hover:bg-muted"
          >
            <div className="text-4xl">{byId(id).emoji}</div>
            <div className="mt-1 text-sm font-medium">{byId(id).name}</div>
          </button>
        ))}
      </div>
      {msg && <Note ok={msg.ok} text={msg.text} />}
    </div>
  );
}

/* ------------------------ Prediction levels ------------------------ */
interface Pred { headline: string; sub: string; q: string; options: string[]; answer: string; why: string }

const LEVEL3: Pred[] = [
  {
    headline: "🚨 ECOSYSTEM ALERT",
    sub: "The number of caterpillars has suddenly decreased.",
    q: "What could happen to birds that feed on caterpillars?",
    options: ["🐦 Increase", "🐦 Decrease", "🐦 Stay exactly the same"],
    answer: "🐦 Decrease",
    why: "Fewer caterpillars → less food for some birds → the bird population may decrease.",
  },
  {
    headline: "🌱 FOLLOW THE RIPPLE",
    sub: "Caterpillars are still low in the meadow.",
    q: "What might happen to the plants?",
    options: ["🌱 Increase", "🌱 Decrease", "🌱 Disappear"],
    answer: "🌱 Increase",
    why: "Fewer caterpillars → less leaf eating → the plant population may increase. One change travels through the whole web.",
  },
];

const LEVEL4: Pred[] = [
  {
    headline: "🐛🐛🐛 TOO MANY CATERPILLARS",
    sub: "A warm spring means caterpillars hatch everywhere.",
    q: "What happens to the plants first?",
    options: ["🌱 Plants decrease", "🌱 Plants increase", "🌱 Nothing changes"],
    answer: "🌱 Plants decrease",
    why: "More leaf eaters → more leaves eaten → the plant population drops (🌱 ↓, 🐛 ↑).",
  },
  {
    headline: "🐦 AND THE BIRDS?",
    sub: "Lots of caterpillars are crawling on every stem.",
    q: "What is likely to happen to birds at first?",
    options: ["🐦 Increase — lots of food", "🐦 Vanish", "🐦 Turn into predators of plants"],
    answer: "🐦 Increase — lots of food",
    why: "More food usually means more birds — though birds can also go down later if the plants run out. Populations change together.",
  },
  {
    headline: "🤔 THINK IT THROUGH",
    sub: "The class is arguing about insects.",
    q: "Is having more caterpillars always bad?",
    options: ["Not necessarily — it depends on balance", "Yes, insects are always bad", "Yes, remove every insect"],
    answer: "Not necessarily — it depends on balance",
    why: "An ecosystem isn't about having zero insects. It's about populations interacting and changing together.",
  },
];

const LEVEL5: Pred[] = [
  { headline: "🐞 Ladybug", sub: "\"I eat small insects such as aphids.\"", q: "What role does the ladybug play?", options: ["Insect predator", "Pollinator", "Decomposer"], answer: "Insect predator", why: "Ladybugs keep plant-sucking insects like aphids in check." },
  { headline: "🐝 Bee", sub: "\"I help pollinate flowers.\"", q: "What happens to flowering plants when bees are around?", options: ["They make more seeds and fruit", "They stop growing", "They become predators"], answer: "They make more seeds and fruit", why: "Pollinators move pollen so plants can reproduce." },
  { headline: "🦋 Butterfly & 🕷️ Spider", sub: "\"I visit flowers.\" / \"I eat insects.\"", q: "Which one helps control insect numbers?", options: ["🕷️ Spider", "🦋 Butterfly", "Neither"], answer: "🕷️ Spider", why: "Spiders are predators; butterflies mostly help with pollination." },
  { headline: "🐛 Caterpillar", sub: "\"I eat plants... and later I become a butterfly.\"", q: "So is the caterpillar helpful or harmful?", options: ["Both — depends on the part of the web", "Only harmful", "Only helpful"], answer: "Both — depends on the part of the web", why: "An insect can be helpful in one way and still affect another part of the ecosystem." },
];

const LEVEL6: Pred[] = [
  { headline: "🌧️ BIG STORM", sub: "Heavy rain changes the habitat.", q: "Which organisms are most affected right away?", options: ["Small insects washed off plants", "Foxes only", "Nothing is affected"], answer: "Small insects washed off plants", why: "Storms knock insects off plants and flood burrows; predators that rely on them feel it next." },
  { headline: "🔥 WILDFIRE", sub: "Part of the habitat is lost.", q: "What happens to organisms that depend on that habitat?", options: ["They must move, or their numbers fall", "They grow faster", "They become decomposers"], answer: "They must move, or their numbers fall", why: "Losing habitat removes food and shelter — the whole web shrinks until plants regrow." },
  { headline: "🌵 DROUGHT", sub: "Plants have less water.", q: "What happens to plant-eating insects, and then to their predators?", options: ["Both decrease", "Both increase", "Only predators increase"], answer: "Both decrease", why: "Fewer plants → fewer plant eaters → less food for birds, frogs and spiders." },
  { headline: "🐝 POLLINATOR DECLINE", sub: "There are fewer pollinators.", q: "What happens to flowering plants?", options: ["Fewer seeds and fruit", "More flowers than ever", "They turn into fungi"], answer: "Fewer seeds and fruit", why: "Without pollinators, many flowering plants can't reproduce well." },
  { headline: "🐦 NEW PREDATOR", sub: "A new predator enters the ecosystem.", q: "What might happen to its prey?", options: ["Prey numbers drop", "Prey numbers explode", "Nothing at all"], answer: "Prey numbers drop", why: "A new predator eats prey that had no defenses against it — the ripple reaches the whole web." },
  { headline: "🐛 INSECT POPULATION BOOM", sub: "One insect population increases dramatically.", q: "Follow it through the web — what is the most likely chain?", options: ["Plants ↓, then predators ↑", "Plants ↑, predators ↓", "Nothing changes anywhere"], answer: "Plants ↓, then predators ↑", why: "More plant eaters means fewer plants, and more food for the animals that eat those insects." },
];

function PredictRun({ items, title, onDone, award, onHealth }: { items: Pred[]; title: string; onDone: () => void; award: (n: number) => void; onHealth: (d: number) => void }) {
  const [i, setI] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const p = items[i];

  if (!p)
    return (
      <div className="rounded-2xl border border-success/40 bg-success/10 p-5 text-center">
        <Sparkles className="mx-auto h-8 w-8 text-success" />
        <h4 className="mt-2 text-lg font-bold text-foreground">{title} complete</h4>
        <p className="mt-1 text-sm text-muted-foreground">You changed ONE organism — but look at how many others were affected. 🕸️ Everything is connected.</p>
        <Btn tone="primary" onClick={onDone}>Continue <ArrowRight className="ml-1 inline h-4 w-4" /></Btn>
      </div>
    );

  return (
    <div>
      <div className="rounded-xl border border-primary/40 bg-primary/10 p-3">
        <div className="text-sm font-bold text-primary">{p.headline}</div>
        <div className="text-sm text-foreground">{p.sub}</div>
      </div>
      <p className="mb-2 mt-3 text-sm font-semibold text-foreground">{p.q}</p>
      <div className="grid gap-2">
        {p.options.map((o) => (
          <button
            key={o}
            disabled={!!msg}
            onClick={() => {
              const ok = o === p.answer;
              if (ok) award(2);
              onHealth(ok ? 4 : -4);
              setMsg({ ok, text: p.why });
              setTimeout(() => { setMsg(null); setI((n) => n + 1); }, 2400);
            }}
            className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm font-medium hover:bg-muted"
          >
            {o}
          </button>
        ))}
      </div>
      {msg && <Note ok={msg.ok} text={msg.text} />}
      <div className="mt-2 text-xs text-muted-foreground">Question {i + 1} of {items.length}</div>
    </div>
  );
}

/* ------------------------------ shell ----------------------------- */
const STAGES = ["Explore", "Who needs who?", "Build the web", "Something changed!", "Too many insects!", "Helpful insects", "Ecosystem events"];

export function WebOfLife({ onAward, onClose }: { onAward: (n: number) => void; onClose?: () => void }) {
  const [stage, setStage] = useState(0);
  const [health, setHealth] = useState(70);
  const bump = (d: number) => setHealth((h) => Math.max(0, Math.min(100, h + d)));
  const next = () => { bump(5); setStage((s) => s + 1); };
  const restart = () => { setStage(0); setHealth(70); };

  const body = useMemo(() => {
    switch (stage) {
      case 0: return <Explore onDone={next} />;
      case 1: return <LevelChain onDone={next} award={onAward} />;
      case 2: return <LevelWeb onDone={next} award={onAward} />;
      case 3: return <PredictRun items={LEVEL3} title="Something changed" onDone={next} award={onAward} onHealth={bump} />;
      case 4: return <PredictRun items={LEVEL4} title="Too many insects" onDone={next} award={onAward} onHealth={bump} />;
      case 5: return <PredictRun items={LEVEL5} title="Helpful insects" onDone={next} award={onAward} onHealth={bump} />;
      case 6: return <PredictRun items={LEVEL6} title="Ecosystem events" onDone={next} award={onAward} onHealth={bump} />;
      default:
        return (
          <div className="rounded-2xl border border-success/40 bg-success/10 p-6 text-center">
            <div className="text-4xl">🌎🕸️</div>
            <h4 className="mt-2 text-xl font-bold text-foreground">{health >= 70 ? "The meadow is thriving!" : health >= 45 ? "The meadow survived — but it is stressed." : "The meadow is unbalanced. Try the story again!"}</h4>
            <p className="mt-2 text-sm text-muted-foreground">
              Plants provide food. Insects eat plants and other insects. Birds, frogs and spiders eat insects. Predators eat other animals. Decomposers recycle nutrients. Every organism has a role.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Btn tone="primary" onClick={restart}><RefreshCcw className="mr-1 inline h-4 w-4" /> Play again</Btn>
              {onClose && <Btn onClick={onClose}>Return to games</Btn>}
            </div>
          </div>
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, health]);

  return (
    <div>
      <HealthMeter health={health} />
      <div className="mb-3 flex flex-wrap gap-1 text-[11px]">
        {STAGES.map((s, i) => (
          <span key={s} className={`rounded-full px-2 py-1 ${i === stage ? "bg-primary text-primary-foreground" : i < stage ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
            {i + 1}. {s}
          </span>
        ))}
      </div>
      {body}
    </div>
  );
}

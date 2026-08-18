import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, RefreshCcw, Shield, Sparkles, XCircle } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Insect Invasion: Save the Farm!                                     */
/* 7 levels + timed finale. Teaches how invasive insects spread,       */
/* damage crops, and ripple through the whole ecosystem.               */
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

const METER = [
  { label: "Healthy", dot: "🟢", cls: "bg-success/15 text-success border-success/40" },
  { label: "Watch closely", dot: "🟢", cls: "bg-success/10 text-success border-success/30" },
  { label: "Spreading", dot: "🟡", cls: "bg-primary/15 text-primary border-primary/40" },
  { label: "Serious threat", dot: "🟠", cls: "bg-primary/25 text-primary border-primary/60" },
  { label: "Ecosystem emergency!", dot: "🔴", cls: "bg-destructive/15 text-destructive border-destructive/50" },
];

function InvasionMeter({ level }: { level: number }) {
  const idx = Math.min(4, Math.max(0, level - 1));
  const m = METER[idx];
  return (
    <div className={`mb-4 rounded-xl border p-3 ${m.cls}`}>
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide">
        <span>Invasion level</span>
        <span>{m.dot} {level} — {m.label}</span>
      </div>
      <div className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className={`h-2 flex-1 rounded-full ${n <= level ? "bg-current opacity-80" : "bg-current opacity-15"}`} />
        ))}
      </div>
    </div>
  );
}

/* ---------------------------- Level 1 ---------------------------- */
const ECO = [
  { emoji: "🌽", name: "Corn", role: "I provide food for people and animals." },
  { emoji: "🌻", name: "Flowers", role: "I feed pollinators with nectar and pollen." },
  { emoji: "🐝", name: "Bee", role: "I help pollinate plants so they make seeds and fruit." },
  { emoji: "🐞", name: "Ladybug", role: "I eat aphids and keep pest numbers down." },
  { emoji: "🦋", name: "Butterfly", role: "I pollinate flowers and my caterpillars feed birds." },
  { emoji: "🐦", name: "Bird", role: "I eat insects and help keep populations balanced." },
  { emoji: "🌱", name: "Native plants", role: "I give food and shelter to native insects and animals." },
  { emoji: "🪱", name: "Soil organisms", role: "I recycle dead leaves into healthy topsoil." },
];

function Level1({ next }: { next: () => void }) {
  const [seen, setSeen] = useState<string[]>([]);
  const [open, setOpen] = useState<typeof ECO[number] | null>(null);
  return (
    <div>
      <h4 className="text-base font-bold text-foreground">🌎 Level 1 — Meet the ecosystem</h4>
      <p className="mb-3 text-sm text-muted-foreground">The farm is balanced. Tap each member of the team to learn its job. ({seen.length}/{ECO.length} met)</p>
      <div className="grid grid-cols-4 gap-2 rounded-xl border border-success/30 bg-success/5 p-3">
        {ECO.map((e) => (
          <button
            key={e.name}
            onClick={() => { setOpen(e); setSeen((s) => (s.includes(e.name) ? s : [...s, e.name])); }}
            className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-center transition hover:bg-muted ${seen.includes(e.name) ? "border-success/50 bg-success/10" : "border-border bg-card"}`}
          >
            <span className="text-3xl">{e.emoji}</span>
            <span className="text-[10px] font-semibold leading-tight">{e.name}</span>
          </button>
        ))}
      </div>
      {open && (
        <div className="mt-3 rounded-lg border border-border bg-card p-3 text-sm">
          <span className="mr-2 text-2xl align-middle">{open.emoji}</span>
          <strong>{open.name}:</strong> <em>“{open.role}”</em>
        </div>
      )}
      <p className="mt-3 text-xs text-muted-foreground">An ecosystem is like a team — every member has a role.</p>
      <div className="mt-4 text-right">
        <Btn tone="primary" disabled={seen.length < ECO.length} onClick={next}>
          {seen.length < ECO.length ? `Meet ${ECO.length - seen.length} more` : "Continue →"}
        </Btn>
      </div>
    </div>
  );
}

/* ---------------------------- Level 2 ---------------------------- */
function Level2({ next }: { next: () => void }) {
  const traits = [
    "Reproduces very quickly",
    "Eats lots of plants",
    "Has few natural predators here",
    "Can spread to new areas",
  ];
  return (
    <div>
      <div className="animate-pulse rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        <div className="flex items-center gap-2 font-bold"><AlertTriangle className="h-5 w-5" /> 🚨 INVASIVE INSECT DETECTED!</div>
        <p className="mt-1 text-sm">A new insect has appeared near the farm. It isn't normally found here.</p>
      </div>
      <div className="mt-4 rounded-xl border border-border bg-card p-4 text-center">
        <div className="text-5xl">🐛</div>
        <div className="mt-1 text-lg font-bold text-foreground">The Super Bug</div>
        <ul className="mx-auto mt-3 max-w-sm space-y-1 text-left text-sm text-muted-foreground">
          {traits.map((t) => <li key={t}>• {t}</li>)}
        </ul>
      </div>
      <div className="mt-4 text-right"><Btn tone="primary" onClick={next}>Start the search →</Btn></div>
    </div>
  );
}

/* ---------------------------- Level 3 ---------------------------- */
const PLACES = ["🚜 Farm field", "🌲 Forest edge", "🌷 Garden", "🏞️ River bank", "🏡 Neighboring farm"];
const EVENTS = [
  { emoji: "🌬️", title: "Strong winds", text: "The insects have spread to a nearby field!", spread: 1 },
  { emoji: "🚚", title: "Farm equipment moves", text: "The insects may have traveled to another field.", spread: 1 },
  { emoji: "🐦", title: "Hungry birds arrive", text: "Some insects were eaten!", spread: -1 },
  { emoji: "🌧️", title: "Heavy rain", text: "The insect population changed.", spread: 0 },
  { emoji: "🚜", title: "Early detection", text: "A farmer spotted the infestation before it spread!", spread: -1 },
];

function Level3({ next, bump, addScore }: { next: () => void; bump: (n: number) => void; addScore: (n: number) => void }) {
  const [hidden] = useState(() => Math.floor(Math.random() * PLACES.length));
  const [checked, setChecked] = useState<number[]>([]);
  const [bugs, setBugs] = useState(1);
  const [found, setFound] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [event, setEvent] = useState<typeof EVENTS[number] | null>(null);

  const investigate = (i: number) => {
    if (found || checked.includes(i)) return;
    setChecked((c) => [...c, i]);
    if (i === hidden) {
      setFound(true);
      setMsg("You found the outbreak! Finding an invasive insect early makes it much easier to manage.");
      bump(-1);
      addScore(2);
    } else {
      setMsg("Nothing here — and while you searched, the insects multiplied.");
      const ev = EVENTS[Math.floor(Math.random() * EVENTS.length)];
      setEvent(ev);
      setBugs((b) => Math.min(12, Math.max(1, b * 2 + ev.spread)));
      bump(1);
    }
  };

  return (
    <div>
      <h4 className="text-base font-bold text-foreground">🗺️ Level 3 — Stop the spread</h4>
      <p className="mb-3 text-sm text-muted-foreground">Choose where to investigate. Every miss gives the insects time to multiply.</p>
      <div className="mb-3 rounded-xl border border-border bg-muted/40 p-3 text-center">
        <div className="text-2xl leading-relaxed">{"🐛".repeat(bugs)}</div>
        <div className="mt-1 text-xs text-muted-foreground">Population: about {bugs * 100} insects</div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {PLACES.map((p, i) => (
          <button
            key={p}
            onClick={() => investigate(i)}
            disabled={found || checked.includes(i)}
            className={`rounded-lg border p-3 text-left text-sm transition disabled:opacity-60 ${
              found && i === hidden ? "border-success bg-success/15" : checked.includes(i) ? "border-border bg-muted" : "border-border bg-card hover:bg-muted"
            }`}
          >
            {p} {checked.includes(i) && (i === hidden ? "🔎 found!" : "— clear")}
          </button>
        ))}
      </div>
      {event && !found && (
        <div className="mt-3 rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm text-primary">
          <strong>🎲 Event card — {event.emoji} {event.title}:</strong> {event.text}
        </div>
      )}
      {msg && <Note ok={found} text={msg} />}
      {found && <div className="mt-4 text-right"><Btn tone="primary" onClick={next}>See the damage →</Btn></div>}
    </div>
  );
}

/* ---------------------------- Level 4 ---------------------------- */
const DAMAGE_OPTS = [
  { text: "Crops are being damaged.", ok: true },
  { text: "Native plants are declining.", ok: true },
  { text: "Helpful insects are losing food and habitat.", ok: true },
  { text: "The ecosystem is becoming less balanced.", ok: true },
  { text: "Every insect on the farm is harmful now.", ok: false },
  { text: "The farm got bigger.", ok: false },
];

function Level4({ next, addScore, bump }: { next: () => void; addScore: (n: number) => void; bump: (n: number) => void }) {
  const [picked, setPicked] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const opts = useMemo(() => [...DAMAGE_OPTS].sort(() => Math.random() - 0.5), []);
  const right = picked.filter((p) => DAMAGE_OPTS.find((o) => o.text === p)?.ok).length;
  const wrong = picked.length - right;

  return (
    <div>
      <h4 className="text-base font-bold text-foreground">🌽 Level 4 — What is being damaged?</h4>
      <p className="mb-3 text-sm text-muted-foreground">Compare the farm before and after. Choose everything that changed.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-success/40 bg-success/5 p-3">
          <div className="text-xs font-semibold uppercase text-success">Before</div>
          <div className="mt-1 text-2xl leading-relaxed">🌽🌽🌽🌽🌽<br />🌻🌻🌻<br />🐝🐝<br />🐞🐞<br />🦋🦋</div>
        </div>
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-3">
          <div className="text-xs font-semibold uppercase text-destructive">After the invasion</div>
          <div className="mt-1 text-2xl leading-relaxed">🌽🌽🌱🌱<br />🌻🌱<br />🐝<br />🐞<br />🦋</div>
        </div>
      </div>
      <div className="mt-3 grid gap-2">
        {opts.map((o) => {
          const sel = picked.includes(o.text);
          return (
            <button
              key={o.text}
              disabled={done}
              onClick={() => setPicked((p) => (sel ? p.filter((x) => x !== o.text) : [...p, o.text]))}
              className={`rounded-lg border p-2 text-left text-sm transition ${
                done ? (o.ok ? "border-success bg-success/10" : sel ? "border-destructive bg-destructive/10" : "border-border bg-card opacity-60")
                     : sel ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-muted"
              }`}
            >
              {sel ? "☑" : "☐"} {o.text}
            </button>
          );
        })}
      </div>
      {done && <Note ok={right >= 3 && wrong === 0} text={`You spotted ${right} of 4 real changes${wrong ? ` and ${wrong} that weren't true` : ""}. Remember: most insects here are helpers — only the invader is causing the problem.`} />}
      <div className="mt-4 text-right">
        {done ? <Btn tone="primary" onClick={next}>Investigate the clues →</Btn> : (
          <Btn tone="primary" disabled={picked.length === 0} onClick={() => { setDone(true); const r = picked.filter((p) => DAMAGE_OPTS.find((o) => o.text === p)?.ok).length; addScore(r); bump(r >= 3 ? -1 : 1); }}>
            Report findings
          </Btn>
        )}
      </div>
    </div>
  );
}

/* ---------------------------- Level 5 ---------------------------- */
const CLUES = [
  "I wasn't originally found in this ecosystem.",
  "I reproduce quickly.",
  "I don't have many natural predators here.",
  "I am damaging plants.",
];

function Level5({ next, addScore, bump }: { next: () => void; addScore: (n: number) => void; bump: (n: number) => void }) {
  const [shown, setShown] = useState(1);
  const [pick, setPick] = useState<string | null>(null);
  const answer = "Invasive insect";
  return (
    <div>
      <h4 className="text-base font-bold text-foreground">🔎 Level 5 — Be an insect detective</h4>
      <p className="mb-3 text-sm text-muted-foreground">Read the clues, then decide what kind of insect this is.</p>
      <div className="space-y-2">
        {CLUES.slice(0, shown).map((c, i) => (
          <div key={c} className="rounded-lg border border-border bg-card p-3 text-sm"><strong>CLUE #{i + 1}</strong> — “{c}”</div>
        ))}
      </div>
      {shown < CLUES.length && !pick && <div className="mt-3"><Btn onClick={() => setShown((s) => s + 1)}>Next clue</Btn></div>}
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {["Native insect", "Beneficial insect", "Invasive insect"].map((o) => (
          <button
            key={o}
            disabled={!!pick}
            onClick={() => { setPick(o); const ok = o === answer; addScore(ok ? 3 : 0); bump(ok ? -1 : 1); }}
            className={`rounded-lg border p-3 text-sm font-semibold transition ${
              pick ? (o === answer ? "border-success bg-success/15 text-success" : o === pick ? "border-destructive bg-destructive/10 text-destructive" : "border-border bg-card opacity-60")
                   : "border-border bg-card hover:bg-muted"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
      {pick && <Note ok={pick === answer} text={pick === answer ? "🎉 INVASIVE INSECT! New to the area, breeds fast, few predators, and damaging plants." : "Not quite — native and beneficial insects belong here and have natural predators. This one is invasive."} />}
      {pick && <div className="mt-4 text-right"><Btn tone="primary" onClick={next}>See the domino effect →</Btn></div>}
    </div>
  );
}

/* ---------------------------- Level 6 ---------------------------- */
const DOMINOES = [
  "🐛 Invasive insect eats native plants",
  "🌱 Fewer native plants",
  "🐝 Less food for pollinators",
  "🐦 Fewer insects available for birds",
  "🌎 The whole ecosystem changes",
];

function Level6({ next, addScore, bump }: { next: () => void; addScore: (n: number) => void; bump: (n: number) => void }) {
  const [order, setOrder] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const pool = useMemo(() => [...DOMINOES].sort(() => Math.random() - 0.5), []);
  const correct = order.every((o, i) => o === DOMINOES[i]) && order.length === DOMINOES.length;
  return (
    <div>
      <h4 className="text-base font-bold text-foreground">🐦 Level 6 — The domino effect</h4>
      <p className="mb-3 text-sm text-muted-foreground">Tap the steps in order to show how one change ripples through the ecosystem.</p>
      <div className="grid gap-2">
        {pool.map((d) => (
          <button
            key={d}
            disabled={done || order.includes(d)}
            onClick={() => setOrder((o) => [...o, d])}
            className="rounded-lg border border-border bg-card p-2 text-left text-sm hover:bg-muted disabled:opacity-40"
          >
            {d}
          </button>
        ))}
      </div>
      <div className="mt-3 rounded-xl border border-border bg-muted/40 p-3">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">Your chain</div>
        {order.length === 0 ? <div className="text-sm text-muted-foreground">Nothing placed yet.</div> : order.map((o, i) => (
          <div key={o} className={`text-sm ${done ? (o === DOMINOES[i] ? "text-success" : "text-destructive") : ""}`}>{i + 1}. {o}</div>
        ))}
      </div>
      {done && <Note ok={correct} text={correct ? "Exactly! An invasive insect doesn't just affect one plant — it can affect an entire ecosystem." : `The real chain is: ${DOMINOES.join(" → ")}`} />}
      <div className="mt-4 flex justify-end gap-2">
        {!done && <Btn onClick={() => setOrder([])}><RefreshCcw className="mr-1 inline h-3 w-3" />Clear</Btn>}
        {done ? <Btn tone="primary" onClick={next}>Build your defense →</Btn> : (
          <Btn tone="primary" disabled={order.length < DOMINOES.length} onClick={() => { setDone(true); const r = order.filter((o, i) => o === DOMINOES[i]).length; addScore(r); bump(r === DOMINOES.length ? -1 : 1); }}>Check chain</Btn>
        )}
      </div>
    </div>
  );
}

/* ---------------------------- Level 7 ---------------------------- */
const TOOLS = [
  { emoji: "🔍", name: "Monitor the fields", good: true, text: "Great choice! You discovered the invasive insect early, when it is easiest to manage." },
  { emoji: "🚧", name: "Prevent spread", good: true, text: "Smart! Cleaning equipment and limiting movement keeps the insect from reaching new fields." },
  { emoji: "🧤", name: "Remove affected plants", good: true, text: "Good work — removing infested plants takes away the invader's food and shelter." },
  { emoji: "🐞", name: "Protect beneficial insects", good: true, text: "Yes! Ladybugs, bees, and birds are your allies. Protecting them protects the balance." },
  { emoji: "📚", name: "Learn to identify the pest", good: true, text: "Knowing exactly what you're looking at prevents harming helpful insects by mistake." },
  { emoji: "📞", name: "Report the suspected invasive", good: true, text: "Reporting brings in experts who can track and stop the invasion regionally." },
  { emoji: "😴", name: "Ignore the insects", good: false, text: "Uh-oh! The population grew and spread to another field." },
  { emoji: "💥", name: "Remove every insect on the farm", good: false, text: "Careful! That wipes out pollinators and predators too — the ecosystem gets less balanced." },
];

function Level7({ next, addScore, bump }: { next: () => void; addScore: (n: number) => void; bump: (n: number) => void }) {
  const [used, setUsed] = useState<string[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const goodPicked = used.filter((u) => TOOLS.find((t) => t.name === u)?.good).length;
  return (
    <div>
      <h4 className="text-base font-bold text-foreground">🎮 Level 7 — Build your defense</h4>
      <p className="mb-3 text-sm text-muted-foreground">Pick 4 strategies from your toolbox. ({used.length}/4 used)</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {TOOLS.map((t) => (
          <button
            key={t.name}
            disabled={used.includes(t.name) || used.length >= 4}
            onClick={() => { setUsed((u) => [...u, t.name]); setMsg({ ok: t.good, text: t.text }); addScore(t.good ? 1 : 0); bump(t.good ? -1 : 1); }}
            className="rounded-lg border border-border bg-card p-3 text-left text-sm hover:bg-muted disabled:opacity-40"
          >
            <span className="mr-1 text-lg">{t.emoji}</span> {t.name}
          </button>
        ))}
      </div>
      {msg && <Note ok={msg.ok} text={msg.text} />}
      {used.length >= 4 && (
        <div className="mt-4 text-right">
          <Btn tone="primary" onClick={next}>Final mission: {goodPicked}/4 smart choices →</Btn>
        </div>
      )}
    </div>
  );
}

/* ------------------------- Final level ---------------------------- */
const MISSIONS = [
  { id: "find", label: "🔎 Find the insect", q: "Where should you scout first for a brand-new invasive insect?", options: ["Field edges and new plantings where it was first seen", "The middle of a healthy field far away", "Inside the barn"], answer: 0 },
  { id: "id", label: "🐛 Identify it", q: "Which set of traits means an insect is invasive?", options: ["Native, slow-breeding, many predators", "New to the area, breeds fast, few predators, damages plants", "Colorful and large"], answer: 1 },
  { id: "crops", label: "🌽 Locate affected crops", q: "What shows the invader has reached a field?", options: ["Chewed, wilting plants and bare patches spreading outward", "Bees visiting flowers", "Worms in the soil"], answer: 0 },
  { id: "stop", label: "🚧 Stop its spread", q: "What best stops it from reaching the neighboring farm?", options: ["Move equipment and plants between fields freely", "Clean equipment and quarantine infested plants", "Do nothing and wait"], answer: 1 },
  { id: "protect", label: "🐞 Protect beneficial insects", q: "How do you protect helpers while managing the invader?", options: ["Target only the invasive pest and keep flowers for pollinators", "Remove every insect you can find", "Mow all the flowers"], answer: 0 },
  { id: "restore", label: "🌱 Restore the ecosystem", q: "What helps the farm recover afterwards?", options: ["Replant native plants and keep monitoring", "Pave the field", "Stop scouting forever"], answer: 0 },
];

function FinalLevel({ finish, addScore, bump }: { finish: (stars: number) => void; addScore: (n: number) => void; bump: (n: number) => void }) {
  const [time, setTime] = useState(300);
  const [idx, setIdx] = useState(0);
  const [right, setRight] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (idx >= MISSIONS.length) return;
    const t = setInterval(() => setTime((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [idx]);

  useEffect(() => {
    if (time === 0) finishNow(right);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time]);

  const finishNow = (r: number) => {
    const stars = r >= 6 ? 5 : r >= 5 ? 4 : r >= 4 ? 3 : r >= 2 ? 2 : 1;
    finish(stars);
  };

  const m = MISSIONS[idx];
  const mm = String(Math.floor(time / 60)).padStart(1, "0");
  const ss = String(time % 60).padStart(2, "0");

  if (!m) return null;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between rounded-xl border border-primary/40 bg-primary/10 p-3">
        <div className="text-sm font-bold text-primary">🏆 Final mission — Save the ecosystem</div>
        <div className={`font-mono text-lg font-bold ${time < 60 ? "text-destructive" : "text-primary"}`}>⏱ {mm}:{ss}</div>
      </div>
      <div className="mb-3 flex flex-wrap gap-1 text-[11px]">
        {MISSIONS.map((x, i) => (
          <span key={x.id} className={`rounded-full border px-2 py-0.5 ${i < idx ? "border-success/50 bg-success/10 text-success" : i === idx ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>{x.label}</span>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-sm font-semibold text-foreground">{m.q}</div>
        <div className="mt-3 grid gap-2">
          {m.options.map((o, i) => (
            <button
              key={o}
              disabled={!!msg}
              onClick={() => {
                const ok = i === m.answer;
                setMsg({ ok, text: ok ? "Correct — mission complete!" : `The best answer was: ${m.options[m.answer]}` });
                if (ok) { setRight((r) => r + 1); addScore(2); bump(-1); } else bump(1);
              }}
              className="rounded-lg border border-border bg-background p-3 text-left text-sm hover:bg-muted disabled:opacity-70"
            >
              {o}
            </button>
          ))}
        </div>
      </div>
      {msg && <Note ok={msg.ok} text={msg.text} />}
      {msg && (
        <div className="mt-4 text-right">
          <Btn tone="primary" onClick={() => {
            const nextIdx = idx + 1;
            setMsg(null);
            if (nextIdx >= MISSIONS.length) finishNow(right);
            else setIdx(nextIdx);
          }}>
            {idx + 1 >= MISSIONS.length ? "Finish mission" : "Next mission"} <ArrowRight className="ml-1 inline h-3 w-3" />
          </Btn>
        </div>
      )}
    </div>
  );
}

const RANKS = ["Bug Rookie", "Insect Investigator", "Junior Bug Detective", "Farm Defender", "Ecosystem Protector"];

/* ---------------------------- Shell ------------------------------- */
export function InsectInvasion({ onAward, onClose }: { onAward: (n: number) => void; onClose?: () => void }) {
  const [stage, setStage] = useState(0); // 0 = briefing, 1..7 levels, 8 final, 9 results
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);

  const bump = (n: number) => setLevel((l) => Math.min(5, Math.max(1, l + n)));
  const addScore = (n: number) => { if (n > 0) { setScore((s) => s + n); onAward(n); } };
  const next = () => setStage((s) => s + 1);

  const restart = () => { setStage(0); setLevel(1); setScore(0); setStars(0); };

  return (
    <div>
      {stage > 0 && stage < 9 && <InvasionMeter level={level} />}

      {stage === 0 && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5 text-center">
          <div className="text-4xl">🚨</div>
          <h4 className="mt-2 text-lg font-bold text-destructive">FARM ALERT!</h4>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            A new insect has been found near the farm. It isn't normally found here, and it has very few natural enemies.
            Your mission: stop the invasion before it damages the farm and the ecosystem.
          </p>
          <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground">
            Remember — your job isn't to get rid of every bug. Bees, ladybugs, butterflies and beetles are valuable. Your goal is to
            <strong> protect the balance of the ecosystem.</strong>
          </p>
          <div className="mt-4"><Btn tone="primary" onClick={next}><Shield className="mr-1 inline h-4 w-4" />Accept the mission</Btn></div>
        </div>
      )}

      {stage === 1 && <Level1 next={next} />}
      {stage === 2 && <Level2 next={() => { bump(1); next(); }} />}
      {stage === 3 && <Level3 next={next} bump={bump} addScore={addScore} />}
      {stage === 4 && <Level4 next={next} addScore={addScore} bump={bump} />}
      {stage === 5 && <Level5 next={next} addScore={addScore} bump={bump} />}
      {stage === 6 && <Level6 next={next} addScore={addScore} bump={bump} />}
      {stage === 7 && <Level7 next={next} addScore={addScore} bump={bump} />}
      {stage === 8 && <FinalLevel addScore={addScore} bump={bump} finish={(s) => { setStars(s); setStage(9); }} />}

      {stage === 9 && (
        <div className={`rounded-xl border p-6 text-center ${stars >= 4 ? "border-success/50 bg-success/10" : "border-primary/40 bg-primary/10"}`}>
          <div className="text-4xl">{stars >= 4 ? "🌟🚜" : "🐛🌽"}</div>
          <div className="mt-2 text-2xl">{"⭐".repeat(stars)}</div>
          <h4 className="mt-1 text-xl font-bold text-foreground">{RANKS[stars - 1] ?? RANKS[0]}</h4>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {stars >= 4
              ? "You found the invader early, protected the beneficial insects, and kept the food web connected. The farm is balanced again!"
              : "The invasion spread further than it had to — but you learned how it happens. Early scouting is the strongest tool a farmer has."}
          </p>
          <p className="mx-auto mt-2 max-w-md text-xs font-medium text-foreground">
            “An invasive insect doesn't just affect one plant. It can affect an entire ecosystem.”
          </p>
          <div className="mt-2 text-sm text-muted-foreground"><Sparkles className="mr-1 inline h-4 w-4 text-primary" />{score} points earned</div>
          <div className="mt-4 flex justify-center gap-2">
            <Btn tone="primary" onClick={restart}>Play again</Btn>
            {onClose && <Btn onClick={onClose}>Return to games</Btn>}
          </div>
        </div>
      )}
    </div>
  );
}

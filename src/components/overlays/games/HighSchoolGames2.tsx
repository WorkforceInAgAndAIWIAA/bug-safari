import { useMemo, useState } from "react";
import { Dices, DollarSign, Search, Eye, Bug, CloudSun, Notebook } from "lucide-react";
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

function Banner({
  kicker,
  title,
  sub,
  tone = "primary",
}: {
  kicker: string;
  title: string;
  sub: string;
  tone?: "primary" | "accent" | "destructive";
}) {
  const tones: Record<string, string> = {
    primary: "border-primary/40 bg-primary/10",
    accent: "border-accent/40 bg-accent/10",
    destructive: "border-destructive/40 bg-destructive/10",
  };
  return (
    <div className={`rounded-xl border ${tones[tone]} px-4 py-3`}>
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{kicker}</div>
      <div className="font-display text-xl font-extrabold text-foreground">{title}</div>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

/* ============================================================== 1. MOLT & MOVE
   Theme: "The Instar Rally" — a two-lane development rally.
   Phase 1: reconstruct both developmental sequences from one shuffled pool.
   Phase 2: roll a die, SPLIT the pips between movement and stored energy,
            and pay the metabolic cost of every molt gate. Limited turns.
   ============================================================================ */

const COMPLETE_ORDER = [
  "Egg",
  "1st instar larva",
  "3rd instar larva",
  "Prepupa",
  "Pupa",
  "Adult (holometabolous)",
];
const INCOMPLETE_ORDER = [
  "Egg",
  "1st instar nymph",
  "3rd instar nymph",
  "5th instar nymph (wing pads)",
  "Adult (hemimetabolous)",
];

/** metabolic cost of the molt entering stage index i (0 = no gate) */
const COMPLETE_GATES = [0, 1, 2, 2, 3, 3];
const INCOMPLETE_GATES = [0, 1, 2, 2, 3];

const TURN_LIMIT = 12;

export function MetamorphosisRace({ add, onFinish }: GameProps) {
  const [pool, setPool] = useState<string[]>(() => shuffle([...COMPLETE_ORDER, ...INCOMPLETE_ORDER]));
  const [builtC, setBuiltC] = useState<string[]>([]);
  const [builtI, setBuiltI] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [misfiles, setMisfiles] = useState(0);
  const [placed, setPlaced] = useState(0);

  const [phase, setPhase] = useState<"order" | "race">("order");
  const [turn, setTurn] = useState(1);
  const [die, setDie] = useState<number | null>(null);
  const [pips, setPips] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [posC, setPosC] = useState(0);
  const [posI, setPosI] = useState(0);
  const [gatesPaid, setGatesPaid] = useState(0);
  const [log, setLog] = useState<string[]>(["Rebuild both development sequences before the rally can start."]);

  const orderingDone = builtC.length === COMPLETE_ORDER.length && builtI.length === INCOMPLETE_ORDER.length;
  const doneC = posC >= COMPLETE_ORDER.length - 1;
  const doneI = posI >= INCOMPLETE_ORDER.length - 1;
  const raceWon = doneC && doneI;
  const outOfTurns = turn > TURN_LIMIT && pips === 0;

  function place(track: "C" | "I") {
    if (!selected) return;
    const target = track === "C" ? COMPLETE_ORDER : INCOMPLETE_ORDER;
    const built = track === "C" ? builtC : builtI;
    const expected = target[built.length];
    if (selected === expected) {
      if (track === "C") setBuiltC((b) => [...b, selected]);
      else setBuiltI((b) => [...b, selected]);
      setPool((p) => p.filter((x) => x !== selected));
      setPlaced((n) => n + 1);
      add(4);
      setLog((l) => [`Filed "${selected}" correctly.`, ...l]);
    } else {
      setMisfiles((m) => m + 1);
      setLog((l) => [`"${selected}" does not come next on that lane — check what has to molt first.`, ...l]);
    }
    setSelected(null);
  }

  function startRace() {
    setPhase("race");
    setLog((l) => ["Rally start. Roll, then split the pips between moving and banking energy.", ...l]);
  }

  function roll() {
    if (pips > 0 || raceWon || outOfTurns) return;
    const n = 1 + Math.floor(Math.random() * 6);
    setDie(n);
    setPips(n);
    setLog((l) => [`Turn ${turn}: rolled ${n}. Allocate ${n} pips.`, ...l]);
  }

  function endTurnIfSpent(remaining: number) {
    if (remaining === 0) setTurn((t) => t + 1);
  }

  function bank() {
    if (pips <= 0) return;
    setEnergy((e) => e + 1);
    setPips((p) => {
      endTurnIfSpent(p - 1);
      return p - 1;
    });
  }

  function move(track: "C" | "I") {
    if (pips <= 0) return;
    const gates = track === "C" ? COMPLETE_GATES : INCOMPLETE_GATES;
    const len = track === "C" ? COMPLETE_ORDER.length : INCOMPLETE_ORDER.length;
    const pos = track === "C" ? posC : posI;
    if (pos >= len - 1) return;
    const cost = gates[pos + 1];
    if (energy < cost) {
      setLog((l) => [
        `Molt into "${(track === "C" ? COMPLETE_ORDER : INCOMPLETE_ORDER)[pos + 1]}" needs ${cost} energy — you have ${energy}. Bank pips first.`,
        ...l,
      ]);
      return;
    }
    setEnergy((e) => e - cost);
    setGatesPaid((g) => g + 1);
    add(6);
    if (track === "C") setPosC(pos + 1);
    else setPosI(pos + 1);
    setLog((l) => [
      `${track === "C" ? "Complete" : "Incomplete"} lane molted into "${(track === "C" ? COMPLETE_ORDER : INCOMPLETE_ORDER)[pos + 1]}" (−${cost} energy).`,
      ...l,
    ]);
    setPips((p) => {
      endTurnIfSpent(p - 1);
      return p - 1;
    });
  }

  function finish() {
    const turnsLeft = Math.max(0, TURN_LIMIT - (turn - 1));
    const score = placed * 4 + gatesPaid * 6 + (raceWon ? turnsLeft * 5 : 0) - misfiles * 2;
    const totalSteps = COMPLETE_ORDER.length + INCOMPLETE_ORDER.length;
    onFinish({
      score: Math.max(0, score),
      correct: placed + gatesPaid - misfiles,
      total: totalSteps + COMPLETE_GATES.length - 1 + INCOMPLETE_GATES.length - 1,
      message: raceWon
        ? "The complete-metamorphosis lane is longer and its molts cost more energy — the pupal rebuild is the most expensive step in an insect's life. That energy has to be banked by feeding first."
        : "You ran out of turns. Molting is metabolically expensive: an insect that cannot bank enough energy stalls in its current instar, which is exactly why poor hosts slow pest development.",
    });
  }

  const Lane = ({
    name,
    order,
    gates,
    pos,
    track,
  }: {
    name: string;
    order: string[];
    gates: number[];
    pos: number;
    track: "C" | "I";
  }) => (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-foreground">{name}</div>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
          {pos + 1}/{order.length}
        </span>
      </div>
      <ol className="mt-2 space-y-1">
        {order.map((s, i) => (
          <li
            key={`${name}-${s}`}
            className={`flex items-center justify-between gap-2 rounded-md border px-2 py-1 text-xs ${
              i === pos
                ? "border-primary bg-primary/10 font-semibold text-foreground"
                : "border-border bg-background text-muted-foreground"
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="w-4 text-center">{i === pos ? "🐛" : "·"}</span>
              {s}
            </span>
            {gates[i] > 0 && i > pos && (
              <span className="shrink-0 rounded-full bg-destructive/10 px-1.5 text-[10px] font-bold text-destructive">
                molt ⚡{gates[i]}
              </span>
            )}
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={() => move(track)}
        disabled={pips <= 0 || pos >= order.length - 1}
        className="mt-2 w-full rounded-md bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-40"
      >
        {pos >= order.length - 1 ? "Adult ✓" : `Spend 1 pip → molt (⚡${gates[pos + 1]})`}
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <Banner
        kicker="The Instar Rally"
        title={phase === "order" ? "Stage 1 · File the development sequences" : "Stage 2 · Run the two lanes"}
        sub={
          phase === "order"
            ? "One shuffled pool, two lanes. Every card must be filed in the exact order it occurs."
            : `Turn ${Math.min(turn, TURN_LIMIT)} of ${TURN_LIMIT}. Split each roll between moving and banking metabolic energy.`
        }
      />

      {phase === "order" ? (
        <>
          <div className="rounded-xl border border-border bg-card p-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Unsorted stage cards ({pool.length} left) · misfiles {misfiles}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {pool.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelected(s === selected ? null : s)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    selected === s
                      ? "border-primary bg-primary/15 text-foreground"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {s}
                </button>
              ))}
              {pool.length === 0 && <span className="text-xs text-muted-foreground">All cards filed.</span>}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {(["C", "I"] as const).map((t) => {
              const built = t === "C" ? builtC : builtI;
              const order = t === "C" ? COMPLETE_ORDER : INCOMPLETE_ORDER;
              return (
                <div key={t} className="rounded-xl border border-border bg-card p-3">
                  <div className="text-sm font-bold text-foreground">
                    {t === "C" ? "Complete metamorphosis lane" : "Incomplete metamorphosis lane"}
                  </div>
                  <ol className="mt-2 space-y-1 text-xs">
                    {order.map((_, i) => (
                      <li
                        key={i}
                        className={`rounded-md border px-2 py-1 ${
                          built[i] ? "border-success/40 bg-success/10 text-foreground" : "border-dashed border-border text-muted-foreground"
                        }`}
                      >
                        {built[i] ?? `slot ${i + 1}`}
                      </li>
                    ))}
                  </ol>
                  <button
                    type="button"
                    onClick={() => place(t)}
                    disabled={!selected || built.length === order.length}
                    className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-xs font-bold text-foreground hover:bg-muted disabled:opacity-40"
                  >
                    File selected card here
                  </button>
                </div>
              );
            })}
          </div>

          {orderingDone && (
            <button
              type="button"
              onClick={startRace}
              className="w-full rounded-md bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:opacity-90"
            >
              Sequences verified — start the rally →
            </button>
          )}
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <button
              type="button"
              onClick={roll}
              disabled={pips > 0 || raceWon || outOfTurns}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-40"
            >
              <Dices className="h-4 w-4" /> Roll
            </button>
            <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">Die {die ?? "—"}</span>
            <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">Pips left {pips}</span>
            <span className="rounded-full bg-accent/15 px-3 py-1 font-semibold text-accent">⚡ Energy {energy}</span>
            <button
              type="button"
              onClick={bank}
              disabled={pips <= 0}
              className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-foreground hover:bg-muted disabled:opacity-40"
            >
              Feed: 1 pip → +1 energy
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Lane name="Complete metamorphosis" order={COMPLETE_ORDER} gates={COMPLETE_GATES} pos={posC} track="C" />
            <Lane name="Incomplete metamorphosis" order={INCOMPLETE_ORDER} gates={INCOMPLETE_GATES} pos={posI} track="I" />
          </div>

          {(raceWon || outOfTurns) && (
            <button
              type="button"
              onClick={finish}
              className="w-full rounded-md bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:opacity-90"
            >
              {raceWon ? "Both lanes reached adult — see results →" : "Season over — see results →"}
            </button>
          )}
        </>
      )}

      <div className="space-y-1.5">
        {log.slice(0, 4).map((l, i) => (
          <div key={i} className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================== 2. BOTTOM LINE FARM
   Theme: "Miller Farms, Season Ledger" — a three-field management sim.
   Pest populations grow week to week, beneficials suppress them, sprays flare
   them, resistance builds with repeated use, and you only see what you scout.
   ============================================================================ */

interface FieldState {
  id: string;
  crop: string;
  emoji: string;
  pest: string;
  /** potential gross revenue per acre */
  potential: number;
  pop: number;
  beneficials: number;
  resistance: number;
  damage: number;
  prevented: boolean;
  lastSeen: { week: number; pop: number } | null;
  actedThisWeek: boolean;
}

const START_FIELDS: FieldState[] = [
  { id: "cotton", crop: "Cotton", emoji: "🪴", pest: "Boll weevil", potential: 950, pop: 12, beneficials: 30, resistance: 0, damage: 0, prevented: false, lastSeen: null, actedThisWeek: false },
  { id: "corn", crop: "Corn", emoji: "🌽", pest: "Corn rootworm", potential: 1150, pop: 8, beneficials: 35, resistance: 0, damage: 0, prevented: false, lastSeen: null, actedThisWeek: false },
  { id: "soy", crop: "Soybean", emoji: "🌱", pest: "Soybean aphid", potential: 820, pop: 15, beneficials: 40, resistance: 0, damage: 0, prevented: false, lastSeen: null, actedThisWeek: false },
];

const WEATHER = [
  { name: "Hot and dry", emoji: "☀️", growth: 1.55, note: "Heat speeds pest generations and stresses the crop." },
  { name: "Warm, scattered storms", emoji: "🌦️", growth: 1.3, note: "Rain knocks back small soft-bodied pests." },
  { name: "Cool front", emoji: "🌬️", growth: 1.1, note: "Development slows below the lower threshold temperature." },
  { name: "Humid and still", emoji: "🌫️", growth: 1.4, note: "Humidity favors fungal disease of pests — and of the crop." },
];

const WEEKS = 6;
const START_CASH = 620;

const COSTS = { scout: 12, prevent: 70, broad: 55, selective: 95, release: 60 };

export function FarmEconomics({ add, onFinish }: GameProps) {
  const [fields, setFields] = useState<FieldState[]>(() => START_FIELDS.map((f) => ({ ...f })));
  const [week, setWeek] = useState(1);
  const [cash, setCash] = useState(START_CASH);
  const [spend, setSpend] = useState(0);
  const [weather, setWeather] = useState(() => WEATHER[Math.floor(Math.random() * WEATHER.length)]);
  const [ledger, setLedger] = useState<{ label: string; amount: number }[]>([]);
  const [note, setNote] = useState("Scout before you spend. You cannot manage what you have not measured.");
  const [over, setOver] = useState(false);

  function charge(label: string, amount: number): boolean {
    if (cash < amount) {
      setNote("Not enough operating cash. Something has to go unsprayed this week — that is the real trade-off.");
      return false;
    }
    setCash((c) => c - amount);
    setSpend((s) => s + amount);
    setLedger((l) => [...l, { label: `Wk${week} ${label}`, amount: -amount }]);
    return true;
  }

  function update(id: string, fn: (f: FieldState) => FieldState) {
    setFields((fs) => fs.map((f) => (f.id === id ? fn(f) : f)));
  }

  function scout(f: FieldState) {
    if (!charge(`${f.crop} scouting`, COSTS.scout)) return;
    update(f.id, (x) => ({ ...x, lastSeen: { week, pop: Math.round(x.pop) } }));
    setNote(`${f.crop}: ${Math.round(f.pop)} ${f.pest} per 100 plants, ${Math.round(f.beneficials)} natural enemies present.`);
  }

  function act(f: FieldState, kind: "prevent" | "broad" | "selective" | "release") {
    if (f.actedThisWeek) {
      setNote("One management action per field per week — labor is finite.");
      return;
    }
    const labels = {
      prevent: "cultural prevention (rotation, refuge, trap crop)",
      broad: "broad-spectrum spray",
      selective: "selective insecticide",
      release: "beneficial release",
    } as const;
    if (!charge(`${f.crop} ${labels[kind]}`, COSTS[kind])) return;
    update(f.id, (x) => {
      const n = { ...x, actedThisWeek: true };
      if (kind === "prevent") {
        n.prevented = true;
        n.pop = x.pop * 0.85;
      } else if (kind === "broad") {
        const eff = 0.75 * (1 - x.resistance / 100);
        n.pop = x.pop * (1 - eff);
        n.beneficials = x.beneficials * 0.35;
        n.resistance = Math.min(95, x.resistance + 18);
      } else if (kind === "selective") {
        const eff = 0.6 * (1 - x.resistance / 200);
        n.pop = x.pop * (1 - eff);
        n.beneficials = x.beneficials * 0.9;
        n.resistance = Math.min(95, x.resistance + 6);
      } else {
        n.beneficials = Math.min(100, x.beneficials + 35);
      }
      return n;
    });
    setNote(
      kind === "broad"
        ? "Broad-spectrum knocked the pest down hard — and took most of the natural enemies with it. Watch for a resurgence."
        : kind === "selective"
          ? "Selective chemistry: lower kill, but the predators stay in the field and keep working."
          : kind === "release"
            ? "Predators released. They need prey to stay — a release into a sprayed field usually starves out."
            : "Cultural prevention slows the growth rate all season instead of resetting it once.",
    );
  }

  function advance() {
    let dmgAdded = 0;
    const next = fields.map((f) => {
      const growth = weather.growth * (f.prevented ? 0.78 : 1);
      const predation = (f.beneficials / 100) * 0.45;
      let pop = f.pop * growth * (1 - predation);
      pop = Math.max(0.5, Math.min(120, pop));
      // beneficials track prey availability
      let ben = f.beneficials + (pop > 20 ? 6 : -4);
      ben = Math.max(0, Math.min(100, ben));
      const threshold = 25;
      const dmg = pop > threshold ? (pop - threshold) * 0.55 : 0;
      dmgAdded += dmg;
      return { ...f, pop, beneficials: ben, damage: Math.min(100, f.damage + dmg), actedThisWeek: false };
    });
    setFields(next);
    if (week >= WEEKS) {
      setOver(true);
      setNote("Harvest. Close the books.");
      return;
    }
    setWeek((w) => w + 1);
    setWeather(WEATHER[Math.floor(Math.random() * WEATHER.length)]);
    setNote(dmgAdded > 20 ? "Damage accrued this week — populations above threshold are costing yield right now." : "Fields held. Populations stayed near or below threshold.");
  }

  const revenue = fields.reduce((s, f) => s + f.potential * (1 - f.damage / 100), 0);
  const profit = Math.round(revenue - spend);

  function close() {
    const best = fields.reduce((s, f) => s + f.potential, 0);
    const pct = Math.max(0, Math.min(100, Math.round((profit / best) * 100)));
    const pts = Math.max(0, Math.round(profit / 8));
    add(pts);
    onFinish({
      score: pts,
      correct: pct,
      total: 100,
      message: `Net $${profit}/acre against a $${Math.round(best)} ceiling. Treatment only pays when expected loss exceeds the cost of control — and every broad-spectrum spray you bought also bought you a resistance problem and a resurgence.`,
    });
  }

  return (
    <div className="space-y-4">
      <Banner
        kicker="Miller Farms · Season Ledger"
        title={over ? "Harvest — close the books" : `Week ${week} of ${WEEKS}`}
        sub="Three fields, one budget, six weeks. You only know what you pay to scout."
        tone="accent"
      />

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-bold ${cash > 250 ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
          <DollarSign className="h-3.5 w-3.5" /> {Math.round(cash)} cash
        </span>
        <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">Spent ${spend}</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-3 py-1 font-semibold text-accent">
          <CloudSun className="h-3.5 w-3.5" /> {weather.emoji} {weather.name}
        </span>
        <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">Projected ${profit}/ac</span>
      </div>

      <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">{weather.note} · {note}</p>

      <div className="grid gap-3 md:grid-cols-3">
        {fields.map((f) => {
          const known = f.lastSeen;
          const stale = known ? week - known.week : null;
          return (
            <div key={f.id} className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-foreground">
                  {f.emoji} {f.crop}
                </div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {f.pest}
                </span>
              </div>

              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pest / 100 plants</span>
                  <span className="font-semibold text-foreground">
                    {known ? `${known.pop}${stale ? ` (${stale} wk old)` : ""}` : "unscouted"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Natural enemies</span>
                  <span className="font-semibold text-foreground">{known ? Math.round(f.beneficials) : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resistance built</span>
                  <span className="font-semibold text-foreground">{Math.round(f.resistance)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Yield lost</span>
                  <span className="font-semibold text-destructive">{Math.round(f.damage)}%</span>
                </div>
              </div>

              {!over && (
                <div className="mt-3 space-y-1.5">
                  <button
                    type="button"
                    onClick={() => scout(f)}
                    className="flex w-full items-center justify-between rounded-md border border-border bg-background px-2 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" /> Scout
                    </span>
                    <span className="text-muted-foreground">${COSTS.scout}</span>
                  </button>
                  {(
                    [
                      ["prevent", "Cultural prevention"],
                      ["selective", "Selective insecticide"],
                      ["broad", "Broad-spectrum spray"],
                      ["release", "Release beneficials"],
                    ] as const
                  ).map(([k, label]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => act(f, k)}
                      disabled={f.actedThisWeek}
                      className="flex w-full items-center justify-between rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground hover:bg-muted disabled:opacity-40"
                    >
                      <span>{label}</span>
                      <span className="text-muted-foreground">${COSTS[k]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!over ? (
        <button
          type="button"
          onClick={advance}
          className="w-full rounded-md bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:opacity-90"
        >
          {week >= WEEKS ? "Run the final week →" : "Advance one week →"}
        </button>
      ) : (
        <button
          type="button"
          onClick={close}
          className="w-full rounded-md bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:opacity-90"
        >
          Close the books — net ${profit}/acre →
        </button>
      )}

      <div className="rounded-xl border border-border bg-card p-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Ledger</div>
        {ledger.length === 0 ? (
          <p className="mt-1 text-xs text-muted-foreground">No entries yet — you open the season with ${START_CASH}/acre operating cash.</p>
        ) : (
          <ul className="mt-1 max-h-40 space-y-1 overflow-auto text-xs">
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

/* ============================================================ 3. DAMAGE CSI
   Theme: Clue. Six insect "characters" with motives, six scenes of the crime,
   six mouthparts as the weapon. Hidden solution, witness cards, a deduction
   notebook, limited suggestions, one final accusation.
   ============================================================================ */

interface Suspect {
  name: string;
  species: string;
  emoji: string;
  motive: string;
  mouthpart: string;
  signature: string;
}

const SUSPECTS: Suspect[] = [
  { name: "Baron von Borer", species: "European corn borer", emoji: "🎩", motive: "Needs a warm hollow stalk to overwinter in.", mouthpart: "Chewing mandibles", signature: "round entry holes packed with sawdust frass" },
  { name: "Duchess Aphidia", species: "Soybean aphid", emoji: "👑", motive: "Hoarding phloem sugar for a colony of clones.", mouthpart: "Piercing-sucking stylet", signature: "sticky honeydew and black sooty mold" },
  { name: "Colonel Cutworm", species: "Black cutworm", emoji: "🎖️", motive: "Works the night shift and hides by day.", mouthpart: "Chewing mandibles", signature: "seedlings cut clean at the soil line" },
  { name: "Madame Hopperburn", species: "Potato leafhopper", emoji: "💃", motive: "Injects toxic saliva while she feeds.", mouthpart: "Piercing-sucking stylet", signature: "yellow V-shaped burn at the leaf tip" },
  { name: "Professor Mite", species: "Two-spotted spider mite", emoji: "🧪", motive: "Thrives in the heat once her predators are sprayed out.", mouthpart: "Rasping stylet", signature: "fine stippling and silk webbing" },
  { name: "Sir Skeletonizer", species: "Japanese beetle", emoji: "🛡️", motive: "Grazes in groups; pheromones call in the mob.", mouthpart: "Chewing mandibles", signature: "leaf lace with the veins left standing" },
];

const SCENES = [
  "The cornfield stalks",
  "The soybean canopy",
  "The seedling rows",
  "The orchard edge",
  "The greenhouse bench",
  "The alfalfa strip",
];

const MOUTHPARTS = [
  "Chewing mandibles",
  "Piercing-sucking stylet",
  "Rasping stylet",
  "Siphoning proboscis",
  "Sponging labellum",
  "Chewing-lapping tongue",
];

const WITNESSES = ["Scout Riley", "Agronomist Vega", "Extension Agent Okafor"];

type Card = { kind: "suspect" | "scene" | "mouthpart"; value: string };

interface Mark {
  [key: string]: "unknown" | "cleared" | "suspected";
}

const MAX_SUGGESTIONS = 8;

export function DamageCSI({ add, onFinish }: GameProps) {
  const setup = useMemo(() => {
    const solution = {
      suspect: SUSPECTS[Math.floor(Math.random() * SUSPECTS.length)].name,
      scene: SCENES[Math.floor(Math.random() * SCENES.length)],
      mouthpart: MOUTHPARTS[Math.floor(Math.random() * MOUTHPARTS.length)],
    };
    const rest: Card[] = shuffle([
      ...SUSPECTS.filter((s) => s.name !== solution.suspect).map((s) => ({ kind: "suspect" as const, value: s.name })),
      ...SCENES.filter((s) => s !== solution.scene).map((s) => ({ kind: "scene" as const, value: s })),
      ...MOUTHPARTS.filter((m) => m !== solution.mouthpart).map((m) => ({ kind: "mouthpart" as const, value: m })),
    ]);
    const hands: Card[][] = [[], [], []];
    rest.forEach((c, i) => hands[i % 3].push(c));
    return { solution, hands };
  }, []);

  const [marks, setMarks] = useState<Mark>({});
  const [pickS, setPickS] = useState<string | null>(null);
  const [pickL, setPickL] = useState<string | null>(null);
  const [pickM, setPickM] = useState<string | null>(null);
  const [used, setUsed] = useState(0);
  const [transcript, setTranscript] = useState<string[]>([
    "Damage was found at Miller Farms overnight. Six suspects, six scenes, six mouthparts. Question the witnesses, then accuse once.",
  ]);
  const [accusing, setAccusing] = useState(false);
  const [verdict, setVerdict] = useState<null | { ok: boolean }>(null);

  function cycle(key: string) {
    setMarks((m) => {
      const cur = m[key] ?? "unknown";
      const nextVal = cur === "unknown" ? "cleared" : cur === "cleared" ? "suspected" : "unknown";
      return { ...m, [key]: nextVal };
    });
  }

  function suggest() {
    if (!pickS || !pickL || !pickM || used >= MAX_SUGGESTIONS || verdict) return;
    const asked: Card[] = [
      { kind: "suspect", value: pickS },
      { kind: "scene", value: pickL },
      { kind: "mouthpart", value: pickM },
    ];
    let shown: { who: string; card: Card } | null = null;
    for (let i = 0; i < setup.hands.length && !shown; i++) {
      const matches = setup.hands[i].filter((c) => asked.some((a) => a.kind === c.kind && a.value === c.value));
      if (matches.length) shown = { who: WITNESSES[i], card: matches[Math.floor(Math.random() * matches.length)] };
    }
    setUsed((u) => u + 1);
    if (shown) {
      setMarks((m) => ({ ...m, [`${shown!.card.kind}:${shown!.card.value}`]: "cleared" }));
      setTranscript((t) => [
        `${shown!.who} pulls a card from the case file: "${shown!.card.value}" is accounted for — cross it off.`,
        ...t,
      ]);
      add(3);
    } else {
      setTranscript((t) => [
        `No witness can disprove any part of that. Suspect ${pickS}, ${pickL}, ${pickM} — that combination is still live.`,
        ...t,
      ]);
      add(6);
    }
  }

  function accuse() {
    if (!pickS || !pickL || !pickM) return;
    const ok = pickS === setup.solution.suspect && pickL === setup.solution.scene && pickM === setup.solution.mouthpart;
    setVerdict({ ok });
    const s = SUSPECTS.find((x) => x.name === setup.solution.suspect)!;
    setTranscript((t) => [
      ok
        ? `Case closed. ${s.name} (${s.species}) at ${setup.solution.scene} with the ${setup.solution.mouthpart}. Motive: ${s.motive}`
        : `The accusation fails. The true file reads: ${s.name} (${s.species}), ${setup.solution.scene}, ${setup.solution.mouthpart}.`,
      ...t,
    ]);
  }

  function finish() {
    const efficiency = Math.max(0, MAX_SUGGESTIONS - used);
    const score = (verdict?.ok ? 60 + efficiency * 5 : 10) + used * 2;
    add(score);
    const s = SUSPECTS.find((x) => x.name === setup.solution.suspect)!;
    onFinish({
      score,
      correct: verdict?.ok ? 1 : 0,
      total: 1,
      message: `${s.name} leaves ${s.signature} — the wound is the signature of the mouthpart. Chewing removes tissue; piercing-sucking and rasping leave the tissue in place but discolored, distorted, or sticky.`,
    });
  }

  const Col = ({
    kind,
    items,
    pick,
    setPick,
  }: {
    kind: "suspect" | "scene" | "mouthpart";
    items: { key: string; label: string; sub?: string }[];
    pick: string | null;
    setPick: (v: string) => void;
  }) => (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {kind === "suspect" ? "Suspects" : kind === "scene" ? "Scenes of the crime" : "Mouthpart (the weapon)"}
      </div>
      <div className="mt-2 space-y-1">
        {items.map((it) => {
          const state = marks[`${kind}:${it.key}`] ?? "unknown";
          return (
            <div key={it.key} className="flex items-stretch gap-1">
              <button
                type="button"
                onClick={() => setPick(it.key)}
                className={`flex-1 rounded-md border px-2 py-1.5 text-left text-xs transition ${
                  pick === it.key ? "border-primary bg-primary/10 text-foreground" : "border-border bg-background text-muted-foreground hover:bg-muted"
                } ${state === "cleared" ? "line-through opacity-60" : ""}`}
              >
                <div className="font-semibold text-foreground">{it.label}</div>
                {it.sub && <div className="text-[10px] text-muted-foreground">{it.sub}</div>}
              </button>
              <button
                type="button"
                onClick={() => cycle(`${kind}:${it.key}`)}
                title="Notebook: unknown / cleared / suspected"
                className={`w-8 shrink-0 rounded-md border text-xs font-bold ${
                  state === "cleared"
                    ? "border-destructive/40 bg-destructive/10 text-destructive"
                    : state === "suspected"
                      ? "border-success/40 bg-success/10 text-success"
                      : "border-border bg-muted/40 text-muted-foreground"
                }`}
              >
                {state === "cleared" ? "✗" : state === "suspected" ? "★" : "?"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Banner
        kicker="Mystery at Miller Farms"
        title="Damage CSI · a whodunit in six suspects"
        sub="Who did the damage, where, and with which mouthpart? Question witnesses to cross cards off, then accuse once."
        tone="destructive"
      />

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-muted-foreground">
          <Notebook className="h-3.5 w-3.5" /> Questions left {MAX_SUGGESTIONS - used}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">
          <Search className="h-3.5 w-3.5" /> {WITNESSES.join(" · ")}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Col
          kind="suspect"
          pick={pickS}
          setPick={setPickS}
          items={SUSPECTS.map((s) => ({ key: s.name, label: `${s.emoji} ${s.name}`, sub: `${s.species} — ${s.motive}` }))}
        />
        <Col kind="scene" pick={pickL} setPick={setPickL} items={SCENES.map((s) => ({ key: s, label: s }))} />
        <Col kind="mouthpart" pick={pickM} setPick={setPickM} items={MOUTHPARTS.map((m) => ({ key: m, label: m }))} />
      </div>

      {!verdict && (
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="text-sm text-foreground">
            <Bug className="mr-1 inline h-4 w-4 text-accent" />
            Your theory: <span className="font-semibold">{pickS ?? "…"}</span> at{" "}
            <span className="font-semibold">{pickL ?? "…"}</span> with the{" "}
            <span className="font-semibold">{pickM ?? "…"}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={suggest}
              disabled={!pickS || !pickL || !pickM || used >= MAX_SUGGESTIONS}
              className="rounded-md bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-40"
            >
              Question the witnesses
            </button>
            <button
              type="button"
              onClick={() => setAccusing(true)}
              disabled={!pickS || !pickL || !pickM}
              className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2 text-xs font-bold text-destructive hover:bg-destructive/20 disabled:opacity-40"
            >
              Make the final accusation
            </button>
          </div>
          {accusing && (
            <div className="mt-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-xs">
              <p className="text-foreground">One accusation only. If it is wrong, the case is lost.</p>
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={accuse} className="rounded-md bg-destructive px-3 py-1.5 font-bold text-destructive-foreground">
                  Accuse
                </button>
                <button type="button" onClick={() => setAccusing(false)} className="rounded-md border border-border px-3 py-1.5 font-semibold text-foreground">
                  Keep investigating
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {verdict && (
        <button
          type="button"
          onClick={finish}
          className="w-full rounded-md bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:opacity-90"
        >
          {verdict.ok ? "Case closed — see results →" : "Case lost — see results →"}
        </button>
      )}

      <div className="space-y-1.5">
        {transcript.slice(0, 6).map((t, i) => (
          <div key={i} className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            {t}
          </div>
        ))}
      </div>
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
    blurb: "The Instar Rally: rebuild both development sequences from memory, then race two lanes on a metabolic energy budget.",
    howTo: [
      "Stage 1: one shuffled pool of stage cards feeds two lanes. File every card into the exact position it occupies in complete or incomplete metamorphosis. Misfiles cost points.",
      "Stage 2: roll a d6, then split the pips yourself between moving a lane and feeding (banking metabolic energy).",
      "Every molt costs energy — the pupal rebuild costs the most. Not enough banked energy means the lane cannot molt at all.",
      "You have 12 turns to get both lanes to adult. Leftover turns are worth points.",
    ],
    render: (p) => <MetamorphosisRace {...p} />,
  },
  {
    id: "farm-economics",
    name: "Bottom Line Farm",
    emoji: "💵",
    topic: "Economic impact of insects",
    blurb: "Miller Farms season ledger: three fields, six weeks, one operating budget, and populations that only move if you understand them.",
    howTo: [
      "You run cotton, corn, and soybean on $620/acre of operating cash for six weeks.",
      "Pest counts are hidden until you pay to scout — and your reading goes stale as the weeks pass.",
      "Each field gets one action per week: cultural prevention, selective insecticide, broad-spectrum spray, or a beneficial release.",
      "Broad-spectrum sprays kill natural enemies and build resistance, so their kill rate drops every time you reuse them.",
      "Populations above the economic threshold take yield every week. Net profit at harvest is your score.",
    ],
    render: (p) => <FarmEconomics {...p} />,
  },
  {
    id: "damage-csi",
    name: "Damage CSI",
    emoji: "🔍",
    topic: "Insect damage",
    blurb: "A Clue-style whodunit: six insect suspects with motives, six scenes, six mouthparts, one hidden solution.",
    howTo: [
      "A hidden case file holds one suspect, one scene, and one mouthpart. Everything else is dealt to three witnesses.",
      "Build a theory from the three columns, then question the witnesses — one of them will disprove a card if they can.",
      "Use the notebook toggle (? / ✗ / ★) beside each card to track what is cleared and what is still live.",
      "You get 8 questions. Then one accusation only — get all three right to close the case.",
    ],
    render: (p) => <DamageCSI {...p} />,
  },
];

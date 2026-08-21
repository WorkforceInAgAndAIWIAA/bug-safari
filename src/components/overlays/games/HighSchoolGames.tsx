import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, RefreshCcw, Sparkles, Trophy, Timer, ShieldAlert } from "lucide-react";
import { insectsForGrade } from "@/data/gradeInsects";
import type { Insect } from "@/data/insects";
import { InsectImage } from "@/components/InsectImage";
import { linkForGame } from "@/data/topicLinks";
import { GameIntro, GameResults, type GameMeta, type GameProps, type GameResult } from "./GameFrame";
import { HS_GAMES_2 } from "./HighSchoolGames2";
import { HS_GAMES_3 } from "./HighSchoolGames3";

/* ------------------------------------------------------------------ utils */

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const POOL = () => insectsForGrade("high");

function useHsPoints() {
  const KEY = "entoquest_hs_points";
  const [pts, setPts] = useState(0);
  useEffect(() => {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
    if (raw) setPts(Number(raw) || 0);
  }, []);
  const write = (n: number) => {
    setPts(n);
    try {
      window.localStorage.setItem(KEY, String(n));
    } catch {
      /* ignore */
    }
  };
  return {
    pts,
    add: (n: number) => write(Math.max(0, pts + n)),
    reset: () => write(0),
  };
}

/* --------------------------------------------- 1. Binomial Battleship ---- */

interface Ship {
  insect: Insect;
  genus: string;
  epithet: string;
}

function BinomialBattleship({ add, onFinish }: GameProps) {
  const [seed, setSeed] = useState(0);

  const { ships, genera, epithets } = useMemo(() => {
    const usable = POOL().filter((i) => {
      const parts = i.scientificName.split(" ");
      return parts.length === 2 && !parts[1].startsWith("spp");
    });
    const picked: Insect[] = [];
    const seenGenus = new Set<string>();
    for (const i of shuffle(usable)) {
      const g = i.scientificName.split(" ")[0];
      if (seenGenus.has(g)) continue;
      seenGenus.add(g);
      picked.push(i);
      if (picked.length === 5) break;
    }
    const s: Ship[] = picked.map((i) => ({
      insect: i,
      genus: i.scientificName.split(" ")[0],
      epithet: i.scientificName.split(" ")[1],
    }));
    return {
      ships: s,
      genera: shuffle(s.map((x) => x.genus)),
      epithets: shuffle(s.map((x) => x.epithet)),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  const [target, setTarget] = useState<{ genus: string; epithet: string } | null>(null);
  const [typed, setTyped] = useState("");
  const [fired, setFired] = useState<Record<string, "hit" | "miss">>({});
  const [log, setLog] = useState<{ text: string; kind: "hit" | "miss" | "bad" }[]>([]);
  const [shots, setShots] = useState(0);

  const hits = Object.values(fired).filter((v) => v === "hit").length;
  const won = hits === ships.length && ships.length > 0;

  const key = (g: string, e: string) => `${g}|${e}`;

  function fire() {
    if (!target) return;
    const want = `${target.genus} ${target.epithet}`;
    const ok = typed.trim().replace(/\s+/g, " ").toLowerCase() === want.toLowerCase();
    if (!ok) {
      setLog((l) => [
        { text: `Misfire — the binomial for that coordinate is "${want}" (Genus capitalized, epithet lowercase).`, kind: "bad" },
        ...l,
      ]);
      setTyped("");
      return;
    }
    const ship = ships.find((s) => s.genus === target.genus && s.epithet === target.epithet);
    setShots((n) => n + 1);
    setFired((f) => ({ ...f, [key(target.genus, target.epithet)]: ship ? "hit" : "miss" }));
    if (ship) {
      add(15);
      setLog((l) => [
        { text: `HIT — ${want} is a real species: the ${ship.insect.commonName} (family ${ship.insect.family}). +15 pts`, kind: "hit" },
        ...l,
      ]);
    } else {
      setLog((l) => [
        { text: `Splash — ${want} is not a valid combination. Genus and epithet must come from the same described species.`, kind: "miss" },
        ...l,
      ]);
    }
    setTarget(null);
    setTyped("");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">Fleet sunk: {hits}/{ships.length}</span>
        <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">Shots fired: {shots}</span>
        <button
          onClick={() => {
            setSeed((s) => s + 1);
            setFired({});
            setLog([]);
            setShots(0);
            setTarget(null);
            setTyped("");
          }}
          className="ml-auto inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-xs hover:bg-muted"
        >
          <RefreshCcw className="h-3.5 w-3.5" /> New fleet
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-separate border-spacing-1 text-xs">
          <thead>
            <tr>
              <th className="w-28" />
              {epithets.map((e) => (
                <th key={e} className="px-1 py-1 text-center font-semibold italic text-muted-foreground">{e}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {genera.map((g) => (
              <tr key={g}>
                <th className="pr-2 text-right font-semibold italic text-foreground">{g}</th>
                {epithets.map((e) => {
                  const state = fired[key(g, e)];
                  const selected = target?.genus === g && target?.epithet === e;
                  return (
                    <td key={e}>
                      <button
                        disabled={!!state || won}
                        onClick={() => {
                          setTarget({ genus: g, epithet: e });
                          setTyped("");
                        }}
                        className={`h-11 w-full rounded-md border text-base transition ${
                          state === "hit"
                            ? "border-success/50 bg-success/20"
                            : state === "miss"
                              ? "border-border bg-muted text-muted-foreground"
                              : selected
                                ? "border-accent bg-accent/20"
                                : "border-border bg-background hover:bg-muted"
                        }`}
                        aria-label={`${g} ${e}`}
                      >
                        {state === "hit" ? "🐛" : state === "miss" ? "💧" : ""}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {target && !won && (
        <div className="rounded-xl border border-accent/50 bg-accent/10 p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Coordinate locked</div>
          <div className="mt-1 text-sm text-foreground">
            Row <span className="font-semibold italic">{target.genus}</span> · Column{" "}
            <span className="font-semibold italic">{target.epithet}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              autoFocus
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fire()}
              placeholder="Type the binomial to fire…"
              className="min-w-[220px] flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <button onClick={fire} className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90">
              Fire
            </button>
          </div>
        </div>
      )}

      {won && (
        <div className="rounded-xl border border-success/40 bg-success/10 p-4 text-sm">
          <div className="font-display text-lg font-extrabold text-foreground">Fleet sunk! 🎯</div>
          <p className="mt-1 text-muted-foreground">
            You fired {shots} shots to find 5 valid binomials.
          </p>
          <button
            type="button"
            onClick={() =>
              onFinish({
                score: hits * 15,
                correct: hits,
                total: Math.max(shots, hits),
                message:
                  "Every genus pairs with only its own epithet — that pairing is the species. Genus is capitalized, the epithet never is.",
              })
            }
            className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
          >
            See results →
          </button>
        </div>
      )}

      <div className="space-y-1.5">
        {log.slice(0, 6).map((l, i) => (
          <div
            key={i}
            className={`rounded-md border px-3 py-2 text-xs ${
              l.kind === "hit"
                ? "border-success/40 bg-success/10 text-foreground"
                : l.kind === "bad"
                  ? "border-destructive/40 bg-destructive/10 text-foreground"
                  : "border-border bg-muted text-muted-foreground"
            }`}
          >
            {l.text}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------ 2. Family Speed Sort --- */

const FAMILY_TRAITS: Record<string, string[]> = {
  Coccinellidae: ["Chewing mouthparts", "Rounded, domed body", "Short clubbed antennae", "Hardened elytra"],
  Chrysomelidae: ["Chewing mouthparts", "Oval leaf-feeding beetle", "Filiform antennae ~½ body", "Bright elytra"],
  Curculionidae: ["Chewing mouthparts on a snout", "Elbowed (geniculate) antennae", "Hard rounded body"],
  Scarabaeidae: ["Chewing mouthparts", "Stout body", "Lamellate (fan-plate) antennae", "C-shaped grub stage"],
  Carabidae: ["Chewing mouthparts", "Long running legs", "Threadlike antennae", "Predaceous, ground-dwelling"],
  Cerambycidae: ["Chewing mouthparts", "Antennae as long as body or longer", "Wood-boring larvae"],
  Buprestidae: ["Chewing mouthparts", "Metallic bullet-shaped body", "Short serrate antennae"],
  Noctuidae: ["Siphoning proboscis as adult", "Two scaled wings pairs", "Drab stout-bodied moth", "Caterpillar larva"],
  Pyralidae: ["Siphoning proboscis", "Narrow triangular wings at rest", "Slender moth"],
  Plutellidae: ["Siphoning proboscis", "Small moth, diamond pattern on back", "Fringed hindwings"],
  Papilionidae: ["Siphoning proboscis", "Large scaled wings", "Clubbed antennae", "Tailed hindwings"],
  Nymphalidae: ["Siphoning proboscis", "Clubbed antennae", "Reduced brush-like forelegs"],
  Pieridae: ["Siphoning proboscis", "White or yellow scaled wings", "Clubbed antennae"],
  Aphididae: ["Piercing-sucking beak", "Soft pear-shaped body", "Paired cornicles on abdomen"],
  Pentatomidae: ["Piercing-sucking beak", "Shield-shaped body", "Large triangular scutellum", "5-segmented antennae"],
  Coreidae: ["Piercing-sucking beak", "Elongate leathery body", "Often flared hind tibiae"],
  Reduviidae: ["Curved piercing beak held under body", "Narrow head and neck", "Raptorial front legs"],
  Miridae: ["Piercing-sucking beak", "Soft body with cuneus on forewing", "Fast-moving plant bug"],
  Cicadellidae: ["Piercing-sucking beak", "Wedge shape, rows of spines on hind tibiae", "Jumps sideways"],
  Aphelinidae: ["Chewing mouthparts", "Tiny parasitoid wasp", "Membranous wings"],
  Braconidae: ["Chewing mouthparts", "Membranous wings with reduced venation", "Ovipositor for parasitism"],
  Apidae: ["Chewing-lapping mouthparts", "Branched body hairs", "Pollen-carrying hind legs"],
  Chrysopidae: ["Chewing mouthparts", "Lace-like veined wings", "Golden eyes", "Alligator-like larva"],
  Syrphidae: ["Sponging mouthparts", "One wing pair plus halteres", "Bee mimic that hovers"],
  Cecidomyiidae: ["One wing pair plus halteres", "Tiny fragile fly", "Long beaded antennae"],
  Tetranychidae: ["Piercing stylets", "Eight legs — not an insect", "Fine webbing on leaves"],
  Acrididae: ["Chewing mouthparts", "Enlarged jumping hind femora", "Short antennae"],
  Tenebrionidae: ["Chewing mouthparts", "Dark hardened body", "Stored-product feeder"],
  Fulgoridae: ["Piercing-sucking beak", "Broad planthopper wings", "Bright hindwing flash"],
  Cercopidae: ["Piercing-sucking beak", "Nymph in a spittle mass", "Stout hopper body"],
  Thripidae: ["Rasping-sucking mouthparts", "Fringed (feathery) wings", "Tiny slender body"],
  Elateridae: ["Chewing mouthparts", "Clicking hinged prothorax", "Hard wireworm larva"],
};

function traitsFor(insect: Insect): string[] {
  return (
    FAMILY_TRAITS[insect.family] ?? [
      `Order ${insect.order}`,
      insect.metamorphosis === "Complete" ? "Complete metamorphosis (has a pupa)" : "Incomplete metamorphosis (nymphs)",
      `Feeds on: ${insect.hosts}`,
    ]
  );
}

function FamilySpeedSort({ add, onFinish }: GameProps) {
  const CARDS = 10;
  const SECONDS = 15;

  const deck = useMemo(() => {
    const pool = POOL().filter((i) => FAMILY_TRAITS[i.family]);
    return shuffle(pool).slice(0, CARDS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [right, setRight] = useState(0);
  const [left, setLeft] = useState(SECONDS);
  const [picked, setPicked] = useState<string | null>(null);

  const card = deck[idx];
  const done = idx >= deck.length;

  const options = useMemo(() => {
    if (!card) return [];
    const fams = Array.from(new Set(POOL().map((i) => i.family))).filter((f) => f !== card.family);
    return shuffle([card.family, ...shuffle(fams).slice(0, 3)]);
  }, [card]);

  useEffect(() => {
    if (done || picked) return;
    setLeft(SECONDS);
    const t = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          setPicked("__timeout__");
          setCombo(0);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [idx, done, picked]);

  function choose(fam: string) {
    if (picked) return;
    setPicked(fam);
    if (fam === card.family) {
      const gain = 10 + combo * 2 + Math.max(0, left - 5);
      setScore((s) => s + gain);
      setCombo((c) => c + 1);
      setRight((r) => r + 1);
      add(gain);
    } else {
      setCombo(0);
    }
  }

  if (done)
    return (
      <div className="rounded-xl border border-primary/40 bg-primary/5 p-6 text-center">
        <div className="font-display text-2xl font-extrabold text-foreground">Pile sorted!</div>
        <p className="mt-2 text-sm text-muted-foreground">
          Round score: <span className="font-bold text-primary">{score}</span>
        </p>
        <button
          type="button"
          onClick={() =>
            onFinish({
              score,
              correct: right,
              total: deck.length,
              message:
                "Families are diagnosed by structure — mouthpart type, wing count and texture, antennal shape — not by color or size.",
            })
          }
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
        >
          See results →
        </button>
      </div>
    );

  const correct = picked === card.family;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-sm">
        <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">Card {idx + 1}/{deck.length}</span>
        <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">Score {score}</span>
        <span className="rounded-full bg-accent/15 px-3 py-1 font-semibold text-accent">Combo ×{combo}</span>
        <span className={`ml-auto inline-flex items-center gap-1 rounded-full px-3 py-1 font-semibold ${left <= 5 ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"}`}>
          <Timer className="h-3.5 w-3.5" /> {left}s
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
        <div className="rounded-2xl border border-border bg-card p-3">
          <InsectImage id={card.id} name={card.commonName} className="h-40 w-full" />
          <div className="mt-2 text-sm font-semibold text-foreground">{card.commonName}</div>
          <div className="text-xs italic text-muted-foreground">{card.scientificName}</div>
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Key traits</div>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-foreground">
            {traitsFor(card).map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {options.map((f) => {
              const isAnswer = f === card.family;
              const chosen = picked === f;
              return (
                <button
                  key={f}
                  onClick={() => choose(f)}
                  disabled={!!picked}
                  className={`rounded-lg border px-4 py-3 text-left text-sm transition ${
                    picked && isAnswer
                      ? "border-success/60 bg-success/15"
                      : chosen
                        ? "border-destructive/60 bg-destructive/10"
                        : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {picked && (
        <div className={`rounded-xl border p-4 text-sm ${correct ? "border-success/40 bg-success/10" : "border-destructive/40 bg-destructive/10"}`}>
          <div className="font-semibold text-foreground">
            {correct ? "Sorted correctly." : picked === "__timeout__" ? "Time's up." : "Wrong pile."}
          </div>
          <p className="mt-1 text-muted-foreground">
            {card.commonName} is in <span className="font-semibold text-foreground">{card.family}</span> ({card.order}).
          </p>
          <button
            onClick={() => {
              setPicked(null);
              setIdx((i) => i + 1);
            }}
            className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
          >
            Next card →
          </button>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------- 3. Push-your-luck biocontrol */

const THRESHOLD = 21;
const ROUNDS = 5;

interface PestCard {
  insect: Insect;
  damage: number;
}

function BalanceTheField({ add, onFinish }: GameProps) {
  const pests = useMemo(() => POOL().filter((i) => i.role === "Pest" || i.role === "Invasive Pest"), []);
  const predators = useMemo(() => POOL().filter((i) => i.role === "Beneficial"), []);

  const [round, setRound] = useState(1);
  const [banked, setBanked] = useState(0);
  const [table, setTable] = useState<PestCard[]>([]);
  const [roundScore, setRoundScore] = useState(0);
  const [releases, setReleases] = useState(3);
  const [state, setState] = useState<"playing" | "busted" | "banked" | "over">("playing");
  const [note, setNote] = useState<string>("Draw a pest card to start scouting.");

  const damage = table.reduce((s, c) => s + c.damage, 0);

  function draw() {
    if (state !== "playing") return;
    const insect = pests[Math.floor(Math.random() * pests.length)];
    const dmg = 2 + Math.floor(Math.random() * 7);
    const next = [...table, { insect, damage: dmg }];
    setTable(next);
    const total = next.reduce((s, c) => s + c.damage, 0);
    if (total > THRESHOLD) {
      setState("busted");
      setRoundScore(0);
      setNote(`Damage hit ${total} — past the ${THRESHOLD}-point economic threshold. The field is a loss this round.`);
    } else {
      setRoundScore((s) => s + dmg * 2);
      setNote(`${insect.commonName} added ${dmg} damage. Every pest you tolerate below threshold is yield you did not spend money to protect (+${dmg * 2} pts).`);
    }
  }

  function release() {
    if (state !== "playing" || releases <= 0 || table.length === 0) return;
    const removed = table[table.length - 1];
    const pred = predators[Math.floor(Math.random() * predators.length)];
    setTable(table.slice(0, -1));
    setReleases((r) => r - 1);
    setRoundScore((s) => Math.max(0, s - 6));
    setNote(`${pred.commonName} released — it cleared the ${removed.insect.commonName} (${removed.damage} damage), but the release cost 6 pts of upkeep. Biological control is not free.`);
  }

  function bank() {
    if (state !== "playing") return;
    setState("banked");
    setNote(`Banked ${roundScore} pts with damage at ${damage}/${THRESHOLD}. Stopping under threshold is the whole skill.`);
  }

  function nextRound() {
    const gained = state === "busted" ? 0 : roundScore;
    const total = banked + gained;
    setBanked(total);
    add(gained);
    if (round >= ROUNDS) {
      setState("over");
      return;
    }
    setRound((r) => r + 1);
    setTable([]);
    setRoundScore(0);
    setReleases(3);
    setState("playing");
    setNote("New field, new season. Draw a pest card.");
  }

  if (state === "over")
    return (
      <div className="rounded-xl border border-primary/40 bg-primary/5 p-6 text-center">
        <div className="font-display text-2xl font-extrabold text-foreground">Season complete</div>
        <p className="mt-2 text-sm text-muted-foreground">
          Final harvest score: <span className="font-bold text-primary">{banked}</span>
        </p>
        <button
          type="button"
          onClick={() =>
            onFinish({
              score: banked,
              message:
                "Pest pressure below the economic threshold does not justify treatment, and natural enemies carry a real cost — scouting decides which risk you take.",
            })
          }
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
        >
          See results →
        </button>
      </div>
    );

  const pct = Math.min(100, (damage / THRESHOLD) * 100);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">Round {round}/{ROUNDS}</span>
        <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">Banked {banked}</span>
        <span className="rounded-full bg-accent/15 px-3 py-1 font-semibold text-accent">This round {roundScore}</span>
        <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">Releases left {releases}</span>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <ShieldAlert className="h-3.5 w-3.5" /> Damage {damage} / {THRESHOLD}
          </span>
          <span>Economic threshold</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full transition-all ${pct > 85 ? "bg-destructive" : pct > 60 ? "bg-accent" : "bg-success"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="min-h-[120px] rounded-xl border border-border bg-card p-3">
        {table.length === 0 ? (
          <div className="grid h-[104px] place-items-center text-sm text-muted-foreground">Field is clean — no pest cards on the table.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {table.map((c, i) => (
              <div key={`${c.insect.id}-${i}`} className="w-[104px] rounded-lg border border-border bg-background p-2">
                <InsectImage id={c.insect.id} name={c.insect.commonName} className="h-16 w-full" />
                <div className="mt-1 truncate text-[11px] font-semibold text-foreground">{c.insect.commonName}</div>
                <div className="text-[11px] text-destructive">+{c.damage} damage</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-accent/40 bg-accent/10 p-3 text-sm text-foreground">{note}</div>

      <div className="flex flex-wrap gap-2">
        {state === "playing" ? (
          <>
            <button onClick={draw} className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90">
              Draw pest card
            </button>
            <button
              onClick={release}
              disabled={releases <= 0 || table.length === 0}
              className="rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-50"
            >
              Release predator (−6 pts)
            </button>
            <button onClick={bank} className="rounded-md border border-success/50 bg-success/10 px-4 py-2 text-sm font-semibold hover:bg-success/20">
              Bank round
            </button>
          </>
        ) : (
          <button onClick={nextRound} className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90">
            {round >= ROUNDS ? "See season results →" : "Next round →"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- hub */

export const HS_GAMES: GameMeta[] = [
  {
    id: "binomial-battleship",
    name: "Binomial Battleship",
    emoji: "🎯",
    topic: "Scientific names",
    blurb: "Call coordinates on a genus × epithet grid — construct the binomial to fire.",
    howTo: [
      "Rows are genus names, columns are species epithets. Five real species hide at the correct intersections.",
      "Pick a coordinate, then construct the binomial to fire: Genus epithet — genus capitalized, epithet lowercase.",
      "A misfire costs nothing but a chance to re-read the rule.",
      "Sink all five species to win.",
    ],
    render: (p) => <BinomialBattleship {...p} />,
  },
  {
    id: "family-feud-taxonomy",
    name: "Family Sort Showdown",
    emoji: "🃏",
    topic: "Scientific families",
    blurb: "Speed-sort trait cards into family piles using key characters.",
    howTo: [
      "Each card shows a specimen plus its key traits — the same characters a dichotomous key uses.",
      "Sort it into the right family pile before the 15-second timer runs out.",
      "Faster answers and streaks score higher.",
      "Ten cards per hand.",
    ],
    render: (p) => <FamilySpeedSort {...p} />,
  },
  {
    id: "balance-the-field",
    name: "Balance the Field",
    emoji: "🎲",
    topic: "Predator/pest interactions",
    blurb: "Push your luck against the economic threshold — predators cost upkeep.",
    howTo: [
      "Draw pest cards to keep earning — each one adds damage and points.",
      `Go over ${THRESHOLD} damage and the round scores zero.`,
      "Predator releases remove the last pest card but cost 6 pts of upkeep, and you only get 3 per round.",
      `Bank any time to lock the round in. ${ROUNDS} rounds per season.`,
    ],
    render: (p) => <BalanceTheField {...p} />,
  },
  ...HS_GAMES_2,
  ...HS_GAMES_3,
];

export function HighSchoolGamesHub({
  initialGameId,
  onOpenLesson,
}: {
  initialGameId?: string;
  onOpenLesson?: (lessonId: string) => void;
} = {}) {
  const { pts, add, reset } = useHsPoints();
  const [active, setActive] = useState<GameMeta | null>(() => HS_GAMES.find((g) => g.id === initialGameId) ?? null);
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [result, setResult] = useState<GameResult | null>(null);
  const [runKey, setRunKey] = useState(0);

  const lessonLink = active ? linkForGame("high", active.id) : undefined;

  function openGame(g: GameMeta) {
    setActive(g);
    setPhase("intro");
    setResult(null);
  }

  function backToHub() {
    setActive(null);
    setPhase("intro");
    setResult(null);
  }

  function playAgain() {
    setResult(null);
    setRunKey((k) => k + 1);
    setPhase("play");
  }

  if (active && phase === "intro")
    return (
      <GameIntro
        game={active}
        onPlay={() => {
          setRunKey((k) => k + 1);
          setPhase("play");
        }}
        onBack={backToHub}
        onOpenLesson={lessonLink && onOpenLesson ? () => onOpenLesson(lessonLink.lessonId) : undefined}
        lessonLabel={lessonLink?.topic}
      />
    );

  if (active && phase === "done" && result)
    return <GameResults game={active} result={result} onAgain={playAgain} onBack={backToHub} />;

  if (active)
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={backToHub}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" /> All games
          </button>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            <Trophy className="h-4 w-4" /> {pts} pts
          </div>
        </div>
        <h3 className="mb-1 font-display text-xl font-extrabold text-foreground">
          {active.emoji} {active.name}
        </h3>
        <p className="mb-4 text-xs text-muted-foreground">
          {active.topic} · {active.blurb}
        </p>
        <div key={runKey}>
          {active.render({
            add,
            onFinish: (r) => {
              setResult(r);
              setPhase("done");
            },
          })}
        </div>
      </div>
    );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-3">
        <div className="inline-flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">IPM Specialist points</div>
            <div className="text-2xl font-bold text-primary">{pts}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={reset}
          className="rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
        >
          <RefreshCcw className="mr-1 inline h-3 w-3" /> Reset
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {HS_GAMES.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => openGame(g)}
            className="flex flex-col items-start gap-1 rounded-xl border border-border bg-card p-4 text-left transition hover:bg-muted/50 hover:shadow-md"
          >
            <span className="text-3xl">{g.emoji}</span>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{g.topic}</div>
            <div className="font-semibold text-foreground">{g.name}</div>
            <div className="text-xs text-muted-foreground">{g.blurb}</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[11px] font-medium text-primary">Play →</span>
              {onOpenLesson && linkForGame("high", g.id) && (
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

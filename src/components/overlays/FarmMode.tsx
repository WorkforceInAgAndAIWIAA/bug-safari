import { useEffect, useMemo, useState } from "react";
import { OverlayShell } from "@/components/OverlayShell";
import { insects } from "@/data/insects";
import { Sprout, Bug, ShieldCheck, Beaker, Hand, Leaf } from "lucide-react";

const SEASONS = ["Spring", "Early Summer", "Late Summer", "Fall"] as const;
const CROPS = ["Corn", "Soybean", "Wheat", "Alfalfa"] as const;
const CROP_HOSTS: Record<string, RegExp> = {
  Corn: /corn|grass|sorghum/i,
  Soybean: /soybean|bean|clover|alfalfa/i,
  Wheat: /wheat|grain|cereal|oat/i,
  Alfalfa: /alfalfa|clover/i,
};

type Tactic = "Biological" | "Cultural" | "Mechanical" | "Chemical";
const TACTIC_ICON: Record<Tactic, typeof Sprout> = {
  Biological: ShieldCheck,
  Cultural: Leaf,
  Mechanical: Hand,
  Chemical: Beaker,
};

interface Sighting {
  id: string;
  insectId: string;
  x: number;
  y: number;
}

function spawnSightings(pool: { id: string }[], n: number): Sighting[] {
  const out: Sighting[] = [];
  for (let i = 0; i < n && pool.length; i++) {
    out.push({
      id: `${Date.now()}-${i}-${Math.random()}`,
      insectId: pool[Math.floor(Math.random() * pool.length)].id,
      x: 8 + Math.random() * 84,
      y: 8 + Math.random() * 84,
    });
  }
  return out;
}

export function FarmMode({ onClose }: { onClose: () => void }) {
  const [crop, setCrop] = useState<(typeof CROPS)[number]>("Corn");
  const [season, setSeason] = useState(0);
  const [budget, setBudget] = useState(10000);
  const [yieldPct, setYield] = useState(100);
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [selected, setSelected] = useState<Sighting | null>(null);
  const [log, setLog] = useState<string[]>(["Season started. Scout your field."]);

  const pestPool = useMemo(
    () => insects.filter((i) => i.role !== "Beneficial" && i.role !== "Pollinator" && CROP_HOSTS[crop].test(i.hosts)),
    [crop],
  );

  useEffect(() => {
    setSightings(spawnSightings(pestPool, 4 + season));
    setSelected(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crop, season]);

  function nextSeason() {
    setBudget((b) => b - 2500);
    setYield((y) => Math.max(0, y - sightings.length * 4));
    setLog((l) => [`${SEASONS[season]} closed: ${sightings.length} pests remained, −$2,500 ops.`, ...l]);
    setSeason((s) => (s + 1) % SEASONS.length);
  }

  function applyTactic(t: Tactic) {
    if (!selected) return;
    const cost = t === "Chemical" ? 600 : t === "Biological" ? 300 : t === "Mechanical" ? 150 : 50;
    setBudget((b) => b - cost);
    setSightings((s) => s.filter((x) => x.id !== selected.id));
    setLog((l) => [
      `${t} control deployed against ${insects.find((i) => i.id === selected.insectId)?.commonName} (−$${cost}).`,
      ...l,
    ]);
    setSelected(null);
  }

  const selectedInsect = selected ? insects.find((i) => i.id === selected.insectId) : null;

  return (
    <OverlayShell title="Farm Mode" subtitle="Scout the field, choose your IPM tactic, finish the season." onClose={onClose}>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
            <label className="text-sm">
              Crop:&nbsp;
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value as (typeof CROPS)[number])}
                className="rounded-md border border-input bg-background px-2 py-1 text-sm"
              >
                {CROPS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <span className="text-sm text-muted-foreground">Season:</span>
            <span className="font-semibold text-foreground">{SEASONS[season]}</span>
            <span className="ml-auto text-sm">
              Budget: <span className="font-semibold text-foreground">${budget.toLocaleString()}</span>
            </span>
            <span className="text-sm">
              Yield: <span className="font-semibold text-foreground">{yieldPct}%</span>
            </span>
            <button
              onClick={nextSeason}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              End season →
            </button>
          </div>

          <div className="relative h-[420px] overflow-hidden rounded-2xl border border-border bg-[radial-gradient(circle_at_30%_20%,_oklch(0.78_0.12_120)_0%,_oklch(0.5_0.1_140)_60%,_oklch(0.35_0.08_140)_100%)]">
            <div className="absolute inset-0 bg-[linear-gradient(transparent_24px,_rgba(0,0,0,0.08)_25px),linear-gradient(90deg,transparent_24px,_rgba(0,0,0,0.08)_25px)] bg-[length:25px_25px]" />
            {sightings.map((s) => {
              const ins = insects.find((i) => i.id === s.insectId)!;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelected(s)}
                  style={{ left: `${s.x}%`, top: `${s.y}%` }}
                  className={`absolute grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 backdrop-blur transition hover:scale-110 ${
                    selected?.id === s.id ? "border-secondary bg-card/95" : "border-card/80 bg-card/80"
                  }`}
                  title={ins.commonName}
                >
                  <Bug className="h-6 w-6 text-destructive" />
                </button>
              );
            })}
            {sightings.length === 0 && (
              <div className="absolute inset-0 grid place-items-center text-sm font-medium text-card">
                Field clear — end the season to advance.
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">Sighting</h3>
            {selectedInsect ? (
              <>
                <p className="mt-2 text-sm">
                  <span className="font-semibold">{selectedInsect.commonName}</span>
                  <br />
                  <span className="italic text-muted-foreground">{selectedInsect.scientificName}</span>
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {(Object.keys(TACTIC_ICON) as Tactic[]).map((t) => {
                    const Icon = TACTIC_ICON[t];
                    return (
                      <button
                        key={t}
                        onClick={() => applyTactic(t)}
                        className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-muted"
                      >
                        <Icon className="h-4 w-4 text-primary" /> {t}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">Tap a sighting on the field to pick a tactic.</p>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">Field log</h3>
            <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto text-xs text-muted-foreground">
              {log.map((line, i) => (
                <li key={i} className="rounded-md bg-muted/50 px-2 py-1">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </OverlayShell>
  );
}
import { useEffect, useMemo, useState } from "react";
import { OverlayShell } from "@/components/OverlayShell";
import { Sparkles, Lock, Check } from "lucide-react";

interface Props {
  onClose: () => void;
  xp: number;
  totalCorrect: number;
  mastered: number;
}

type Slot = "hat" | "tool" | "gear" | "badge";

interface Item {
  id: string;
  slot: Slot;
  name: string;
  emoji: string;
  cost: number;
  perk: string;
}

const ITEMS: Item[] = [
  { id: "cap", slot: "hat", name: "Field cap", emoji: "🧢", cost: 0, perk: "Keeps the sun out while you scout." },
  { id: "safari", slot: "hat", name: "Safari hat", emoji: "🎩", cost: 150, perk: "Official expedition headwear." },
  { id: "helmet", slot: "hat", name: "Lab helmet", emoji: "⛑️", cost: 400, perk: "For field trials and research plots." },
  { id: "lens", slot: "tool", name: "Hand lens", emoji: "🔍", cost: 0, perk: "See antennae and mouthparts up close." },
  { id: "net", slot: "tool", name: "Sweep net", emoji: "🥅", cost: 100, perk: "Sample a whole row of alfalfa in one pass." },
  { id: "scope", slot: "tool", name: "Microscope", emoji: "🔬", cost: 350, perk: "Confirm family-level features." },
  { id: "camera", slot: "tool", name: "Field camera", emoji: "📷", cost: 600, perk: "Document every observation." },
  { id: "notebook", slot: "gear", name: "Field notebook", emoji: "📓", cost: 0, perk: "Record counts and dates." },
  { id: "boots", slot: "gear", name: "Muck boots", emoji: "🥾", cost: 200, perk: "Scout wet field edges." },
  { id: "vest", slot: "gear", name: "Scout vest", emoji: "🦺", cost: 500, perk: "Pockets for vials, tags and traps." },
  { id: "rookie", slot: "badge", name: "Rookie badge", emoji: "🎖️", cost: 0, perk: "You started the quest." },
  { id: "detective", slot: "badge", name: "Bug detective", emoji: "🕵️", cost: 250, perk: "You solve identifications from clues." },
  { id: "entomologist", slot: "badge", name: "Entomologist", emoji: "🏅", cost: 800, perk: "Top rank in the field school." },
];

const SLOTS: { id: Slot; label: string }[] = [
  { id: "hat", label: "Headgear" },
  { id: "tool", label: "Tools" },
  { id: "gear", label: "Field gear" },
  { id: "badge", label: "Badges" },
];

const KEY = "entoquest-scout";

interface Saved {
  name: string;
  equipped: Record<Slot, string>;
}

const DEFAULTS: Saved = { name: "Scout", equipped: { hat: "cap", tool: "lens", gear: "notebook", badge: "rookie" } };

function useScout() {
  const [saved, setSaved] = useState<Saved>(DEFAULTS);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSaved({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, []);
  const update = (next: Saved) => {
    setSaved(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };
  return { saved, update };
}

function k5Points() {
  if (typeof localStorage === "undefined") return 0;
  let sum = 0;
  for (const key of ["entoquest.k5.points"]) {
    const v = Number(localStorage.getItem(key) ?? 0);
    if (!Number.isNaN(v)) sum += v;
  }
  return sum;
}

export function ScoutProfile({ onClose, xp, totalCorrect, mastered }: Props) {
  const { saved, update } = useScout();
  const [extra, setExtra] = useState(0);
  useEffect(() => setExtra(k5Points()), []);

  const points = xp + extra + totalCorrect * 5 + mastered * 20;
  const rank = useMemo(() => {
    if (points >= 800) return { title: "Field Entomologist", next: null as number | null };
    if (points >= 400) return { title: "Senior Scout", next: 800 };
    if (points >= 150) return { title: "Bug Detective", next: 400 };
    return { title: "Rookie Scout", next: 150 };
  }, [points]);

  const unlocked = (i: Item) => points >= i.cost;
  const equip = (i: Item) => {
    if (!unlocked(i)) return;
    update({ ...saved, equipped: { ...saved.equipped, [i.slot]: i.id } });
  };
  const worn = (slot: Slot) => ITEMS.find((i) => i.id === saved.equipped[slot]);

  return (
    <OverlayShell title="Your Bug Scout" subtitle="Earn points, gear up, become an entomologist" onClose={onClose}>
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        {/* Character */}
        <div className="rounded-2xl border border-primary/40 bg-gradient-to-b from-primary/25 to-secondary/20 p-5 text-center">
          <div className="mx-auto grid h-44 w-44 place-items-center rounded-full bg-card/80 text-7xl shadow-inner">
            <div className="relative">
              <span className="absolute -top-9 left-1/2 -translate-x-1/2 text-4xl">{worn("hat")?.emoji}</span>
              <span>🕵️</span>
              <span className="absolute -bottom-2 -left-8 text-3xl">{worn("tool")?.emoji}</span>
              <span className="absolute -bottom-2 -right-8 text-3xl">{worn("gear")?.emoji}</span>
            </div>
          </div>
          <input
            value={saved.name}
            onChange={(e) => update({ ...saved, name: e.target.value.slice(0, 18) })}
            className="mt-4 w-full rounded-md border border-input bg-background px-3 py-2 text-center font-display text-lg font-extrabold text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Scout name"
          />
          <div className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent">
            {worn("badge")?.emoji} {rank.title}
          </div>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-sm font-bold text-foreground">
            <Sparkles className="h-4 w-4 text-primary" /> {points} scout points
          </div>
          {rank.next && (
            <>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-card">
                <div className="h-full bg-accent" style={{ width: `${Math.min(100, (points / rank.next) * 100)}%` }} />
              </div>
              <p className="mt-1.5 text-[11px] text-foreground/70">
                {rank.next - points} points to the next rank — keep playing games to earn them.
              </p>
            </>
          )}
        </div>

        {/* Locker */}
        <div className="space-y-5">
          {SLOTS.map((s) => (
            <section key={s.id}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{s.label}</h3>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {ITEMS.filter((i) => i.slot === s.id).map((i) => {
                  const open = unlocked(i);
                  const on = saved.equipped[s.id] === i.id;
                  return (
                    <button
                      key={i.id}
                      onClick={() => equip(i)}
                      disabled={!open}
                      className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                        on
                          ? "border-primary bg-primary/15"
                          : open
                            ? "border-border bg-card hover:bg-muted/50"
                            : "cursor-not-allowed border-dashed border-border bg-muted/30 opacity-70"
                      }`}
                    >
                      <span className="text-2xl">{i.emoji}</span>
                      <span className="flex-1">
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                          {i.name}
                          {on && <Check className="h-3.5 w-3.5 text-primary" />}
                          {!open && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                        </span>
                        <span className="block text-xs text-muted-foreground">{i.perk}</span>
                        <span className="mt-1 block text-[11px] font-bold uppercase tracking-wider text-accent">
                          {open ? (on ? "Equipped" : "Tap to equip") : `Unlocks at ${i.cost} pts`}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </OverlayShell>
  );
}

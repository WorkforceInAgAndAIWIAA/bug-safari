import { useMemo, useState } from "react";
import { Ear, Radio, Wrench } from "lucide-react";
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

/* ================================================== 1. HOW INSECTS HEAR ====
   Theme: "The Listening Post" — a Concentration memory match.
   Flip a species card and an ear-location card; a match reveals the biology.
   ============================================================================ */

interface EarPair {
  id: string;
  insect: string;
  emoji: string;
  organ: string;
  fact: string;
}

const EAR_PAIRS: EarPair[] = [
  {
    id: "cricket",
    insect: "Field cricket",
    emoji: "🦗",
    organ: "Tympanum on the front tibia",
    fact: "A cricket's eardrum sits on its front leg. It aims at a singing male by turning the whole leg like a directional antenna.",
  },
  {
    id: "mosquito",
    insect: "Mosquito",
    emoji: "🦟",
    organ: "Johnston's organ in the antennae",
    fact: "Male mosquitoes hear with feathery antennae: the shaft vibrates to the female's wingbeat and Johnston's organ at the base reads the motion.",
  },
  {
    id: "moth",
    insect: "Noctuid moth",
    emoji: "🦋",
    organ: "Tympanum on the thorax (metathorax)",
    fact: "Noctuid moths hear bat echolocation with a two-neuron ear on the thorax — loud pulses trigger an instant power dive.",
  },
  {
    id: "grasshopper",
    insect: "Grasshopper",
    emoji: "🌾",
    organ: "Tympanum on the first abdominal segment",
    fact: "Grasshopper ears are a pair of oval membranes on the sides of the abdomen, just behind the hind legs.",
  },
  {
    id: "cicada",
    insect: "Cicada",
    emoji: "🎺",
    organ: "Tympanal organ beneath the abdomen",
    fact: "Cicadas crease their own eardrums while singing so the 100+ dB call does not deafen them.",
  },
  {
    id: "lacewing",
    insect: "Green lacewing",
    emoji: "🪰",
    organ: "Ear at the base of the forewing vein",
    fact: "Lacewings hear ultrasound through a swelling in a wing vein — enough to fold their wings and drop away from a hunting bat.",
  },
  {
    id: "caterpillar",
    insect: "Caterpillar",
    emoji: "🐛",
    organ: "Sensory hairs (setae), no eardrum",
    fact: "Many caterpillars have no ear at all. Fine body hairs pick up the air motion of a wasp's wingbeat and trigger a thrash-and-drop response.",
  },
  {
    id: "honeybee",
    insect: "Honey bee",
    emoji: "🐝",
    organ: "Johnston's organ, tuned to comb vibration",
    fact: "Bees feel the waggle dance rather than hear it in air — antennal Johnston's organs read vibrations carried through the comb.",
  },
];

type MemCard = { key: string; pairId: string; face: "insect" | "organ"; label: string; emoji?: string };

export function ListeningPost({ add, onFinish }: GameProps) {
  const deck = useMemo(() => {
    const chosen = shuffle(EAR_PAIRS).slice(0, 6);
    const cards: MemCard[] = chosen.flatMap((p) => [
      { key: `${p.id}-i`, pairId: p.id, face: "insect" as const, label: p.insect, emoji: p.emoji },
      { key: `${p.id}-o`, pairId: p.id, face: "organ" as const, label: p.organ },
    ]);
    return { chosen, cards: shuffle(cards) };
  }, []);

  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [reveal, setReveal] = useState<EarPair | null>(null);

  const done = matched.length === deck.chosen.length;

  function flip(card: MemCard) {
    if (matched.includes(card.pairId) || flipped.includes(card.key) || flipped.length === 2) return;
    const next = [...flipped, card.key];
    setFlipped(next);
    if (next.length === 2) {
      const [a, b] = next.map((k) => deck.cards.find((c) => c.key === k)!);
      setAttempts((n) => n + 1);
      if (a.pairId === b.pairId && a.face !== b.face) {
        const pair = deck.chosen.find((p) => p.id === a.pairId)!;
        setMatched((m) => [...m, pair.id]);
        setReveal(pair);
        add(10);
        setTimeout(() => setFlipped([]), 350);
      } else {
        setTimeout(() => setFlipped([]), 900);
      }
    }
  }

  function finish() {
    const efficiency = Math.max(0, 18 - attempts);
    const score = matched.length * 10 + efficiency * 3;
    onFinish({
      score,
      correct: matched.length,
      total: deck.chosen.length,
      message:
        "Insect ears are wherever evolution could put a membrane: legs, thorax, abdomen, wing veins, even antennae. Location follows function — bat-detecting ears sit high on the body, mate-finding ears face sideways.",
    });
  }

  return (
    <div className="space-y-4">
      <Banner
        kicker="The Listening Post"
        title="Match each insect to its ear"
        sub="Concentration: flip two cards. An insect and its hearing organ make a pair — and unlock the biology behind it."
      />

      <div className="flex flex-wrap gap-3 text-sm">
        <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">Attempts {attempts}</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">
          <Ear className="h-3.5 w-3.5" /> Pairs {matched.length}/{deck.chosen.length}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {deck.cards.map((c) => {
          const open = flipped.includes(c.key) || matched.includes(c.pairId);
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => flip(c)}
              className={`min-h-[92px] rounded-xl border p-3 text-left text-xs transition ${
                matched.includes(c.pairId)
                  ? "border-success/50 bg-success/10"
                  : open
                    ? "border-primary bg-primary/10"
                    : "border-border bg-muted/50 hover:bg-muted"
              }`}
            >
              {open ? (
                <span className="font-semibold text-foreground">
                  {c.emoji ? `${c.emoji} ` : "🔊 "}
                  {c.label}
                </span>
              ) : (
                <span className="text-muted-foreground">Listening post card</span>
              )}
            </button>
          );
        })}
      </div>

      {reveal && (
        <div className="rounded-xl border border-accent/40 bg-card p-3 text-sm">
          <div className="font-semibold text-foreground">
            {reveal.emoji} {reveal.insect} — {reveal.organ}
          </div>
          <p className="mt-1 text-muted-foreground">{reveal.fact}</p>
        </div>
      )}

      {done && (
        <button
          type="button"
          onClick={finish}
          className="w-full rounded-md bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:opacity-90"
        >
          All pairs found — see results →
        </button>
      )}
    </div>
  );
}

/* ==================================================== 2. ANTENNAE DOMINOES ==
   Theme: "The Antenna Line" — chain dominoes end to end.
   Each tile: [antenna shape] | [insect]. You may play a tile on either open
   end when the matching half agrees with that end.
   ============================================================================ */

interface Tile {
  id: string;
  antenna: string;
  antennaGloss: string;
  insect: string;
  emoji: string;
}

/** Each insect's antenna type; a domino carries one antenna type and one insect
    which may belong to a DIFFERENT antenna type — you chain shape → insect. */
const ANTENNA_TYPES: { type: string; gloss: string; insect: string; emoji: string }[] = [
  { type: "Filiform (thread-like)", gloss: "uniform, slender segments", insect: "Ground beetle", emoji: "🪲" },
  { type: "Clavate (clubbed)", gloss: "gradually thickened tip", insect: "Monarch butterfly", emoji: "🦋" },
  { type: "Lamellate (plated)", gloss: "flat plates that fan open", insect: "June beetle", emoji: "🐞" },
  { type: "Plumose (feathery)", gloss: "dense side branches", insect: "Male mosquito", emoji: "🦟" },
  { type: "Geniculate (elbowed)", gloss: "long scape with a bend", insect: "Honey bee", emoji: "🐝" },
  { type: "Serrate (saw-toothed)", gloss: "one-sided tooth per segment", insect: "Click beetle", emoji: "⚡" },
  { type: "Moniliform (beaded)", gloss: "round, bead-like segments", insect: "Termite", emoji: "🪵" },
  { type: "Aristate (bristled)", gloss: "pouch-like with a side bristle", insect: "House fly", emoji: "🪰" },
];

function buildHand(): { chain: Tile[]; hand: Tile[]; startAntenna: string } {
  const ring = shuffle(ANTENNA_TYPES);
  // build tiles as [antenna of ring[i]] | [insect of ring[i+1]]
  const tiles: Tile[] = ring.map((a, i) => {
    const partner = ring[(i + 1) % ring.length];
    return {
      id: `${a.type}->${partner.insect}`,
      antenna: a.type,
      antennaGloss: a.gloss,
      insect: partner.insect,
      emoji: partner.emoji,
    };
  });
  return { chain: [], hand: shuffle(tiles), startAntenna: ring[0].type };
}

function antennaOf(insect: string): string {
  return ANTENNA_TYPES.find((a) => a.insect === insect)!.type;
}

export function AntennaeDominoes({ add, onFinish }: GameProps) {
  const initial = useMemo(buildHand, []);
  const [hand, setHand] = useState<Tile[]>(initial.hand);
  const [chain, setChain] = useState<Tile[]>([]);
  const [misplays, setMisplays] = useState(0);
  const [note, setNote] = useState(
    "Play any tile to open the line. After that, a tile only fits when the insect on the line actually has the antenna type you are attaching.",
  );

  const rightEnd = chain.length ? chain[chain.length - 1].insect : null;
  const leftEnd = chain.length ? chain[0].antenna : null;
  const done = hand.length === 0;

  function play(t: Tile, side: "left" | "right") {
    if (chain.length === 0) {
      setChain([t]);
      setHand((h) => h.filter((x) => x.id !== t.id));
      add(6);
      setNote(`Line opened with ${t.antenna} → ${t.insect}.`);
      return;
    }
    if (side === "right") {
      // the insect at the right end must own the antenna type of the new tile
      if (rightEnd && antennaOf(rightEnd) === t.antenna) {
        setChain((c) => [...c, t]);
        setHand((h) => h.filter((x) => x.id !== t.id));
        add(10);
        setNote(`${rightEnd} does carry ${t.antenna} antennae — tile fits on the right.`);
      } else {
        setMisplays((m) => m + 1);
        setNote(`${rightEnd} does not have ${t.antenna} antennae. Look at the shape gloss before you play.`);
      }
    } else {
      // the new tile's insect must own the antenna type at the left end
      if (leftEnd && antennaOf(t.insect) === leftEnd) {
        setChain((c) => [t, ...c]);
        setHand((h) => h.filter((x) => x.id !== t.id));
        add(10);
        setNote(`${t.insect} carries ${leftEnd} antennae — tile fits on the left.`);
      } else {
        setMisplays((m) => m + 1);
        setNote(`${t.insect} does not carry ${leftEnd} antennae. Try the other end.`);
      }
    }
  }

  function finish() {
    const score = Math.max(0, chain.length * 10 - misplays * 3);
    add(0);
    onFinish({
      score,
      correct: Math.max(0, chain.length - misplays),
      total: initial.hand.length,
      message:
        "Antenna shape is a working diagnostic character: plumose antennae mean a male tracking a pheromone plume, lamellate plates mean a scarab sampling air, geniculate elbows mean a bee or ant carrying the antenna into tight spaces.",
    });
  }

  return (
    <div className="space-y-4">
      <Banner
        kicker="The Antenna Line"
        title="Antennae dominoes"
        sub="Chain tiles end to end. A tile only fits when the insect at that end really does carry that antenna type."
        tone="accent"
      />

      <div className="flex flex-wrap gap-3 text-sm">
        <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">Tiles in hand {hand.length}</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">
          <Radio className="h-3.5 w-3.5" /> Line length {chain.length}
        </span>
        <span className="rounded-full bg-destructive/10 px-3 py-1 text-destructive">Misplays {misplays}</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card p-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">The line</div>
        {chain.length === 0 ? (
          <p className="mt-1 text-xs text-muted-foreground">Empty — play any tile to start.</p>
        ) : (
          <div className="mt-2 flex min-w-max items-stretch gap-1">
            {chain.map((t) => (
              <div key={t.id} className="flex overflow-hidden rounded-md border border-border text-[11px]">
                <div className="bg-accent/10 px-2 py-1.5 text-foreground">{t.antenna}</div>
                <div className="bg-primary/10 px-2 py-1.5 font-semibold text-foreground">
                  {t.emoji} {t.insect}
                </div>
              </div>
            ))}
          </div>
        )}
        {chain.length > 0 && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            Left end needs an insect with <strong>{leftEnd}</strong> antennae · Right end is{" "}
            <strong>{rightEnd}</strong>, so it needs a tile whose antenna type matches that insect.
          </p>
        )}
      </div>

      <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">{note}</p>

      <div className="grid gap-2 sm:grid-cols-2">
        {hand.map((t) => (
          <div key={t.id} className="rounded-xl border border-border bg-card p-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-md bg-accent/10 px-2 py-1 font-semibold text-foreground">{t.antenna}</span>
              <span className="text-muted-foreground">|</span>
              <span className="rounded-md bg-primary/10 px-2 py-1 font-semibold text-foreground">
                {t.emoji} {t.insect}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">Shape: {t.antennaGloss}</div>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => play(t, "left")}
                className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-[11px] font-bold text-foreground hover:bg-muted"
              >
                ◀ Play left
              </button>
              <button
                type="button"
                onClick={() => play(t, "right")}
                className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-[11px] font-bold text-foreground hover:bg-muted"
              >
                Play right ▶
              </button>
            </div>
          </div>
        ))}
      </div>

      {(done || (hand.length > 0 && misplays >= 6)) && (
        <button
          type="button"
          onClick={finish}
          className="w-full rounded-md bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:opacity-90"
        >
          {done ? "Whole hand played — see results →" : "End the line — see results →"}
        </button>
      )}
    </div>
  );
}

/* ====================================================== 3. GUESS THE TOOL ===
   Theme: "The Toolshed" — match insect specimens to the tool analogy that
   describes their mouthpart, then read the feeding evidence in round two.
   ============================================================================ */

interface Tool {
  id: string;
  tool: string;
  emoji: string;
  mouthpart: string;
  how: string;
}

const TOOLS: Tool[] = [
  { id: "straw", tool: "Drinking straw", emoji: "🥤", mouthpart: "Siphoning proboscis", how: "A coiled tube that uncoils to draw liquid nectar." },
  { id: "sponge", tool: "Sponge mop", emoji: "🧽", mouthpart: "Sponging labellum", how: "Saliva dissolves the food, then grooved pads mop up the slurry." },
  { id: "scissors", tool: "Scissors", emoji: "✂️", mouthpart: "Chewing mandibles", how: "Opposing jaws cut and grind solid tissue away." },
  { id: "needle", tool: "Hypodermic needle", emoji: "💉", mouthpart: "Piercing-sucking stylet", how: "A stylet bundle punctures tissue and pumps fluid out." },
  { id: "brush", tool: "Paintbrush + spoon", emoji: "🖌️", mouthpart: "Chewing-lapping tongue", how: "Jaws for wax and comb, a hairy tongue for nectar." },
  { id: "grater", tool: "Cheese grater", emoji: "🧀", mouthpart: "Rasping-sucking stylet", how: "Rasps the cell open and sucks the contents out one cell at a time." },
];

const SPECIMENS: { insect: string; emoji: string; toolId: string; evidence: string }[] = [
  { insect: "Monarch butterfly", emoji: "🦋", toolId: "straw", evidence: "No damage at all — it visits flowers and takes only nectar." },
  { insect: "House fly", emoji: "🪰", toolId: "sponge", evidence: "Wet spots and regurgitation marks on the food surface." },
  { insect: "Grasshopper", emoji: "🦗", toolId: "scissors", evidence: "Ragged holes chewed inward from the leaf margin." },
  { insect: "Soybean aphid", emoji: "🐜", toolId: "needle", evidence: "Curled leaves, honeydew, sooty mold — no tissue missing." },
  { insect: "Honey bee", emoji: "🐝", toolId: "brush", evidence: "No plant injury; wax comb built and nectar carried home." },
  { insect: "Western flower thrips", emoji: "🌼", toolId: "grater", evidence: "Silvered patches with tiny black frass specks." },
];

export function GuessTheTool({ add, onFinish }: GameProps) {
  const order = useMemo(() => shuffle(SPECIMENS), []);
  const [round, setRound] = useState<1 | 2>(1);
  const [idx, setIdx] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [ruledOut, setRuledOut] = useState<string[]>([]);

  const spec = order[idx];
  const tools = useMemo(() => shuffle(TOOLS), []);

  function pick(t: Tool) {
    if (feedback) return;
    if (t.id === spec.toolId) {
      setCorrect((c) => c + 1);
      add(round === 1 ? 10 : 14);
      setFeedback({ ok: true, text: `${t.emoji} ${t.tool} → ${t.mouthpart}. ${t.how}` });
    } else {
      setWrong((w) => w + 1);
      setRuledOut((r) => [...r, t.id]);
      setFeedback({
        ok: false,
        text: `${t.tool} means ${t.mouthpart} — that does not fit this specimen. Ruled out; look at what the feeding actually leaves behind.`,
      });
    }
  }

  function next() {
    setFeedback(null);
    setRuledOut([]);
    if (idx + 1 < order.length) {
      setIdx((i) => i + 1);
      return;
    }
    if (round === 1) {
      setRound(2);
      setIdx(0);
      return;
    }
    onFinish({
      score: Math.max(0, correct * 12 - wrong * 3),
      correct,
      total: order.length * 2,
      message:
        "Form follows function: the tool tells you the wound, and the wound tells you the tool. Chewing removes tissue, siphoning leaves none, sponging leaves wet residue, piercing and rasping leave the tissue in place but discolored.",
    });
  }

  const canAdvance = feedback?.ok;

  return (
    <div className="space-y-4">
      <Banner
        kicker="The Toolshed"
        title={round === 1 ? "Round 1 · Match the specimen to its tool" : "Round 2 · Read the evidence backwards"}
        sub={
          round === 1
            ? "Every mouthpart is a tool. Pick the tool this insect is carrying."
            : "Now you only get the feeding evidence. Work back from the damage to the tool that made it."
        }
        tone={round === 1 ? "primary" : "accent"}
      />

      <div className="flex flex-wrap gap-3 text-sm">
        <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
          Specimen {idx + 1}/{order.length} · Round {round}
        </span>
        <span className="rounded-full bg-success/15 px-3 py-1 font-semibold text-success">Matched {correct}</span>
        <span className="rounded-full bg-destructive/10 px-3 py-1 text-destructive">Ruled out {wrong}</span>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        {round === 1 ? (
          <>
            <div className="text-3xl">{spec.emoji}</div>
            <div className="mt-1 font-display text-xl font-extrabold text-foreground">{spec.insect}</div>
            <p className="mt-1 text-sm text-muted-foreground">Which tool is in this insect's kit?</p>
          </>
        ) : (
          <>
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-accent">
              <Wrench className="h-3.5 w-3.5" /> Feeding evidence
            </div>
            <div className="mt-1 font-display text-lg font-extrabold text-foreground">{spec.evidence}</div>
            <p className="mt-1 text-sm text-muted-foreground">Which tool left this behind?</p>
          </>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {tools.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => pick(t)}
            disabled={ruledOut.includes(t.id) || !!feedback?.ok}
            className={`rounded-xl border p-3 text-left text-sm transition ${
              ruledOut.includes(t.id)
                ? "border-border bg-muted text-muted-foreground line-through"
                : "border-border bg-background hover:bg-muted"
            }`}
          >
            <div className="text-2xl">{t.emoji}</div>
            <div className="mt-1 font-semibold text-foreground">{t.tool}</div>
            <div className="text-[11px] text-muted-foreground">{t.how}</div>
          </button>
        ))}
      </div>

      {feedback && (
        <div className={`rounded-xl border p-3 text-sm ${feedback.ok ? "border-success/40 bg-success/10" : "border-destructive/40 bg-destructive/10"}`}>
          <p className="text-foreground">{feedback.text}</p>
          {!feedback.ok && (
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="mt-2 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted"
            >
              Try another tool
            </button>
          )}
        </div>
      )}

      {canAdvance && (
        <button
          type="button"
          onClick={next}
          className="w-full rounded-md bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:opacity-90"
        >
          {idx + 1 < order.length ? "Next specimen →" : round === 1 ? "Round 2: read the evidence →" : "See results →"}
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ meta */

export const HS_GAMES_3: GameMeta[] = [
  {
    id: "listening-post",
    name: "The Listening Post",
    emoji: "👂",
    topic: "How insects hear",
    blurb: "Concentration memory match: pair each insect with the body part it actually hears through.",
    howTo: [
      "Twelve face-down cards: six insects and six hearing organs.",
      "Flip two cards. A species and its correct ear location stay face up.",
      "Every match unlocks the biology behind that ear — where it sits and what it listens for.",
      "Fewer attempts scores higher, so remember what you have already turned over.",
    ],
    render: (p) => <ListeningPost {...p} />,
  },
  {
    id: "antennae-dominoes",
    name: "Antennae Dominoes",
    emoji: "🀄",
    topic: "Antennae",
    blurb: "Chain dominoes: one half is an antenna type, the other half is an insect. Both ends have to agree.",
    howTo: [
      "Each tile reads [antenna type] | [insect]. Play any tile to open the line.",
      "To add on the right, the insect at that end must genuinely carry the antenna type on your tile.",
      "To add on the left, your tile's insect must carry the antenna type showing at that end.",
      "The shape gloss under each tile is your key. Misplays cost points; empty your hand for the full chain.",
    ],
    render: (p) => <AntennaeDominoes {...p} />,
  },
  {
    id: "guess-the-tool",
    name: "The Toolshed",
    emoji: "🧰",
    topic: "Mouthparts",
    blurb: "Match insects to the tool their mouthpart really is — then run it backwards from the feeding evidence.",
    howTo: [
      "Round 1: a specimen appears. Pick the tool analogy that matches its mouthpart (straw, sponge, scissors, needle, grater, brush).",
      "A wrong tool is ruled out of the shed for that specimen and costs points — you keep working until you find the right one.",
      "Round 2: the specimen is hidden. You only see the damage or feeding behavior it left behind.",
      "Work from the wound back to the tool. Correct calls in round 2 are worth more.",
    ],
    render: (p) => <GuessTheTool {...p} />,
  },
];

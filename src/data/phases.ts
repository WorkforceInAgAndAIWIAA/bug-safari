import type { GradeLevel } from "@/lib/types";

export interface Phase {
  id: string;
  name: string;
  xpRequired: number;
  xpReward: number;
  description: string;
}

export const XP_PER_LEVEL = 100;

export const PHASES: Record<GradeLevel, Phase[]> = {
  elementary: [
    { id: "e1", name: "Spot the Bug", xpRequired: 0, xpReward: 10, description: "Identify the adult insect from a photo card." },
    { id: "e2", name: "Friend or Foe", xpRequired: 50, xpReward: 12, description: "Decide if the insect is a pest or a helper." },
    { id: "e3", name: "Order Up", xpRequired: 120, xpReward: 15, description: "Match the insect to its order (beetle, fly, moth…)." },
    { id: "e4", name: "Where It Lives", xpRequired: 220, xpReward: 18, description: "Match an insect to the crop it eats." },
  ],
  middle: [
    { id: "m1", name: "Field Scout", xpRequired: 0, xpReward: 12, description: "Identify by common name and host crop." },
    { id: "m2", name: "Order & Family", xpRequired: 80, xpReward: 16, description: "Place the insect in its order and family." },
    { id: "m3", name: "Life Cycle", xpRequired: 180, xpReward: 18, description: "Complete vs. incomplete metamorphosis." },
    { id: "m4", name: "IPM Role", xpRequired: 300, xpReward: 20, description: "Determine pest, beneficial, pollinator, or invasive." },
  ],
  high: [
    { id: "h1", name: "Scientific Name", xpRequired: 0, xpReward: 18, description: "Type the genus (or full binomial) from the photo." },
    { id: "h2", name: "Family Diagnostics", xpRequired: 120, xpReward: 20, description: "Use family-level traits to identify the specimen." },
    { id: "h3", name: "Economic Threshold", xpRequired: 260, xpReward: 22, description: "Decide whether scouting counts warrant action." },
    { id: "h4", name: "Mode of Action", xpRequired: 420, xpReward: 25, description: "Choose an IRAC group appropriate for the pest." },
  ],
};

export const BATCH_PHASES: string[] = []; // mini-game phases reserved for later expansion
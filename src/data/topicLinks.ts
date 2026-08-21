import type { LearningGradeLevel } from "@/lib/types";

/**
 * Connects a learning module (lesson) with the mini-game that practices the
 * same topic, at the same grade level, in both directions.
 */
export interface TopicLink {
  tier: LearningGradeLevel;
  topic: string;
  lessonId: string;
  gameId: string;
  gameName: string;
}

export const TOPIC_LINKS: TopicLink[] = [
  { tier: "elementary", topic: "Insect definition", lessonId: "what-is-an-insect", gameId: "insect-or-not", gameName: "Insect or Not?" },
  { tier: "elementary", topic: "3-part body plan", lessonId: "what-is-an-insect", gameId: "build-insect", gameName: "Build an Insect" },
  { tier: "elementary", topic: "Common names", lessonId: "names", gameId: "name-insect", gameName: "Name the Insect" },
  { tier: "elementary", topic: "Life stages", lessonId: "egg-to-adult", gameId: "life-stages", gameName: "Life Stages Sequence" },
  { tier: "elementary", topic: "Head position", lessonId: "parts", gameId: "head-position", gameName: "Head Position Match" },
  { tier: "elementary", topic: "Pollinators", lessonId: "pollinators", gameId: "pollinator-power", gameName: "Pollinator Power" },
  { tier: "elementary", topic: "Predator/pest", lessonId: "predators", gameId: "predator-pest", gameName: "Predator vs. Pest" },
  { tier: "elementary", topic: "Decomposers", lessonId: "decomposers", gameId: "decomposer-dash", gameName: "Decomposer Dash" },
  { tier: "elementary", topic: "Beneficial insects", lessonId: "protect-beneficials", gameId: "beneficial-sort", gameName: "Beneficial Sort" },
  { tier: "elementary", topic: "Invasive species", lessonId: "native-vs-invasive", gameId: "insect-invasion", gameName: "Insect Invasion: Save the Farm!" },
  { tier: "elementary", topic: "Biodiversity", lessonId: "biodiversity", gameId: "mix-match", gameName: "Insect Mix and Match" },
  { tier: "elementary", topic: "Food webs", lessonId: "food-chains", gameId: "web-of-life", gameName: "Web of Life" },
  { tier: "elementary", topic: "Ecosystem balance", lessonId: "producers-consumers-decomposers", gameId: "pull-the-string", gameName: "Pull the String" },
  { tier: "elementary", topic: "Dispersal", lessonId: "move-and-spread", gameId: "insect-travel", gameName: "Insect Travel" },
  { tier: "elementary", topic: "Basic management", lessonId: "ipm", gameId: "ipm-beginner", gameName: "IPM Beginner" },

  { tier: "middle", topic: "Taxonomy", lessonId: "taxonomy", gameId: "match", gameName: "Bug Name Match-Up" },
  { tier: "middle", topic: "Morphology", lessonId: "morphology", gameId: "build", gameName: "Build-a-Bug" },
  { tier: "middle", topic: "Identification", lessonId: "observation", gameId: "detective", gameName: "Bug Detective" },
  { tier: "middle", topic: "Life cycles", lessonId: "metamorphosis", gameId: "life-cycle", gameName: "Life Cycle Builder" },

  { tier: "high", topic: "Scientific names", lessonId: "scientific-names", gameId: "binomial-battleship", gameName: "Binomial Battleship" },
  { tier: "high", topic: "Scientific families", lessonId: "scientific-families", gameId: "family-feud-taxonomy", gameName: "Family Sort Showdown" },
  { tier: "high", topic: "Predator/pest interactions", lessonId: "predator-pest", gameId: "balance-the-field", gameName: "Balance the Field" },
  { tier: "high", topic: "Identification", lessonId: "ipm", gameId: "field-scout", gameName: "Field Scout" },
  { tier: "high", topic: "Metamorphosis", lessonId: "metamorphosis", gameId: "life-cycle", gameName: "Life Cycle Sort" },
  { tier: "high", topic: "Scientific families", lessonId: "scientific-families", gameId: "order-up", gameName: "Order Up" },
  { tier: "high", topic: "Predator/pest interactions", lessonId: "predator-pest", gameId: "natural-enemies", gameName: "Natural Enemies" },
  { tier: "high", topic: "Metamorphosis", lessonId: "metamorphosis", gameId: "metamorphosis-race", gameName: "Molt & Move" },
  { tier: "high", topic: "Economic impact of insects", lessonId: "ipm", gameId: "farm-economics", gameName: "Bottom Line Farm" },
  { tier: "high", topic: "Insect damage", lessonId: "predator-pest", gameId: "damage-csi", gameName: "Damage CSI" },
];

export function linkForLesson(tier: LearningGradeLevel, lessonId: string) {
  return TOPIC_LINKS.find((l) => l.tier === tier && l.lessonId === lessonId);
}

export function linkForGame(tier: LearningGradeLevel, gameId: string) {
  return TOPIC_LINKS.find((l) => l.tier === tier && l.gameId === gameId);
}

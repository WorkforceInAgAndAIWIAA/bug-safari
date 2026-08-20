import { insects, type Insect } from "@/data/insects";
import type { LearningGradeLevel } from "@/lib/types";

const ELEMENTARY_IDS = [
  "monarch-butterfly", "honey-bee", "seven-spotted-lady-beetle", "differential-grasshopper",
  "tomato-hornworm", "japanese-beetle", "green-lacewing", "assassin-bug",
  "spotted-lantern-fly", "ground-beetle", "squash-bug", "syrphid-fly", "wireworm",
  "white-grub", "braconid-wasp",
] as const;

const MIDDLE_IDS = [
  "monarch-butterfly", "black-swallowtail", "honey-bee", "bumble-bee", "braconid-wasp",
  "seven-spotted-lady-beetle", "asian-lady-beetle", "japanese-beetle", "ground-beetle",
  "colorado-potato-beetle", "striped-cucumber-beetle", "emerald-ash-borer",
  "differential-grasshopper", "two-striped-grasshopper", "tomato-hornworm", "cabbage-looper",
  "corn-earworm", "european-corn-borer", "diamondback-moth", "green-lacewing", "syrphid-fly",
  "assassin-bug", "squash-bug", "brown-marmorated-stink-bug", "green-stink-bug",
  "big-eyed-bug", "minute-pirate-bug", "spotted-lantern-fly", "meadow-spittlebug",
  "potato-leafhopper", "pea-aphid", "onion-thrips", "wireworm", "white-grub",
  "two-spotted-spider-mite",
] as const;

const HIGH_IDS = [
  "monarch-butterfly", "black-swallowtail", "honey-bee", "bumble-bee", "braconid-wasp",
  "seven-spotted-lady-beetle", "asian-lady-beetle", "japanese-beetle", "ground-beetle",
  "colorado-potato-beetle", "striped-cucumber-beetle", "emerald-ash-borer", "asian-longhorn-beetle",
  "asiatic-garden-beetle", "cereal-leaf-beetle", "corn-flea-beetle", "crucifer-flea-beetle",
  "bean-leaf-beetle", "mexican-bean-beetle", "alfalfa-weevil", "clover-leaf-weevil",
  "granary-weevil", "maize-weevil", "rice-weevil", "northern-corn-rootworm", "dectes-stem-borer",
  "differential-grasshopper", "two-striped-grasshopper", "red-legged-grasshopper", "tomato-hornworm",
  "cabbage-looper", "imported-cabbageworm", "corn-earworm", "european-corn-borer",
  "diamondback-moth", "army-cutworm", "black-cutworm", "beet-armyworm", "fall-armyworm",
  "green-cloverworm", "garden-webworm", "indian-meal-moth", "spongy-moth",
  "southwestern-corn-borer", "green-lacewing", "syrphid-fly", "hessian-fly", "seed-corn-maggot",
  "assassin-bug", "squash-bug", "brown-marmorated-stink-bug", "green-stink-bug", "big-eyed-bug",
  "minute-pirate-bug", "spined-soldier-bug", "chinch-bug", "kudzu-bug", "spotted-lantern-fly",
  "meadow-spittlebug", "potato-leafhopper", "pea-aphid", "bird-cherry-oat-aphid", "greenbug",
  "russian-wheat-aphid", "soybean-aphid", "onion-thrips", "wireworm", "corn-wireworm",
  "white-grub", "two-spotted-spider-mite",
] as const;

const COLLEGIATE_IDS = [
  "monarch-butterfly", "black-swallowtail", "tomato-hornworm", "tobacco-hornworm", "cabbage-looper",
  "imported-cabbageworm", "corn-earworm", "european-corn-borer", "diamondback-moth", "army-cutworm",
  "black-cutworm", "dingy-cutworm", "true-armyworm", "variegated-cutworm", "western-bean-cutworm",
  "beet-armyworm", "fall-armyworm", "green-cloverworm", "garden-webworm", "soybean-looper-moth",
  "indian-meal-moth", "angoumois-grain-moth", "spongy-moth", "southwestern-corn-borer",
  "sorghum-webworm", "thistle-caterpillar-painted-lady-butterfly", "stalk-borer",
  "seven-spotted-lady-beetle", "asian-lady-beetle", "japanese-beetle", "ground-beetle",
  "colorado-potato-beetle", "striped-cucumber-beetle", "spotted-cucumber-beetle", "cereal-leaf-beetle",
  "corn-flea-beetle", "crucifer-flea-beetle", "asian-longhorn-beetle", "asiatic-garden-beetle",
  "emerald-ash-borer", "bean-leaf-beetle", "mexican-bean-beetle", "confused-flour-beetle",
  "red-flour-beetle", "sawtoothed-grain-beetle", "foreign-grain-beetle", "lesser-grain-borer",
  "granary-weevil", "maize-weevil", "rice-weevil", "alfalfa-weevil", "clover-leaf-weevil",
  "striped-blister-beetle", "northern-corn-rootworm", "southern-corn-rootworm", "western-corn-rootworm",
  "dectes-stem-borer", "wireworm", "corn-wireworm", "eastern-field-wireworm", "white-grub",
  "green-lacewing", "assassin-bug", "big-eyed-bug", "minute-pirate-bug", "squash-bug",
  "brown-marmorated-stink-bug", "green-stink-bug", "one-spotted-stink-bug", "spined-soldier-bug",
  "chinch-bug", "kudzu-bug", "tarnished-plant-bug", "threecornered-alfalfa-hopper",
  "potato-leafhopper", "meadow-spittlebug", "spotted-lantern-fly", "pea-aphid", "corn-leaf-aphid",
  "corn-root-aphid", "bird-cherry-oat-aphid", "english-grain-aphid", "russian-wheat-aphid",
  "greenbug", "soybean-aphid", "spotted-alfalfa-aphid", "sugarcane-aphid",
  "yellow-sugarcane-aphid", "soybean-thrips", "two-striped-grasshopper", "bumble-bee",
  "corn-silk-fly", "onion-thrips", "differential-grasshopper", "honey-bee", "syrphid-fly",
  "western-flower-thrips", "red-legged-grasshopper", "braconid-wasp", "hessian-fly",
  "wheat-stem-sawfly", "seed-corn-maggot", "sorghum-midge", "swede-midge",
  "alfalfa-blotch-leafminer", "two-spotted-spider-mite", "banks-grass-mite",
] as const;

const IDS_BY_GRADE: Record<LearningGradeLevel, readonly string[]> = {
  elementary: ELEMENTARY_IDS,
  middle: MIDDLE_IDS,
  high: HIGH_IDS,
  collegiate: COLLEGIATE_IDS,
};

export const INSECTS_BY_GRADE: Record<LearningGradeLevel, Insect[]> = Object.fromEntries(
  Object.entries(IDS_BY_GRADE).map(([grade, ids]) => {
    const idSet = new Set(ids);
    return [grade, insects.filter((insect) => idSet.has(insect.id))];
  }),
) as Record<LearningGradeLevel, Insect[]>;

export function insectsForGrade(grade: LearningGradeLevel): Insect[] {
  return INSECTS_BY_GRADE[grade];
}
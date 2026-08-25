import { insects, type Insect } from "@/data/insects";
import type { LearningGradeLevel } from "@/lib/types";

const ELEMENTARY_IDS = [ "seven-spotted-lady-beetle", "japanese-beetle",
] as const;

const MIDDLE_IDS = [
  "seven-spotted-lady-beetle", "asian-lady-beetle", "japanese-beetle", "striped-cucumber-beetle",
  "corn-earworm", "european-corn-borer", "brown-marmorated-stink-bug", "green-stink-bug", "meadow-spittlebug",
  "potato-leafhopper", "pea-aphid",
  "two-spotted-spider-mite",
] as const;

const HIGH_IDS = [
  "seven-spotted-lady-beetle", "asian-lady-beetle", "japanese-beetle", "striped-cucumber-beetle",
  "bean-leaf-beetle", "alfalfa-weevil", "northern-corn-rootworm", "dectes-stem-borer", "corn-earworm", "european-corn-borer", "black-cutworm", "fall-armyworm",
  "green-cloverworm", "seed-corn-maggot", "brown-marmorated-stink-bug", "green-stink-bug", "spined-soldier-bug",
  "meadow-spittlebug", "potato-leafhopper", "pea-aphid", "bird-cherry-oat-aphid", "two-spotted-spider-mite",
] as const;

const COLLEGIATE_IDS = [ "corn-earworm", "european-corn-borer",
  "black-cutworm", "dingy-cutworm", "true-armyworm", "variegated-cutworm", "western-bean-cutworm", "fall-armyworm", "green-cloverworm", "soybean-looper-moth", "thistle-caterpillar-painted-lady-butterfly", "stalk-borer",
  "seven-spotted-lady-beetle", "asian-lady-beetle", "japanese-beetle", "striped-cucumber-beetle", "spotted-cucumber-beetle", "bean-leaf-beetle", "alfalfa-weevil",
  "striped-blister-beetle", "northern-corn-rootworm",
  "dectes-stem-borer",
  "brown-marmorated-stink-bug", "green-stink-bug", "spined-soldier-bug", "tarnished-plant-bug",
  "potato-leafhopper", "meadow-spittlebug", "pea-aphid", "corn-leaf-aphid", "bird-cherry-oat-aphid", "english-grain-aphid", "seed-corn-maggot", "two-spotted-spider-mite",
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
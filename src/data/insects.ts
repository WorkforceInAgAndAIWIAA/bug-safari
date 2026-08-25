// AUTO-GENERATED: 108 insect species. Edit data here as needed.
export type InsectRole = 'Pest' | 'Beneficial' | 'Pollinator' | 'Invasive Pest' | 'Pollinator/Pest';

export interface Insect {
  id: string;
  commonName: string;
  scientificName: string;
  order: string;
  family: string;
  hosts: string;
  role: InsectRole;
  metamorphosis: 'Complete' | 'Incomplete' | 'Ametabolous';
}

export const insects: Insect[] = [
  { id: "alfalfa-weevil", commonName: "Alfalfa Weevil", scientificName: "Hypera postica", order: "Coleoptera", family: "Curculionidae", hosts: "Alfalfa", role: "Pest", metamorphosis: "Complete" },
  { id: "asian-lady-beetle", commonName: "Asian Lady Beetle", scientificName: "Harmonia axyridis", order: "Coleoptera", family: "Coccinellidae", hosts: "Aphids", role: "Beneficial", metamorphosis: "Complete" },
  { id: "bean-leaf-beetle", commonName: "Bean Leaf Beetle", scientificName: "Cerotoma trifurcata", order: "Coleoptera", family: "Chrysomelidae", hosts: "Soybean, beans", role: "Pest", metamorphosis: "Complete" },
  { id: "bird-cherry-oat-aphid", commonName: "Bird Cherry-oat Aphid", scientificName: "Rhopalosiphum padi", order: "Hemiptera", family: "Aphididae", hosts: "Wheat, oats", role: "Pest", metamorphosis: "Incomplete" },
  { id: "black-cutworm", commonName: "Black Cutworm", scientificName: "Agrotis ipsilon", order: "Lepidoptera", family: "Noctuidae", hosts: "Corn seedlings", role: "Pest", metamorphosis: "Complete" },
  { id: "brown-marmorated-stink-bug", commonName: "Brown Marmorated Stink Bug", scientificName: "Halyomorpha halys", order: "Hemiptera", family: "Pentatomidae", hosts: "Fruit, soybean", role: "Invasive Pest", metamorphosis: "Incomplete" },
  { id: "corn-earworm", commonName: "Corn Earworm", scientificName: "Helicoverpa zea", order: "Lepidoptera", family: "Noctuidae", hosts: "Corn, cotton", role: "Pest", metamorphosis: "Complete" },
  { id: "corn-leaf-aphid", commonName: "Corn Leaf Aphid", scientificName: "Rhopalosiphum maidis", order: "Hemiptera", family: "Aphididae", hosts: "Corn, sorghum", role: "Pest", metamorphosis: "Incomplete" },
  { id: "dectes-stem-borer", commonName: "Dectes Stem Borer", scientificName: "Dectes texanus", order: "Coleoptera", family: "Cerambycidae", hosts: "Soybean, sunflower", role: "Pest", metamorphosis: "Complete" },
  { id: "dingy-cutworm", commonName: "Dingy Cutworm", scientificName: "Feltia jaculifera", order: "Lepidoptera", family: "Noctuidae", hosts: "Corn, alfalfa", role: "Pest", metamorphosis: "Complete" },
  { id: "english-grain-aphid", commonName: "English Grain Aphid", scientificName: "Sitobion avenae", order: "Hemiptera", family: "Aphididae", hosts: "Wheat, oats", role: "Pest", metamorphosis: "Incomplete" },
  { id: "european-corn-borer", commonName: "European Corn Borer", scientificName: "Ostrinia nubilalis", order: "Lepidoptera", family: "Crambidae", hosts: "Corn", role: "Pest", metamorphosis: "Complete" },
  { id: "fall-armyworm", commonName: "Fall Armyworm", scientificName: "Spodoptera frugiperda", order: "Lepidoptera", family: "Noctuidae", hosts: "Corn, grasses", role: "Pest", metamorphosis: "Complete" },
  { id: "green-cloverworm", commonName: "Green Cloverworm", scientificName: "Hypena scabra", order: "Lepidoptera", family: "Erebidae", hosts: "Soybean, clover", role: "Pest", metamorphosis: "Complete" },
  { id: "green-stink-bug", commonName: "Green Stink Bug", scientificName: "Chinavia hilaris", order: "Hemiptera", family: "Pentatomidae", hosts: "Soybean, fruit", role: "Pest", metamorphosis: "Incomplete" },
  { id: "japanese-beetle", commonName: "Japanese Beetle", scientificName: "Popillia japonica", order: "Coleoptera", family: "Scarabaeidae", hosts: "Many plants", role: "Invasive Pest", metamorphosis: "Complete" },
  { id: "meadow-spittlebug", commonName: "Meadow Spittlebug", scientificName: "Philaenus spumarius", order: "Hemiptera", family: "Aphrophoridae", hosts: "Alfalfa, clover", role: "Pest", metamorphosis: "Incomplete" },
  { id: "northern-corn-rootworm", commonName: "Northern Corn Rootworm", scientificName: "Diabrotica barberi", order: "Coleoptera", family: "Chrysomelidae", hosts: "Corn", role: "Pest", metamorphosis: "Complete" },
  { id: "pea-aphid", commonName: "Pea Aphid", scientificName: "Acyrthosiphon pisum", order: "Hemiptera", family: "Aphididae", hosts: "Alfalfa, peas", role: "Pest", metamorphosis: "Incomplete" },
  { id: "potato-leafhopper", commonName: "Potato Leafhopper", scientificName: "Empoasca fabae", order: "Hemiptera", family: "Cicadellidae", hosts: "Alfalfa, potato", role: "Pest", metamorphosis: "Incomplete" },
  { id: "seed-corn-maggot", commonName: "Seed Corn Maggot", scientificName: "Delia platura", order: "Diptera", family: "Anthomyiidae", hosts: "Seedlings", role: "Pest", metamorphosis: "Complete" },
  { id: "seven-spotted-lady-beetle", commonName: "Seven Spotted Lady Beetle", scientificName: "Coccinella septempunctata", order: "Coleoptera", family: "Coccinellidae", hosts: "Aphids", role: "Beneficial", metamorphosis: "Complete" },
  { id: "soybean-looper-moth", commonName: "Soybean Looper Moth", scientificName: "Chrysodeixis includens", order: "Lepidoptera", family: "Noctuidae", hosts: "Soybean", role: "Pest", metamorphosis: "Complete" },
  { id: "spined-soldier-bug", commonName: "Spined Soldier Bug", scientificName: "Podisus maculiventris", order: "Hemiptera", family: "Pentatomidae", hosts: "Caterpillars", role: "Beneficial", metamorphosis: "Incomplete" },
  { id: "spotted-cucumber-beetle", commonName: "Spotted Cucumber Beetle", scientificName: "Diabrotica undecimpunctata", order: "Coleoptera", family: "Chrysomelidae", hosts: "Cucurbits, corn", role: "Pest", metamorphosis: "Complete" },
  { id: "stalk-borer", commonName: "Stalk Borer", scientificName: "Papaipema nebris", order: "Lepidoptera", family: "Noctuidae", hosts: "Corn", role: "Pest", metamorphosis: "Complete" },
  { id: "striped-blister-beetle", commonName: "Striped Blister Beetle", scientificName: "Epicauta vittata", order: "Coleoptera", family: "Meloidae", hosts: "Alfalfa, many", role: "Pest", metamorphosis: "Complete" },
  { id: "striped-cucumber-beetle", commonName: "Striped Cucumber Beetle", scientificName: "Acalymma vittatum", order: "Coleoptera", family: "Chrysomelidae", hosts: "Cucurbits", role: "Pest", metamorphosis: "Complete" },
  { id: "tarnished-plant-bug", commonName: "Tarnished Plant Bug", scientificName: "Lygus lineolaris", order: "Hemiptera", family: "Miridae", hosts: "Cotton, alfalfa", role: "Pest", metamorphosis: "Incomplete" },
  { id: "thistle-caterpillar-painted-lady-butterfly", commonName: "Thistle Caterpillar (painted Lady Butterfly)", scientificName: "Vanessa cardui", order: "Lepidoptera", family: "Nymphalidae", hosts: "Thistle, soybean", role: "Pollinator/Pest", metamorphosis: "Complete" },
  { id: "true-armyworm", commonName: "True Armyworm", scientificName: "Mythimna unipuncta", order: "Lepidoptera", family: "Noctuidae", hosts: "Grasses, corn", role: "Pest", metamorphosis: "Complete" },
  { id: "two-spotted-spider-mite", commonName: "Two Spotted Spider Mite", scientificName: "Tetranychus urticae", order: "Trombidiformes", family: "Tetranychidae", hosts: "Many crops", role: "Pest", metamorphosis: "Incomplete" },
  { id: "variegated-cutworm", commonName: "Variegated Cutworm", scientificName: "Peridroma saucia", order: "Lepidoptera", family: "Noctuidae", hosts: "Many crops", role: "Pest", metamorphosis: "Complete" },
  { id: "western-bean-cutworm", commonName: "Western Bean Cutworm", scientificName: "Striacosta albicosta", order: "Lepidoptera", family: "Noctuidae", hosts: "Corn, beans", role: "Pest", metamorphosis: "Complete" },
];

export const insectMap: Record<string, Insect> = Object.fromEntries(insects.map(i => [i.id, i]));

export const ORDERS = Array.from(new Set(insects.map(i => i.order))).sort();
export const FAMILIES = Array.from(new Set(insects.map(i => i.family))).sort();

import type { LearningGradeLevel } from "@/lib/types";
import bodyPartsImg from "@/assets/insect_body_parts_cartoon.jpg.asset.json";
import fireflyNamesImg from "@/assets/firefly_names.jpg.asset.json";
import lifeStagesImg from "@/assets/insect_life_stages_cartoon.jpg.asset.json";
import detectivesImg from "@/assets/insect_detectives_cartoon.jpg.asset.json";
import lookAlikesImg from "@/assets/insect_look-alikes.jpg.asset.json";

export interface Lesson {
  id: string;
  title: string;
  sections: { heading: string; body: string }[];
  funFact?: string;
  /** Illustration shown at the end of the lesson. */
  image?: { src: string; alt: string };
  /** Outline only — content still being written. */
  placeholder?: boolean;
}


export interface Unit {
  id: string;
  title: string;
  lessons: Lesson[];
}

/** Placeholder lesson: title + outline while the full content is written. */
function ph(id: string, title: string, outline: string): Lesson {
  return {
    id,
    title,
    placeholder: true,
    sections: [{ heading: "What this module will cover", body: outline }],
  };
}

export const CURRICULUM: Record<LearningGradeLevel, Unit[]> = {
  elementary: [
    {
      id: "what-is-an-insect",
      title: "What is an insect?",
      lessons: [
        {
          id: "what-is-an-insect",
          title: "What is an insect?",
          sections: [
            {
              heading: "Meet the insects",
              body: "Insects are everywhere — in the grass, under rocks, on flowers, and even buzzing past your ear! Scientists put them all in one big group called Insecta. There are more than 1 million kinds of insects that we know about, and scientists are still finding new ones. That means insects are the biggest animal group on the whole planet.",
            },
            {
              heading: "Three body parts, like a tiny train",
              body: "Every single insect — no matter how big or small — has a body built in three pieces: the head, the thorax, and the abdomen. Think of it like a tiny train with three cars! The head is where the eyes, antennae, and mouth are. The thorax is the middle car, where the legs (and wings, if it has them) attach. The abdomen is the back car, where the insect digests its food.",
            },
            {
              heading: "The six-leg rule",
              body: "Here's a rule that never breaks: insects always have exactly six legs. Always! If you count eight legs, you found a spider. If you count way more, you might have a centipede or a pillbug. Those are cool creatures too, but they are not insects.",
            },
            {
              heading: "Antennae and wings",
              body: "Every insect also has at least one pair of antennae on its head. Antennae are like super-senses — insects use them to smell, feel, and even taste the world around them. And many insects have wings, which makes them the only animals without backbones that can fly. Butterflies have scaly wings, beetles have hard shield wings, and flies have just one pair. So next time you spot a bug, check the list: three body parts, six legs, antennae. If it passes, you found an insect!",
            },
          ],
          funFact:
            "Try it out: next time you find an ant, count its legs out loud. One, two, three, four, five, six! Yep — it's an insect.",
          image: { src: bodyPartsImg.url, alt: "Cartoon insect labeled with head, thorax, abdomen, antennae, wings, and six legs" },
        },
        {
          id: "names",
          title: "Common names vs. scientific names",
          sections: [
            {
              heading: "One name the whole world can share",
              body: "People call insects all kinds of things. A \"lightning bug\" in Ohio might be called a \"firefly\" in Texas — and they're the same bug! Scientists needed one name everyone in the whole world could agree on, so they gave every insect a special two-word name in Latin. For example: the honeybee! Scientists call honeybeels \"Apis mellifera\". That name means the same thing whether you're in Texas, Japan, or Brazil. The first word tells you the insect's family, and the second word tells you exactly which one it is. It's like a first name and a last name, but in a very old language!",
            },
          ],
          funFact: "The western corn rootworm's scientific name is Diabrotica virgifera. Try saying it three times fast!",
          image: { src: fireflyNamesImg.url, alt: "Glossary of firefly nicknames: firefly, lightning bug, glowworm, candlefly, firebob, lamp bug, will-o'-the-wisp" },
        },

      ],
    },
    {
      id: "life-stages",
      title: "Insect life stages",
      lessons: [
        {
          id: "egg-to-adult",
          title: "From egg to adult",
          sections: [
            {
              heading: "Metamorphosis",
              body: "A caterpillar and a butterfly look nothing alike — but they're the same creature at different times in its life! Many insects go through four big changes called life stages: egg, larva, pupa, and adult. A moth starts as a tiny egg, hatches into a caterpillar (that's the larva), wraps itself into a cocoon (that's the pupa stage), and then emerges as a moth. We call this amazing change metamorphosis. Other insects like grasshoppers skip the cocoon stage — their young, called nymphs, look like tiny adults right from the start. Knowing which stage you're looking at helps farmers figure out if a bug is about to become a big problem on the farm.",
            },
          ],
          funFact:
            "A corn earworm starts as a tiny egg on a corn silk, hatches into a caterpillar that eats the corn, and eventually becomes a moth that flies away. One bug, four totally different looks!",
          image: { src: lifeStagesImg.url, alt: "Complete metamorphosis of a moth and incomplete metamorphosis of a grasshopper" },
        },
      ],
    },
    {
      id: "identify",
      title: "How to identify insects",
      lessons: [
        {
          id: "look-and-describe",
          title: "Look and describe",
          sections: [
            {
              heading: "Insect Detective!",
              body: "Grab your detective eyes and field journal — it's time to investigate! Look closely at your insect without touching it. What color is it? Is it bigger or smaller than your fingernail? Does it have spots, stripes, or shiny patches? Is its body long and skinny or round and fat?",
            },
            {
              heading: "Gather your clues",
              body: "Look for clues about where you found it — was it on a leaf, hiding under a rock, or visiting a flower? Write down your clues or draw a picture in your field journal, just like real scientists do! Remember, never touch an insect unless a grown-up says it is safe, because some insects can pinch or sting.",
            },
            {
              heading: "Detective challenge",
              body: "Can you figure out what makes your insect unique? Compare your notes with a friend's and see whether you both found the very same suspect.",
            },
          ],
          funFact: "A magnifying glass makes even tiny insects look huge and amazing — you can see their eyes, leg hairs, and wing veins up close!",
          image: { src: detectivesImg.url, alt: "Kid detectives with magnifying glass and clue book inspecting a ladybug" },
        },
        {
          id: "parts",
          title: "Heads, wings, antennae, and mouthparts",
          sections: [
            {
              heading: "Clues that tell you which insect it is",
              body: "Once you know an insect has six legs and three body parts, you can look for clues that tell you exactly which kind it is. Scientists look at where the insect's head points: forward (like a beetle hunting prey), downward (like a grasshopper eating a leaf), or backward (like an aphid sucking plant juice). Wings are another big clue — are they hard like a shield, soft like paper, or scaly like a moth? Antennae come in all shapes: long and thin, feathery, or beaded like a necklace. And mouthparts reveal what it eats — chewing jaws for leaf-eaters, a needle-like beak for juice-suckers, or a coiled tube for sipping flower nectar.",
            },
          ],
          funFact:
            "A butterfly's mouthpart is like a drinking straw that stays rolled up — it only uncoils when the butterfly lands on a flower!",
        },
        {
          id: "side-by-side",
          title: "Comparing insects side by side",
          sections: [
            {
              heading: "Tricky look-alikes",
              body: "Sometimes two insects look almost exactly the same — but one is helpful to farmers and the other is a pest! That's why comparing insects side by side is such an important skill. For example, the Mexican bean beetle looks a lot like a ladybug, but the Mexican bean beetle eats soybean plants while the ladybug eats the pests. How do you tell them apart? Count the spots and check the color — the Mexican bean beetle is copper-orange, while most helpful ladybugs are red. By making a checklist of color, size, spot patterns, and where you found it, you can tell even tricky look-alikes apart.",
            },
          ],
          funFact: "Scientists use a tool called a \"dichotomous key\" — it's like a game of twenty questions that leads you to the right insect name!",
          image: { src: lookAlikesImg.url, alt: "Side-by-side comparison of the pest Mexican bean beetle and the helpful ladybug" },
        },
      ],
    },
    {
      id: "helpful",
      title: "Helpful insects",
      lessons: [
        {
          id: "pollinators",
          title: "Pollinators: bees, butterflies, and beetles",
          sections: [
            {
              heading: "Free farm helpers",
              body: "When a bee visits a flower to drink nectar, tiny grains of yellow dust called pollen stick to its fuzzy body. When the bee flies to another flower, some of that pollen rubs off — and that's how many plants make seeds and fruit! This job is called pollination, and without it, we wouldn't have apples, strawberries, pumpkins, almonds, or most of the foods we love. Bees are the most famous pollinators, but butterflies, moths, flies, and even some beetles do it too. On a farm, having pollinators around is like having free farm helpers that never take a day off.",
            },
          ],
          funFact: "About one out of every three bites of food you eat exists because of pollinators. That's a lot of thank-yous owed to bees!",
        },
        {
          id: "predators",
          title: "Predators that eat pest insects",
          sections: [
            {
              heading: "Nature's pest control",
              body: "Some insects are nature's pest control. Ladybugs and their larvae eat aphids — tiny bugs that suck the juice out of plants. Green lacewings look delicate and lacy, but their babies are called \"aphid lions\" because they gobble up pests like hungry little monsters. Ground beetles run fast through the soil hunting other insects and even slug eggs. These helpful hunters are called predatory insects, and when a farmer protects them, those insects do a lot of pest-fighting work for free. Spraying too many pesticides can accidentally kill these good guys, which is why farmers try to be careful about what they use.",
            },
          ],
          funFact: "A single green lacewing larva can eat up to 200 aphids in one week. That's one hungry little bug!",
        },
        {
          id: "decomposers",
          title: "Decomposers: nature's cleanup crew",
          sections: [
            {
              heading: "Recyclers of the soil",
              body: "When a leaf falls off a tree or an animal dies, it doesn't just sit there forever. Insects called decomposers eat dead plants and animals, breaking them down into tiny pieces that go back into the soil. Beetles, fly larvae, and many other insects do this important job. The nutrients they release feed new plants — so in a way, these insects are recyclers! Without decomposers, dead stuff would pile up everywhere and the soil would run out of the good stuff plants need to grow. On a farm, healthy soil full of decomposer activity means better crops.",
            },
          ],
          funFact: "Dung beetles roll animal poop into balls and bury it — that's decomposing at its most extreme, and it puts nutrients right back into the ground!",
        },
      ],
    },
    {
      id: "pests",
      title: "Pest insects",
      lessons: [
        {
          id: "what-makes-a-pest",
          title: "What makes an insect a crop pest?",
          sections: [
            {
              heading: "Chewing, sucking, and boring",
              body: "Not all insects that eat plants are pests. An insect becomes a pest when it causes enough damage to cost the farmer money — like ruining so many corn plants that there's not enough corn to sell. Pests damage plants in three main ways: chewing (caterpillars munching holes in leaves), sucking (aphids piercing stems to drink plant juice like a vampire), and boring (beetles or moth larvae tunneling inside stalks or roots where you can't even see them). Some pests also spread diseases between plants, like a sick person sneezing on someone healthy.",
            },
          ],
          funFact: "Aphids can multiply so fast that a single aphid can become thousands of aphids on one plant in just a few weeks!",
        },
        {
          id: "native-vs-invasive",
          title: "Native vs. invasive pest insects",
          sections: [
            {
              heading: "Hitchhikers from far away",
              body: "Some pest insects have always lived in an area — we call them native species. Native insects usually have natural enemies (predators and parasites) that help keep their numbers in check. But sometimes insects accidentally travel from far away — hiding in a shipment of fruit, wood, or plants — and arrive somewhere they've never lived before. These are called invasive species. Because nothing in their new home knows to eat them, invasive insects can spread super fast and cause huge damage. The spotted lanternfly came from Asia and is now spreading through the eastern US, harming grape vines, apple trees, and many other crops.",
            },
          ],
          funFact: "The brown marmorated stink bug is from Asia — it hitchhiked to the US in packing crates in the 1990s and has been causing problems for fruit and vegetable farmers ever since!",
        },
      ],
    },
    {
      id: "living-things",
      title: "Insects and living things",
      lessons: [
        {
          id: "biodiversity",
          title: "What is biodiversity?",
          sections: [
            {
              heading: "A team of many players",
              body: "Imagine if every book in your library was the exact same story. Pretty boring, right? Nature is the same way — it needs lots of different living things to stay healthy and interesting. That variety of life is called biodiversity. On a farm, having many different types of insects, plants, birds, and other animals helps things stay balanced. When one type of bug gets too common, its predators multiply to eat it back down. When there are many kinds of flowers, many kinds of pollinators thrive. Biodiversity is like a team where every player has a special job — and the team works best when all the players show up.",
            },
          ],
          funFact: "Scientists have found and named over one million insect species — and they think there might be millions more we haven't discovered yet!",
        },
        {
          id: "food-chains",
          title: "Farm insect food chains",
          sections: [
            {
              heading: "Who eats who",
              body: "Everything in nature is connected in a chain of who eats who. A food chain on a farm might look like this: a soybean plant makes food from sunlight → an aphid drinks the plant's juice → a ladybug eats the aphid → a bird eats the ladybug. Each step depends on the one before it. If aphids suddenly disappeared, the ladybugs would go hungry, and so would the birds. If the plants died, the whole chain would fall apart. Insects are often right in the middle of these chains — eating plants and being eaten by bigger animals — so they're incredibly important to life on the farm.",
            },
          ],
          funFact: "Baby birds need caterpillars to grow. A single nest of baby chickadees can eat 6,000 caterpillars before they're old enough to fly!",
        },
      ],
    },
    {
      id: "food-webs",
      title: "Food webs and roles",
      lessons: [
        {
          id: "producers-consumers-decomposers",
          title: "Producers, consumers, and decomposers",
          sections: [
            {
              heading: "The natural balancing act",
              body: "A food web is like a food chain — but way more connected. Instead of one straight line, it's a whole net of \"who eats who\" going in many directions at once. Plants are the producers — they make their own food from sunlight. Insects that eat plants are consumers. Insects that eat other insects are also consumers, just at a different level. And when things die, decomposers break everything back down. On a farm, predator insects keep pest populations from exploding — that's called a predator-prey cycle. When pest numbers go up, predator numbers follow. When pests get eaten down, predators decline too. It's a natural balancing act.",
            },
          ],
          funFact: "A braconid wasp lays its eggs inside caterpillars — the wasp babies hatch inside and eat the caterpillar from the inside out. Gruesome, but it helps control farm pests!",
        },
        {
          id: "move-and-spread",
          title: "How insects move and spread",
          sections: [
            {
              heading: "Flying, drifting, and hitchhiking",
              body: "Insects don't stay in one place forever — they spread out in lots of clever ways. Most adult insects can fly, which lets them travel from field to field. Some tiny insects like aphids get picked up by the wind and carried many miles before landing. Others hitchhike — hiding on farm equipment, in soil, in shipments of plants or grain, or even on people's shoes. This is how invasive insects travel to new states or countries. Understanding how insects move helps farmers prepare — if fall armyworm moths are being spotted two states south, farmers here know to start watching their fields soon.",
            },
          ],
          funFact: "Monarch butterflies migrate up to 3,000 miles from Canada all the way to Mexico every fall — using the sun like a compass to find their way!",
        },
      ],
    },
    {
      id: "stewardship",
      title: "Good insect stewardship and management",
      lessons: [
        {
          id: "protect-beneficials",
          title: "Why farmers protect beneficial insects",
          sections: [
            {
              heading: "Thousands of tiny helpers",
              body: "A farmer who takes care of the good insects on their land has thousands of tiny helpers working for free every single day. Predatory insects eat pests, pollinators help crops grow fruit, and decomposers keep the soil healthy. Good insect stewardship means making choices that protect these helpers — like planting flowers along field edges where pollinators can live, leaving a little wild habitat for ground beetles, or being careful not to spray pesticides when bees are active. Farmers who steward their insects well often need fewer chemical sprays, which saves money and is better for the environment.",
            },
          ],
          funFact: "Some farmers plant \"insectary strips\" — rows of wildflowers in or around their fields just to give beneficial insects a home base!",
        },
        {
          id: "ipm",
          title: "Controlling pests without harming helpers",
          sections: [
            {
              heading: "Integrated Pest Management",
              body: "Farmers have a toolbox full of ways to manage pests. The smartest approach is called Integrated Pest Management — or IPM for short. Instead of automatically spraying chemicals everywhere, farmers first watch their fields carefully to see if pests are really at a level that would hurt the crop. They might release beneficial insects, rotate which crop they plant in a field each year (so pests can't settle in), use resistant plant varieties, or wait until natural predators bring pest numbers down on their own. When a spray is truly needed, they choose ones that are less harmful to bees and other good bugs, and they apply it at the right time.",
            },
          ],
          funFact: "Crop rotation fools pests that live in the soil — if a pest spends the winter waiting for corn to come back, and instead the farmer plants soybeans, the pest goes hungry!",
        },
      ],
    },
  ],
  middle: [
    {
      id: "classification-morphology",
      title: "Classification and morphology",
      lessons: [
        {
          id: "taxonomy",
          title: "Taxonomy: how insects get their names",
          sections: [
            {
              heading: "The ranked hierarchy of life",
              body: "Taxonomy is the science of classifying living things into organized groups based on shared traits. All living organisms are arranged in a ranked hierarchy: Kingdom, Phylum, Class, Order, Family, Genus, and Species. Insects belong to Class Insecta within Phylum Arthropoda, a group that also includes spiders, centipedes, and crustaceans. Understanding these groupings explains why a spider is not an insect: spiders have eight legs and two body sections, placing them in Class Arachnida, while insects always have six legs and three body sections.",
            },
            {
              heading: "Binomial nomenclature",
              body: "Every insect species carries a unique two-word scientific name in a system called binomial nomenclature, developed by the Swedish naturalist Carl Linnaeus in the 1700s. The first word identifies the genus, a grouping of closely related species, and the second word identifies the specific species within that genus. Scientific names are always written in italics and are recognized by scientists worldwide regardless of language. Common names, by contrast, vary widely by region and can cause genuine confusion in the field.",
            },
          ],
          funFact:
            "Think of scientific names like GPS coordinates. A common name like \"corn borer\" is like saying \"meet me downtown\" — it could mean a dozen different places. The scientific name Ostrinia nubilalis drops a pin on exactly one species, worldwide.",
        },
        {
          id: "morphology",
          title: "Morphology: reading a bug like a map",
          sections: [
            {
              heading: "Head position and mouthparts",
              body: "Morphology is the study of an organism's physical structure and form. Head position reveals feeding strategy: a prognathous head points forward (predators), a hypognathous head points downward (plant chewers like grasshoppers), and an opisthognathous head angles backward (piercing-suckers like aphids and leafhoppers). Chewing mandibles cut and grind solid tissue, while piercing-sucking stylets act like hypodermic needles to extract fluids or inject saliva.",
            },
            {
              heading: "Antennae and wings",
              body: "Antennae take many forms: filiform (thread-like, ground beetles), clavate (club-tipped, bark beetles), pectinate (comb-like, some moths), and aristate (bristle-bearing, many flies). Wings are equally diagnostic. Beetles have hardened forewings called elytra protecting membranous hindwings. True bugs have a partially hardened forewing called a hemelytron. Moths and butterflies carry microscopic scales on all four wings. Working head-to-abdomen systematically produces consistent IDs.",
            },
          ],
          funFact:
            "An insect's body is a tool bag where every feature has a reason. A flea beetle's enlarged hind legs are its springs, a bee's pollen baskets are its grocery bags, and an aphid's needle-like beak is its juice straw.",
        },
      ],
    },
    {
      id: "life-cycles",
      title: "Life cycles",
      lessons: [
        {
          id: "metamorphosis",
          title: "One bug, four disguises",
          sections: [
            {
              heading: "Complete vs. incomplete metamorphosis",
              body: "Holometabolous insects (complete metamorphosis) pass through four stages: egg, larva, pupa, adult — beetles, moths, flies, and wasps. Larvae and adults often look like completely different species. Hemimetabolous insects (incomplete metamorphosis) hatch as nymphs that resemble miniature wingless adults — grasshoppers, aphids, stink bugs, and leafhoppers.",
            },
            {
              heading: "Instars and management timing",
              body: "Nymphs develop through growth stages called instars, each separated by a molt in which the insect sheds its exoskeleton. Wing pads and reproductive structures develop with each successive instar. In the field, identifying life stage matters as much as identifying species: management timing, economic thresholds, and control options are all tied to which stage the population has reached.",
            },
          ],
          funFact:
            "Spraying a field after caterpillars have bored into the stalk is like locking the barn door after the horse is out — the insecticide can't reach them. Life-cycle knowledge tells you which window to act in.",
        },
      ],
    },
    {
      id: "identification",
      title: "Identification skills and tools",
      lessons: [
        {
          id: "observation",
          title: "Observation: scouting with a system",
          sections: [
            {
              heading: "Systematic scouting records",
              body: "Crop scouting is the systematic inspection of a field to detect, identify, and estimate pest densities. A thorough record includes crop growth stage, plant part examined, insect life stage with a population estimate, and location within the field. Pest pressure follows predictable spatial patterns: black cutworm damage often enters from field edges near grass, while aphid colonies concentrate in low-lying, lush areas.",
            },
            {
              heading: "Damage diagnosis",
              body: "Damage patterns narrow the suspect list as effectively as seeing the insect. Stippled, silvery leaves indicate spider mites. Clean circular holes suggest flea beetles. Transparent \"windowing\" of leaf epidermis points to early-instar caterpillars. Learning to work backward from damage to culprit is a core skill built through field practice.",
            },
          ],
          funFact:
            "Random scouting is like opening a book to random pages. A systematic route through the field reads chapter by chapter — the story builds, and patterns emerge you'd never otherwise notice.",
        },
        {
          id: "dichotomous-key",
          title: "Dichotomous keys: the yes-or-no path to a name",
          sections: [
            {
              heading: "How a key works",
              body: "A dichotomous key guides you to an unknown organism's name through paired choices called couplets. The word comes from Greek dicha (\"in two\") and temnein (\"to cut\"). Each couplet presents two contrasting descriptions of a feature; the user picks the match and is directed to the next couplet. Each step eliminates large groups until a single species remains.",
            },
            {
              heading: "Morphological characters",
              body: "Keys rely on morphological characters — observable structural features. Common ones for insects: number and texture of wings, antenna shape and length, head position, mouthpart type, leg segment arrangement, body markings, and overall shape and size.",
            },
          ],
          funFact:
            "A dichotomous key is twenty questions with a strict rulebook. Every question has two answers, each eliminates a big chunk of possibilities, and careful answers always arrive at a name. The only way to end up wrong is to rush before really looking at the specimen.",
        },
        {
          id: "look-alikes",
          title: "Look-alikes: when bugs wear each other's clothes",
          sections: [
            {
              heading: "Diagnostic features",
              body: "Look-alike species share enough visual similarity to be routinely confused but often need very different management. Fall armyworm vs. true armyworm is a classic example: both are brown-gray caterpillars in corn, but the fall armyworm shows an inverted pale \"Y\" on the head capsule and four black spots in a square on the eighth abdominal segment, while the true armyworm has pale lateral stripes and a more uniform body color.",
            },
            {
              heading: "One reliable feature at a time",
              body: "A diagnostic feature is a single characteristic that, when clearly observed, is enough to rule out all similar species. Searching for one reliable diagnostic feature — rather than trying to match overall appearance — separates experienced scouts from beginners. A 10× hand lens reveals features invisible to the naked eye, like the rusty-orange cornicle base on the bird cherry-oat aphid or the antennal banding of the brown marmorated stink bug.",
            },
          ],
          funFact:
            "Distinguishing look-alikes is like identifying twins. You don't glance and guess — you find the one specific detail only one of them has, and that single feature does all the work.",
        },
      ],
    },
    {
      id: "beneficials",
      title: "Beneficial insects",
      lessons: [
        {
          id: "pollination",
          title: "Pollination: the hidden workforce",
          sections: [
            {
              heading: "Managed and wild pollinators",
              body: "Pollination transfers pollen from anther to stigma, triggering seed and fruit development. It's essential for almonds, apples, blueberries, cucumbers, soybeans, and sunflowers. Managed pollinators — most famously the European honey bee — are intentionally kept for pollination services. Wild native pollinators include bumble bees, sweat bees, mining bees, mason bees, plus non-bees like syrphid flies, beetles, and butterflies.",
            },
            {
              heading: "Protecting pollinators on the farm",
              body: "When pollinator communities decline, fruit set drops and yield falls in ways no fertilizer or irrigation can fix. Protection means timing insecticide applications around bee activity, preserving flowering habitat near fields, and choosing bee-safer products when bloom-time sprays are unavoidable. Syrphid flies deserve recognition — their yellow-and-black bands mimic bees and wasps, but their two wings (vs. four) and stationary hovering give them away.",
            },
          ],
          funFact:
            "Pollinators are mail carriers for plants. Without them delivering pollen flower to flower, the plant never gets the signal to start making fruit. No delivery, no harvest.",
        },
        {
          id: "biocontrol",
          title: "Biocontrol: insects that fight your battles",
          sections: [
            {
              heading: "Predators and parasitoids",
              body: "Predators actively hunt and consume many prey — lady beetles, green lacewings, ground beetles, spined soldier bugs. Parasitoids lay eggs in or on a single host; their offspring consume the host from the inside and eventually kill it. Braconid wasps, ichneumon wasps, and tachinid flies parasitize caterpillars, aphids, and other pests.",
            },
            {
              heading: "Signs of biocontrol at work",
              body: "Parasitoid evidence is often visible without catching a single insect: silken cocoons attached to a caterpillar's exterior, or bronze, hardened aphid mummies on leaves. When broad-spectrum insecticides wipe these natural enemies out, pest resurgence often follows — populations rebound higher than before because the biological brake is gone along with the pest itself.",
            },
          ],
          funFact:
            "Natural enemies are an unpaid security team working in the background. You don't notice them until they're gone — and then pests they were controlling suddenly run wild. A broad-spectrum spray is like firing the security team right before a big event.",
        },
        {
          id: "decomposers",
          title: "Decomposers: nature's recycling system",
          sections: [
            {
              heading: "Comminution and nutrient cycling",
              body: "Decomposition breaks dead organic matter into simpler compounds that living plants can reabsorb, returning nitrogen, phosphorus, and potassium to the soil. Insects contribute through comminution — the physical shredding of organic material into smaller pieces. Beetles, fly larvae, springtails, and earwigs are primary insect decomposers, dramatically increasing surface area available for microbial activity.",
            },
            {
              heading: "Soil health and decomposer communities",
              body: "Fields with diverse decomposer communities show faster residue turnover and more biologically active soils than those with intensive tillage, compaction, or heavy pesticide use — all of which reduce decomposer populations. Soil health and insect conservation are two sides of the same practice, not separate concerns.",
            },
          ],
          funFact:
            "Decomposer insects are a compost crew working underground — they chop big pieces into small pieces so the microbial team can finish the job. Without them, it's like composting a whole pumpkin: it eventually breaks down, but very slowly.",
        },
      ],
    },
    {
      id: "pest-damage",
      title: "Pest insects and crop damage",
      lessons: [
        {
          id: "feeding-guilds",
          title: "Feeding guilds: how pests do their damage",
          sections: [
            {
              heading: "Chewers, suckers, and borers",
              body: "A feeding guild groups pest species by how they damage crops, regardless of species. Chewers (caterpillars, beetles, grasshoppers) remove tissue outright — ragged holes, skeletonized leaves, clipped stems. Piercing-suckers (aphids, leafhoppers, plant bugs, stink bugs) extract fluids through stylets, producing stippling, yellowing, wilting, and often transmitting viruses. Borers (European corn borer, stalk borer, Dectes stem borer) tunnel into stems, stalks, or roots and feed hidden inside plant tissue, largely protected from foliar sprays.",
            },
            {
              heading: "Why guild determines strategy",
              body: "The guild determines what damage looks like, where to scout, at what stage the pest is most damaging, and which control methods can realistically reach the insect and stop the injury.",
            },
          ],
          funFact:
            "Trying to spray a borer already inside a corn stalk is like trying to wash the inside of a sealed water bottle — the product can't reach the target. Guild knowledge tells you whether a spray will even work.",
        },
        {
          id: "vectors",
          title: "Disease vectors: when the bug is the messenger",
          sections: [
            {
              heading: "Vectors of plant pathogens",
              body: "A vector transmits a pathogen between hosts without necessarily being harmed itself. The corn flea beetle (Chaetocnema pulicaria) vectors Stewart's wilt (Pantoea stewartii). Corn leaf aphid and other aphids vector Barley Yellow Dwarf Virus. Western flower thrips (Frankliniella occidentalis) vectors Tomato Spotted Wilt Virus across many crops.",
            },
            {
              heading: "Inoculative transmission and low thresholds",
              body: "For vectors, the treatment threshold is driven by disease transmission risk, not feeding damage — small populations can transmit a pathogen within seconds of probing. Inoculative transmission means even insects killed quickly may already have transmitted the disease. Scout records must capture both pest identity and crop growth stage, since disease susceptibility windows vary by crop and development period.",
            },
          ],
          funFact:
            "A vector is contagious before showing any symptoms. By the time disease is obvious in the plant, transmission already happened — which is why vector thresholds are often much lower than for other pests.",
        },
        {
          id: "native-invasive",
          title: "Native vs. invasive: home field disadvantage",
          sections: [
            {
              heading: "The enemy release hypothesis",
              body: "A native species evolved in a region and sits in ecological balance with its natural enemies. A non-native (exotic, introduced) species originates elsewhere and arrives by accident or intent. Non-natives that establish, spread, and cause harm are classified as invasive. The enemy release hypothesis explains why many invasives spread so fast: they arrive without the parasitoids, predators, and pathogens that regulated them at home.",
            },
            {
              heading: "Classical biocontrol and reporting",
              body: "Brown marmorated stink bug (Halyomorpha halys), spotted lanternfly (Lycorma delicatula), and soybean aphid (Aphis glycines) all originate in Asia and expanded aggressively in the US for this reason. Managing invasives often requires classical biological control — importing and releasing natural enemies from the pest's native range under strict regulatory review. Some regulated invasives (e.g., spotted lanternfly) must be reported to state departments of agriculture.",
            },
          ],
          funFact:
            "An invasive insect in a new country is like a sports team with no opponents — they just keep scoring. The natural enemies back home were the opposition, and without them the population runs up the score.",
        },
      ],
    },
    {
      id: "ecology-webs",
      title: "Ecology and food webs",
      lessons: [
        {
          id: "trophic-levels",
          title: "Trophic levels: the farm as an ecosystem",
          sections: [
            {
              heading: "Producers, consumers, decomposers",
              body: "Trophic level describes where an organism sits in the energy flow. Primary producers (crop plants) capture solar energy via photosynthesis. Primary consumers are herbivores — mostly pest insects like caterpillars, aphids, and beetles. Secondary consumers are predators — predatory insects, spiders, insectivorous birds. Decomposers operate across all levels, breaking down dead matter and returning nutrients to the soil.",
            },
            {
              heading: "Ripple effects and pest resurgence",
              body: "These feeding relationships form a food web, and disrupting one level ripples through the others. When a broad-spectrum spray removes aphid predators along with the aphid population, pest resurgence often follows: the aphid population rebounds rapidly because the biological brake is gone, and can exceed pre-treatment levels. The farm is a functioning ecosystem, not a controlled box.",
            },
          ],
          funFact:
            "A food web is a net. Pull hard on one strand and several others shift. Removing natural enemies doesn't just leave a gap — it changes the tension across the whole system, and pests rush in to fill the slack.",
        },
        {
          id: "dispersal",
          title: "Dispersal: how pests travel and arrive",
          sections: [
            {
              heading: "Four ways insects move",
              body: "Active flight is powered adult movement — the most common mechanism. Passive aerial dispersal carries wingless or weak-flying insects like aphids and early-instar caterpillars on wind currents, sometimes for very long distances. Phoresy (hitchhiking) moves insects unintentionally on equipment, transplants, seed, soil, or packaging — the primary pathway for most invasive species. Crawling handles short-range movement within or between adjacent fields.",
            },
            {
              heading: "Migratory pests and trap networks",
              body: "Many economically important pests are migratory. Fall armyworm (Spodoptera frugiperda) can't overwinter in northern states and moves north each spring from the Gulf Coast on warm-front weather systems. Regional pheromone trap networks capture adult moths with synthetic attractants, tracking migrations in real time and giving scouts about two weeks of lead time before larvae appear in the field.",
            },
          ],
          funFact:
            "Migratory pest moths are like weather systems — they form far away and travel toward you. Regional moth trap networks are the radar map that lets scouts prepare before larvae show up.",
        },
      ],
    },
    {
      id: "management",
      title: "Management and stewardship",
      lessons: [
        {
          id: "thresholds",
          title: "Economic thresholds: when is it worth treating?",
          sections: [
            {
              heading: "EIL vs. ET",
              body: "The economic injury level (EIL) is the lowest pest density at which crop-damage cost equals control cost. The economic threshold (ET, or action threshold) is the density at which action should be taken to prevent reaching the EIL — deliberately set below the EIL to give response time. Below the ET, treatment costs more than the loss it prevents, so treating is economically unjustifiable regardless of how many insects are present.",
            },
            {
              heading: "Thresholds move with the market",
              body: "Thresholds vary by crop, growth stage, pest species, commodity price, and control cost. Some are expressed as insects per plant, some as percent defoliation, others as insects per standardized sweep. Because prices fluctuate, the ET isn't fixed: higher crop value means lower pest densities justify treatment, because each unit of yield saved is worth more.",
            },
          ],
          funFact:
            "Treating below threshold is like buying insurance for something that won't happen. The threshold tells you exactly where the math tips from \"wait\" to \"act.\"",
        },
        {
          id: "ipm",
          title: "IPM: the smarter toolbox",
          sections: [
            {
              heading: "Four categories of control",
              body: "Integrated Pest Management uses multiple strategies to hold pests below damaging levels while minimizing risk to people, non-targets, and the environment. Cultural controls (crop rotation, planting date, tillage, resistant varieties) reduce establishment or survival. Biological controls conserve or augment natural enemies. Mechanical/physical controls include row covers, trap crops, and pheromone traps. Chemical controls are used only when other strategies are insufficient and thresholds are exceeded.",
            },
            {
              heading: "Insecticide resistance management",
              body: "Resistance develops when individuals carrying genetic mutations survive an insecticide that kills susceptible ones. They reproduce and pass on the trait, shifting the population until the product no longer works. Rotating modes of action (MOA) — the biochemical mechanism by which a product kills — is the primary IRM strategy. Different MOAs in successive applications prevent any one resistance mechanism from being strongly selected across the population.",
            },
          ],
          funFact:
            "Relying on one insecticide MOA is like using the same antibiotic for every illness — the more you use it, the less it works. IPM rotates tools the same way a doctor rotates antibiotics: to stay ahead of resistance.",
        },
        {
          id: "biodiversity-stewardship",
          title: "Biodiversity and stewardship",
          sections: [
            {
              heading: "Ecosystem services and landscape simplification",
              body: "Agricultural biodiversity is the variety of living organisms in and around a farming system — insects, plants, fungi, bacteria, soil invertebrates. Ecosystem services are the free benefits functioning communities provide: pollination, biological pest control, nutrient cycling, soil formation. High biodiversity delivers more of these services. Landscape simplification — removing hedgerows, draining wetlands, eliminating field borders, reducing crop diversity — cuts habitat, food, and overwintering sites for both predators and pollinators.",
            },
            {
              heading: "Practices that restore insect biodiversity",
              body: "Farmers can rebuild insect biodiversity by establishing insectary strips (flowering plantings along field margins), planting cover crops between cash crops for habitat continuity, reducing tillage to protect soil-dwelling beneficials, and adopting threshold-based rather than calendar-based spray timing to minimize non-target impact.",
            },
          ],
          funFact:
            "A biodiverse farm is a well-stocked toolbox — you have the right tool for every job. A simplified landscape is a toolbox with only one wrench: it works fine until the problem needs something else.",
        },
      ],
    },
  ],
  high: [
    {
      id: "ipm",
      title: "IPM in practice",
      lessons: [
        {
          id: "ipm",
          title: "Integrated Pest Management",
          sections: [
            { heading: "The four tactic layers", body: "Cultural, mechanical, biological, and chemical tactics layered into one plan." },
          ],
        },
        {
          id: "thresholds",
          title: "Economic thresholds",
          sections: [
            { heading: "When to act", body: "When scouting counts cross the line that justifies treatment." },
          ],
        },
        {
          id: "natural-enemies",
          title: "Beneficial insects",
          sections: [
            { heading: "Your unpaid scout team", body: "Lacewings, lady beetles, syrphid flies, parasitoid wasps — recognize and conserve them." },
          ],
        },
      ],
    },
    {
      id: "hs-taxonomy",
      title: "Naming, families & variation",
      lessons: [
        ph("scientific-names", "Scientific names", "Binomial nomenclature, why Latin names travel, and how to read authorities and revisions."),
        ph("scientific-families", "Scientific families", "Family-level diagnostics for the families that matter on working farms."),
        ph("variation", "Inter- and intraspecific variation", "Why two individuals of one species can look different, and how variation between species is used in keys."),
        ph("reproduction", "Reproduction", "Sexual and asexual strategies — including aphid parthenogenesis and how it drives explosive population growth."),
      ],
    },
    {
      id: "hs-structure",
      title: "Structure & senses",
      lessons: [
        ph("metamorphosis", "Metamorphosis", "Complete vs. incomplete development, instars, and how stage timing drives scouting decisions."),
        ph("hearing", "How insects hear", "Tympanal organs, Johnston's organ, and hair sensilla — sound as predator warning and mating signal."),
        ph("antennae", "Antennae", "Antennal forms (filiform, clavate, plumose, geniculate) and what each says about the insect's lifestyle."),
        ph("mouthparts", "Mouth parts", "Chewing, piercing-sucking, siphoning, and sponging mouthparts — and the damage signature each leaves behind."),
      ],
    },
    {
      id: "hs-ecology",
      title: "Ecology & interactions",
      lessons: [
        ph("predator-pest", "Predator/pest interactions", "Predation, parasitism, and how natural-enemy pressure shapes pest populations."),
        ph("herbivores-carnivores", "Herbivores vs. carnivores", "Feeding guilds, trophic roles, and why the same field holds both."),
        ph("habitats-seasons", "Habitats and time of year", "Overwintering, degree-day accumulation, and the seasonal calendar of field insects."),
        ph("disease-carriers", "Disease carriers", "Disease cycles and the disease triangle: host, pathogen, environment — with the insect as vector."),
        ph("native-invasive", "Native vs. invasive vs. introduced", "How the three categories differ, and why only some introductions become invasive."),
        ph("biodiversity", "Biodiversity and crop management", "Why diverse fields are more stable, and how habitat plantings support crop management."),
      ],
    },
    {
      id: "hs-impact",
      title: "Impact & management",
      lessons: [
        ph("economic-impact", "Economic impact of insects", "Yield loss, control costs, pollination value, and quarantine trade impacts."),
        ph("insect-damage", "Insect damage", "Reading defoliation, stippling, tunneling, wilting, and honeydew back to the responsible pest."),
        ph("chemical-groups", "Specific chemical groups of insecticides", "Pyrethroids, neonicotinoids, diamides, organophosphates and more, organized by IRAC mode-of-action group."),
      ],
    },
  ],
  collegiate: [
    {
      id: "diagnostics",
      title: "Diagnostics & resistance (coming soon)",
      lessons: [
        {
          id: "taxonomy",
          title: "Taxonomy deep dive",
          placeholder: true,
          sections: [
            { heading: "Beyond the family", body: "Tribe- and genus-level diagnostics, genitalia keys, and molecular confirmation." },
          ],
        },
        {
          id: "resistance",
          title: "Resistance management",
          placeholder: true,
          sections: [
            { heading: "IRAC rotation strategy", body: "Mode-of-action rotation, refuge design, and monitoring resistance allele frequency." },
          ],
        },
      ],
    },
  ],
};
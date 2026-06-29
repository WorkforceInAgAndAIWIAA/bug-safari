import type { LearningGradeLevel } from "@/lib/types";

export interface Lesson {
  id: string;
  title: string;
  sections: { heading: string; body: string }[];
  funFact?: string;
}

export interface Unit {
  id: string;
  title: string;
  lessons: Lesson[];
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
              body: "Insects are a diverse group of animals in the class Insecta. Insects may appear to be small bugs, but they are unique! There are more than 1 million known types of insects in the world. Insects can be identified by what they look like. Insects have 6 legs and a 3-part body plan. All insects have at least 1 pair of antennae on their head. Some insects have wings!",
            },
          ],
        },
        {
          id: "body-basics",
          title: "Insect body basics",
          sections: [
            {
              heading: "Three body parts, six legs",
              body: "Have you ever looked closely at a beetle or a bee? Every single insect — no matter how big or small — has a body built in three pieces. We call them the head, the thorax, and the abdomen. Think of it like a tiny train with three cars! The head is where the eyes and mouth are. The thorax is the middle part where the legs attach. The abdomen is the back section. And here's a rule that never breaks: insects always have exactly six legs. Always. If you count more legs (like a spider!) or fewer legs, it's not an insect.",
            },
          ],
          funFact:
            "Try it out: next time you find an ant, count its legs out loud. One, two, three, four, five, six! Yep — it's an insect.",
        },
        {
          id: "names",
          title: "Common names vs. scientific names",
          sections: [
            {
              heading: "One name the whole world can share",
              body: "People call insects all kinds of things. A \"lightning bug\" in Ohio might be called a \"firefly\" in Texas — and they're the same bug! Scientists needed one name everyone in the whole world could agree on, so they gave every insect a special two-word name in Latin. For example, the honeybee scientists call Apis mellifera. That name means the same thing whether you're in Texas, Japan, or Brazil. The first word tells you the insect's family, and the second word tells you exactly which one it is. It's like a first name and a last name, but in a very old language!",
            },
          ],
          funFact: "The western corn rootworm's scientific name is Diabrotica virgifera. Try saying it three times fast!",
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
              heading: "Use your eyes and a notebook",
              body: "You can learn a lot about an insect just by slowing down and looking carefully. Start with the safe senses — your eyes and ears. What color is it? Is it bigger than your fingernail or smaller? Does it have spots, stripes, or shiny patches? What shape is its body — long and skinny, or round and fat? Where did you find it — on a leaf, under a rock, in a flower? You can write down or draw what you see in a little notebook called a field journal. Scientists do the exact same thing! Never touch an insect unless a grown-up says it's safe. Some insects can pinch or sting.",
            },
          ],
          funFact: "A magnifying glass makes even tiny insects look huge and amazing — you can see their eyes, leg hairs, and wing veins up close!",
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
          title: "Comparing farm species side by side",
          sections: [
            {
              heading: "Tricky look-alikes",
              body: "Sometimes two insects look almost exactly the same — but one is helpful to farmers and the other is a pest! That's why comparing insects side by side is such an important skill. For example, the Mexican bean beetle looks a lot like a ladybug, but the Mexican bean beetle eats soybean plants while the ladybug eats the pests. How do you tell them apart? Count the spots and check the color — the Mexican bean beetle is copper-orange, while most helpful ladybugs are red. By making a checklist of color, size, spot patterns, and where you found it, you can tell even tricky look-alikes apart.",
            },
          ],
          funFact: "Scientists use a tool called a \"dichotomous key\" — it's like a game of twenty questions that leads you to the right insect name!",
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
        {
          id: "disease-carriers",
          title: "What are disease carriers?",
          sections: [
            {
              heading: "Vectors of disease",
              body: "Insects can spread diseases between other insects, plants, and humans. A disease is a harmful condition that impacts living organisms and shows specific signs and symptoms. Insects spread diseases by acting as vectors of disease. Vectors are organisms that carry and spread disease. Insects spread diseases in two ways: bites and contamination. Some insects bite, suck the blood, or cause injury to the skin of animals and humans. Through this method, insects can spread diseases directly to humans. Disease is spread by contaminated insects when they have disease pathogens on their bodies from infected areas. Insects may pick up these pathogens from garbage, sewage, and other contaminated items. Insects must be managed to prevent diseases from spreading to humans and animals.",
            },
          ],
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
      id: "field-basics",
      title: "Field basics",
      lessons: [
        {
          id: "orders",
          title: "Insect orders at a glance",
          sections: [
            { heading: "What to look for first", body: "Beetles, flies, moths/butterflies, true bugs, bees/wasps, grasshoppers — learn the order-level traits that narrow any ID quickly." },
          ],
        },
        {
          id: "life-cycle",
          title: "Complete vs. incomplete metamorphosis",
          sections: [
            { heading: "Why it matters for scouting", body: "Egg → larva → pupa → adult, versus egg → nymph → adult. Knowing the stage tells you what damage to expect and how to time control." },
          ],
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
  ],
  collegiate: [
    {
      id: "diagnostics",
      title: "Diagnostics & resistance",
      lessons: [
        {
          id: "taxonomy",
          title: "Taxonomy deep dive",
          sections: [
            { heading: "Beyond the family", body: "Tribe- and genus-level diagnostics, genitalia keys, and molecular confirmation." },
          ],
        },
        {
          id: "resistance",
          title: "Resistance management",
          sections: [
            { heading: "IRAC rotation strategy", body: "Mode-of-action rotation, refuge design, and monitoring resistance allele frequency." },
          ],
        },
      ],
    },
  ],
};
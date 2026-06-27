import { OverlayShell } from "@/components/OverlayShell";

const SECTIONS = [
  {
    title: "Image sources",
    items: [
      "iNaturalist Research-Grade observations (CC-BY-NC) — default photo source.",
      "Bugwood.org — University of Georgia Center for Invasive Species and Ecosystem Health.",
      "USDA APHIS Pest Tracker — quarantine pest distributions.",
    ],
  },
  {
    title: "IPM & extension references",
    items: [
      "University Extension IPM bulletins (Iowa State, Purdue, Penn State, UC ANR).",
      "IRAC — Insecticide Resistance Action Committee, Mode of Action classification.",
      "USDA NIFA Crop Protection & Pest Management program.",
    ],
  },
  {
    title: "Taxonomy",
    items: [
      "ITIS — Integrated Taxonomic Information System.",
      "GBIF — Global Biodiversity Information Facility.",
      "Triplehorn & Johnson, Borror and DeLong's Introduction to the Study of Insects, 7th ed.",
    ],
  },
];

export function ReferencesPage({ onClose }: { onClose: () => void }) {
  return (
    <OverlayShell title="References" subtitle="Sources powering EntoQuest" onClose={onClose}>
      <div className="space-y-6">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{s.title}</h3>
            <ul className="mt-2 space-y-1">
              {s.items.map((it) => (
                <li key={it} className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground">
                  {it}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </OverlayShell>
  );
}
import type { Insect } from "@/data/insects";
import { Bug, Leaf, Sparkles, ShieldAlert, Flower2 } from "lucide-react";

const ROLE_STYLES: Record<string, string> = {
  Pest: "bg-destructive/10 text-destructive",
  "Invasive Pest": "bg-destructive/15 text-destructive",
  Beneficial: "bg-success/15 text-success",
  Pollinator: "bg-accent/30 text-accent-foreground",
  "Pollinator/Pest": "bg-accent/20 text-accent-foreground",
};

const ORDER_ICON: Record<string, typeof Bug> = {
  Coleoptera: Bug,
  Lepidoptera: Flower2,
  Hymenoptera: Sparkles,
  Hemiptera: ShieldAlert,
  Diptera: Bug,
  Orthoptera: Leaf,
};

export function InsectCard({ insect, onClick }: { insect: Insect; onClick?: () => void }) {
  const Icon = ORDER_ICON[insect.order] ?? Bug;
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-stretch overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex h-28 items-center justify-center bg-gradient-to-br from-secondary/40 via-accent/30 to-primary/15">
        <Icon className="h-12 w-12 text-primary/70 transition group-hover:scale-110" strokeWidth={1.5} />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="text-sm font-semibold leading-tight text-foreground">{insect.commonName}</div>
        <div className="text-xs italic text-muted-foreground">{insect.scientificName}</div>
        <div className="mt-auto flex flex-wrap items-center gap-1 pt-2">
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            {insect.order}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${ROLE_STYLES[insect.role] ?? "bg-muted text-muted-foreground"}`}>
            {insect.role}
          </span>
        </div>
      </div>
    </button>
  );
}
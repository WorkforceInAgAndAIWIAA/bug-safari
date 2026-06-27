import type { Insect } from "@/data/insects";
import { Bug, X } from "lucide-react";

const STAGES_COMPLETE = ["Egg", "Larva", "Pupa", "Adult"];
const STAGES_INCOMPLETE = ["Egg", "Nymph", "Nymph (late)", "Adult"];

export function InsectDetail({ insect, onClose }: { insect: Insect; onClose: () => void }) {
  const stages = insect.metamorphosis === "Incomplete" ? STAGES_INCOMPLETE : STAGES_COMPLETE;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md border border-border bg-card p-1.5 text-muted-foreground hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex h-44 items-center justify-center rounded-xl bg-gradient-to-br from-secondary/40 via-accent/30 to-primary/15">
          <Bug className="h-24 w-24 text-primary/70" strokeWidth={1.25} />
        </div>
        <h3 className="mt-4 text-2xl font-bold text-foreground">{insect.commonName}</h3>
        <p className="text-sm italic text-muted-foreground">{insect.scientificName}</p>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <Field label="Order" value={insect.order} />
          <Field label="Family" value={insect.family} />
          <Field label="Role" value={insect.role} />
          <Field label="Hosts" value={insect.hosts} />
          <Field label="Metamorphosis" value={insect.metamorphosis} />
        </dl>

        <div className="mt-5">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Life-stage sequence</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {stages.map((s) => (
              <span key={s} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                {s}
              </span>
            ))}
          </div>
        </div>

        <p className="mt-5 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
          Image citations and management notes will appear here once the references dataset is populated.
        </p>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/40 px-3 py-2">
      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}
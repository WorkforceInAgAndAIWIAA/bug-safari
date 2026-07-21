import type { Insect } from "@/data/insects";
import { X } from "lucide-react";
import { InsectImage } from "@/components/InsectImage";
import { getInsectImage } from "@/lib/insectImages";

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
        <InsectImage id={insect.id} name={insect.commonName} className="h-56 w-full" imgClassName="h-full w-full object-cover" />
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
          <StageGallery insect={insect} />
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

function StageGallery({ insect }: { insect: Insect }) {
  const stageKeys = ["egg", "larva", "nymph", "pupa", "adult", "damage"] as const;
  const items = stageKeys
    .map((k) => ({ key: k, url: getInsectImage(insect.id, k) }))
    .filter((x, i, arr) => x.url && arr.findIndex((y) => y.url === x.url) === i);
  if (items.length <= 1) return null;
  return (
    <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
      {items.map((it) => (
        <div key={it.key} className="overflow-hidden rounded-md border border-border bg-muted">
          <img src={it.url!} alt={`${insect.commonName} ${it.key}`} className="h-20 w-full object-cover" loading="lazy" />
          <div className="px-1 py-0.5 text-center text-[10px] capitalize text-muted-foreground">{it.key}</div>
        </div>
      ))}
    </div>
  );
}
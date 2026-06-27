import { useMemo, useState } from "react";
import { OverlayShell } from "@/components/OverlayShell";
import { InsectCard } from "@/components/InsectCard";
import { insects, ORDERS, type Insect } from "@/data/insects";
import { InsectDetail } from "@/components/overlays/InsectDetail";
import { Search } from "lucide-react";

export function Glossary({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<string>("All");
  const [selected, setSelected] = useState<Insect | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return insects.filter((i) => {
      if (order !== "All" && i.order !== order) return false;
      if (!q) return true;
      return (
        i.commonName.toLowerCase().includes(q) ||
        i.scientificName.toLowerCase().includes(q) ||
        i.family.toLowerCase().includes(q) ||
        i.hosts.toLowerCase().includes(q)
      );
    });
  }, [query, order]);

  return (
    <OverlayShell
      title="Glossary"
      subtitle={`${filtered.length} of ${insects.length} species`}
      onClose={onClose}
      toolbar={
        <div className="hidden items-center gap-2 sm:flex">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search species…"
              className="w-56 rounded-md border border-input bg-background py-1.5 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
          >
            <option value="All">All orders</option>
            {ORDERS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      }
    >
      <div className="mb-4 flex items-center gap-2 sm:hidden">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search species…"
          className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm"
        />
        <select
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
        >
          <option value="All">All</option>
          {ORDERS.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filtered.map((i) => (
          <InsectCard key={i.id} insect={i} onClick={() => setSelected(i)} />
        ))}
      </div>

      {selected && <InsectDetail insect={selected} onClose={() => setSelected(null)} />}
    </OverlayShell>
  );
}
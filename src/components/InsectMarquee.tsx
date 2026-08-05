import { useMemo } from "react";
import { insects } from "@/data/insects";
import { getInsectImage } from "@/lib/insectImages";

/** Full-bleed strip of species photos scrolling across the top of the page. */
export function InsectMarquee() {
  const items = useMemo(() => {
    const withPhotos = insects
      .map((i) => ({ id: i.id, name: i.commonName, src: getInsectImage(i.id, "adult") }))
      .filter((i): i is { id: string; name: string; src: string } => !!i.src);
    // deterministic spread so neighbours aren't alphabetically adjacent
    const step = 7;
    const out: typeof withPhotos = [];
    for (let k = 0; k < withPhotos.length; k++) {
      out.push(withPhotos[(k * step) % withPhotos.length]);
    }
    return out.slice(0, 40);
  }, []);

  const row = [...items, ...items];

  return (
    <div className="relative w-full overflow-hidden border-y border-border bg-muted/40">
      <div className="marquee-track flex w-max gap-2 py-2">
        {row.map((i, idx) => (
          <figure
            key={`${i.id}-${idx}`}
            className="group relative h-28 w-40 shrink-0 overflow-hidden rounded-sm sm:h-36 sm:w-52"
          >
            <img
              src={i.src}
              alt={i.name}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent px-2 pb-1 pt-6 text-[10px] font-medium uppercase tracking-wide text-background opacity-0 transition group-hover:opacity-100">
              {i.name}
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { insects } from "@/data/insects";
import { getInsectImage } from "@/lib/insectImages";
import { Bug, BookOpen, Gamepad2, Sprout, Library, MessageSquare, UserRound, BookMarked } from "lucide-react";

interface Props {
  onOpenLearning: () => void;
  onOpenPractice: () => void;
  onOpenFarm: () => void;
  onOpenGlossary: () => void;
  onOpenReferences: () => void;
  onOpenFeedback: () => void;
  onOpenScout: () => void;
  onHome: () => void;
}

const NavBtn = ({ icon: Icon, label, onClick }: { icon: typeof Bug; label: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className="group inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/85 px-3 py-1.5 text-[12px] font-bold uppercase tracking-wider text-foreground shadow-sm transition hover:border-accent hover:bg-accent hover:text-accent-foreground"
  >
    <Icon className="h-4 w-4 text-accent transition group-hover:text-accent-foreground" />
    <span className="hidden md:inline">{label}</span>
  </button>
);

/** Slowly cross-fading species photos that sit behind the header chrome. */
function HeaderBackdrop() {
  const shots = useMemo(
    () =>
      insects
        .map((i) => getInsectImage(i.id, "adult"))
        .filter((s): s is string => !!s)
        .filter((_, idx) => idx % 3 === 0)
        .filter((s, i, a) => a.indexOf(s) === i)
        .slice(0, 24),
    [],
  );
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (shots.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % shots.length), 6000);
    return () => clearInterval(t);
  }, [shots.length]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {shots.map((src, i) => (
        <img
          key={`${src}-${i}`}
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[2500ms] ease-in-out"
          style={{ opacity: i === idx ? 0.35 : 0 }}
        />
      ))}
      <div className="absolute inset-0 bg-background/45" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/35 to-background/75" />
    </div>
  );
}

export function AppHeader(props: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/75 backdrop-blur">
      <HeaderBackdrop />
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-2 px-6 py-3">
        <button onClick={props.onHome} className="flex items-center gap-2 text-left">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">
            <Bug className="h-4.5 w-4.5" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-lg font-extrabold tracking-tight text-foreground">
              Ento<span className="text-accent">Quest</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">108 species · K–College</span>
          </span>
        </button>
        <nav className="flex flex-wrap items-center justify-end gap-1.5">
          <NavBtn icon={BookOpen} label="Learn" onClick={props.onOpenLearning} />
          <NavBtn icon={Gamepad2} label="Practice" onClick={props.onOpenPractice} />
          <NavBtn icon={Sprout} label="Farm" onClick={props.onOpenFarm} />
          <NavBtn icon={Library} label="Glossary" onClick={props.onOpenGlossary} />
          <NavBtn icon={UserRound} label="My Scout" onClick={props.onOpenScout} />
          <NavBtn icon={BookMarked} label="References" onClick={props.onOpenReferences} />
          <NavBtn icon={MessageSquare} label="Feedback" onClick={props.onOpenFeedback} />
        </nav>
      </div>
    </header>
  );
}
import { Bug, BookOpen, Gamepad2, Sprout, Library, MessageSquare, Trophy } from "lucide-react";

interface Props {
  onOpenLearning: () => void;
  onOpenPractice: () => void;
  onOpenFarm: () => void;
  onOpenGlossary: () => void;
  onOpenReferences: () => void;
  onOpenFeedback: () => void;
  onOpenStats: () => void;
  onHome: () => void;
}

const NavBtn = ({ icon: Icon, label, onClick }: { icon: typeof Bug; label: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-foreground/80 transition hover:bg-muted hover:text-foreground"
  >
    <Icon className="h-4 w-4" />
    <span className="hidden sm:inline">{label}</span>
  </button>
);

export function AppHeader(props: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3">
        <button onClick={props.onHome} className="flex items-center gap-2 text-left">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Bug className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-bold tracking-tight text-foreground">EntoQuest</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">108 species · K–College</span>
          </span>
        </button>
        <nav className="flex items-center gap-0.5">
          <NavBtn icon={BookOpen} label="Learn" onClick={props.onOpenLearning} />
          <NavBtn icon={Gamepad2} label="Practice" onClick={props.onOpenPractice} />
          <NavBtn icon={Sprout} label="Farm" onClick={props.onOpenFarm} />
          <NavBtn icon={Library} label="Glossary" onClick={props.onOpenGlossary} />
          <NavBtn icon={Trophy} label="Stats" onClick={props.onOpenStats} />
          <NavBtn icon={Library} label="Refs" onClick={props.onOpenReferences} />
          <NavBtn icon={MessageSquare} label="Feedback" onClick={props.onOpenFeedback} />
        </nav>
      </div>
    </header>
  );
}
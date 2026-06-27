import { OverlayShell } from "@/components/OverlayShell";
import { Award, Flame, Sparkles, Target, Trophy } from "lucide-react";

interface Props {
  onClose: () => void;
  xp: number;
  streak: number;
  totalCorrect: number;
  totalWrong: number;
  mastered: number;
  speciesCount: number;
}

export function StatsPanel({ onClose, xp, streak, totalCorrect, totalWrong, mastered, speciesCount }: Props) {
  const answered = totalCorrect + totalWrong;
  const accuracy = answered === 0 ? 0 : Math.round((totalCorrect / answered) * 100);
  const level = Math.floor(xp / 100) + 1;

  const cards = [
    { icon: Sparkles, label: "XP", value: xp, hint: `Level ${level}` },
    { icon: Flame, label: "Best streak", value: streak, hint: "Bonuses every 3 & 5" },
    { icon: Target, label: "Accuracy", value: `${accuracy}%`, hint: `${totalCorrect}/${answered} correct` },
    { icon: Trophy, label: "Species mastered", value: `${mastered}/${speciesCount}`, hint: "Across all tiers" },
  ];

  return (
    <OverlayShell title="Your Stats" subtitle="This sitting · resets when you leave" onClose={onClose}>
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((c) => (
          <div key={c.label} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
            <c.icon className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</div>
              <div className="text-2xl font-bold text-foreground">{c.value}</div>
              <div className="text-xs text-muted-foreground">{c.hint}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        <Award className="mb-2 h-5 w-5 text-secondary" />
        Persistent badges, leaderboards, and class sync activate once the backend is connected.
      </div>
    </OverlayShell>
  );
}
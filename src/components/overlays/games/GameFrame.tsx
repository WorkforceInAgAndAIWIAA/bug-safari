import type { ReactElement } from "react";
import { ArrowLeft, BookOpen, Play, RotateCcw, Trophy, Sprout } from "lucide-react";

export interface GameResult {
  /** points earned this run */
  score: number;
  correct?: number;
  total?: number;
  message: string;
}

export interface GameProps {
  add: (n: number) => void;
  onFinish: (r: GameResult) => void;
}

export interface GameMeta {
  id: string;
  name: string;
  emoji: string;
  topic: string;
  blurb: string;
  howTo: string[];
  render: (props: GameProps) => ReactElement;
}

/* ------------------------------------------------------------------ intro */

export function GameIntro({
  game,
  onPlay,
  onBack,
  onOpenLesson,
  lessonLabel,
  coachName = "Farmer Joe",
  coachEmoji = "🧑‍🌾",
}: {
  game: GameMeta;
  onPlay: () => void;
  onBack: () => void;
  onOpenLesson?: () => void;
  lessonLabel?: string;
  coachName?: string;
  coachEmoji?: string;
}) {
  return (
    <div className="mx-auto max-w-xl">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted"
      >
        <ArrowLeft className="h-4 w-4" /> All games
      </button>

      <div className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-muted text-3xl">{game.emoji}</div>
        <h3 className="mt-4 font-display text-3xl font-extrabold text-foreground">{game.name}</h3>
        <div className="mt-2 inline-block rounded-full bg-accent/15 px-3 py-0.5 text-xs font-semibold text-accent">
          {game.topic}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{game.blurb}</p>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-4">
        <div className="text-sm font-bold text-foreground">How to Play</div>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {game.howTo.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </div>

      {onOpenLesson && (
        <button
          type="button"
          onClick={onOpenLesson}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-muted/60 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
        >
          <BookOpen className="h-4 w-4 text-accent" /> Learn more about this topic
          {lessonLabel ? <span className="text-muted-foreground">· {lessonLabel}</span> : null}
        </button>
      )}

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-accent/40 bg-card p-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/15 text-xl">{coachEmoji}</div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-accent">{coachName}</div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Welcome, scout. I'll set the scene for {game.name}, but you'll do the thinking. Take your time and trust your
            training.
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={onPlay}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-base font-bold text-primary-foreground hover:opacity-90"
        >
          <Play className="h-4 w-4" /> Play
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- results */

function badgeFor(pct: number) {
  if (pct >= 90) return { label: "Gold badge earned!", tone: "text-accent", ring: "bg-accent/20" };
  if (pct >= 80) return { label: "Silver badge earned!", tone: "text-muted-foreground", ring: "bg-muted" };
  if (pct >= 70) return { label: "Bronze badge earned!", tone: "text-primary", ring: "bg-primary/15" };
  return { label: "Keep scouting", tone: "text-muted-foreground", ring: "bg-muted" };
}

export function GameResults({
  game,
  result,
  onAgain,
  onBack,
}: {
  game: GameMeta;
  result: GameResult;
  onAgain: () => void;
  onBack: () => void;
}) {
  const pct =
    result.total && result.total > 0 ? Math.round(((result.correct ?? 0) / result.total) * 100) : undefined;
  const badge = badgeFor(pct ?? 0);

  return (
    <div className="grid place-items-center py-8">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className={`mx-auto grid h-16 w-16 place-items-center rounded-full ${badge.ring}`}>
          <Trophy className={`h-8 w-8 ${badge.tone}`} />
        </div>
        {pct !== undefined && (
          <div className="mt-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{badge.label}</div>
        )}
        <h3 className="mt-1 font-display text-2xl font-extrabold text-foreground">{game.name} complete!</h3>

        {pct !== undefined ? (
          <>
            <p className="mt-2 text-lg text-foreground">
              {result.correct} / {result.total} correct
            </p>
            <p className="text-sm text-accent">{pct}% accuracy</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Grading scale: 90%+ Gold · 80%+ Silver · 70%+ Bronze (passing)
            </p>
          </>
        ) : (
          <p className="mt-2 text-lg text-foreground">Score: {result.score} pts</p>
        )}

        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
          <Sprout className="h-4 w-4" /> +{result.score} pts banked
        </div>

        <p className="mt-4 text-sm text-muted-foreground">{result.message}</p>

        <div className="mt-6 space-y-2">
          <button
            type="button"
            onClick={onAgain}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:opacity-90"
          >
            <RotateCcw className="h-4 w-4" /> Play again
          </button>
          <button
            type="button"
            onClick={onBack}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" /> Back to practice games
          </button>
        </div>
      </div>
    </div>
  );
}

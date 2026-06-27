import { useGameEngine } from "@/hooks/useGameEngine";
import { insectMap } from "@/data/insects";
import { Trophy, RotateCcw, Home } from "lucide-react";

type Engine = ReturnType<typeof useGameEngine>;

export function ResultsScreen({ engine, onHome }: { engine: Engine; onHome: () => void }) {
  const { xp, totalCorrect, totalWrong, insectStats, phaseStats, grade, startGame } = engine;
  const mastered = Object.entries(insectStats).filter(([, s]) => s.mastered);
  const accuracy = totalCorrect + totalWrong > 0 ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <Trophy className="mx-auto h-14 w-14 text-secondary" />
        <h2 className="mt-4 text-2xl font-bold text-foreground">Session complete</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your progress is preserved this sitting.</p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Tile label="XP earned" value={xp} />
          <Tile label="Correct" value={totalCorrect} />
          <Tile label="Wrong" value={totalWrong} />
          <Tile label="Accuracy" value={`${accuracy}%`} />
        </div>

        <div className="mt-6 text-left">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Mastered species</h3>
          {mastered.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">None yet — answer correctly 3× on a species to master it.</p>
          ) : (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {mastered.map(([id]) => (
                <li key={id} className="rounded-full bg-success/15 px-2.5 py-1 text-xs text-success">
                  {insectMap[id]?.commonName ?? id}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 text-left">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Phase progress</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {Object.entries(phaseStats).map(([id, s]) => (
              <li key={id} className="flex justify-between rounded-md bg-muted/50 px-3 py-1.5">
                <span className="font-medium text-foreground">{id}</span>
                <span className="text-muted-foreground">
                  {s.correct} / {s.seen}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => startGame(grade)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <RotateCcw className="h-4 w-4" /> Play again
          </button>
          <button
            onClick={onHome}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            <Home className="h-4 w-4" /> Home
          </button>
        </div>
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl bg-muted/60 p-4">
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}
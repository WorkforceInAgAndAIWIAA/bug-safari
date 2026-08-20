import { useEffect, useState } from "react";
import { useGameEngine } from "@/hooks/useGameEngine";
import { Flame, Sparkles, ChevronRight, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { InsectImage } from "@/components/InsectImage";

type Engine = ReturnType<typeof useGameEngine>;

export function GameScreen({ engine, onExit }: { engine: Engine; onExit: () => void }) {
  const { current, feedback, submitAnswer, nextQuestion, xp, streak, round, questionNum, phases, endSession } = engine;
  const [text, setText] = useState("");

  useEffect(() => {
    setText("");
  }, [current?.id]);

  if (!current) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <p className="text-muted-foreground">Loading question…</p>
      </div>
    );
  }

  const disabled = !!feedback;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* HUD */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Pill icon={Sparkles} label={`${xp} XP`} />
          <Pill icon={Flame} label={`${streak} streak`} />
          <Pill icon={ChevronRight} label={`Round ${round} · Q${questionNum}`} />
          <span className="ml-2 text-xs text-muted-foreground">
            {phases.length} phase{phases.length === 1 ? "" : "s"} unlocked
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={endSession}
            className="inline-flex items-center gap-1.5 rounded-full border border-accent bg-accent px-4 py-2 text-xs font-bold uppercase tracking-wider text-accent-foreground transition hover:opacity-90"
          >
            <Flag className="h-4 w-4" /> End session
          </button>
          <button
            onClick={onExit}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold uppercase tracking-wider text-foreground transition hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" /> Home
          </button>
        </div>
      </div>

      {/* Question card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-secondary/40 px-3 py-1 text-xs font-medium uppercase tracking-wide text-secondary-foreground">
          {current.phase.name}
        </div>

        <InsectImage
          id={current.insect.id}
          name={current.insect.commonName}
          className="h-64 w-full sm:h-72"
          imgClassName="h-full w-full object-contain bg-gradient-to-br from-secondary/20 via-accent/20 to-primary/10"
          fallbackClassName="h-24 w-24 text-primary/70"
        />

        <h3 className="mt-5 text-center text-xl font-semibold text-foreground">{current.prompt}</h3>
        {current.hint && <p className="mt-1 text-center text-xs text-muted-foreground">Hint: family is {current.hint}</p>}

        <div className="mt-5">
          {current.type === "fillin" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!disabled && text.trim()) submitAnswer(text);
              }}
              className="flex flex-col items-stretch gap-2 sm:flex-row"
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={disabled}
                placeholder="Genus or full binomial…"
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                disabled={disabled || !text.trim()}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
              >
                Submit
              </button>
            </form>
          ) : (
            <div className={`grid gap-2 ${current.type === "binary" ? "grid-cols-2" : "sm:grid-cols-2"}`}>
              {current.options!.map((opt) => {
                const isCorrect = feedback && opt === current.answer;
                const isWrongPick = feedback && !feedback.correct && opt === feedback.answer;
                return (
                  <button
                    key={opt}
                    disabled={disabled}
                    onClick={() => submitAnswer(opt)}
                    className={`rounded-lg border px-4 py-3 text-left text-sm font-medium transition disabled:cursor-not-allowed ${
                      isCorrect
                        ? "border-success bg-success/15 text-success"
                        : isWrongPick
                          ? "border-destructive bg-destructive/10 text-destructive"
                          : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {feedback && (
          <div
            className={`mt-5 flex items-start gap-2 rounded-lg border p-3 text-sm ${
              feedback.correct ? "border-success/50 bg-success/10 text-success" : "border-destructive/40 bg-destructive/10 text-destructive"
            }`}
          >
            {feedback.correct ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <XCircle className="mt-0.5 h-4 w-4" />}
            <div className="flex-1">
              <div className="font-semibold">{feedback.correct ? "Correct!" : "Not quite."}</div>
              <div className="text-xs opacity-90">{feedback.message}</div>
            </div>
            <button
              onClick={nextQuestion}
              className="rounded-md bg-foreground/90 px-3 py-1.5 text-xs font-medium text-background hover:bg-foreground"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Pill({ icon: Icon, label }: { icon: typeof Flame; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
      <Icon className="h-3.5 w-3.5 text-primary" /> {label}
    </span>
  );
}
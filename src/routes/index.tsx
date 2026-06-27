import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Toaster } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { LandingPage } from "@/components/LandingPage";
import { GameScreen } from "@/components/GameScreen";
import { ResultsScreen } from "@/components/ResultsScreen";
import { LearningModule } from "@/components/overlays/LearningModule";
import { PracticeHub } from "@/components/overlays/PracticeHub";
import { FarmMode } from "@/components/overlays/FarmMode";
import { Glossary } from "@/components/overlays/Glossary";
import { ReferencesPage } from "@/components/overlays/ReferencesPage";
import { FeedbackDialog } from "@/components/overlays/FeedbackDialog";
import { StatsPanel } from "@/components/overlays/StatsPanel";
import { useGameEngine } from "@/hooks/useGameEngine";
import { insects } from "@/data/insects";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EntoQuest — Learn 108 insects" },
      { name: "description", content: "An entomology field school: identify, scout, and manage 108 insect species across K–College tiers." },
      { property: "og:title", content: "EntoQuest" },
      { property: "og:description", content: "Learn 108 insect species through games, scouting, and IPM." },
    ],
  }),
  component: Index,
});

function Index() {
  const engine = useGameEngine();
  const [showLearning, setShowLearning] = useState(false);
  const [showPractice, setShowPractice] = useState(false);
  const [showFarm, setShowFarm] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [showReferences, setShowReferences] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const mastered = Object.values(engine.insectStats).filter((s) => s.mastered).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader
        onHome={engine.resetToLanding}
        onOpenLearning={() => setShowLearning(true)}
        onOpenPractice={() => setShowPractice(true)}
        onOpenFarm={() => setShowFarm(true)}
        onOpenGlossary={() => setShowGlossary(true)}
        onOpenReferences={() => setShowReferences(true)}
        onOpenFeedback={() => setShowFeedback(true)}
        onOpenStats={() => setShowStats(true)}
      />

      {engine.screen === "landing" && (
        <LandingPage
          xp={engine.xp}
          streak={engine.streak}
          totalCorrect={engine.totalCorrect}
          totalWrong={engine.totalWrong}
          speciesMastered={mastered}
          startGame={engine.startGame}
          onOpenLearning={() => setShowLearning(true)}
          onOpenPractice={() => setShowPractice(true)}
          onOpenFarm={() => setShowFarm(true)}
          onOpenGlossary={() => setShowGlossary(true)}
          onOpenStats={() => setShowStats(true)}
        />
      )}
      {engine.screen === "playing" && <GameScreen engine={engine} onExit={engine.resetToLanding} />}
      {engine.screen === "results" && <ResultsScreen engine={engine} onHome={engine.resetToLanding} />}

      {showLearning && <LearningModule onClose={() => setShowLearning(false)} />}
      {showPractice && <PracticeHub onClose={() => setShowPractice(false)} />}
      {showFarm && <FarmMode onClose={() => setShowFarm(false)} />}
      {showGlossary && <Glossary onClose={() => setShowGlossary(false)} />}
      {showReferences && <ReferencesPage onClose={() => setShowReferences(false)} />}
      {showFeedback && <FeedbackDialog onClose={() => setShowFeedback(false)} />}
      {showStats && (
        <StatsPanel
          onClose={() => setShowStats(false)}
          xp={engine.xp}
          streak={engine.streak}
          totalCorrect={engine.totalCorrect}
          totalWrong={engine.totalWrong}
          mastered={mastered}
          speciesCount={insects.length}
        />
      )}

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

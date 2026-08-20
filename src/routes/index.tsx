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
import { ScoutProfile } from "@/components/overlays/ScoutProfile";
import { useGameEngine } from "@/hooks/useGameEngine";
import type { GradeLevel, LearningGradeLevel } from "@/lib/types";

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
  const [showScout, setShowScout] = useState(false);
  const [learnTier, setLearnTier] = useState<LearningGradeLevel>("elementary");
  const [practiceTier, setPracticeTier] = useState<LearningGradeLevel>("elementary");
  const [learnLessonId, setLearnLessonId] = useState<string | undefined>(undefined);
  const [practiceGameId, setPracticeGameId] = useState<string | undefined>(undefined);

  const mastered = Object.values(engine.insectStats).filter((s) => s.mastered).length;

  const closeAllPanels = () => {
    setShowLearning(false);
    setShowPractice(false);
    setShowFarm(false);
    setShowGlossary(false);
    setShowReferences(false);
    setShowFeedback(false);
    setShowScout(false);
  };

  const goHome = () => {
    closeAllPanels();
    engine.resetToLanding();
  };

  const openOnly = (open: () => void) => {
    closeAllPanels();
    engine.resetToLanding();
    open();
  };

  const jumpToGame = (tier: LearningGradeLevel, gameId: string) => {
    setShowLearning(false);
    setPracticeTier(tier);
    setPracticeGameId(gameId);
    setShowPractice(true);
  };
  const jumpToLesson = (tier: LearningGradeLevel, lessonId: string) => {
    setShowPractice(false);
    setLearnTier(tier);
    setLearnLessonId(lessonId);
    setShowLearning(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader
        onHome={goHome}
        onOpenLearning={() => {
          openOnly(() => {
            setLearnLessonId(undefined);
            setShowLearning(true);
          });
        }}
        onOpenPractice={() => {
          openOnly(() => {
            setPracticeGameId(undefined);
            setShowPractice(true);
          });
        }}
        onOpenFarm={() => openOnly(() => setShowFarm(true))}
        onOpenGlossary={() => openOnly(() => setShowGlossary(true))}
        onOpenReferences={() => openOnly(() => setShowReferences(true))}
        onOpenFeedback={() => openOnly(() => setShowFeedback(true))}
        onOpenScout={() => openOnly(() => setShowScout(true))}
      />

      {engine.screen === "landing" && (
        <LandingPage
          xp={engine.xp}
          streak={engine.streak}
          totalCorrect={engine.totalCorrect}
          totalWrong={engine.totalWrong}
          speciesMastered={mastered}
          startGame={engine.startGame}
          onOpenLearning={(t) => {
            setLearnTier(t);
            setLearnLessonId(undefined);
            setShowLearning(true);
          }}
          onOpenPractice={(t) => {
            setPracticeTier(t);
            setPracticeGameId(undefined);
            setShowPractice(true);
          }}
          onOpenFarm={() => setShowFarm(true)}
          onOpenGlossary={() => setShowGlossary(true)}
          onOpenScout={() => setShowScout(true)}
        />
      )}
      {engine.screen === "playing" && <GameScreen engine={engine} onExit={engine.resetToLanding} />}
      {engine.screen === "results" && <ResultsScreen engine={engine} onHome={engine.resetToLanding} />}

      {showLearning && (
        <LearningModule
          key={`learn-${learnTier}-${learnLessonId ?? "start"}`}
          initialTier={learnTier}
          initialLessonId={learnLessonId}
          onPlayGame={jumpToGame}
          onClose={() => setShowLearning(false)}
        />
      )}
      {showPractice && (
        <PracticeHub
          key={`practice-${practiceTier}-${practiceGameId ?? "start"}`}
          initialTier={practiceTier}
          initialGameId={practiceGameId}
          onOpenLesson={jumpToLesson}
          onClose={() => setShowPractice(false)}
        />
      )}
      {showFarm && <FarmMode onClose={() => setShowFarm(false)} />}
      {showGlossary && <Glossary onClose={() => setShowGlossary(false)} />}
      {showReferences && <ReferencesPage onClose={() => setShowReferences(false)} />}
      {showFeedback && <FeedbackDialog onClose={() => setShowFeedback(false)} />}
      {showScout && (
        <ScoutProfile
          onClose={() => setShowScout(false)}
          xp={engine.xp}
          totalCorrect={engine.totalCorrect}
          mastered={mastered}
        />
      )}

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

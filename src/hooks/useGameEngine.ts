import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Insect } from "@/data/insects";
import { insectsForGrade } from "@/data/gradeInsects";
import { PHASES, type Phase } from "@/data/phases";
import type { GradeLevel } from "@/lib/types";

export type Screen = "landing" | "playing" | "results";

export interface Question {
  id: string;
  type: "mcq" | "binary" | "fillin";
  phase: Phase;
  insect: Insect;
  prompt: string;
  options?: string[];
  answer: string;
  hint?: string;
}

export interface InsectStat {
  seen: number;
  correct: number;
  mastered: boolean;
}

export interface PhaseStat {
  seen: number;
  correct: number;
}

interface AnswerFeedback {
  correct: boolean;
  message: string;
  answer: string;
  insectId: string;
}

const rand = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const sample = <T,>(arr: T[], n: number): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
};

function unlockedPhases(grade: GradeLevel, xp: number): Phase[] {
  return PHASES[grade].filter((p) => xp >= p.xpRequired);
}

function generateQuestion(phase: Phase, insect: Insect, pool: Insect[]): Question {
  const id = `${phase.id}-${insect.id}-${Math.random().toString(36).slice(2, 7)}`;
  switch (phase.id) {
    case "e1":
    case "m1": {
      const distract = sample(pool.filter((i) => i.id !== insect.id), 3).map((i) => i.commonName);
      const options = sample([insect.commonName, ...distract], 4);
      return { id, type: "mcq", phase, insect, prompt: "Which insect is this?", options, answer: insect.commonName };
    }
    case "e2":
      return {
        id,
        type: "binary",
        phase,
        insect,
        prompt: `Is the ${insect.commonName} a pest or a helper?`,
        options: ["Pest", "Helper"],
        answer: insect.role === "Beneficial" || insect.role === "Pollinator" ? "Helper" : "Pest",
      };
    case "e3":
    case "m2": {
      const orders = Array.from(new Set(pool.map((i) => i.order)));
      const distract = sample(orders.filter((o) => o !== insect.order), 3);
      const options = sample([insect.order, ...distract], Math.min(4, distract.length + 1));
      return { id, type: "mcq", phase, insect, prompt: `Which order does the ${insect.commonName} belong to?`, options, answer: insect.order };
    }
    case "e4": {
      const distract = sample(pool.filter((i) => i.hosts !== insect.hosts), 3).map((i) => i.hosts);
      const options = sample([insect.hosts, ...distract], 4);
      return { id, type: "mcq", phase, insect, prompt: `What does the ${insect.commonName} feed on?`, options, answer: insect.hosts };
    }
    case "m3":
      return {
        id,
        type: "binary",
        phase,
        insect,
        prompt: `Does the ${insect.commonName} undergo complete or incomplete metamorphosis?`,
        options: ["Complete", "Incomplete"],
        answer: insect.metamorphosis === "Ametabolous" ? "Incomplete" : insect.metamorphosis,
      };
    case "m4": {
      const roles = ["Pest", "Beneficial", "Pollinator", "Invasive Pest"];
      return { id, type: "mcq", phase, insect, prompt: `IPM role of the ${insect.commonName}?`, options: roles, answer: insect.role.includes("Pollinator") ? "Pollinator" : insect.role };
    }
    case "h1":
      return { id, type: "fillin", phase, insect, prompt: `Type the scientific name (genus is enough) for the ${insect.commonName}.`, answer: insect.scientificName, hint: insect.family };
    case "h2": {
      const families = Array.from(new Set(pool.map((i) => i.family)));
      const distract = sample(families.filter((f) => f !== insect.family), 3);
      const options = sample([insect.family, ...distract], Math.min(4, distract.length + 1));
      return { id, type: "mcq", phase, insect, prompt: `Which family does ${insect.scientificName} belong to?`, options, answer: insect.family };
    }
    case "h3":
      return {
        id,
        type: "binary",
        phase,
        insect,
        prompt: `Scouting count exceeds the economic threshold for ${insect.commonName}. Should you treat?`,
        options: ["Treat", "Continue monitoring"],
        answer: insect.role === "Beneficial" || insect.role === "Pollinator" ? "Continue monitoring" : "Treat",
      };
    case "h4": {
      const groups = ["IRAC 1B (Organophosphate)", "IRAC 3A (Pyrethroid)", "IRAC 4A (Neonicotinoid)", "IRAC 6 (Avermectin)", "Biological control"];
      const correct = insect.role === "Beneficial" || insect.role === "Pollinator" ? "Biological control" : rand(groups.slice(0, 4));
      return { id, type: "mcq", phase, insect, prompt: `Choose an appropriate management tactic for ${insect.commonName}.`, options: groups, answer: correct };
    }
    default:
      return { id, type: "mcq", phase, insect, prompt: "Identify the insect.", options: [insect.commonName], answer: insect.commonName };
  }
}

function buildPool(grade: GradeLevel, xp: number): Question[] {
  const phases = unlockedPhases(grade, xp);
  const eligible = insectsForGrade(grade);
  const out: Question[] = [];
  for (const phase of phases) {
    for (const insect of sample(eligible, 2)) {
      out.push(generateQuestion(phase, insect, eligible));
    }
  }
  return sample(out, out.length);
}

export function useGameEngine() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [grade, setGrade] = useState<GradeLevel>("elementary");
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(1);
  const [questionNum, setQuestionNum] = useState(0);
  const [pool, setPool] = useState<Question[]>([]);
  const [current, setCurrent] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [insectStats, setInsectStats] = useState<Record<string, InsectStat>>({});
  const [phaseStats, setPhaseStats] = useState<Record<string, PhaseStat>>({});
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalWrong, setTotalWrong] = useState(0);

  const phases = useMemo(() => unlockedPhases(grade, xp), [grade, xp]);

  const startGame = useCallback((g: GradeLevel) => {
    setGrade(g);
    setXp(0);
    setStreak(0);
    setRound(1);
    setQuestionNum(1);
    setInsectStats({});
    setPhaseStats({});
    setTotalCorrect(0);
    setTotalWrong(0);
    const p = buildPool(g, 0);
    setPool(p.slice(1));
    setCurrent(p[0] ?? null);
    setFeedback(null);
    setScreen("playing");
  }, []);

  const nextQuestion = useCallback(() => {
    setFeedback(null);
    setQuestionNum((n) => n + 1);
    setPool((prev) => {
      if (prev.length === 0) {
        setRound((r) => r + 1);
        const fresh = buildPool(grade, xp);
        setCurrent(fresh[0] ?? null);
        return fresh.slice(1);
      }
      setCurrent(prev[0]);
      return prev.slice(1);
    });
  }, [grade, xp]);

  const submitAnswer = useCallback(
    (answer: string) => {
      if (!current) return;
      const normalize = (s: string) => s.trim().toLowerCase();
      const correct =
        current.type === "fillin"
          ? normalize(answer).length > 0 &&
            (normalize(current.answer).startsWith(normalize(answer)) ||
              normalize(answer).startsWith(normalize(current.answer).split(" ")[0]))
          : normalize(answer) === normalize(current.answer);

      const insectId = current.insect.id;
      setInsectStats((prev) => {
        const s = prev[insectId] ?? { seen: 0, correct: 0, mastered: false };
        const seen = s.seen + 1;
        const c = s.correct + (correct ? 1 : 0);
        const mastered = c >= 3;
        if (mastered && !s.mastered) toast.success(`Species mastered: ${current.insect.commonName}`);
        return { ...prev, [insectId]: { seen, correct: c, mastered } };
      });
      setPhaseStats((prev) => {
        const s = prev[current.phase.id] ?? { seen: 0, correct: 0 };
        return { ...prev, [current.phase.id]: { seen: s.seen + 1, correct: s.correct + (correct ? 1 : 0) } };
      });

      if (correct) {
        const reward = current.phase.xpReward;
        const bonus = (streak + 1) % 5 === 0 ? 5 : (streak + 1) % 3 === 0 ? 2 : 0;
        const prevXp = xp;
        const newXp = prevXp + reward + bonus;
        const before = unlockedPhases(grade, prevXp).length;
        const after = unlockedPhases(grade, newXp).length;
        if (after > before) toast.success(`Phase unlocked: ${PHASES[grade][after - 1].name}`);
        setXp(newXp);
        setStreak((s) => s + 1);
        setTotalCorrect((n) => n + 1);
        setFeedback({ correct: true, message: bonus ? `+${reward} XP  ·  +${bonus} streak bonus` : `+${reward} XP`, answer: current.answer, insectId });
      } else {
        setStreak(0);
        setTotalWrong((n) => n + 1);
        setFeedback({ correct: false, message: `Answer: ${current.answer}`, answer: current.answer, insectId });
      }
    },
    [current, grade, streak, xp],
  );

  const endSession = useCallback(() => setScreen("results"), []);
  const resetToLanding = useCallback(() => setScreen("landing"), []);

  return {
    screen,
    grade,
    setGrade,
    xp,
    streak,
    round,
    questionNum,
    current,
    feedback,
    phases,
    insectStats,
    phaseStats,
    totalCorrect,
    totalWrong,
    startGame,
    submitAnswer,
    nextQuestion,
    endSession,
    resetToLanding,
  } as const;
}
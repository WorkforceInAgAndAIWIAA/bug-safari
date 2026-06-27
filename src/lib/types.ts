export type GradeLevel = "elementary" | "middle" | "high";
export type LearningGradeLevel = GradeLevel | "collegiate";

export const GRADE_LABEL: Record<GradeLevel, string> = {
  elementary: "K–5 Bug Buddy",
  middle: "6–8 Field Scout",
  high: "9–12 IPM Specialist",
};
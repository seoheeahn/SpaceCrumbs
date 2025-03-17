import type { Answer } from "./questions";
import type { MbtiType } from "@shared/schema";

export function calculateMbti(answers: Answer[]): MbtiType {
  const scores = {
    E: 0, I: 0,
    S: 0, N: 0,
    T: 0, F: 0,
    J: 0, P: 0
  };

  answers.forEach(answer => {
    const question = questions.find(q => q.id === answer.questionId);
    if (!question) return;

    const [dim1, dim2] = question.category.split("/");
    const score = (answer.value - 3) * question.weight;

    if (score > 0) {
      scores[dim1] += Math.abs(score);
    } else {
      scores[dim2] += Math.abs(score);
    }
  });

  const type = [
    scores.E > scores.I ? "E" : "I",
    scores.S > scores.N ? "S" : "N",
    scores.T > scores.F ? "T" : "F",
    scores.J > scores.P ? "J" : "P"
  ].join("") as MbtiType;

  return type;
}

export const mbtiDescriptions = {
  ISTJ: {
    ko: "신중하고 조용하며 집중력이 강하고 매사에 철저합니다.",
    en: "Quiet, serious, thorough and dependable."
  },
  // Add descriptions for all 16 types
};

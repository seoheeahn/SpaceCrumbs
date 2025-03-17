import { questions, type Answer } from "./questions";
import type { MbtiType } from "@shared/schema";
import type { DimensionKey, MbtiLetter } from "./types";

function getWeightByValue(value: number): { [key: string]: number } {
  // 1,2는 A쪽으로 가중치, 4,5는 B쪽으로 가중치
  if (value === 1) return { A: 1.0, B: 0.0 };
  if (value === 2) return { A: 0.75, B: 0.25 };
  if (value === 3) return { A: 0.5, B: 0.5 };
  if (value === 4) return { A: 0.25, B: 0.75 };
  if (value === 5) return { A: 0.0, B: 1.0 };
  return { A: 0, B: 0 };
}

export function calculateDimensionScores(answers: Answer[]) {
  const scores = {
    E: 0, I: 0,
    S: 0, N: 0,
    T: 0, F: 0,
    J: 0, P: 0
  };

  const totalWeights = {
    "E/I": 0,
    "S/N": 0,
    "T/F": 0,
    "J/P": 0
  };

  answers.forEach(answer => {
    const question = questions.find(q => q.id === answer.questionId);
    if (!question) return;

    const dimension = question.category;
    const weights = getWeightByValue(answer.value);
    const [trait1, trait2] = dimension.split("/") as [keyof typeof scores, keyof typeof scores];

    // 가중치 적용
    scores[trait1] += weights.A * question.weight;
    scores[trait2] += weights.B * question.weight;
    totalWeights[dimension] += question.weight;
  });

  // 백분율 계산
  return {
    E: (scores.E / totalWeights["E/I"]) * 100 || 0,
    I: (scores.I / totalWeights["E/I"]) * 100 || 0,
    S: (scores.S / totalWeights["S/N"]) * 100 || 0,
    N: (scores.N / totalWeights["S/N"]) * 100 || 0,
    T: (scores.T / totalWeights["T/F"]) * 100 || 0,
    F: (scores.F / totalWeights["T/F"]) * 100 || 0,
    J: (scores.J / totalWeights["J/P"]) * 100 || 0,
    P: (scores.P / totalWeights["J/P"]) * 100 || 0
  };
}

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

    const weights = getWeightByValue(answer.value);
    const [trait1, trait2] = question.category.split("/") as [keyof typeof scores, keyof typeof scores];

    scores[trait1] += weights.A * question.weight;
    scores[trait2] += weights.B * question.weight;
  });

  const type = [
    scores.E > scores.I ? "E" : "I",
    scores.S > scores.N ? "S" : "N",
    scores.T > scores.F ? "T" : "F",
    scores.J > scores.P ? "J" : "P"
  ].join("") as MbtiType;

  return type;
}

export const mbtiDescriptions: Record<MbtiType, {ko: string; en: string}> = {
  ISTJ: {
    ko: "신중하고 조용하며 집중력이 강하고 매사에 철저합니다.",
    en: "Quiet, serious, thorough and dependable."
  },
  ISFJ: {
    ko: "차분하고 친근하며 책임감이 있고 헌신적입니다.",
    en: "Quiet, friendly, responsible and conscientious."
  },
  INFJ: {
    ko: "통찰력이 있고 헌신적이며 창의적입니다.",
    en: "Insightful, devoted and creative."
  },
  INTJ: {
    ko: "독창적인 사고와 강한 추진력을 가지고 있습니다.",
    en: "Original mind and great drive."
  },
  ISTP: {
    ko: "관용적이고 유연하며 실용적인 문제해결에 능합니다.",
    en: "Tolerant, flexible and practical problem-solver."
  },
  ISFP: {
    ko: "다정하고 친절하며 현재의 삶을 즐깁니다.",
    en: "Friendly, sensitive and lives in the present."
  },
  INFP: {
    ko: "이상주의적이고 충실하며 적응력이 좋습니다.",
    en: "Idealistic, loyal and adaptable."
  },
  INTP: {
    ko: "논리적이고 독창적이며 지적 호기심이 많습니다.",
    en: "Logical, original and curious."
  },
  ESTP: {
    ko: "활동적이고 사교적이며 실용적입니다.",
    en: "Active, sociable and practical."
  },
  ESFP: {
    ko: "외향적이고 친절하며 수용력이 좋습니다.",
    en: "Outgoing, friendly and accepting."
  },
  ENFP: {
    ko: "열정적이고 창의적이며 융통성이 있습니다.",
    en: "Enthusiastic, creative and flexible."
  },
  ENTP: {
    ko: "독창적이고 다재다능하며 도전을 즐깁니다.",
    en: "Inventive, versatile and enjoys challenges."
  },
  ESTJ: {
    ko: "실제적이고 현실적이며 체계적입니다.",
    en: "Practical, realistic and systematic."
  },
  ESFJ: {
    ko: "사교적이고 협조적이며 배려심이 많습니다.",
    en: "Sociable, cooperative and considerate."
  },
  ENFJ: {
    ko: "사려깊고 이해심이 많으며 책임감이 강합니다.",
    en: "Responsive, responsible and caring."
  },
  ENTJ: {
    ko: "선도적이고 결단력이 있으며 계획적입니다.",
    en: "Leader, decisive and planned."
  }
};

export const dimensionColors: Record<DimensionKey, string> = {
  "E-I": "#ff9500",
  "S-N": "#34c759",
  "T-F": "#007aff",
  "J-P": "#af52de"
};

export const dimensionScores: Record<MbtiLetter, number> = {
  E: 0.8,
  I: 0.2,
  S: 0.7,
  N: 0.3,
  T: 0.6,
  F: 0.4,
  J: 0.9,
  P: 0.1
};

export const dimensionToLetters: Record<DimensionKey, [MbtiLetter, MbtiLetter]> = {
  "E-I": ["E", "I"],
  "S-N": ["S", "N"],
  "T-F": ["T", "F"],
  "J-P": ["J", "P"]
};
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

export const dimensionColors: Record<DimensionKey, string> = {
  "E-I": "#FF6B6B",
  "S-N": "#4ECDC4",
  "T-F": "#45B7D1",
  "J-P": "#96CEB4"
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

export const mbtiDescriptions: { [key in MbtiType]: { ko: string; en: string } } = {
  ISTJ: {
    ko: "신중하고 조용하며 집중력이 강하고 매사에 철저하다.",
    en: "Thorough, responsible, and detail-oriented."
  },
  ISFJ: {
    ko: "조용하고 차분하며 친근하고 책임감이 강하다.",
    en: "Quiet, friendly, and responsible."
  },
  INFJ: {
    ko: "인내심이 많고 통찰력이 있으며 화합을 추구한다.",
    en: "Insightful, creative, and values harmony."
  },
  INTJ: {
    ko: "독창적인 사고와 강한 추진력을 가지고 있다.",
    en: "Independent, original, and driven."
  },
  ISTP: {
    ko: "과묵하고 분석적이며 적응력이 뛰어나다.",
    en: "Practical, analytical, and adaptable."
  },
  ISFP: {
    ko: "다정하고 민감하며 겸손하고 부드럽다.",
    en: "Gentle, sensitive, and kind."
  },
  INFP: {
    ko: "이상주의적이고 성실하며 적응력이 좋다.",
    en: "Idealistic, loyal, and adaptable."
  },
  INTP: {
    ko: "논리적이고 분석적이며 호기심이 많다.",
    en: "Logical, analytical, and curious."
  },
  ESTP: {
    ko: "활동적이고 적응력이 있으며 현실적이다.",
    en: "Active, adaptable, and pragmatic."
  },
  ESFP: {
    ko: "사교적이고 활동적이며 수용적이다.",
    en: "Outgoing, friendly, and accepting."
  },
  ENFP: {
    ko: "열정적이고 창의적이며 상상력이 풍부하다.",
    en: "Enthusiastic, creative, and imaginative."
  },
  ENTP: {
    ko: "독창적이고 다재다능하며 논쟁을 즐긴다.",
    en: "Innovative, versatile, and enjoys debate."
  },
  ESTJ: {
    ko: "현실감각이 뛰어나며 조직적이고 체계적이다.",
    en: "Practical, organized, and systematic."
  },
  ESFJ: {
    ko: "동정심이 많고 사교적이며 협조적이다.",
    en: "Warm, social, and cooperative."
  },
  ENFJ: {
    ko: "사교적이고 동정심이 많으며 참을성이 있다.",
    en: "Warm, empathetic, and responsive."
  },
  ENTJ: {
    ko: "논리적이고 결단력 있으며 계획적이다.",
    en: "Leader, decisive and planned."
  }
};

export function calculateMbti(answers: Answer[]): MbtiType {
  const dimensions = {
    EI: 0,
    SN: 0,
    TF: 0,
    JP: 0
  };

  answers.forEach((answer, index) => {
    const question = questions[index];
    const weight = getWeightByValue(answer.value);

    if (question.dimension === "E-I") {
      dimensions.EI += weight.A - weight.B;
    } else if (question.dimension === "S-N") {
      dimensions.SN += weight.A - weight.B;
    } else if (question.dimension === "T-F") {
      dimensions.TF += weight.A - weight.B;
    } else if (question.dimension === "J-P") {
      dimensions.JP += weight.A - weight.B;
    }
  });

  const result = [
    dimensions.EI > 0 ? "E" : "I",
    dimensions.SN > 0 ? "S" : "N",
    dimensions.TF > 0 ? "T" : "F",
    dimensions.JP > 0 ? "J" : "P"
  ].join("") as MbtiType;

  return result;
}
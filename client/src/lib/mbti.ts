import { questions, type Answer } from "./questions";
import type { MbtiType } from "@shared/schema";

export function calculateDimensionScores(answers: Answer[]) {
  const scores = {
    E: 0, I: 0,
    S: 0, N: 0,
    T: 0, F: 0,
    J: 0, P: 0
  };

  // 각 차원별로 5개 문항씩 있음
  const questionsPerTrait = 5;

  answers.forEach(answer => {
    const question = questions.find(q => q.id === answer.questionId);
    if (!question) return;

    const [trait1, trait2] = question.category.split("/") as [keyof typeof scores, keyof typeof scores];

    // answer.value는 1~5 사이의 값
    // 1,2는 trait1에 해당, 4,5는 trait2에 해당, 3은 중립
    if (answer.value <= 2) {
      scores[trait1] += question.weight;
    } else if (answer.value >= 4) {
      scores[trait2] += question.weight;
    }
    // 3(중립)인 경우 양쪽 다 점수를 주지 않음
  });

  // 각 차원별 최대 점수 계산 (weight의 합)
  const maxScores = {
    EI: questions.filter(q => q.category === "E/I").reduce((sum, q) => sum + q.weight, 0),
    SN: questions.filter(q => q.category === "S/N").reduce((sum, q) => sum + q.weight, 0),
    TF: questions.filter(q => q.category === "T/F").reduce((sum, q) => sum + q.weight, 0),
    JP: questions.filter(q => q.category === "J/P").reduce((sum, q) => sum + q.weight, 0)
  };

  // 백분율 계산
  return {
    E: (scores.E / maxScores.EI) * 100,
    I: (scores.I / maxScores.EI) * 100,
    S: (scores.S / maxScores.SN) * 100,
    N: (scores.N / maxScores.SN) * 100,
    T: (scores.T / maxScores.TF) * 100,
    F: (scores.F / maxScores.TF) * 100,
    J: (scores.J / maxScores.JP) * 100,
    P: (scores.P / maxScores.JP) * 100
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

    const [trait1, trait2] = question.category.split("/") as [keyof typeof scores, keyof typeof scores];

    if (answer.value <= 2) {
      scores[trait1] += question.weight;
    } else if (answer.value >= 4) {
      scores[trait2] += question.weight;
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
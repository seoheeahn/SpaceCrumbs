export interface Question {
  id: number;
  text: {
    ko: string;
    en: string;
  };
  category: "E/I" | "S/N" | "T/F" | "J/P";
  weight: number;
}

export const questions: Question[] = [
  // E/I 차원 (5문항)
  {
    id: 1,
    text: {
      ko: "모임에서 새로운 사람들과 대화를 시작하는 것이 편하다",
      en: "I feel comfortable starting conversations with new people at gatherings"
    },
    category: "E/I",
    weight: 2
  },
  {
    id: 2,
    text: {
      ko: "여러 사람들과 함께 있을 때 에너지가 충전된다",
      en: "Being around many people energizes me"
    },
    category: "E/I",
    weight: 2
  },
  {
    id: 3,
    text: {
      ko: "조용한 환경보다 활기찬 환경을 선호한다",
      en: "I prefer lively environments over quiet ones"
    },
    category: "E/I",
    weight: 1.5
  },
  {
    id: 4,
    text: {
      ko: "그룹 활동에 적극적으로 참여하는 것을 즐긴다",
      en: "I enjoy actively participating in group activities"
    },
    category: "E/I",
    weight: 1.5
  },
  {
    id: 5,
    text: {
      ko: "새로운 경험과 모험을 추구한다",
      en: "I seek new experiences and adventures"
    },
    category: "E/I",
    weight: 1
  },

  // S/N 차원 (5문항)
  {
    id: 6,
    text: {
      ko: "구체적인 사실과 세부사항에 집중한다",
      en: "I focus on concrete facts and details"
    },
    category: "S/N",
    weight: 2
  },
  {
    id: 7,
    text: {
      ko: "현실적이고 실용적인 해결책을 선호한다",
      en: "I prefer practical and realistic solutions"
    },
    category: "S/N",
    weight: 2
  },
  {
    id: 8,
    text: {
      ko: "직접적인 경험을 통해 배우는 것을 선호한다",
      en: "I prefer learning through direct experience"
    },
    category: "S/N",
    weight: 1.5
  },
  {
    id: 9,
    text: {
      ko: "현재에 집중하는 편이다",
      en: "I tend to focus on the present moment"
    },
    category: "S/N",
    weight: 1.5
  },
  {
    id: 10,
    text: {
      ko: "단계적이고 순차적인 정보를 선호한다",
      en: "I prefer step-by-step and sequential information"
    },
    category: "S/N",
    weight: 1
  },

  // T/F 차원 (5문항)
  {
    id: 11,
    text: {
      ko: "논리적 분석을 통해 결정을 내린다",
      en: "I make decisions through logical analysis"
    },
    category: "T/F",
    weight: 2
  },
  {
    id: 12,
    text: {
      ko: "객관적인 사실을 중시한다",
      en: "I value objective facts"
    },
    category: "T/F",
    weight: 2
  },
  {
    id: 13,
    text: {
      ko: "감정보다 이성을 중시한다",
      en: "I prioritize reason over emotions"
    },
    category: "T/F",
    weight: 1.5
  },
  {
    id: 14,
    text: {
      ko: "공정성과 일관성을 중요하게 여긴다",
      en: "I value fairness and consistency"
    },
    category: "T/F",
    weight: 1.5
  },
  {
    id: 15,
    text: {
      ko: "비판적 피드백을 잘 수용한다",
      en: "I handle critical feedback well"
    },
    category: "T/F",
    weight: 1
  },

  // J/P 차원 (5문항)
  {
    id: 16,
    text: {
      ko: "계획을 세우고 그대로 실행하는 것을 좋아한다",
      en: "I like to plan things and follow through"
    },
    category: "J/P",
    weight: 2
  },
  {
    id: 17,
    text: {
      ko: "체계적이고 조직적인 환경을 선호한다",
      en: "I prefer structured and organized environments"
    },
    category: "J/P",
    weight: 2
  },
  {
    id: 18,
    text: {
      ko: "마감 기한을 여유있게 지키는 편이다",
      en: "I tend to complete tasks well before deadlines"
    },
    category: "J/P",
    weight: 1.5
  },
  {
    id: 19,
    text: {
      ko: "결정을 빨리 내리고 확실히 하는 것을 선호한다",
      en: "I prefer to make decisions quickly and decisively"
    },
    category: "J/P",
    weight: 1.5
  },
  {
    id: 20,
    text: {
      ko: "일상적인 루틴을 잘 지킨다",
      en: "I maintain daily routines well"
    },
    category: "J/P",
    weight: 1
  }
];

export type Answer = {
  questionId: number;
  value: number; // 1-5 scale where 1: Strongly Disagree, 5: Strongly Agree
};
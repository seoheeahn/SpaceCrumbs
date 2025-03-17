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
      ko: "실제 경험과 구체적인 사실을 중요하게 생각한다",
      en: "I value real experiences and concrete facts"
    },
    category: "S/N",
    weight: 2
  },
  {
    id: 3,
    text: {
      ko: "논리적인 분석을 통해 결정을 내리는 것을 선호한다",
      en: "I prefer making decisions through logical analysis"
    },
    category: "T/F",
    weight: 2
  },
  {
    id: 4,
    text: {
      ko: "계획을 세우고 그대로 실행하는 것을 좋아한다",
      en: "I like to plan things and follow the plan"
    },
    category: "J/P",
    weight: 2
  },
  {
    id: 5,
    text: {
      ko: "대화할 때 다른 사람의 감정을 잘 고려한다",
      en: "I consider others' feelings when conversing"
    },
    category: "T/F",
    weight: 1.5
  },
  // More questions can be added here...
];

export type Answer = {
  questionId: number;
  value: number; // 1-5 scale where 1: Strongly Disagree, 5: Strongly Agree
};
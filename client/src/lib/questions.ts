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
  // Add 18 more questions here for all MBTI dimensions
];

export type Answer = {
  questionId: number;
  value: number; // 1-5 scale
};

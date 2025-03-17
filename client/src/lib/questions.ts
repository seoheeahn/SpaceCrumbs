export interface Question {
  id: number;
  text: {
    ko: string;
    en: string;
  };
  category: "E/I" | "S/N" | "T/F" | "J/P";
  facet: string;
  weight: number;
  options: {
    A: string;
    B: string;
  };
}

export const questions: Question[] = [
  // E/I 차원 (5문항)
  {
    id: 1,
    text: {
      ko: "새로운 사람들과 처음 만났을 때 나는...",
      en: "When meeting new people, I..."
    },
    category: "E/I",
    facet: "시작형-응대형",
    weight: 2,
    options: {
      A: "먼저 대화를 시작하는 편이다.",
      B: "상대방이 먼저 말을 걸어주길 기다리는 편이다."
    }
  },
  {
    id: 2,
    text: {
      ko: "나는 하루 일과를 마친 후...",
      en: "After finishing daily tasks, I..."
    },
    category: "E/I",
    facet: "표현형-절제형",
    weight: 2,
    options: {
      A: "사람들과 어울리며 에너지를 얻는다.",
      B: "혼자 시간을 보내며 충전하는 것이 더 좋다."
    }
  },
  {
    id: 3,
    text: {
      ko: "모임에서 나는...",
      en: "In gatherings, I..."
    },
    category: "E/I",
    facet: "사교형-친밀형",
    weight: 1.5,
    options: {
      A: "여러 사람들과 활발히 대화한다.",
      B: "몇몇 친한 사람들과 깊이 있는 대화를 나눈다."
    }
  },
  {
    id: 4,
    text: {
      ko: "내 감정 표현 방식은...",
      en: "My way of expressing emotions is..."
    },
    category: "E/I",
    facet: "활동형-반성형",
    weight: 1.5,
    options: {
      A: "감정을 적극적으로 드러내는 편이다.",
      B: "감정을 속으로 삭이거나 조용히 표현하는 편이다."
    }
  },
  {
    id: 5,
    text: {
      ko: "나는 새로운 환경에서...",
      en: "In new environments, I..."
    },
    category: "E/I",
    facet: "열정형-차분형",
    weight: 1,
    options: {
      A: "적극적으로 적응하고 먼저 행동한다.",
      B: "주변을 먼저 관찰하고 조심스럽게 행동한다."
    }
  },

  // S/N 차원 (5문항)
  {
    id: 6,
    text: {
      ko: "나는 정보를 받아들일 때...",
      en: "When processing information, I..."
    },
    category: "S/N",
    facet: "구체적-추상적",
    weight: 2,
    options: {
      A: "구체적인 사실과 데이터를 중시한다.",
      B: "전체적인 개념과 가능성을 먼저 고려한다."
    }
  },
  {
    id: 7,
    text: {
      ko: "문제를 해결할 때 나는...",
      en: "When solving problems, I..."
    },
    category: "S/N",
    facet: "현실적-상상적",
    weight: 2,
    options: {
      A: "실제 경험과 검증된 방법을 따르는 편이다.",
      B: "새로운 아이디어와 창의적인 접근을 시도하는 편이다."
    }
  },
  {
    id: 8,
    text: {
      ko: "나는 설명을 들을 때...",
      en: "When receiving explanations, I..."
    },
    category: "S/N",
    facet: "실용적-개념적",
    weight: 1.5,
    options: {
      A: "구체적인 사례와 실용적인 정보를 선호한다.",
      B: "큰 그림과 이론적인 개념을 듣는 것이 더 좋다."
    }
  },
  {
    id: 9,
    text: {
      ko: "나는 결정을 내릴 때...",
      en: "When making decisions, I..."
    },
    category: "S/N",
    facet: "경험적-이론적",
    weight: 1.5,
    options: {
      A: "현재의 현실적인 요소를 중시한다.",
      B: "미래의 가능성과 잠재력을 고려한다."
    }
  },
  {
    id: 10,
    text: {
      ko: "나는 새로운 것을 배울 때...",
      en: "When learning something new, I..."
    },
    category: "S/N",
    facet: "전통적-독창적",
    weight: 1,
    options: {
      A: "직접 체험하며 배우는 것이 효과적이다.",
      B: "개념과 이론을 이해한 후 적용하는 것이 효과적이다."
    }
  },

  // T/F 차원 (5문항)
  {
    id: 11,
    text: {
      ko: "나는 의사결정을 할 때...",
      en: "When making decisions, I..."
    },
    category: "T/F",
    facet: "논리적-공감적",
    weight: 2,
    options: {
      A: "논리적이고 객관적인 기준을 우선한다.",
      B: "사람들의 감정과 관계를 고려하는 것이 더 중요하다."
    }
  },
  {
    id: 12,
    text: {
      ko: "나는 다른 사람과 갈등이 생겼을 때...",
      en: "When conflicts arise with others, I..."
    },
    category: "T/F",
    facet: "합리적-동정적",
    weight: 2,
    options: {
      A: "문제의 원인을 분석하고 해결하려 한다.",
      B: "상대방의 감정을 먼저 고려하며 조정하려 한다."
    }
  },
  {
    id: 13,
    text: {
      ko: "나는 의견을 나눌 때...",
      en: "When sharing opinions, I..."
    },
    category: "T/F",
    facet: "의문형-수용형",
    weight: 1.5,
    options: {
      A: "비판적으로 검토하며 논리적으로 접근한다.",
      B: "조화를 중시하며 상대방의 감정을 고려한다."
    }
  },
  {
    id: 14,
    text: {
      ko: "나는 팀 프로젝트에서...",
      en: "In team projects, I..."
    },
    category: "T/F",
    facet: "비판적-수용적",
    weight: 1.5,
    options: {
      A: "효율성과 논리를 기반으로 역할을 분배한다.",
      B: "구성원들의 감정과 관계를 고려하며 조정한다."
    }
  },
  {
    id: 15,
    text: {
      ko: "나는 주변 사람들에게...",
      en: "With people around me, I..."
    },
    category: "T/F",
    facet: "강인형-부드러운",
    weight: 1,
    options: {
      A: "솔직하고 직설적인 피드백을 주는 편이다.",
      B: "배려하고 조심스럽게 의견을 전달하는 편이다."
    }
  },

  // J/P 차원 (5문항)
  {
    id: 16,
    text: {
      ko: "나는 일정을 계획할 때...",
      en: "When planning schedules, I..."
    },
    category: "J/P",
    facet: "체계적-편안한",
    weight: 2,
    options: {
      A: "사전에 철저하게 계획하고 실행한다.",
      B: "유동적으로 조정하며 진행하는 것이 더 좋다."
    }
  },
  {
    id: 17,
    text: {
      ko: "나는 마감 기한이 있을 때...",
      en: "When facing deadlines, I..."
    },
    category: "J/P",
    facet: "계획형-개방형",
    weight: 2,
    options: {
      A: "미리 준비해서 여유롭게 끝낸다.",
      B: "마감 직전에 집중해서 해결하는 편이다."
    }
  },
  {
    id: 18,
    text: {
      ko: "나는 결정을 내릴 때...",
      en: "When making decisions, I..."
    },
    category: "J/P",
    facet: "조기 시작형-압박형",
    weight: 1.5,
    options: {
      A: "한 번 결정하면 쉽게 바꾸지 않는다.",
      B: "새로운 정보가 있으면 결정을 유동적으로 조정한다."
    }
  },
  {
    id: 19,
    text: {
      ko: "나는 여행을 계획할 때...",
      en: "When planning trips, I..."
    },
    category: "J/P",
    facet: "일정형-자발형",
    weight: 1.5,
    options: {
      A: "사전에 자세한 일정을 짜는 것이 좋다.",
      B: "즉흥적으로 현장에서 조정하는 것이 더 좋다."
    }
  },
  {
    id: 20,
    text: {
      ko: "나는 일을 할 때...",
      en: "When working, I..."
    },
    category: "J/P",
    facet: "방법론적-발생형",
    weight: 1,
    options: {
      A: "체계적인 절차와 방법을 따르는 것이 중요하다.",
      B: "상황에 맞게 유연하게 처리하는 것이 더 좋다."
    }
  }
];

export type Answer = {
  questionId: number;
  value: number; // 1: Strongly A, 3: Neutral, 5: Strongly B
};
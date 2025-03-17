import OpenAI from "openai";
import type { MbtiResult } from "@shared/schema";
import { calculateDimensionScores } from "../client/src/lib/mbti";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function analyzeMbtiResult(result: MbtiResult): Promise<{ analysis: string; requestId: string }> {
  const dimensionScores = calculateDimensionScores(result.answers);

  const prompt = `
당신은 MBTI 전문가입니다.  
아래 MBTI 테스트 결과를 바탕으로 300자 이내로 분석을 제공하세요.

### 입력 데이터  
- MBTI 유형: ${result.result}  
- 성향 점수:  
  - E/I: E(${Math.round(dimensionScores.E)}%) vs I(${Math.round(dimensionScores.I)}%)  
  - S/N: S(${Math.round(dimensionScores.S)}%) vs N(${Math.round(dimensionScores.N)}%)  
  - T/F: T(${Math.round(dimensionScores.T)}%) vs F(${Math.round(dimensionScores.F)}%)  
  - J/P: J(${Math.round(dimensionScores.J)}%) vs P(${Math.round(dimensionScores.P)}%)  

아래 JSON 형식으로 응답해주세요:

{
    "MBTI": "${result.result}",
    "Description": "[MBTI 유형의 별칭]",
    "Analysis": "[각 지표 점수를 반영한 간략한 분석]",
    "Strengths": ["강점1", "강점2", "강점3"],
    "Growth": ["성장 포인트1", "성장 포인트2"],
    "Social": "[대인관계 특징]",
    "Careers": ["추천 직업1", "추천 직업2", "추천 직업3"]
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "당신은 MBTI 전문가로서 한국어로 상세한 MBTI 분석 결과를 제공합니다."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const content = response.choices[0].message.content || "분석을 생성하지 못했습니다.";

    // Return both the analysis content and the request ID
    return {
      analysis: content,
      requestId: response.id
    };
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw new Error("AI 분석 생성 중 오류가 발생했습니다.");
  }
}
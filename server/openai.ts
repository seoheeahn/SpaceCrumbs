import OpenAI from "openai";
import type { MbtiResult } from "@shared/schema";
import { calculateDimensionScores } from "../client/src/lib/mbti";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function analyzeMbtiResult(result: MbtiResult): Promise<string> {
  const dimensionScores = calculateDimensionScores(result.answers);

  const prompt = `
As an MBTI expert, analyze the following MBTI test result and provide detailed insights:

MBTI Type: ${result.result}

Dimension Scores:
- E/I: E(${Math.round(dimensionScores.E)}%) vs I(${Math.round(dimensionScores.I)}%)
- S/N: S(${Math.round(dimensionScores.S)}%) vs N(${Math.round(dimensionScores.N)}%)
- T/F: T(${Math.round(dimensionScores.T)}%) vs F(${Math.round(dimensionScores.F)}%)
- J/P: J(${Math.round(dimensionScores.J)}%) vs P(${Math.round(dimensionScores.P)}%)

Please provide:
1. A detailed personality analysis based on the dimension scores
2. Key strengths and potential areas for growth
3. How this type typically interacts with others
4. Career paths that might be well-suited for this personality type

Format the response in natural, conversational Korean language. Keep the tone professional but approachable.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert MBTI analyst providing detailed, personalized insights in Korean language."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return response.choices[0].message.content || "분석을 생성하지 못했습니다.";
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return "죄송합니다. 현재 AI 분석을 제공할 수 없습니다.";
  }
}
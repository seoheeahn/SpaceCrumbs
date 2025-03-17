import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Users, Brain, Heart, Calendar } from "lucide-react";
import type { MbtiResult } from "@shared/schema";
import { mbtiDescriptions, calculateDimensionScores } from "@/lib/mbti";
import { questions } from "@/lib/questions";

function getFacetWeights(value: number): { A: number; B: number } {
  if (value === 1) return { A: 100, B: 0 };
  if (value === 2) return { A: 75, B: 25 };
  if (value === 3) return { A: 50, B: 50 };
  if (value === 4) return { A: 25, B: 75 };
  if (value === 5) return { A: 0, B: 100 };
  return { A: 50, B: 50 };
}

type FacetGroup = {
  category: string;
  title: string;
  facets: {
    id: number;
    facet: string;
    selected: "A" | "B" | "neutral";
    weights: { A: number; B: number };
  }[];
};

export default function Result() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data: result, isLoading } = useQuery<MbtiResult>({
    queryKey: [`/api/mbti-results/${id}`]
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>결과를 불러오는 중...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>결과를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const dimensionScores = calculateDimensionScores(result.answers);
  const dimensionColors = {
    "외향성/내향성": "hsl(200, 75%, 65%)",
    "감각/직관": "hsl(150, 65%, 70%)",
    "사고/감정": "hsl(260, 60%, 75%)",
    "판단/인식": "hsl(30, 65%, 70%)"
  };

  const facetColors = {
    "외향성/내향성": ["hsl(200, 75%, 60%)", "hsl(200, 65%, 85%)"],
    "감각/직관": ["hsl(150, 65%, 60%)", "hsl(150, 55%, 85%)"],
    "사고/감정": ["hsl(260, 60%, 65%)", "hsl(260, 50%, 85%)"],
    "판단/인식": ["hsl(30, 65%, 60%)", "hsl(30, 55%, 85%)"]
  };

  // 질문들을 MBTI 차원별로 그룹화
  const facetGroups: FacetGroup[] = Object.keys(dimensionColors).map(dimension => {
    const categoryQuestions = questions.filter(q =>
      q.category === dimension.replace("외향성/내향성", "E/I")
        .replace("감각/직관", "S/N")
        .replace("사고/감정", "T/F")
        .replace("판단/인식", "J/P")
    );
    const answers = result.answers;

    return {
      category: dimension,
      title: dimension,
      facets: categoryQuestions.map(q => {
        const answer = answers.find(a => a.questionId === q.id);
        const selected = answer
          ? (answer.value <= 2 ? "A" : answer.value >= 4 ? "B" : "neutral")
          : "neutral";
        const weights = answer ? getFacetWeights(answer.value) : { A: 50, B: 50 };
        return {
          id: q.id,
          facet: q.facet,
          selected,
          weights
        };
      })
    };
  });

  const handleShare = async () => {
    try {
      await navigator.share({
        title: "My MBTI Result",
        text: `My MBTI type is ${result.result}`,
        url: window.location.href
      });
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  const mbtiIcons = {
    E: <Users className="w-8 h-8" />,
    I: <Users className="w-8 h-8" />,
    S: <Brain className="w-8 h-8" />,
    N: <Brain className="w-8 h-8" />,
    T: <Heart className="w-8 h-8" />,
    F: <Heart className="w-8 h-8" />,
    J: <Calendar className="w-8 h-8" />,
    P: <Calendar className="w-8 h-8" />
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-primary/5 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardContent className="pt-6">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-center mb-6">
                  당신의 MBTI는
                </h1>
                <div className="flex justify-center gap-8 mb-8">
                  {result.result.split("").map((letter, index) => {
                    const dimensionKey = ["E/I", "S/N", "T/F", "J/P"][index];
                    const scores = {
                      "E/I": { E: dimensionScores.E, I: dimensionScores.I },
                      "S/N": { S: dimensionScores.S, N: dimensionScores.N },
                      "T/F": { T: dimensionScores.T, F: dimensionScores.F },
                      "J/P": { J: dimensionScores.J, P: dimensionScores.P }
                    }[dimensionKey];
                    const score = scores[letter as keyof typeof scores];

                    return (
                      <div
                        key={index}
                        className="w-28 h-28 rounded-2xl bg-primary/10 flex items-center justify-center flex-col"
                        style={{ color: dimensionColors[Object.keys(dimensionColors)[index]] }}
                      >
                        {mbtiIcons[letter as keyof typeof mbtiIcons]}
                        <span className="text-3xl font-bold mt-2">{letter}</span>
                        <span className="text-sm mt-1">{Math.round(score)}%</span>
                      </div>
                    );
                  })}
                </div>

                <p className="text-lg text-gray-600 text-center">
                  {mbtiDescriptions[result.result as keyof typeof mbtiDescriptions].ko}
                </p>
              </div>

              <div className="space-y-4">
                {facetGroups.map((group, index) => (
                  <div key={index} className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <h2 className="text-lg font-semibold mb-3 text-center"
                      style={{ color: dimensionColors[group.title] }}>
                      {group.title}
                    </h2>
                    <div className="space-y-2">
                      {group.facets.map((facet) => {
                        const [typeA, typeB] = facet.facet.split("-");
                        const [colorA, colorB] = facetColors[group.title];
                        const isADominant = facet.weights.A > facet.weights.B;
                        const isBDominant = facet.weights.B > facet.weights.A;

                        return (
                          <div key={facet.id} className="bg-gray-50 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`text-sm font-medium text-right w-24 shrink-0 ${
                                isADominant ? "text-primary font-bold" : "text-gray-600"
                              }`}>
                                {typeA}
                              </div>
                              <div className="grow h-5 relative bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="absolute inset-y-0 left-0 transition-all duration-500"
                                  style={{
                                    width: `${facet.weights.A}%`,
                                    backgroundColor: colorA
                                  }}
                                />
                                <div
                                  className="absolute inset-y-0 right-0 transition-all duration-500"
                                  style={{
                                    width: `${facet.weights.B}%`,
                                    backgroundColor: colorB
                                  }}
                                />
                              </div>
                              <div className={`text-sm font-medium w-24 shrink-0 ${
                                isBDominant ? "text-primary font-bold" : "text-gray-600"
                              }`}>
                                {typeB}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                <Button
                  onClick={handleShare}
                  className="w-full bg-gradient-to-r from-primary/80 to-primary hover:from-primary hover:to-primary/80 transition-all duration-300"
                  variant="outline"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  결과 공유하기
                </Button>

                <Button
                  onClick={() => setLocation('/')}
                  className="w-full bg-white hover:bg-gray-50 text-primary hover:text-primary/80 transition-colors duration-300"
                >
                  테스트 다시하기
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}